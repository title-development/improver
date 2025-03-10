package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.*;
import com.improver.model.out.CompanyLeadsReport;
import com.improver.model.out.billing.Receipt;
import com.improver.repository.*;
import com.improver.util.StringUtil;
import com.improver.application.properties.ThirdPartyApis;
import com.improver.util.mail.MailService;
import com.stripe.Stripe;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;

import static com.improver.application.properties.BusinessProperties.*;
import static com.improver.application.properties.Text.BONUS_MESSAGE;
import static com.improver.application.properties.Text.INITIAL_BONUS_MESSAGE;
import static java.time.temporal.TemporalAdjusters.firstDayOfMonth;
import static java.time.temporal.TemporalAdjusters.lastDayOfMonth;

@Service
@Slf4j
public class BillingService {

    // Required for same instance Transactional method call
    @Autowired private BillingService self;
    @Autowired private BillRepository billRepository;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private WsNotificationService wsNotificationService;
    @Autowired private InvitationRepository invitationRepository;
    @Autowired private MailService mailService;
    @Autowired private ThirdPartyApis thirdPartyApis;
    @Autowired private StaffActionLogger staffActionLogger;


    @PostConstruct
    public void init() {
        Stripe.apiKey = thirdPartyApis.getStripeSecretKey();
    }

    public void addBonus(Company company, int amount, String comment, Staff currentStaff) {
        comment = comment != null && !comment.equals("") ? comment : BONUS_MESSAGE;
        self.addBonusTransactional(company, amount, comment);
        wsNotificationService.updateBalance(company, company.getBilling());
        wsNotificationService.bonusReceived(company, amount);
        if(currentStaff != null) {
            staffActionLogger.logAddBonus(currentStaff, company.getId(), amount);
        }
        mailService.sendBonus(company, amount);
    }

    @Transactional
    public void addBonusTransactional(Company company, int amount, String comment) {
        if(amount < MIN_INVITATION_BONUS || amount > MAX_INVITATION_BONUS) {
            throw new ValidationException("The bonus amount is out of limits (" + MIN_INVITATION_BONUS / 100 + " - " + MAX_INVITATION_BONUS / 100 + " )");
        }
        Billing billing = company.getBilling();
        billing.addToBalance(amount);
        billRepository.save(billing);
        Transaction transaction = Transaction.bonus(company, amount, billing.getBalance(), comment);
        transactionRepository.save(transaction);
    }

    public void addInitialBonus(Company company, String email) {
        Optional<Invitation> invitationOptional = invitationRepository.findByEmailAndActivatedIsNull(email);
        if (invitationOptional.isPresent()) {
            Invitation invitation = invitationOptional.get();
            self.addBonusTransactional(company, invitation.getBonus(), INITIAL_BONUS_MESSAGE);
            invitation.setActivated(ZonedDateTime.now());
            invitationRepository.save(invitation);
        }
    }

    public CompanyLeadsReport getCompanyLeadsReport(long companyId) {
        Billing billing = billRepository.findByCompanyId(companyId)
            .orElseThrow(NotFoundException::new);
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime countingDate = now.minusMonths(MONTHS_STATISTIC_COUNT + 1L);
        LinkedList<CompanyLeadsReport.MonthReport> past = new LinkedList<>();
        for (int i = 0; i <= MONTHS_STATISTIC_COUNT; i++) {
            countingDate = countingDate.plusMonths(1);
            List<Transaction> transactions = transactionRepository.findPurchasedByCompanyBetween(companyId, countingDate.with(firstDayOfMonth()), countingDate.with(lastDayOfMonth()));
            String monthName = countingDate.getMonth().getDisplayName(TextStyle.FULL, Locale.US);
            int dealsCount = transactions.size();
            int monthAmount = transactions.stream()
                .mapToInt(Transaction::getAmount)
                .sum();
            past.add(new CompanyLeadsReport.MonthReport(monthName, dealsCount, monthAmount));
        }


        List<Transaction> transactions;
        String period;
        if (billing.getSubscription().isActive()){
            period = billing.getSubscription().getStartBillingDate().format(DateTimeFormatter.ofPattern("d MMM").withLocale(Locale.US))
                + " - " + billing.getSubscription().getNextBillingDate().format(DateTimeFormatter.ofPattern("d MMM").withLocale(Locale.US));
            transactions = transactionRepository.findPurchasedByCompanyBetween(companyId, billing.getSubscription().getStartBillingDate(), billing.getSubscription().getNextBillingDate());
        } else {
            period = now.getMonth().getDisplayName(TextStyle.FULL, Locale.US);
            transactions = transactionRepository.findPurchasedByCompanyBetween(companyId, now.with(firstDayOfMonth()), now.with(lastDayOfMonth()));
        }




        int payAndGoDealsCount = (int) transactions.stream()
            .filter(Transaction::isManualLead)
            .count();
        int payAndGoSpend = transactions.stream()
            .filter(Transaction::isManualLead)
            .mapToInt(Transaction::getAmount)
            .sum();

        int subscriptionDealsCount = (int) transactions.stream()
            .filter(transaction -> !transaction.isManualLead())
            .count();

        int subscriptionAmount = billing.getSubscription().getBudget();
        int subscriptionSpend = subscriptionAmount - billing.getSubscription().getReserve();
        CompanyLeadsReport.DetailedMonthReport current = new CompanyLeadsReport.DetailedMonthReport(period,
            payAndGoDealsCount, payAndGoSpend, subscriptionDealsCount, subscriptionSpend, subscriptionAmount);

        return new CompanyLeadsReport(current, past);
    }


    public Receipt getReceipt(Company company, long proProjectRequestId) {
        Transaction transaction = transactionRepository.findByTypeAndCompanyAndProject(Transaction.Type.PURCHASE, company, proProjectRequestId)
            .orElseThrow(NotFoundException::new);
        return from(transaction, company);
    }


    public Receipt getReceipt(Company company, String transactionId) {
        Transaction transaction = transactionRepository.findByIdAndCompany(Transaction.getIdFromNumber(transactionId), company)
            .orElseThrow(NotFoundException::new);
         return from(transaction, company);
    }


    private Receipt from(Transaction source, Company company) {
        Transaction transaction = null;
        Transaction refund = null;
        Receipt receipt = new Receipt();
        ProjectRequest projectRequest = source.getProjectRequest();
        int totalSpend = source.getAmount();


        // 1 PURCHASE / RETURN
        if(Transaction.Type.PURCHASE.equals(source.getType()) && source.isRefunded()){
            transaction = source;
            refund = transactionRepository.findByTypeAndCompanyAndProject(Transaction.Type.RETURN, company, projectRequest.getId())
                .orElseThrow(() -> new ConflictException("No linked RETURN transaction found"));
        }
        else if(source.getType().equals(Transaction.Type.RETURN)) {
            refund = source;
            transaction = transactionRepository.findByTypeAndCompanyAndProject(Transaction.Type.PURCHASE, company, projectRequest.getId())
                .orElseThrow(() -> new ConflictException("No linked PURCHASE transaction found"));
        } else {
            transaction = source;
        }


        // 2 Project details
        if (projectRequest != null) {
            receipt.setProjectRequestId(projectRequest.getId())
                .setLocation(transaction.getLocation())
                .setService(transaction.getService())
                .setCustomer(projectRequest.getProject().getCustomer().getDisplayName());
            if (refund != null) {
                receipt.getRecords().add(new Receipt.Record(transaction.getCreated(), Receipt.PURCHASE_RECORD_TYPE, Receipt.PURCHASE_DESC, transaction.getAmount()));
                receipt.getRecords().add(new Receipt.Record(refund.getCreated(), Receipt.RETURN_RECORD_TYPE, Receipt.REFUND_DESC, refund.getAmount()));
                totalSpend -= refund.getAmount();
            }
        }

        // 3 Discount details
        if (transaction.getDiscount() != 0) {
            if (refund == null) {
                receipt.getRecords().add(new Receipt.Record(transaction.getCreated(), Receipt.PURCHASE_RECORD_TYPE, Receipt.PURCHASE_DESC, transaction.getAmount() + transaction.getDiscount()));
                receipt.getRecords().add(new Receipt.Record(transaction.getCreated(), null, Receipt.DISCOUNT_DESC, transaction.getDiscount() * -1)); // negative number
            } else {
                receipt.getRecords().add(1, new Receipt.Record(transaction.getCreated(), null, Receipt.DISCOUNT_DESC, transaction.getDiscount() * -1)); // negative number
            }
        }

        // 4 General details
        String type = StringUtil.capitalize(transaction.getType().toString());
        receipt.setDetail(new Receipt.Record(transaction.getCreated(), type, transaction.generateRecordTitle(), transaction.getAmount()))
            .setId(transaction.getTransactionNumber())
            .setComments(transaction.getComment())
            .setInvoice(transaction.isCharge())
            .setCode(transaction.getChargeId())
            .setPaymentMethod(transaction.getPaymentMethod())
            .setTotalSpend(totalSpend);

        return receipt;
    }
}

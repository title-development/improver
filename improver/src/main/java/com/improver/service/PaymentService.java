package com.improver.service;

import com.improver.entity.Billing;
import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.entity.Transaction;
import com.improver.exception.*;
import com.improver.model.out.billing.PaymentCard;
import com.improver.repository.BillRepository;
import com.improver.repository.ContractorRepository;
import com.improver.repository.TransactionRepository;
import com.improver.util.PaymentCardsHandler;
import com.improver.util.mail.MailService;
import com.improver.util.serializer.SerializationUtil;
import com.stripe.exception.CardException;
import com.stripe.exception.StripeException;
import com.stripe.model.Card;
import com.stripe.model.Charge;
import com.stripe.net.StripeResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static com.improver.application.properties.BusinessProperties.MAX_AVAILABLE_CARDS_COUNT;
import static com.improver.application.properties.BusinessProperties.REFERRAL_BONUS_AMOUNT;
import static com.improver.application.properties.SystemProperties.MIN_STRIPE_CHARGE_CENTS;
import static com.improver.application.properties.Text.TOP_UP_PURPOSE;
import static com.improver.util.TextMessages.REFERRAL_BONUS_MESSAGE;

@Service
public class PaymentService {

    @Autowired
    private WsNotificationService wsNotificationService;
    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private BillRepository billRepository;
    @Autowired
    private MailService mailService;
    @Autowired
    private BillingService billingService;
    @Autowired
    private ContractorRepository contractorRepository;
    private final PaymentCardsHandler paymentCardsHandler = new PaymentCardsHandler();

    public enum ChargeStatus {
        SUCCEEDED("succeeded"),
        PENDING("pending"),
        FAILED("failed");

        private final String value;

        ChargeStatus(String status) {
            value = status;
        }

        public boolean equalsValue(String value) {
            return this.value.equals(value);
        }

        @Override
        public String toString() {
            return this.value;
        }
    }

    /**
     * Replenish inner balance of user
     *
     * @param contractor current contractor
     * @param amount     amount in cents
     */
    public void topUpBalance(Company company, Contractor contractor, int amount) {
        if (amount <= 0) {
            throw new ValidationException("Amount should be greater then 0");
        }
        Billing billing = addToBalance(company, amount, Transaction.Type.TOP_UP, TOP_UP_PURPOSE, null);
        wsNotificationService.updateBalance(company, billing);
        mailService.sendBalanceTopUp(company, amount);
        addReferredBonusesIfNeeded(company, contractor, amount);
    }

    public Billing autoChargeForSubscription(Company company, int amount, int budget) {
        Billing billing = addToBalance(company, amount, Transaction.Type.SUBSCRIPTION,
            "Subscription balance top-up",
            "Charged " + SerializationUtil.formatUsd(amount) + " to fulfill subscription of $" + SerializationUtil.centsToUsd(budget));
        wsNotificationService.updateBalance(company, billing);
        return billing;
    }

    @Transactional
    public Billing addToBalance(Company company, int amount, Transaction.Type type, String purpose, String comment) {

        Billing billing = company.getBilling();
        Charge charge = charge(billing.getStripeId(), amount, purpose);
        Card card = (Card) charge.getSource();
        billing.addToBalance(amount);
        Billing saved = billRepository.save(billing);
        transactionRepository.save(Transaction.topupFor(type,
            comment,
            company,
            card.getBrand() + " ending in " + card.getLast4(),
            charge.getId(),
            amount,
            billing.getBalance())
        );
        return saved;
    }


    /**
     * Charge customer via Stripe
     *
     * @param stripeId current contractor
     * @param amount   amount in cents
     * @return Stripe Charge object
     */
    public Charge charge(String stripeId, int amount, String description) throws PaymentFailureException, InternalServerException {
        if (amount < MIN_STRIPE_CHARGE_CENTS) {
            throw new IllegalArgumentException("Amount must be at least $0.50 usd");
        }
        Charge charge = null;
        try {
            com.stripe.model.Customer stripeCustomer = com.stripe.model.Customer.retrieve(stripeId);
            Map<String, Object> chargeParams = new HashMap<>();
            chargeParams.put("amount", amount);
            chargeParams.put("currency", "usd");
            chargeParams.put("customer", stripeCustomer.getId());
            chargeParams.put("description", description);
            charge = Charge.create(chargeParams);
        } catch (CardException e) {
            throw new PaymentFailureException("Payment cannot be proceed due to card issue. Please check your billing information and try again.", e);
        } catch (StripeException e) {
            throw new InternalServerException("Payment cannot be proceed:  " + e.getMessage(), e);
        }
        if (ChargeStatus.FAILED.equalsValue(charge.getStatus())) {
            throw new PaymentFailureException("Payment failure. " + charge.getFailureMessage());
        }

        return charge;
    }

    /**
     * Add card to stripe Customer
     *
     * @param token obtained via Stripe.js
     */
    public void addCard(Contractor contractor, String token) throws ConflictException {
        Company company = contractor.getCompany();
        Billing bill = company.getBilling();
        List<PaymentCard> cards = paymentCardsHandler.getCards(company);
        if (cards.size() >= MAX_AVAILABLE_CARDS_COUNT) {
            throw new ConflictException("You can add only " + MAX_AVAILABLE_CARDS_COUNT + " cards");
        }
        try {
            com.stripe.model.Customer stripeCustomer;
            Map<String, Object> customerParams = new HashMap<>();
            customerParams.put("source", token);
            if (bill.getStripeId() == null) {
                customerParams.put("email", contractor.getEmail());
                stripeCustomer = com.stripe.model.Customer.create(customerParams);
                bill.setStripeId(stripeCustomer.getId());
                billRepository.save(bill);
            } else {
                stripeCustomer = com.stripe.model.Customer.retrieve(bill.getStripeId());
                stripeCustomer.getSources().create(customerParams);
            }
        } catch (CardException e) {
            throw new InternalServerException("Payment card was declined", e);
        } catch (StripeException e) {
            throw new InternalServerException("Payment Card cannot be proceed due to connectivity issue. Try again in a while", e);
        }
    }

    /**
     * Set default card for Stripe Customer
     */
    public void setDefaultCard(Company company, String cardId) {
        Billing bill = company.getBilling();
        if (bill.getStripeId() == null) {
            throw new ConflictException("No Payment method defined. Please add Payment method first");
        }
        com.stripe.model.Customer stripeCustomer = null;
        try {
            stripeCustomer = com.stripe.model.Customer.retrieve(bill.getStripeId());
            Map<String, Object> params = new HashMap<>();
            params.put("default_source", cardId);
            stripeCustomer.update(params);
        } catch (CardException e) {
            throw new InternalServerException("Your card was declined", e);
        } catch (StripeException e) {
            throw new InternalServerException("Payment Card cannot be proceed due to connectivity issue. Try again in a while", e);
        }
    }

    /**
     * Delete card from Stripe Customer
     */
    public void deleteCard(Company company, String cardId) {
        Billing bill = company.getBilling();
        if (bill.getStripeId() == null) {
            throw new ConflictException("No Payment method defined. Please add Payment method first");
        }

        try {
            com.stripe.model.Customer stripeCustomer = com.stripe.model.Customer.retrieve(bill.getStripeId());
            StripeResponse response = stripeCustomer.getSources().retrieve(cardId).getLastResponse();

            if (response.code() != 200) {
                throw new InternalServerException("Your card was declined.");
            }

        } catch (StripeException e) {
            throw new InternalServerException("Payment Card cannot be proceed due to connectivity issue. Try again in a while", e);
        }
    }

    private void addReferredBonusesIfNeeded(Company company, Contractor contractor, int amount) throws NotFoundException {
        if (amount >= REFERRAL_BONUS_AMOUNT &&
            !contractor.isReferralBonusReceived() &&
            contractor.getReferredBy() != null &&
            !contractor.getReferredBy().isEmpty()
        ) {
            Contractor referredByContractor = contractorRepository.getContractorByRefCode(contractor.getReferredBy())
                .orElseThrow(NotFoundException::new);
            billingService.addBonus(company, REFERRAL_BONUS_AMOUNT, REFERRAL_BONUS_MESSAGE, null);
            contractor.setReferralBonusReceived(true);
            billingService.addBonus(referredByContractor.getCompany(), REFERRAL_BONUS_AMOUNT, REFERRAL_BONUS_MESSAGE, null);
        }
    }

}

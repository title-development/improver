package com.improver.service;

import com.improver.entity.Billing;
import com.improver.entity.Company;
import com.improver.entity.Contractor;
import com.improver.entity.Transaction;
import com.improver.exception.ConflictException;
import com.improver.exception.PaymentFailureException;
import com.improver.exception.InternalServerException;
import com.improver.exception.ValidationException;
import com.improver.model.out.PaymentCard;
import com.improver.repository.BillRepository;
import com.improver.repository.TransactionRepository;
import com.improver.util.mail.MailService;
import com.improver.util.serializer.SerializationUtil;
import com.improver.ws.WsNotificationService;
import com.stripe.exception.*;
import com.stripe.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import static com.improver.application.properties.BusinessProperties.MAX_AVAILABLE_CARDS_COUNT;
import static com.improver.application.properties.Constants.REPLENISHMENT_PURPOSE;

@Service
public class PaymentService {

    private final Logger log = LoggerFactory.getLogger(getClass());

    @Autowired
    private WsNotificationService wsNotificationService;
    @Autowired private TransactionRepository transactionRepository;
    @Autowired private BillRepository billRepository;
    @Autowired private MailService mailService;

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
    public void replenishBalance(Company company, Contractor contractor, int amount) {
        if (amount <= 0) {
            throw new ValidationException("Amount should be greater then 0");
        }
        Billing billing = addToBalance(company, contractor, amount, Transaction.Type.REPLENISHMENT, REPLENISHMENT_PURPOSE, null);
        wsNotificationService.updateBalance(company, billing);
        mailService.sendBalanceReplenished(company, amount);
    }

    public Billing autoChargeForSubscription(Company company, int amount, int budget) {
        Billing billing = addToBalance(company, null, amount, Transaction.Type.SUBSCRIPTION, "Subscription balance replenishment", "Charged " + SerializationUtil.formatUsd(amount) + " to fulfill subscription of $" + SerializationUtil.centsToUsd(amount));
        wsNotificationService.updateBalance(company, billing);
        return billing;
    }

    public void replenishForSubscription(Company company, Contractor contractor, int amount, int budget) {
        Billing billing = addToBalance(company, contractor, amount, Transaction.Type.SUBSCRIPTION, "Subscription balance replenishment", "Charged " + SerializationUtil.formatUsd(amount) + " to fulfill subscription of $" + SerializationUtil.centsToUsd(amount));
        wsNotificationService.updateBalance(company, billing);
    }

    @Transactional
    public Billing addToBalance(Company company, Contractor contractor, int amount, Transaction.Type type, String purpose, String comment) {

        Billing billing = company.getBilling();
        Charge charge = charge(billing.getStripeId(), amount, purpose);
        Card card = (Card) charge.getSource();
        billing.addToBalance(amount);
        Billing saved = billRepository.save(billing);
        transactionRepository.save(Transaction.replenishmentFor(type,
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
            throw new PaymentFailureException("Payment cannot be proceed due to card issue", e);
        } catch (AuthenticationException | InvalidRequestException | APIConnectionException | APIException e) {
            throw new InternalServerException("Payment cannot be proceed due to connectivity issue. Try again in a while", e);
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
    public void addCard(Company company, String token) throws ConflictException {
        Billing bill = company.getBilling();
        List<PaymentCard> cards = getCards(company);
        if (cards.size() >= MAX_AVAILABLE_CARDS_COUNT) {
            throw new ConflictException("You can add only " + MAX_AVAILABLE_CARDS_COUNT + " cards");
        }
        try {
            com.stripe.model.Customer stripeCustomer;
            Map<String, Object> customerParams = new HashMap<>();
            customerParams.put("source", token);
            if (bill.getStripeId() == null) {
                customerParams.put("email", company.getEmail());
                stripeCustomer = com.stripe.model.Customer.create(customerParams);
                bill.setStripeId(stripeCustomer.getId());
                billRepository.save(bill);
            } else {
                stripeCustomer = com.stripe.model.Customer.retrieve(bill.getStripeId());
                stripeCustomer.getSources().create(customerParams);
            }
        } catch (CardException e) {
            throw new InternalServerException("Payment card was declined", e);
        } catch (AuthenticationException | InvalidRequestException | APIConnectionException | APIException e) {
            throw new InternalServerException("Payment Card cannot be proceed due to connectivity issue. Try again in a while", e);
        }

    }

    /**
     * Get all card from Stripe Customer
     */
    public List<PaymentCard> getCards(Company company) {
        Billing bill = company.getBilling();
        if (bill.getStripeId() == null) {
            return new ArrayList<PaymentCard>();
        }
        com.stripe.model.Customer stripeCustomer;
        List<PaymentCard> cards;

        try {
            stripeCustomer = com.stripe.model.Customer.retrieve(bill.getStripeId());
            HashMap<String, Object> sourcesParams = new HashMap<>();
            sourcesParams.put("object", "card");
            sourcesParams.put("limit", MAX_AVAILABLE_CARDS_COUNT);
            ExternalAccountCollection externalAccountCollection = stripeCustomer.getSources().list(sourcesParams);
            List<ExternalAccount> externalAccounts = externalAccountCollection.getData();
            cards = externalAccounts.stream()
                .map(c -> SerializationUtil.mapper().convertValue(c, PaymentCard.class))
                .collect(Collectors.toList());
        } catch (CardException e) {
            log.error("Cannot retrieve payment cards", e);
            throw new InternalServerException(e.getMessage());
        } catch (AuthenticationException | InvalidRequestException | APIConnectionException | APIException e) {
            // TODO: change to third party
            throw new InternalServerException("Cannot retrieve payment cards due to connectivity issue. Try again in a while", e);
        }
        return cards;
    }

    public PaymentCard getDefaultCard(Company company) {
        List<PaymentCard> cards = getCards(company);
        if (cards.isEmpty()) {
            return null;
        }
        return cards.get(0);
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
        } catch (AuthenticationException | InvalidRequestException | APIConnectionException | APIException e) {
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
            stripeCustomer.getSources().retrieve(cardId).delete();
        } catch (CardException e) {
            throw new InternalServerException("Your card was declined", e);
        } catch (AuthenticationException | InvalidRequestException | APIConnectionException | APIException e) {
            throw new InternalServerException("Payment Card cannot be proceed due to connectivity issue. Try again in a while", e);
        }
    }

}

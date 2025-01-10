package com.improver.util;

import com.improver.entity.Billing;
import com.improver.entity.Company;
import com.improver.exception.InternalServerException;
import com.improver.model.out.billing.PaymentCard;
import com.improver.util.serializer.SerializationUtil;
import com.stripe.exception.CardException;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentSourceCollection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

import static com.improver.application.properties.BusinessProperties.MAX_AVAILABLE_CARDS_COUNT;

public class PaymentCardsHandler {

    private final Logger log = LoggerFactory.getLogger(getClass());

    public PaymentCard getDefaultCard(Company company) {
        List<PaymentCard> cards = getCards(company);
        if (cards.isEmpty()) {
            return null;
        }
        return cards.get(0);
    }

    /**
     * Get all card from Stripe Customer
     */
    public List<PaymentCard> getCards(Company company) {
        Billing bill = company.getBilling();
        if (bill.getStripeId() == null) {
            return new ArrayList<>();
        }
        com.stripe.model.Customer stripeCustomer;
        try {
            stripeCustomer = com.stripe.model.Customer.retrieve(bill.getStripeId());
            HashMap<String, Object> sourcesParams = new HashMap<>();
            sourcesParams.put("object", "card");
            sourcesParams.put("limit", MAX_AVAILABLE_CARDS_COUNT);
            PaymentSourceCollection paymentSourceCollection = stripeCustomer.getSources().list(sourcesParams);
            return paymentSourceCollection.getData().stream()
                .map(paymentSource ->
                    SerializationUtil.mapper().convertValue(paymentSource, PaymentCard.class))
                .collect(Collectors.toList());
        } catch (CardException e) {
            log.error("Cannot retrieve payment cards", e);
            throw new InternalServerException(e.getMessage());
        } catch (StripeException e) {
            // TODO: change to third party
            throw new InternalServerException("Cannot retrieve payment cards: " + e.getMessage(), e);
        }
    }
}

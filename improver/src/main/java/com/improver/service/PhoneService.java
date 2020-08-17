package com.improver.service;

import com.improver.entity.*;
import com.improver.exception.ValidationException;
import com.improver.model.in.PhoneValidationConfirm;
import com.improver.repository.PhoneValidationRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.Random;
import java.util.UUID;

@Service
@Slf4j
public class PhoneService {

    public static final int VALIDATION_CODE_LENGTH = 4;
    public static final String SIMULATION_CODE = "1111";

    @Value("${server.domain}") private String serverDomain;
    @Value("${account.twilio.sid}") private String twilioAccountSid;
    @Value("${account.twilio.auth.token}") private String twilioAuthToken;
    @Value("${account.twilio.phone.number}") private String twilioAccountPhoneNumber;
    @Value("${phone.country.code}") private String countryCode;
    @Value("${phone.validation.enabled}") private boolean verificationEnabled;

    @Lazy @Autowired private PhoneService self;
    @Autowired private PhoneValidationRepository phoneValidationRepository;

    @PostConstruct
    private void init() {
        Twilio.init(twilioAccountSid, twilioAuthToken);
    }

    public void sendTextMessage(String phoneNumber, String textMessage) {
        Message.creator(new PhoneNumber(countryCode + phoneNumber), // to
            new PhoneNumber(twilioAccountPhoneNumber), // from
            textMessage)
            .create();
    }

    @Async
    public void sendLeadPurchaseMessage(Project project,
                                        ProjectRequest projectRequest,
                                        Customer customer,
                                        Contractor contractor,
                                        String serviceType,
                                        boolean isManual) {
        if(!isManual && contractor.getNotificationSettings().isReceiveNewSubscriptionLeadsSms()) {
            String url = String.format("%s/pro/projects/%s", serverDomain, projectRequest.getId());
            sendNewSubscriptionLeadPurchaseMessage(customer.getDisplayName(), contractor.getInternalPhone(), serviceType, url);
        }
        if (customer.getNotificationSettings().isReceiveNewProjectRequestsSms()) {
            String url = String.format("%s/my/projects/%s#%s", serverDomain, project.getId(), projectRequest.getId());
            sendNewProjectRequestMessage(contractor.getCompany().getName(), customer.getInternalPhone(), serviceType, url);
        }
    }

    public void sendNewSubscriptionLeadPurchaseMessage(String customerName, String contractorPhoneNumber, String serviceType, String url) {
        try {
            sendTextMessage(contractorPhoneNumber, String.format("New subscription project\n%s for %s\n%s",  serviceType, customerName, url));
        } catch (Exception e) {
            log.error("Unable to send SMS notification about new subscription lead to {}", contractorPhoneNumber,  e);
        }

    }

    public void sendNewProjectRequestMessage(String companyName, String customerPhoneNumber, String serviceType, String url) {
        try {
            sendTextMessage(customerPhoneNumber, String.format("You have new project request from %s on %s\n%s",  companyName, serviceType, url));
        } catch (Exception e) {
            log.error("Unable to send SMS notification about new project request to {}", customerPhoneNumber,  e);
        }
    }

    public String requestPhoneValidation(String phoneNumber) {
        if (!verificationEnabled) {
            return simulatePhoneValidation();
        }
        String validationCode = generateRandomNumber(VALIDATION_CODE_LENGTH);
        Message message = Message
            .creator(new PhoneNumber(countryCode + phoneNumber), // to
                new PhoneNumber(twilioAccountPhoneNumber), // from
                String.format("%s code for Home Improve.",  validationCode))
            .create();
        String messageSid = message.getSid();
        phoneValidationRepository.save(new PhoneValidation()
            .setMessageSid(messageSid)
            .setCode(validationCode));
        return messageSid;
    }

    /**
     * Method for simulation of phone number verification with 1111 code. Its avoid real text message delivery.
     * Should be used only for development purpose.
     */
    public String simulatePhoneValidation() {
        String messageSid = UUID.randomUUID().toString();
        phoneValidationRepository.save(new PhoneValidation()
            .setMessageSid(messageSid)
            .setCode(SIMULATION_CODE));
        return messageSid;
    }

    public void confirmPhoneValidation(PhoneValidationConfirm phoneValidationConfirm) {
        PhoneValidation phoneValidation = phoneValidationRepository.findByMessageSidAndCode(phoneValidationConfirm.getMessageSid(), phoneValidationConfirm.getCode())
            .orElseThrow(() -> new ValidationException("Phone validation code is wrong, or validation record not found"));
        phoneValidationRepository.delete(phoneValidation);
    }

    private String generateRandomNumber(int charLength) {
        return String.valueOf(charLength < 1 ? 0 : new Random()
            .nextInt((9 * (int) Math.pow(10, charLength - 1)) - 1)
            + (int) Math.pow(10, charLength - 1));
    }

}

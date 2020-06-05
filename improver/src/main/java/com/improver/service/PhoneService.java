package com.improver.service;

import com.improver.entity.PhoneValidation;
import com.improver.exception.ValidationException;
import com.improver.model.in.PhoneValidationConfirm;
import com.improver.repository.PhoneValidationRepository;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.Random;
import java.util.UUID;

@Service
@Slf4j
public class PhoneService {

    public static final int CODE_LENGTH = 4;
    public static final String MESSAGE = "Home Improve. Verification code: ";
    public static final String SIMULATION_CODE = "1111";

    @Value("${account.twilio.sid}") private String twilioAccountSid;
    @Value("${account.twilio.auth.token}") private String twilioAuthToken;
    @Value("${account.twilio.phone.number}") private String twilioPhoneNumber;
    @Value("${phone.country.code}") private String phoneCountryCode;
    @Value("${phone.validation.enabled}") private boolean verificationEnabled;

    @Autowired private PhoneValidationRepository phoneValidationRepository;

    @PostConstruct
    private void init() {
        Twilio.init(twilioAccountSid, twilioAuthToken);
    }

    public String requestPhoneValidation(String phoneNumber) {

        if(!verificationEnabled) {
            return simulatePhoneValidation();
        }

        String validationCode = generateRandomNumber(CODE_LENGTH);

        Message message = Message
            .creator(new PhoneNumber(phoneCountryCode + phoneNumber), // to
                new PhoneNumber(twilioPhoneNumber), // from
                MESSAGE + validationCode)
            .create();

        String messageSid = message.getSid();

        phoneValidationRepository.save(new PhoneValidation()
            .setMessageSid(messageSid)
            .setCode(validationCode));

        return messageSid;
    }

    public String simulatePhoneValidation() {
        String messageSid = UUID.randomUUID().toString();

        phoneValidationRepository.save(new PhoneValidation()
            .setMessageSid(messageSid)
            .setCode(SIMULATION_CODE));

        return messageSid;
    }

    public void confirmPhoneValidation(PhoneValidationConfirm phoneValidationConfirm) {
        PhoneValidation phoneValidation = phoneValidationRepository.findByMessageSidAndCode(phoneValidationConfirm.getMessageSid(), phoneValidationConfirm.getCode())
            .orElseThrow(ValidationException::new);
        phoneValidationRepository.delete(phoneValidation);
    }

    private String generateRandomNumber(int charLength) {
        return String.valueOf(charLength < 1 ? 0 : new Random()
            .nextInt((9 * (int) Math.pow(10, charLength - 1)) - 1)
            + (int) Math.pow(10, charLength - 1));
    }

}

package com.improver.service;

import com.improver.exception.RecaptchaValidationException;
import com.improver.model.recapcha.ReCaptchaResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
public class ReCaptchaService {
    @Value("${account.google.recaptcha.secret.key}")
    private String recaptchaSecret;
    @Value("${account.google.recaptcha.verify.url}")
    private String recaptchaVerifyUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    private final Logger log = LoggerFactory.getLogger(getClass());

    public ReCaptchaResponse validate(String response, String userIp) {
        MultiValueMap<String, Object> parameters = new LinkedMultiValueMap<>();
        parameters.add("secret", recaptchaSecret);
        parameters.add("response", response);
        parameters.add("remoteip", userIp);

        try {
            ReCaptchaResponse result = restTemplate.postForEntity(recaptchaVerifyUrl, parameters, ReCaptchaResponse.class).getBody();
            log.debug("reCAPTCHA validation finished: {}", result);
            return result;
        } catch (RestClientException e) {
            throw new RecaptchaValidationException("Recaptcha validation error. Please try again later");
        }
    }

}

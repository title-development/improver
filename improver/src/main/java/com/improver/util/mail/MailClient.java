package com.improver.util.mail;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.MimeMessagePreparator;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.concurrent.*;

@Service
@Slf4j
public class MailClient {

    private final static String DUMMY_VALUE = "dummyValue";

    @Autowired private TemplateEngine templateEngine;
    @Autowired private JavaMailSender mailSenderNoreply;
    @Autowired private JavaMailSender mailSenderSupport;

    @Value("${mail.sendername}") private String senderName;
    @Value("${mail.resend.maxattempts}") private Integer maxResendAttempts;
    private CopyOnWriteArraySet<MailHolder> unsentMails = new CopyOnWriteArraySet<>();

    @Async
    public void sendMailsSeparate(String subject, String template, Context context, MailHolder.MessageType messageType, String... recipients) {
        for (String recipient: recipients) {
            prepareAndSend(subject, template, context, messageType, recipient);
        }
    }

    @Async
    public void sendMail(String subject, String template, Context context, MailHolder.MessageType messageType, String... recipients) {
        if (recipients.length == 0) throw new IllegalArgumentException("recipients could not be empty");
        prepareAndSend(subject, template, context, messageType, recipients);
    }

    protected void prepareAndSend(String subject, String template, Context context, MailHolder.MessageType messageType, String... recipient) {
        String message = templateEngine.process(template, context);
        MimeMessagePreparator messagePreparator = mimeMessage -> {
            MimeMessageHelper messageHelper = new MimeMessageHelper(mimeMessage);
            messageHelper.setTo(recipient);
            messageHelper.setSubject(subject);
            messageHelper.setText(message, true);
            // first param will be rewritten by emails sender. It's used because no other way to set sender name
            messageHelper.setFrom(DUMMY_VALUE, senderName);
        };
        MailHolder mailHolder = new MailHolder(messagePreparator, messageType);
        try {
            send(mailHolder);
        } catch (MailException e) {
            log.error("Could not send mail. Mail is going to que", e);
            unsentMails.add(mailHolder);
        }
    }

    private void send(MailHolder mailHolder) {
        log.trace("Sending email");
            switch (mailHolder.getMessageType()) {
                case INFO:
                    mailSenderNoreply.send(mailHolder.getMimeMessagePreparator());
                    break;
                case BILLING:
                    mailSenderNoreply.send(mailHolder.getMimeMessagePreparator());
                    break;
                case SUPPORT:
                    mailSenderSupport.send(mailHolder.getMimeMessagePreparator());
                    break;
                case NOREPLY:
                default:
                    mailSenderNoreply.send(mailHolder.getMimeMessagePreparator());
                    break;
            }
    }

    /**
     * Schedule resending of unsent emails
     */
    @Scheduled(fixedDelayString="${mail.resend.timeout}")
    public void sendUnsentEmails() {
        log.trace("Check unsent emails que");
        unsentMails.forEach(mailHolder -> {
            try {
                if (mailHolder.getAttempts() > maxResendAttempts) {
                    unsentMails.remove(mailHolder);
                    return;
                }
                log.debug("Sending unsent email");
                send(mailHolder);
                log.debug("Email sent");
                unsentMails.remove(mailHolder);
            } catch (MailException e) {
                log.error("Could not resend mail", e);
                mailHolder.setAttempts(mailHolder.getAttempts() + 1);
            }
        });
    }

}

package com.improver.job;

import com.improver.entity.ProjectRequest;
import com.improver.model.tmp.UnreadProjectMessageInfo;
import com.improver.repository.ProjectMessageRepository;
import com.improver.util.mail.MailService;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.core.SchedulerLock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Slf4j
@Component
public class UnreadMessagesMailNotificationJob {

    public static final int UNREAD_MESSAGES_MAIL_NOTIFICATION_LOCK = 60 * 1000 * 15;
    public static final Duration UNREAD_MESSAGE_JOB_INTERVAL = Duration.ofMinutes(15);

    @Autowired private ProjectMessageRepository projectMessageRepository;
    @Autowired private MailService mailService;


    @Scheduled(cron = "${unread.message.mail.notification.cron}")
    @SchedulerLock(name = "unreadMessagesMailNotification", lockAtLeastFor = UNREAD_MESSAGES_MAIL_NOTIFICATION_LOCK, lockAtMostFor = UNREAD_MESSAGES_MAIL_NOTIFICATION_LOCK)
    public void unreadMessagesMailNotification(){
        log.info("Unread messages mail notification Job started");
        ZonedDateTime now = ZonedDateTime.now();

        List<UnreadProjectMessageInfo> customersUnreadMessages = projectMessageRepository.getCustomersWithUnreadMessagesByCreatedDateBetween(
            now.minus(UNREAD_MESSAGE_JOB_INTERVAL.multipliedBy(2)),
            now.minus(UNREAD_MESSAGE_JOB_INTERVAL),
            ProjectRequest.Status.getActiveForCustomer());
        customersUnreadMessages.stream()
            .collect(Collectors.groupingBy(UnreadProjectMessageInfo::getRecipientEmail))
            .forEach((email, messages) -> mailService.sendUnreadMessageNotificationEmails(email, messages, true));

        List<UnreadProjectMessageInfo> contractorsUnreadMessages = projectMessageRepository.getContractorsWithUnreadMessagesByCreatedDateBetween(
            now.minus(UNREAD_MESSAGE_JOB_INTERVAL.multipliedBy(2)),
            now.minus(UNREAD_MESSAGE_JOB_INTERVAL),
            ProjectRequest.Status.getActiveForCustomer());
        contractorsUnreadMessages.stream()
            .collect(Collectors.groupingBy(UnreadProjectMessageInfo::getRecipientEmail))
            .forEach((email, messages) -> mailService.sendUnreadMessageNotificationEmails(email, messages, false));

        log.info("Unread messages mail notification Job ended");
    }

}

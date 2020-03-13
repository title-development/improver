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
public class UnreadMessagesMailNotificationJob implements OnesPerNodeTask {

    private static final Duration UNREAD_MESSAGE_JOB_INTERVAL = Duration.ofMinutes(15);
    @Autowired private ProjectMessageRepository projectMessageRepository;
    @Autowired private MailService mailService;


    @Scheduled(cron = "${job.unread.messages.cron}")
    @SchedulerLock(name = "unreadMessagesMailNotification", lockAtLeastFor = MAX_CLOCK_DIFF_BETWEEN_NODES, lockAtMostFor = MAX_TASK_DELAY)
    public void unreadMessagesMailNotification(){
        log.info("Job 1 started| Unread messages mail");
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

        log.info("Job 1 ended | Unread messages mail");
    }

}

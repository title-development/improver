package com.improver.ws;

import com.improver.entity.*;
import com.improver.model.out.NotificationMessage;
import com.improver.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import static com.improver.application.properties.Path.*;

@Service
public class WsNotificationService {

    @Autowired private SimpMessagingTemplate stompTemplate;
    @Autowired private NotificationRepository notificationRepository;

    public void updateBalance(Company company, Billing billing){
        String message = NotificationMessage.balance(billing.getBalance(), billing.getSubscription().isActive(),
            billing.getSubscription().getReserve()).toJson();
        company.getContractors().forEach(contractor ->
            stompTemplate.convertAndSend(WS_QUEUE_USERS + SLASH + contractor.getId() + NOTIFICATIONS, message));
    }

    public void sendChatMessage(ProjectMessage message, long projectRequestId) {
        stompTemplate.convertAndSend(WS_TOPIC_PROJECT_REQUESTS + SLASH + projectRequestId, message);
    }

    public void newProjectRequest(User receiver, Company company, String serviceType, long projectId){
        sendNotification(receiver.getId(), Notification.newProjectRequest(receiver, company.getName(), company.getId(), serviceType, projectId));
    }

    public void proLeftProject(User receiver, Company company, String serviceType, long projectId){
        sendNotification(receiver.getId(), Notification.proLeftProject(receiver, company.getName(), company.getId(), serviceType, projectId));
    }

    public void bonusReceived(Company company, int amount) {
        company.getContractors().forEach(contractor ->
            sendNotification(contractor.getId(), Notification.bonusReceived(contractor, amount))
        );
    }

    public void newSubscriptionLeadPurchase(User receiver, Customer customer, String serviceType, long projectRequestId){
        sendNotification(receiver.getId(), Notification.newSubscriptionLeadPurchase(receiver, customer.getDisplayName(), customer.getId(), serviceType, projectRequestId));
    }

    public void customerHired(User receiver, Customer customer, String serviceType, long projectRequestId){
        sendNotification(receiver.getId(), Notification.customerHired(receiver, customer.getDisplayName(), customer.getId(), serviceType, projectRequestId));
    }

    public void customerCloseProject(User receiver, Customer customer, String serviceType, long projectRequestId){
        sendNotification(receiver.getId(), Notification.customerCloseProject(receiver, customer.getDisplayName(), customer.getId(), serviceType, projectRequestId));
    }


    public void reviewed(User receiver, Customer customer, String companyId){
        sendNotification(receiver.getId(), Notification.reviewed(receiver, customer.getDisplayName(), customer.getId(), companyId));
    }

    public void reviewedNegative(User receiver, Customer customer, String companyId){
        sendNotification(receiver.getId(), Notification.reviewedNegative(receiver, customer.getDisplayName(), customer.getId(), companyId));
    }

    public void reviewPublished(User receiver, Customer customer, String companyId){
        sendNotification(receiver.getId(), Notification.reviewPublished(receiver, customer.getDisplayName(), customer.getId(), companyId));
    }


    public void projectInvalidated(User receiver, String serviceType, long projectId){
        sendNotification(receiver.getId(), Notification.projectInvalidated(receiver, serviceType, projectId));
    }

    public void projectToValidation(User receiver, String serviceType, long projectId){
        sendNotification(receiver.getId(), Notification.projectToValidation(receiver, serviceType, projectId));
    }

    public void projectValidated(User receiver, String serviceType, long projectId){
        sendNotification(receiver.getId(), Notification.projectValidated(receiver, serviceType, projectId));
    }

    public void sendNotification(long userId, Notification notification) {
        notificationRepository.save(notification);
        String json = NotificationMessage.plain(notification).toJson();
        stompTemplate.convertAndSend(WS_QUEUE_USERS + SLASH + userId + NOTIFICATIONS, json);
    }

}

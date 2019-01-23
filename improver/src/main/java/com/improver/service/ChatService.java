package com.improver.service;

import com.improver.entity.ProjectMessage;
import com.improver.entity.ProjectRequest;
import com.improver.entity.User;
import com.improver.exception.AccessDeniedException;
import com.improver.exception.ConflictException;
import com.improver.repository.ProjectMessageRepository;
import com.improver.repository.ProjectRequestRepository;
import com.improver.security.JwtPrincipal;
import com.improver.security.SecurityHelper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

import static com.improver.entity.ProjectMessage.Event.IS_TYPING;
import static com.improver.entity.ProjectMessage.Event.READ;
import static com.improver.entity.ProjectMessage.Type.EVENT;

@Slf4j
@Service
public class ChatService {

    @Autowired private ProjectRequestRepository projectRequestRepository;
    @Autowired private ProjectMessageRepository projectMessageRepository;
    @Autowired private SecurityHelper securityHelper;


    /**
     * Handles and processes all types of {@link ProjectMessage}.
     */
    public ProjectMessage handleMessage(ProjectMessage message, long projectRequestId) {
        message.setCreated(ZonedDateTime.now());
        boolean isReadEvent = EVENT.equals(message.getType())
            && (READ.equals(message.getEvent()) || IS_TYPING.equals(message.getEvent()));
        if (!isReadEvent) {
            log.debug("Broadcast message from user " + message.getSender());
        }

        ProjectRequest projectRequest = getWithSecurityCheck(projectRequestId, !isReadEvent);
        if (isReadEvent) {
            handleReadEvent(message.getSender(), message.getCreated(), projectRequest);
        } else {
            projectMessageRepository.save(message.setProjectRequest(projectRequest));
            handleReadEvent(message.getSender(), message.getCreated(), projectRequest);
        }
        return message;
    }


    /**
     * Check if current user have access to {@link ProjectRequest} conversation.
     *
     * @param projectRequestId id of {@link ProjectRequest}
     * @param checkIsChatActive if tue and conversation is closed throws {@link ConflictException}
     */
    public ProjectRequest getWithSecurityCheck(long projectRequestId, boolean checkIsChatActive) {
        JwtPrincipal principal = securityHelper.currentPrincipal();
        ProjectRequest request = null;
        if (User.Role.CONTRACTOR.equals(principal.getRole())){
            request = projectRequestRepository.findByIdAndContractorEmail(projectRequestId, principal.getName())
                .orElseThrow(AccessDeniedException::new);
        } else if (User.Role.CUSTOMER.equals(principal.getRole())){
            request = projectRequestRepository.findByIdAndCustomerEmail(projectRequestId, principal.getName())
                .orElseThrow(AccessDeniedException::new);
        } else {
            throw new AccessDeniedException();
        }
        if (checkIsChatActive && !request.isConversationActive()) {
            throw new ConflictException("Conversation is closed");
        }
        return request;
    }

    private void handleReadEvent(String sender, ZonedDateTime time, ProjectRequest projectRequest) {
        log.debug("ProjectRequest {} | user {} | last read at {}", projectRequest.getId(), sender, time.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        projectMessageRepository.markAsReadAfter(projectRequest.getId(), sender, time);
    }
}

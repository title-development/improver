package com.improver.ws.interceptors;

import org.slf4j.LoggerFactory;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;

/**
 * Used for debug purposes for now.
 */
public class LogWsHandlerDecorator extends WebSocketHandlerDecorator {

    final org.slf4j.Logger log = LoggerFactory.getLogger(getClass());


    public LogWsHandlerDecorator(org.springframework.web.socket.WebSocketHandler delegate) {
        super(delegate);
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        log.debug("WS Connection Established | session=" + session.getId());
        super.afterConnectionEstablished(session);
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        //log.debug("WS Message | session={}, message={}", session.getId(), message.getPayload());
        super.handleMessage(session, message);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        log.error("WS Transport Error | session=" + session.getId());
        super.handleTransportError(session, exception);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        log.debug("WS Connection Closed | session={}, status={}" + session.getId(), closeStatus);
        super.afterConnectionClosed(session, closeStatus);
    }
}

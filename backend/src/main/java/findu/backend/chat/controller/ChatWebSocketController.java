package findu.backend.chat.controller;

import findu.backend.chat.dto.ChatMessageRequest;
import findu.backend.chat.dto.ChatMessageResponse;
import findu.backend.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;

    @MessageMapping("/chat/{roomId}")
    @SendTo("/sub/chat/{roomId}")
    public ChatMessageResponse send(
            @DestinationVariable Long roomId,
            ChatMessageRequest request,
            Authentication authentication
    ) {

        Long uid = (Long) authentication.getPrincipal();

        return chatService.sendWebSocket(
                uid,
                roomId,
                request
        );
    }
}
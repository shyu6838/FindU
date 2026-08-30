package findu.backend.chat.dto;

import findu.backend.chat.entity.ChatMessage;

import java.time.LocalDateTime;

public record ChatMessageResponse(
        Long id,
        Long roomId,
        Long senderId,
        String senderNickname,
        String content,
        LocalDateTime createdAt
) {

    public static ChatMessageResponse from(ChatMessage x) {
        return new ChatMessageResponse(
                x.getId(),
                x.getRoom().getId(),
                x.getSender().getId(),
                x.getSender().getNickname(),
                x.getContent(),
                x.getCreatedAt()
        );
    }
}
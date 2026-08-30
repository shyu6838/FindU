package findu.backend.chat.dto;

import findu.backend.chat.entity.ChatRequest;

import java.time.LocalDateTime;

public record ChatRequestResponse(
        Long id,
        Long requesterId,
        String requesterNickname,
        Long receiverId,
        String receiverNickname,
        String status,
        LocalDateTime createdAt
) {

    public static ChatRequestResponse from(ChatRequest x) {
        return new ChatRequestResponse(
                x.getId(),
                x.getRequester().getId(),
                x.getRequester().getNickname(),
                x.getReceiver().getId(),
                x.getReceiver().getNickname(),
                x.getStatus().name(),
                x.getCreatedAt()
        );
    }
}
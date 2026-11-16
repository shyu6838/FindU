package findu.backend.chat.dto;

import jakarta.validation.constraints.NotNull;

public record CreateRoomRequest(
        @NotNull Long userId,
        Long itemId,
        String answer
) {

    public CreateRoomRequest(Long userId) {
        this(userId, null, null);
    }
}

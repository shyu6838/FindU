package findu.backend.trust.dto;

import findu.backend.trust.entity.TrustEvent.EventType;
import jakarta.validation.constraints.NotNull;

public record TrustEventCreateRequest(
        @NotNull Long userId,
        @NotNull EventType eventType
) {
}
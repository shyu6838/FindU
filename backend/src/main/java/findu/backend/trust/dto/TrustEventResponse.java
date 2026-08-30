package findu.backend.trust.dto;

import findu.backend.trust.entity.TrustEvent;

import java.time.LocalDateTime;

public record TrustEventResponse(
        Long id,
        String eventType,
        Integer amount,
        String description,
        LocalDateTime createdAt
) {

    public static TrustEventResponse from(TrustEvent x) {
        return new TrustEventResponse(
                x.getId(),
                x.getEventType().name(),
                x.getAmount(),
                x.getDescription(),
                x.getCreatedAt()
        );
    }
}
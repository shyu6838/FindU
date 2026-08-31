package findu.backend.notification.dto;

import findu.backend.notification.entity.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String type,
        String message,
        Long targetId,
        boolean read,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification x) {
        return new NotificationResponse(
                x.getId(),
                x.getType(),
                x.getMessage(),
                x.getTargetId(),
                x.isRead(),
                x.getCreatedAt()
        );
    }
}

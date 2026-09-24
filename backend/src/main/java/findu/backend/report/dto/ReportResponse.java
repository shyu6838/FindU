package findu.backend.report.dto;

import java.time.LocalDateTime;

public record ReportResponse(
        Long id,
        Long reporterId,
        String reporterNickname,
        String reporterEmail,
        String targetType,
        Long targetId,
        String targetTitle,
        String targetImageUrl,
        String targetItemType,
        String targetUserNickname,
        String targetUserEmail,
        String reason,
        String description,
        String status,
        String penaltyDetails,
        String snapshotChatLogs,
        LocalDateTime createdAt
) {}

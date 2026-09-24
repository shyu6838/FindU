package findu.backend.report.dto;

<<<<<<< HEAD
import java.time.LocalDateTime;
=======
import findu.backend.report.entity.Report;
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6

public record ReportResponse(
        Long id,
        Long reporterId,
<<<<<<< HEAD
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
=======
        String targetType,
        Long targetId,
        String reason,
        String description,
        String status,
        java.time.LocalDateTime createdAt
) {

    public static ReportResponse from(Report x) {
        return new ReportResponse(
                x.getId(),
                x.getReporter().getId(),
                x.getTargetType(),
                x.getTargetId(),
                x.getReason(),
                x.getDescription(),
                x.getStatus().name(),
                x.getCreatedAt()
        );
    }
}
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6

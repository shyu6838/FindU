package findu.backend.report.dto;

public record ReportProcessRequest(
        String status,
        boolean deleteTarget,
        boolean decreaseTrust,
        boolean sendNotification
) {}
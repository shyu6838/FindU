package findu.backend.report.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import findu.backend.report.dto.*;
import findu.backend.report.entity.Report;
import findu.backend.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
@Tag(name = "신고", description = "신고 등록, 내 신고 조회 및 관리자 신고 처리 API")
public class ReportController {

    private final ReportService s;

    @PostMapping
    @Operation(summary = "신고 등록", description = "허위 게시물, 악의적 행동 또는 거짓 소유자 주장을 신고합니다.")
    public ReportResponse create(@AuthenticationPrincipal Long uid, @Valid @RequestBody ReportCreateRequest r) {
        return s.create(uid, r);
    }

    @GetMapping("/me")
    @Operation(summary = "내 신고 목록 조회")
    public List<ReportResponse> my(@AuthenticationPrincipal Long uid) {
        return s.my(uid);
    }

    @GetMapping
    @Operation(summary = "전체 신고 목록 조회", description = "ADMIN 권한 사용자가 모든 신고 내역을 조회합니다.")
    public List<ReportResponse> all(@AuthenticationPrincipal Long uid) {
        return s.all(uid);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "신고 상태 변경", description = "ADMIN 권한 사용자가 신고 상태를 변경합니다.")
    public ReportResponse status(@AuthenticationPrincipal Long uid, @PathVariable Long id, @RequestParam Report.Status status) {
        return s.status(uid, id, status);
    }

    @PatchMapping("/{id}/process")
    @Operation(summary = "신고 처리", description = "ADMIN 권한 사용자가 신고 처리 결과를 기록합니다.")
    public ReportResponse process(@AuthenticationPrincipal Long uid, @PathVariable Long id, @RequestBody ReportProcessRequest req) {
        return s.process(uid, id, req);
    }
}

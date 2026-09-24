package findu.backend.report.controller;

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
public class ReportController {

    private final ReportService s;

    @PostMapping
    public ReportResponse create(@AuthenticationPrincipal Long uid, @Valid @RequestBody ReportCreateRequest r) {
        return s.create(uid, r);
    }

    @GetMapping("/me")
    public List<ReportResponse> my(@AuthenticationPrincipal Long uid) {
        return s.my(uid);
    }

    @GetMapping
    public List<ReportResponse> all(@AuthenticationPrincipal Long uid) {
        return s.all(uid);
    }

    @PatchMapping("/{id}/status")
    public ReportResponse status(@AuthenticationPrincipal Long uid, @PathVariable Long id, @RequestParam Report.Status status) {
        return s.status(uid, id, status);
    }

    @PatchMapping("/{id}/process")
    public ReportResponse process(@AuthenticationPrincipal Long uid, @PathVariable Long id, @RequestBody ReportProcessRequest req) {
        return s.process(uid, id, req);
    }
}
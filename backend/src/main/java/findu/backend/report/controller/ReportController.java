package findu.backend.report.controller;

import findu.backend.report.dto.*;
import findu.backend.report.entity.Report;
import findu.backend.report.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

<<<<<<< HEAD
import java.util.List;
=======
import java.util.*;
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reports")
public class ReportController {

<<<<<<< HEAD
    private final ReportService s;

    @PostMapping
    public ReportResponse create(@AuthenticationPrincipal Long uid, @Valid @RequestBody ReportCreateRequest r) {
=======
    final ReportService s;

    @PostMapping
    public ReportResponse create(
            @AuthenticationPrincipal Long uid,
            @Valid @RequestBody ReportCreateRequest r
    ) {
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6
        return s.create(uid, r);
    }

    @GetMapping("/me")
<<<<<<< HEAD
    public List<ReportResponse> my(@AuthenticationPrincipal Long uid) {
=======
    public List<ReportResponse> my(
            @AuthenticationPrincipal Long uid
    ) {
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6
        return s.my(uid);
    }

    @GetMapping
<<<<<<< HEAD
    public List<ReportResponse> all(@AuthenticationPrincipal Long uid) {
=======
    public List<ReportResponse> all(
            @AuthenticationPrincipal Long uid
    ) {
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6
        return s.all(uid);
    }

    @PatchMapping("/{id}/status")
<<<<<<< HEAD
    public ReportResponse status(@AuthenticationPrincipal Long uid, @PathVariable Long id, @RequestParam Report.Status status) {
        return s.status(uid, id, status);
    }

    @PatchMapping("/{id}/process")
    public ReportResponse process(@AuthenticationPrincipal Long uid, @PathVariable Long id, @RequestBody ReportProcessRequest req) {
        return s.process(uid, id, req);
    }
=======
    public ReportResponse status(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long id,
            @RequestParam Report.Status status
    ) {
        return s.status(uid, id, status);
    }
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6
}
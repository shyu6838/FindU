package findu.backend.verification.controller;

import findu.backend.verification.dto.*;
import findu.backend.verification.service.VerificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class VerificationController {

    private final VerificationService s;

    // 인증 질문 생성
    @PostMapping(
            "/found-items/{foundItemId}/verification-questions"
    )
    public VerificationQuestionResponse create(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long foundItemId,
            @Valid @RequestBody VerificationQuestionCreate r
    ) {
        return s.create(uid, foundItemId, r);
    }

    // 인증 질문 조회
    @GetMapping(
            "/found-items/{foundItemId}/verification-questions"
    )
    public List<VerificationQuestionResponse> list(
            @PathVariable Long foundItemId
    ) {
        return s.list(foundItemId);
    }

    // 인증 답변 제출
    @PostMapping(
            "/verification-questions/{questionId}/verify"
    )
    public boolean verify(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long questionId,
            @Valid @RequestBody VerificationAnswerRequest r
    ) {
        return s.verify(uid, questionId, r);
    }

    // 해당 습득물 인증 성공 여부 확인
    @GetMapping(
            "/found-items/{foundItemId}/verification"
    )
    public boolean verified(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long foundItemId
    ) {
        return s.isVerified(uid, foundItemId);
    }
}
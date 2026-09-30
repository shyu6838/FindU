package findu.backend.verification.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "본인 확인", description = "습득자가 등록한 질문으로 분실자의 물건 소유 여부를 확인하는 API")
public class VerificationController {

    private final VerificationService s;

    // 인증 질문 생성
    @PostMapping(
            "/found-items/{foundItemId}/verification-questions"
    )
    @Operation(summary = "본인 확인 질문 등록", description = "습득물 작성자가 질문과 정답을 등록합니다. 정답은 응답에 노출되지 않습니다.")
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
    @Operation(summary = "본인 확인 질문 목록 조회", description = "분실자가 답변할 질문 목록을 조회합니다.")
    public List<VerificationQuestionResponse> list(
            @PathVariable Long foundItemId
    ) {
        return s.list(foundItemId);
    }

    // 인증 답변 제출
    @PostMapping(
            "/verification-questions/{questionId}/verify"
    )
    @Operation(summary = "본인 확인 답변 제출", description = "질문에 답변하고 정답 여부를 반환합니다.")
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
    @Operation(summary = "습득물 본인 확인 완료 여부 조회")
    public boolean verified(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long foundItemId
    ) {
        return s.isVerified(uid, foundItemId);
    }
}

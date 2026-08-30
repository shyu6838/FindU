package findu.backend.trust.controller;

import findu.backend.trust.dto.TrustEventResponse;
import findu.backend.trust.service.TrustService;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users/me/trust")
public class TrustController {

    private final UserRepository users;
    private final TrustService trustService;

    // 현재 내 신뢰도 점수 조회
    @GetMapping
    public Integer getTrustScore(
            @AuthenticationPrincipal Long uid
    ) {
        return users.findById(uid)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다.")
                )
                .getTrustScore();
    }

    // 내 신뢰도 변동 내역 조회
    @GetMapping("/events")
    public List<TrustEventResponse> getTrustEvents(
            @AuthenticationPrincipal Long uid
    ) {
        return trustService.getMyEvents(uid);
    }
}
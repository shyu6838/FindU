package findu.backend.match.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import findu.backend.match.dto.MatchResponseDto;
import findu.backend.match.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "AI 매칭", description = "분실물과 습득물 간 AI 기반 유사도 매칭 API")
public class MatchController {

    private final MatchService matchService;

    @PostMapping("/api/lost-items/{lostItemId}/match-found")
    @Operation(summary = "분실물 기준 습득물 매칭 생성", description = "분실물의 이미지·텍스트 임베딩을 기준으로 습득물 매칭 결과를 생성합니다.")
    public List<MatchResponseDto> matchFoundItems(
            @PathVariable Long lostItemId
    ) {
        return matchService.matchFoundItems(lostItemId);
    }

    @GetMapping("/api/lost-items/{lostItemId}/matches/found")
    @Operation(summary = "분실물의 습득물 매칭 결과 조회")
    public List<MatchResponseDto> getFoundMatches(
            @PathVariable Long lostItemId
    ) {
        return matchService.getFoundMatches(lostItemId);
    }

    @GetMapping("/api/found-items/{foundItemId}/matches/lost")
    @Operation(summary = "습득물의 분실물 매칭 결과 조회")
    public List<MatchResponseDto> getLostMatches(
            @PathVariable Long foundItemId
    ) {
        return matchService.getLostMatches(foundItemId);
    }
}

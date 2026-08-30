package findu.backend.match.controller;

import findu.backend.match.dto.MatchResponseDto;
import findu.backend.match.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MatchController {

    private final MatchService matchService;

    @PostMapping("/api/lost-items/{lostItemId}/match-found")
    public List<MatchResponseDto> matchFoundItems(
            @PathVariable Long lostItemId
    ) {
        return matchService.matchFoundItems(lostItemId);
    }

    @GetMapping("/api/lost-items/{lostItemId}/matches/found")
    public List<MatchResponseDto> getFoundMatches(
            @PathVariable Long lostItemId
    ) {
        return matchService.getFoundMatches(lostItemId);
    }

    @GetMapping("/api/found-items/{foundItemId}/matches/lost")
    public List<MatchResponseDto> getLostMatches(
            @PathVariable Long foundItemId
    ) {
        return matchService.getLostMatches(foundItemId);
    }
}
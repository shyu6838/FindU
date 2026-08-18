package findu.backend.match.dto;

import findu.backend.match.entity.ItemMatch;
import lombok.Builder;

@Builder
public record MatchResponseDto(
        Long matchId,
        Long lostItemId,
        Long foundItemId,
        String lostTitle,
        String foundTitle,
        String foundImageUrl,
        Double imageScore,
        Double textScore,
        Double locationScore,
        Double timeScore,
        Double finalScore
) {
    public static MatchResponseDto from(ItemMatch match) {
        return MatchResponseDto.builder()
                .matchId(match.getId())
                .lostItemId(match.getLostItem().getId())
                .foundItemId(match.getFoundItem().getId())
                .lostTitle(match.getLostItem().getTitle())
                .foundTitle(match.getFoundItem().getTitle())
                .foundImageUrl(match.getFoundItem().getImageUrl())
                .imageScore(match.getImageScore())
                .textScore(match.getTextScore())
                .locationScore(match.getLocationScore())
                .timeScore(match.getTimeScore())
                .finalScore(match.getFinalScore())
                .build();
    }
}
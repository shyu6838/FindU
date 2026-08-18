package findu.backend.match.service;

import findu.backend.ai.client.AiClient;
import findu.backend.ai.dto.AiSearchResultDto;
import findu.backend.founditem.entity.FoundItem;
import findu.backend.founditem.repository.FoundItemRepository;
import findu.backend.lostitem.entity.LostItem;
import findu.backend.lostitem.repository.LostItemRepository;
import findu.backend.match.dto.MatchResponseDto;
import findu.backend.match.entity.ItemMatch;
import findu.backend.match.repository.ItemMatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final LostItemRepository lostItemRepository;
    private final FoundItemRepository foundItemRepository;
    private final ItemMatchRepository itemMatchRepository;
    private final AiClient aiClient;

    @Transactional
    public List<MatchResponseDto> matchFoundItems(Long lostItemId) {

        LostItem lostItem = lostItemRepository.findById(lostItemId)
                .orElseThrow(() ->
                        new IllegalArgumentException("분실물을 찾을 수 없습니다.")
                );

        String query =
                lostItem.getTitle() + " " + lostItem.getDescription();

        List<AiSearchResultDto> aiResults =
                aiClient.searchText(query, 5).getResults();

        List<ItemMatch> matches =
                aiResults.stream()
                        .map(result -> createMatch(lostItem, result))
                        .toList();

        itemMatchRepository.saveAll(matches);

        return matches.stream()
                .map(MatchResponseDto::from)
                .toList();
    }

    private ItemMatch createMatch(
            LostItem lostItem,
            AiSearchResultDto result
    ) {
        FoundItem foundItem =
                foundItemRepository.findById(result.getItemId())
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "습득물을 찾을 수 없습니다."
                                )
                        );

        double imageScore = result.getScore();
        double textScore = calculateTextScore(lostItem, foundItem);
        double locationScore = calculateLocationScore(lostItem, foundItem);
        double timeScore = calculateTimeScore(lostItem, foundItem);

        double finalScore =
                imageScore * 0.6
                        + textScore * 0.2
                        + locationScore * 0.1
                        + timeScore * 0.1;

        return ItemMatch.builder()
                .lostItem(lostItem)
                .foundItem(foundItem)
                .imageScore(imageScore)
                .textScore(textScore)
                .locationScore(locationScore)
                .timeScore(timeScore)
                .finalScore(finalScore)
                .build();
    }

    private double calculateTextScore(
            LostItem lostItem,
            FoundItem foundItem
    ) {
        String lostText =
                lostItem.getTitle() + " " + lostItem.getDescription();

        String foundText =
                foundItem.getTitle() + " " + foundItem.getDescription();

        if (foundText.contains(lostItem.getTitle()) ||
                lostText.contains(foundItem.getTitle())) {
            return 1.0;
        }

        return 0.5;
    }

    private double calculateLocationScore(
            LostItem lostItem,
            FoundItem foundItem
    ) {
        if (lostItem.getLocation() == null ||
                foundItem.getLocation() == null) {
            return 0.5;
        }

        if (lostItem.getLocation().equals(foundItem.getLocation())) {
            return 1.0;
        }

        return 0.5;
    }

    private double calculateTimeScore(
            LostItem lostItem,
            FoundItem foundItem
    ) {
        long hours =
                Math.abs(
                        Duration.between(
                                lostItem.getLostAt(),
                                foundItem.getFoundAt()
                        ).toHours()
                );

        if (hours <= 24) {
            return 1.0;
        }

        if (hours <= 72) {
            return 0.7;
        }

        if (hours <= 168) {
            return 0.4;
        }

        return 0.2;
    }

    @Transactional(readOnly = true)
    public List<MatchResponseDto> getFoundMatches(Long lostItemId) {
        return itemMatchRepository
                .findByLostItemIdOrderByFinalScoreDesc(lostItemId)
                .stream()
                .map(MatchResponseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MatchResponseDto> getLostMatches(Long foundItemId) {
        return itemMatchRepository
                .findByFoundItemIdOrderByFinalScoreDesc(foundItemId)
                .stream()
                .map(MatchResponseDto::from)
                .toList();
    }
}
package findu.backend.trust.service;

import findu.backend.trust.dto.TrustEventResponse;
import findu.backend.trust.entity.TrustEvent;
import findu.backend.trust.repository.TrustEventRepository;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TrustService {

    private final TrustEventRepository repo;
    private final UserRepository users;

    @Transactional
    public void addEvent(
            Long userId,
            TrustEvent.EventType eventType,
            int amount,
            String description
    ) {
        User user = users.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다.")
                );

        user.updateTrustScore(
                Math.max(0, user.getTrustScore() + amount)
        );

        TrustEvent event = TrustEvent.builder()
                .user(user)
                .eventType(eventType)
                .amount(amount)
                .description(description)
                .build();

        repo.save(event);
    }

    @Transactional(readOnly = true)
    public List<TrustEventResponse> getMyEvents(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(TrustEventResponse::from)
                .toList();
    }
}
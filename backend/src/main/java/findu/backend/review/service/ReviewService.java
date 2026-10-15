package findu.backend.review.service;

import findu.backend.item.entity.Item;
import findu.backend.item.repository.ItemRepository;
import findu.backend.notification.service.NotificationService;
import findu.backend.review.dto.*;
import findu.backend.review.entity.Review;
import findu.backend.review.repository.ReviewRepository;
import findu.backend.trust.entity.TrustEvent;
import findu.backend.trust.service.TrustService;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// 후기 관련 비즈니스 로직 처리
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final TrustService trustService;
    private final NotificationService notificationService;
    private final ItemRepository itemRepository;

    // 후기 생성 및 알림 발송
    @Transactional
    public ReviewResponse create(Long uid, ReviewCreateRequest request) {
        User reviewer = userRepository.findById(uid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        User reviewee = userRepository.findById(request.revieweeId())
                .orElseThrow(() -> new IllegalArgumentException("대상 사용자를 찾을 수 없습니다."));

        if (uid.equals(request.revieweeId())) {
            throw new IllegalArgumentException("본인에게 리뷰를 작성할 수 없습니다.");
        }

        Review review = reviewRepository.save(
                Review.builder()
                        .reviewer(reviewer)
                        .reviewee(reviewee)
                        .rating(request.rating())
                        .comment(request.comment())
                        .build()
        );

        if (request.rating() >= 4) {
            trustService.addEvent(
                    reviewee.getId(),
                    TrustEvent.EventType.REVIEW_POSITIVE,
                    2,
                    "긍정적인 리뷰를 받았습니다."
            );
        } else if (request.rating() <= 2) {
            trustService.addEvent(
                    reviewee.getId(),
                    TrustEvent.EventType.REVIEW_NEGATIVE,
                    -2,
                    "부정적인 리뷰를 받았습니다."
            );
        }

        if (request.itemId() != null) {
            Item item = itemRepository.findById(request.itemId()).orElse(null);
            if (item != null) {
                boolean isAuthorReviewer = item.getUser() != null && item.getUser().getId().equals(reviewer.getId());
                String notiType = isAuthorReviewer ? "REVIEW_REQUEST" : "REVIEW_ARRIVED";

                notificationService.create(
                        reviewee.getId(),
                        notiType,
                        "[" + item.getTitle() + "] 후기가 도착했습니다.",
                        item.getId()
                );
            } else {
                notificationService.create(
                        reviewee.getId(),
                        "REVIEW_ARRIVED",
                        "새로운 후기가 도착했습니다.",
                        reviewer.getId()
                );
            }
        } else {
            notificationService.create(
                    reviewee.getId(),
                    "REVIEW_ARRIVED",
                    "새로운 후기가 도착했습니다.",
                    reviewer.getId()
            );
        }

        return ReviewResponse.from(review);
    }

    // 특정 사용자가 받은 후기 목록 조회
    @Transactional(readOnly = true)
    public List<ReviewResponse> list(Long uid) {
        return reviewRepository.findByRevieweeIdOrderByCreatedAtDesc(uid)
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }
}
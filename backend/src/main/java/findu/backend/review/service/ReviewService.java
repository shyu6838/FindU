package findu.backend.review.service;

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

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository repo;
    private final UserRepository users;
    private final TrustService trustService;

    @Transactional
    public ReviewResponse create(
            Long uid,
            ReviewCreateRequest r
    ) {

        User reviewer = users.findById(uid)
                .orElseThrow(() ->
                        new IllegalArgumentException("사용자를 찾을 수 없습니다.")
                );

        User reviewee = users.findById(r.revieweeId())
                .orElseThrow(() ->
                        new IllegalArgumentException("대상 사용자를 찾을 수 없습니다.")
                );

        if (uid.equals(r.revieweeId())) {
            throw new IllegalArgumentException(
                    "본인에게 리뷰를 작성할 수 없습니다."
            );
        }

        Review x = repo.save(
                Review.builder()
                        .reviewer(reviewer)
                        .reviewee(reviewee)
                        .rating(r.rating())
                        .comment(r.comment())
                        .build()
        );

        // 신뢰도 변경
        if (r.rating() >= 4) {

            trustService.addEvent(
                    reviewee.getId(),
                    TrustEvent.EventType.REVIEW_POSITIVE,
                    2,
                    "긍정적인 리뷰를 받았습니다."
            );

        } else if (r.rating() <= 2) {

            trustService.addEvent(
                    reviewee.getId(),
                    TrustEvent.EventType.REVIEW_NEGATIVE,
                    -2,
                    "부정적인 리뷰를 받았습니다."
            );
        }

        return ReviewResponse.from(x);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> list(Long uid) {

        return repo.findByRevieweeIdOrderByCreatedAtDesc(uid)
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }
}
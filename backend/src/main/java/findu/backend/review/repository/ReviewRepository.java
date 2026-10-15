package findu.backend.review.repository;

import findu.backend.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 후기 데이터베이스 접근 레포지토리
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByRevieweeIdOrderByCreatedAtDesc(Long revieweeId);

    // 특정 작성자가 대상자에게 이미 후기를 남겼는지 여부 확인
    boolean existsByReviewerIdAndRevieweeId(Long reviewerId, Long revieweeId);
}
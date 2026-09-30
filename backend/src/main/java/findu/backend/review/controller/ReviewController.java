package findu.backend.review.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import findu.backend.review.dto.*;
import findu.backend.review.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
@Tag(name = "감사 후기", description = "물건 전달 후 작성하는 감사 후기 API")
public class ReviewController {

    private final ReviewService s;

    @PostMapping
    @Operation(summary = "감사 후기 작성")
    public ReviewResponse create(
            @AuthenticationPrincipal Long uid,
            @Valid @RequestBody ReviewCreateRequest r
    ) {
        return s.create(uid, r);
    }

    @GetMapping("/users/{userId}")
    @Operation(summary = "사용자 감사 후기 목록 조회")
    public List<ReviewResponse> list(
            @PathVariable Long userId
    ) {
        return s.list(userId);
    }
}

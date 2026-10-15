package findu.backend.review.dto;

import jakarta.validation.constraints.*;

public record ReviewCreateRequest(
        Long itemId,
        @NotNull Long revieweeId,
        @Min(1) @Max(5) int rating,
        String comment
) {}
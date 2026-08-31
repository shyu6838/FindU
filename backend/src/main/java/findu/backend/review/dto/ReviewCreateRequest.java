package findu.backend.review.dto;import jakarta.validation.constraints.*;public record ReviewCreateRequest(@NotNull Long revieweeId, @Min(1)@Max(5)int rating, String comment){}

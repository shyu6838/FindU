package findu.backend.lostitem.dto;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import lombok.Getter;
@Getter public class LostItemRequestDto { @NotNull private Long categoryId; @NotBlank private String title; @NotBlank private String description; private String imageUrl; private String location; @NotNull private LocalDateTime lostAt; }

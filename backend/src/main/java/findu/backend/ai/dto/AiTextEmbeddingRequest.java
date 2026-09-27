package findu.backend.ai.dto;

import jakarta.validation.constraints.NotBlank;

public record AiTextEmbeddingRequest(@NotBlank(message = "텍스트를 입력해주세요.") String text) {
}

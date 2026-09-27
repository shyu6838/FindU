package findu.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiTextEmbeddingResponse(
        @JsonProperty("original_text") String originalText,
        @JsonProperty("translated_text") String translatedText,
        Integer dimension,
        List<Double> embedding
) {
}

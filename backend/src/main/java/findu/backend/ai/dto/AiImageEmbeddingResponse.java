package findu.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record AiImageEmbeddingResponse(
        Integer dimension,
        List<Double> embedding
) {
}

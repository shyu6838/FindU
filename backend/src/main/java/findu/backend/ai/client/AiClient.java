package findu.backend.ai.client;

import findu.backend.ai.dto.AiHealthResponse;
import findu.backend.ai.dto.AiImageEmbeddingResponse;
import findu.backend.ai.dto.AiTextEmbeddingRequest;
import findu.backend.ai.dto.AiTextEmbeddingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

@Component
@RequiredArgsConstructor
public class AiClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${ai.server.url}")
    private String aiServerUrl;

    private RestClient client() {
        return restClientBuilder
                .baseUrl(aiServerUrl)
                .requestFactory(new HttpComponentsClientHttpRequestFactory())
                .build();
    }

    public AiHealthResponse health() {
        return client()
                .get()
                .uri("/health")
                .retrieve()
                .body(AiHealthResponse.class);
    }

    public AiTextEmbeddingResponse embedText(String text) {
        return client()
                .post()
                .uri("/api/ai/embedding/text")
                .contentType(MediaType.APPLICATION_JSON)
                .body(new AiTextEmbeddingRequest(text))
                .retrieve()
                .body(AiTextEmbeddingResponse.class);
    }

    public AiImageEmbeddingResponse embedImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 필요합니다.");
        }

        return embedImage(file.getResource(), file.getOriginalFilename());
    }

    public AiImageEmbeddingResponse embedImage(Resource image, String filename) {
        if (image == null) {
            throw new IllegalArgumentException("이미지 파일이 필요합니다.");
        }

        MultipartBodyBuilder body = new MultipartBodyBuilder();
        body.part("file", image)
                .filename(StringUtils.hasText(filename) ? filename : "image");

        return client()
                .post()
                .uri("/api/ai/embedding/image")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body.build())
                .retrieve()
                .body(AiImageEmbeddingResponse.class);
    }
}

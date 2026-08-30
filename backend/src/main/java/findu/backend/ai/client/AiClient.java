package findu.backend.ai.client;

import findu.backend.ai.dto.AiHealthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import findu.backend.ai.dto.AiTextSearchResponse;
import findu.backend.ai.dto.AiRegisterResponse;
import findu.backend.ai.dto.AiImageSearchResponse;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


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

    public AiTextSearchResponse searchText(
            String query,
            int topK
    ) {
        return client()
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/ai/search")
                        .queryParam("query", query)
                        .queryParam("top_k", topK)
                        .build()
                )
                .retrieve()
                .body(AiTextSearchResponse.class);
    }

    public AiRegisterResponse registerImageUrl(
            Long itemId,
            String imageUrl
    ) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("item_id", String.valueOf(itemId));
        builder.part("image_url", imageUrl);

        return client()
                .post()
                .uri("/api/ai/register")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(builder.build())
                .retrieve()
                .body(AiRegisterResponse.class);
    }

    public AiImageSearchResponse searchByImage(
            MultipartFile file,
            String imageUrl,
            int topK
    ) throws IOException {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();

        if (file != null && !file.isEmpty()) {
            builder.part("file", file.getResource());
        }
        if (imageUrl != null && !imageUrl.isBlank()) {
            builder.part("image_url", imageUrl);
        }
        builder.part("top_k", String.valueOf(topK));

        return client()
                .post()
                .uri("/api/ai/search/image")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(builder.build())
                .retrieve()
                .body(AiImageSearchResponse.class);
    }
}
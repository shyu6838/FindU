package findu.backend.ai.controller;

import findu.backend.ai.client.AiClient;
import findu.backend.ai.dto.AiHealthResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import findu.backend.ai.dto.AiTextSearchRequest;
import findu.backend.ai.dto.AiTextSearchResponse;
import findu.backend.ai.dto.AiRegisterResponse;
import findu.backend.ai.dto.AiImageSearchResponse;

import java.io.IOException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
public class AiController {

    private final AiClient aiClient;

    @GetMapping("/health")
    public AiHealthResponse health() {
        return aiClient.health();
    }

    @PostMapping("/search/text")
    public AiTextSearchResponse searchText(
            @RequestBody AiTextSearchRequest request
    ) {
        return aiClient.searchText(
                request.getQuery(),
                request.getTopK() == null ? 5 : request.getTopK()
        );
    }

    @PostMapping("/register")
    public AiRegisterResponse register(
            @RequestParam Long itemId,
            @RequestParam String imageUrl
    ) {
        return aiClient.registerImageUrl(
                itemId,
                imageUrl
        );
    }

    @PostMapping(value = "/search/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AiImageSearchResponse searchByImage(
            @RequestParam(required = false) MultipartFile file,
            @RequestParam(required = false) String imageUrl,
            @RequestParam(defaultValue = "5") int topK
    ) throws IOException {
        return aiClient.searchByImage(file, imageUrl, topK);
    }

}
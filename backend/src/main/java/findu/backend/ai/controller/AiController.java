package findu.backend.ai.controller;

import findu.backend.ai.client.AiClient;
import findu.backend.ai.dto.AiHealthResponse;
import findu.backend.ai.dto.AiImageEmbeddingResponse;
import findu.backend.ai.dto.AiTextEmbeddingRequest;
import findu.backend.ai.dto.AiTextEmbeddingResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
public class AiController {

    private final AiClient aiClient;

    @GetMapping("/health")
    public AiHealthResponse health() {
        return aiClient.health();
    }

    @PostMapping("/embedding/text")
    public AiTextEmbeddingResponse embedText(@Valid @RequestBody AiTextEmbeddingRequest request) {
        return aiClient.embedText(request.text());
    }

    @PostMapping(value = "/embedding/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public AiImageEmbeddingResponse embedImage(@RequestParam MultipartFile file) {
        return aiClient.embedImage(file);
    }
}

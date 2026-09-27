package findu.backend.ai.repository;

import findu.backend.ai.service.ItemEmbeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PgVectorSchemaInitializer implements ApplicationRunner {

    private final ItemEmbeddingRepository itemEmbeddingRepository;
    private final ItemEmbeddingService itemEmbeddingService;

    @Override
    public void run(ApplicationArguments args) {
        itemEmbeddingRepository.initialize();
        int indexedCount = itemEmbeddingService.indexMissingItems();
        log.info("기존 게시글 {}건의 AI 임베딩을 미리 생성했습니다.", indexedCount);
    }
}

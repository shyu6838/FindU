package findu.backend.ai.repository;

import findu.backend.item.entity.ItemType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Slf4j
@Repository
@RequiredArgsConstructor
public class ItemEmbeddingRepository {

    private final JdbcTemplate jdbcTemplate;
    private volatile boolean available;

    public void initialize() {
        try {
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS vector");
            jdbcTemplate.execute("""
                    CREATE TABLE IF NOT EXISTS item_embeddings (
                        item_id BIGINT PRIMARY KEY REFERENCES items(id) ON DELETE CASCADE,
                        text_embedding vector(512) NOT NULL,
                        image_embedding vector(512),
                        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
                    )
                    """);
            available = true;
            log.info("pgvector item_embeddings 테이블을 사용할 수 있습니다.");
        } catch (DataAccessException e) {
            available = false;
            log.warn("pgvector를 초기화하지 못했습니다. PostgreSQL에 vector 확장을 설치해야 AI 유사도 검색을 사용할 수 있습니다.");
        }
    }

    public boolean isAvailable() {
        return available;
    }

    public boolean hasEmbedding(Long itemId) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM item_embeddings WHERE item_id = ?)",
                Boolean.class,
                itemId
        ));
    }

    public void upsert(Long itemId, String textEmbedding, String imageEmbedding) {
        if (imageEmbedding == null) {
            jdbcTemplate.update("""
                    INSERT INTO item_embeddings (item_id, text_embedding, image_embedding)
                    VALUES (?, CAST(? AS vector), NULL)
                    ON CONFLICT (item_id) DO UPDATE
                    SET text_embedding = EXCLUDED.text_embedding,
                        image_embedding = NULL,
                        updated_at = CURRENT_TIMESTAMP
                    """, itemId, textEmbedding);
            return;
        }

        jdbcTemplate.update("""
                INSERT INTO item_embeddings (item_id, text_embedding, image_embedding)
                VALUES (?, CAST(? AS vector), CAST(? AS vector))
                ON CONFLICT (item_id) DO UPDATE
                SET text_embedding = EXCLUDED.text_embedding,
                    image_embedding = EXCLUDED.image_embedding,
                    updated_at = CURRENT_TIMESTAMP
                """, itemId, textEmbedding, imageEmbedding);
    }

    public List<SimilarEmbedding> findSimilar(Long itemId, ItemType targetType, int limit) {
        return jdbcTemplate.query("""
                SELECT candidate.item_id,
                       CASE
                           WHEN source.image_embedding IS NOT NULL
                               AND candidate.image_embedding IS NOT NULL
                               THEN 0.35 * (1 - (source.text_embedding <=> candidate.text_embedding))
                                  + 0.65 * (1 - (source.image_embedding <=> candidate.image_embedding))
                           ELSE 1 - (source.text_embedding <=> candidate.text_embedding)
                       END AS similarity
                FROM item_embeddings source
                JOIN item_embeddings candidate ON candidate.item_id <> source.item_id
                JOIN items candidate_item ON candidate_item.id = candidate.item_id
                WHERE source.item_id = ?
                  AND candidate_item.type = ?
                  AND candidate_item.status = 'SEARCHING'
                ORDER BY similarity DESC
                LIMIT ?
                """, (rs, rowNum) -> new SimilarEmbedding(
                rs.getLong("item_id"),
                rs.getDouble("similarity")
        ), itemId, targetType.name(), limit);
    }

    public List<SimilarEmbedding> searchByText(
            String textEmbedding,
            ItemType itemType,
            Long categoryId,
            int limit
    ) {
        String categoryCondition = categoryId == null
                ? ""
                : "AND candidate_item.category_id = ?";

        String query = """
                SELECT candidate.item_id,
                       1 - (candidate.text_embedding <=> CAST(? AS vector)) AS similarity
                FROM item_embeddings candidate
                JOIN items candidate_item ON candidate_item.id = candidate.item_id
                WHERE candidate_item.type = ?
                  AND candidate_item.status = 'SEARCHING'
                %s
                ORDER BY similarity DESC
                LIMIT ?
                """.formatted(categoryCondition);

        Object[] parameters = categoryId == null
                ? new Object[]{textEmbedding, itemType.name(), limit}
                : new Object[]{textEmbedding, itemType.name(), categoryId, limit};

        return jdbcTemplate.query(query, (rs, rowNum) -> new SimilarEmbedding(
                rs.getLong("item_id"),
                rs.getDouble("similarity")
        ), parameters);
    }

    public record SimilarEmbedding(Long itemId, double similarity) {
    }
}

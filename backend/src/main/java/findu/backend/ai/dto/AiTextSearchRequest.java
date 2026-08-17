package findu.backend.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AiTextSearchRequest {

    private String query;
    private Integer topK;
}
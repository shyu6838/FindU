package findu.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class AiTextSearchResponse {

    private String query;

    @JsonProperty("translated_query")
    private String translatedQuery;

    private List<AiSearchResultDto> results;
}
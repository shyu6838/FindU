package findu.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AiSearchResultDto {

    @JsonProperty("item_id")
    private Long itemId;

    private Double score;
}
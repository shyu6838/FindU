package findu.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AiHealthResponse {

    private String status;

    @JsonProperty("registered_items_count")
    private Integer registeredItemsCount;
}
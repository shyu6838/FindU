package findu.backend.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class AiRegisterResponse {

    private String status;

    @JsonProperty("item_id")
    private Long itemId;

    private String message;
}
package findu.backend.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class AiImageSearchResponse {

    private String message;

    private List<AiSearchResultDto> results;
}
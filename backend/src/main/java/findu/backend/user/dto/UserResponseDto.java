package findu.backend.user.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserResponseDto {

    private Long id;

    private String email;

    private String nickname;

    private String profileImage;

    private Integer trustScore;
}
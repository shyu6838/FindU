package findu.backend.user.dto;

import lombok.Getter;

@Getter
public class UserUpdateRequestDto {

    private String nickname;

    private String profileImage;
}
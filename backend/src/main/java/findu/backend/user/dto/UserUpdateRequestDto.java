package findu.backend.user.dto;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserUpdateRequestDto {

    @Size(max = 20, message = "닉네임은 20자 이내여야 합니다.")
    private String nickname;

    private String profileImage;
}
package findu.backend.user.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import findu.backend.user.dto.UserResponseDto;
import findu.backend.user.dto.UserUpdateRequestDto;
import findu.backend.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@Tag(name = "사용자", description = "현재 로그인한 사용자의 프로필 API")
public class UserController {

    private final UserService userService;

    // 내 정보 조회
    @GetMapping("/me")
    @Operation(summary = "내 정보 조회", description = "로그인한 사용자의 이메일, 닉네임, 프로필과 신뢰도 정보를 조회합니다.")
    public UserResponseDto getMyInfo(
            @AuthenticationPrincipal Long userId
    ) {
        return userService.getUser(userId);
    }

    // 내 정보 수정
    @PatchMapping("/me")
    @Operation(summary = "내 정보 수정", description = "로그인한 사용자의 닉네임 또는 프로필 정보를 수정합니다.")
    public UserResponseDto updateMyInfo(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UserUpdateRequestDto request
    ) {
        return userService.updateMyInfo(userId, request);
    }
}

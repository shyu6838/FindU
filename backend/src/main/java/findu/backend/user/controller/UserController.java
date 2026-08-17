package findu.backend.user.controller;

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
public class UserController {

    private final UserService userService;

    // 내 정보 조회
    @GetMapping("/me")
    public UserResponseDto getMyInfo(
            @AuthenticationPrincipal Long userId
    ) {
        return userService.getUser(userId);
    }

    // 내 정보 수정
    @PatchMapping("/me")
    public UserResponseDto updateMyInfo(
            @AuthenticationPrincipal Long userId,
            @Valid @RequestBody UserUpdateRequestDto request
    ) {
        return userService.updateMyInfo(userId, request);
    }
}
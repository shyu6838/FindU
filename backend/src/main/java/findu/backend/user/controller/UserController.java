package findu.backend.user.controller;

import findu.backend.user.dto.UserResponseDto;
import findu.backend.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public UserResponseDto getUser(@PathVariable Long id){

        return userService.getUser(id);
    }

}
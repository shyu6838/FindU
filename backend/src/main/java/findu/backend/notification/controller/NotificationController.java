package findu.backend.notification.controller;

import findu.backend.notification.dto.*;
import findu.backend.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

<<<<<<< HEAD
import java.util.List;
=======
import java.util.*;
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
public class NotificationController {
<<<<<<< HEAD
    
    private final NotificationService s;

    @GetMapping
    public List<NotificationResponse> list(@AuthenticationPrincipal Long uid) {
=======

    final NotificationService s;

    @GetMapping
    public List<NotificationResponse> list(
            @AuthenticationPrincipal Long uid
    ) {
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6
        return s.list(uid);
    }

    @PatchMapping("/read-all")
<<<<<<< HEAD
    public ResponseEntity<Void> readAll(@AuthenticationPrincipal Long uid) {
=======
    public ResponseEntity<Void> readAll(
            @AuthenticationPrincipal Long uid
    ) {
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6
        s.readAll(uid);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/read")
<<<<<<< HEAD
    public ResponseEntity<Void> read(@AuthenticationPrincipal Long uid, @PathVariable Long id) {
        s.read(uid, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteAll(@AuthenticationPrincipal Long uid) {
        s.deleteAll(uid);
        return ResponseEntity.noContent().build();
    }
}
=======
    public ResponseEntity<Void> read(
            @AuthenticationPrincipal Long uid,
            @PathVariable Long id
    ) {
        s.read(uid, id);
        return ResponseEntity.noContent().build();
    }
}

>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6

package findu.backend.chat.service;

import findu.backend.chat.dto.ChatRequestResponse;
import findu.backend.chat.entity.ChatRequest;
import findu.backend.chat.repository.ChatRequestRepository;
import findu.backend.notification.service.NotificationService;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import findu.backend.verification.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatRequestService {

    private final ChatRequestRepository repo;
    private final UserRepository users;
    private final VerificationService verificationService;
    private final NotificationService notificationService;
    private final ChatService chatService;

    private User user(Long id) {
        return users.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "사용자를 찾을 수 없습니다."
                        )
                );
    }

    // 채팅 요청
    @Transactional
    public ChatRequestResponse create(
            Long uid,
            Long receiverId,
            Long foundItemId
    ) {

        if (uid.equals(receiverId)) {
            throw new IllegalArgumentException(
                    "본인에게 채팅 요청을 보낼 수 없습니다."
            );
        }

        // 본인확인 성공 여부 확인
        if (!verificationService.isVerified(uid, foundItemId)) {
            throw new IllegalStateException(
                    "본인확인 질문을 먼저 통과해야 합니다."
            );
        }

        User requester = user(uid);
        User receiver = user(receiverId);

        // 이미 대기 중인 요청이 있는지 확인
        if (repo.findByRequesterIdAndReceiverIdAndStatus(
                uid,
                receiverId,
                ChatRequest.Status.PENDING
        ).isPresent()) {

            throw new IllegalStateException(
                    "이미 채팅 요청을 보냈습니다."
            );
        }

        ChatRequest request = ChatRequest.builder()
                .requester(requester)
                .receiver(receiver)
                .status(ChatRequest.Status.PENDING)
                .build();

        ChatRequest saved = repo.save(request);

        // 상대방에게 알림
        notificationService.create(
                receiverId,
                "CHAT_REQUEST",
                requester.getNickname() + "님이 채팅을 요청했습니다."
        );

        return ChatRequestResponse.from(saved);
    }

    // 받은 요청
    @Transactional(readOnly = true)
    public List<ChatRequestResponse> received(Long uid) {

        return repo.findByReceiverIdOrderByCreatedAtDesc(uid)
                .stream()
                .map(ChatRequestResponse::from)
                .toList();
    }

    // 내가 보낸 요청
    @Transactional(readOnly = true)
    public List<ChatRequestResponse> sent(Long uid) {

        return repo.findByRequesterIdOrderByCreatedAtDesc(uid)
                .stream()
                .map(ChatRequestResponse::from)
                .toList();
    }

    // 요청 수락
    @Transactional
    public ChatRequestResponse accept(
            Long uid,
            Long requestId
    ) {

        ChatRequest request = repo.findById(requestId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "채팅 요청을 찾을 수 없습니다."
                        )
                );

        if (!request.getReceiver().getId().equals(uid)) {
            throw new IllegalStateException(
                    "해당 채팅 요청의 수신자가 아닙니다."
            );
        }

        if (request.getStatus() != ChatRequest.Status.PENDING) {
            throw new IllegalStateException(
                    "이미 처리된 채팅 요청입니다."
            );
        }

        request.accept();

        // 수락 시 ChatRoom 생성
        chatService.create(
                request.getReceiver().getId(),
                new findu.backend.chat.dto.CreateRoomRequest(
                        request.getRequester().getId()
                )
        );

        // 요청자에게 알림
        notificationService.create(
                request.getRequester().getId(),
                "CHAT_ACCEPTED",
                request.getReceiver().getNickname()
                        + "님이 채팅 요청을 수락했습니다."
        );

        return ChatRequestResponse.from(request);
    }

    // 요청 거절
    @Transactional
    public ChatRequestResponse reject(
            Long uid,
            Long requestId
    ) {

        ChatRequest request = repo.findById(requestId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "채팅 요청을 찾을 수 없습니다."
                        )
                );

        if (!request.getReceiver().getId().equals(uid)) {
            throw new IllegalStateException(
                    "해당 채팅 요청의 수신자가 아닙니다."
            );
        }

        if (request.getStatus() != ChatRequest.Status.PENDING) {
            throw new IllegalStateException(
                    "이미 처리된 채팅 요청입니다."
            );
        }

        request.reject();

        notificationService.create(
                request.getRequester().getId(),
                "CHAT_REJECTED",
                request.getReceiver().getNickname()
                        + "님이 채팅 요청을 거절했습니다."
        );

        return ChatRequestResponse.from(request);
    }
}
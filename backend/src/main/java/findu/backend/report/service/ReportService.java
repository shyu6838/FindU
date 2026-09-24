package findu.backend.report.service;

<<<<<<< HEAD
import findu.backend.chat.repository.ChatRoomRepository;
import findu.backend.item.ItemRepository;
import findu.backend.notification.service.NotificationService;
import findu.backend.report.dto.*;
import findu.backend.report.entity.Report;
import findu.backend.report.repository.ReportRepository;
import findu.backend.trust.entity.TrustEvent;
import findu.backend.trust.service.TrustService;
import findu.backend.user.entity.User;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
=======
import findu.backend.report.dto.*;
import findu.backend.report.entity.Report;
import findu.backend.report.repository.ReportRepository;
import findu.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6

@Service
@RequiredArgsConstructor
public class ReportService {
<<<<<<< HEAD
    
    private final ReportRepository repo;
    private final UserRepository users;
    private final ItemRepository itemRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final TrustService trustService;
    private final NotificationService notificationService;

    @Transactional
    public ReportResponse create(Long uid, ReportCreateRequest r) {
        User u = users.findById(uid).orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        Report report = Report.builder()
                .reporter(u)
                .targetType(r.targetType())
                .targetId(r.targetId())
                .reason(r.reason())
                .description(r.description())
                .status(Report.Status.PENDING)
                .build();

        if ("ITEM".equals(r.targetType())) {
            itemRepository.findById(r.targetId()).ifPresent(item -> {
                report.setSnapshot(item.getTitle(), item.getImageUrl(), item.getType().name());
            });
        } 
        else if ("CHAT".equals(r.targetType())) {
            chatRoomRepository.findById(r.targetId()).ifPresent(chat -> {
                String chatLogs = chat.getMessages().stream()
                        .map(msg -> msg.getSender().getNickname() + ": " + msg.getContent())
                        .collect(Collectors.joining("\n"));
                report.setChatSnapshot(chatLogs);

                User targetUser = chat.getUser1().getId().equals(u.getId()) ? chat.getUser2() : chat.getUser1();
                report.setChatUserInfoSnapshot(targetUser.getNickname(), targetUser.getEmail());
            });
        }

        Report savedReport = repo.save(report);
        return convertToResponse(savedReport);
=======

    final ReportRepository repo;
    final UserRepository users;

    @Transactional
    public ReportResponse create(Long uid, ReportCreateRequest r) {
        var u = users.findById(uid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        return ReportResponse.from(
                repo.save(
                        Report.builder()
                                .reporter(u)
                                .targetType(r.targetType())
                                .targetId(r.targetId())
                                .reason(r.reason())
                                .description(r.description())
                                .status(Report.Status.PENDING)
                                .build()
                )
        );
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> my(Long uid) {
<<<<<<< HEAD
        return repo.findByReporterIdOrderByCreatedAtDesc(uid).stream()
                .map(this::convertToResponse)
=======
        return repo.findByReporterIdOrderByCreatedAtDesc(uid)
                .stream()
                .map(ReportResponse::from)
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReportResponse> all(Long uid) {
        requireAdmin(uid);
<<<<<<< HEAD
        return repo.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToResponse)
=======

        return repo.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ReportResponse::from)
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6
                .toList();
    }

    @Transactional
    public ReportResponse status(Long uid, Long id, Report.Status st) {
        requireAdmin(uid);
<<<<<<< HEAD
        Report r = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다."));
        r.updateStatus(st, "상태 임의 변경");
        return convertToResponse(r);
    }

    @Transactional
    public ReportResponse process(Long uid, Long id, ReportProcessRequest req) {
        requireAdmin(uid);
        Report r = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다."));
        
        List<String> penalties = new ArrayList<>();
        if ("REJECTED".equals(req.status())) {
            penalties.add("허위 신고 반려");
        } else {
            if (req.deleteTarget()) penalties.add("대상 삭제");
            if (req.decreaseTrust()) penalties.add("신뢰도 5도 하락");
            if (penalties.isEmpty()) penalties.add("조치 완료");
        }

        r.updateStatus(Report.Status.valueOf(req.status()), String.join(", ", penalties));

        User targetUser = null;

        if ("ITEM".equals(r.getTargetType())) {
            var itemOpt = itemRepository.findById(r.getTargetId());
            if (itemOpt.isPresent()) {
                targetUser = itemOpt.get().getUser();
                if (req.deleteTarget()) {
                    itemRepository.delete(itemOpt.get());
                }
            }
        } else if ("CHAT".equals(r.getTargetType())) {
            var chatOpt = chatRoomRepository.findById(r.getTargetId());
            if (chatOpt.isPresent()) {
                var chat = chatOpt.get();
                targetUser = chat.getUser1().getId().equals(r.getReporter().getId()) ? chat.getUser2() : chat.getUser1();
                if (req.deleteTarget()) {
                    chatRoomRepository.delete(chat);
                }
            }
        }

        if (req.decreaseTrust() && targetUser != null) {
            trustService.addEvent(
                    targetUser.getId(),
                    TrustEvent.EventType.REVIEW_NEGATIVE, 
                    -5,
                    "운영정책 위반 신고 처리에 의한 신뢰도 차감"
            );
        }

        if (req.sendNotification()) {
            if (targetUser != null) {
                String targetMessage = "신고가 접수되어 운영정책에 따라 조치되었습니다.";
                if (req.decreaseTrust() && req.deleteTarget()) {
                    targetMessage = "운영정책 위반으로 대상 게시글이 삭제되고 신뢰도가 5도 하락했습니다.";
                } else if (req.decreaseTrust()) {
                    targetMessage = "운영정책 위반으로 신뢰도가 5도 하락했습니다.";
                } else if (req.deleteTarget()) {
                    targetMessage = "운영정책 위반으로 대상 게시글이 삭제되었습니다.";
                }

                notificationService.create(
                        targetUser.getId(),
                        "REPORT_PENALTY",
                        targetMessage,
                        r.getTargetId()
                );
            }

            notificationService.create(
                    r.getReporter().getId(),
                    "REPORT_RESOLVED",
                    "접수하신 신고 내역에 대한 조치가 완료되었습니다.",
                    r.getTargetId()
            );
        }

        return convertToResponse(r);
    }

    private void requireAdmin(Long uid) {
        User u = users.findById(uid).orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        if (u.getRole() != findu.backend.user.entity.Role.ADMIN) {
            throw new AccessDeniedException("관리자만 접근할 수 있습니다.");
        }
    }

    private ReportResponse convertToResponse(Report report) {
        String targetTitle = report.getSnapshotTitle() != null ? report.getSnapshotTitle() : "알 수 없음";
        String targetImageUrl = report.getSnapshotImageUrl();
        String targetItemType = report.getSnapshotItemType();
        String targetUserNickname = null;
        String targetUserEmail = null;

        if ("ITEM".equals(report.getTargetType())) {
            var itemOpt = itemRepository.findById(report.getTargetId());
            if (itemOpt.isPresent()) {
                var item = itemOpt.get();
                targetTitle = item.getTitle();
                targetImageUrl = item.getImageUrl();
                targetItemType = item.getType().name();
            } else {
                targetTitle = report.getSnapshotTitle() != null ? report.getSnapshotTitle() + " (삭제됨)" : "삭제된 게시글";
            }
        } else if ("CHAT".equals(report.getTargetType())) {
            var chatOpt = chatRoomRepository.findById(report.getTargetId());
            if (chatOpt.isPresent()) {
                var chat = chatOpt.get();
                User targetUser = chat.getUser1().getId().equals(report.getReporter().getId()) ? chat.getUser2() : chat.getUser1();
                targetUserNickname = targetUser.getNickname();
                targetUserEmail = targetUser.getEmail();
            } else {
                targetUserNickname = report.getSnapshotTargetNickname() != null ? report.getSnapshotTargetNickname() : "삭제된 채팅";
                targetUserEmail = report.getSnapshotTargetEmail();
            }
        }

        return new ReportResponse(
                report.getId(),
                report.getReporter().getId(),
                report.getReporter().getNickname(),
                report.getReporter().getEmail(),
                report.getTargetType(),
                report.getTargetId(),
                targetTitle,
                targetImageUrl,
                targetItemType,
                targetUserNickname,
                targetUserEmail,
                report.getReason(),
                report.getDescription(),
                report.getStatus().name(),
                report.getPenaltyDetails(),
                report.getSnapshotChatLogs(),
                report.getCreatedAt()
        );
=======

        var r = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다."));

        r.updateStatus(st);

        return ReportResponse.from(r);
    }

    private void requireAdmin(Long uid) {
        var u = users.findById(uid)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (u.getRole() != findu.backend.user.entity.Role.ADMIN)
            throw new org.springframework.security.access.AccessDeniedException(
                    "관리자만 접근할 수 있습니다."
            );
>>>>>>> ac000a47bda31227ea8a335b533fb0ca489933d6
    }
}
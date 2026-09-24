// NotificationDropdown.jsx

import { useCallback, useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import api from '../api/axios';

// 네비게이션바 알림 드롭다운 컴포넌트
export default function NotificationDropdown({ onNavigate, isLoggedIn }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);
  const toastTimerRef = useRef(null);

  // 알림 목록 조회
  const fetchNotifications = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get('/api/notifications', { timeout: 5000 });
      setNotifications(res.data || []);
    } catch (error) {
      setNotifications([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // 토스트 메시지 표시 타이머 관리
  const showToast = useCallback((notification) => {
    setToast(notification);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

  // 실시간 웹소켓 연결 및 알림 구독
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      setToast(null);
      return;
    }

    fetchNotifications();

    const accessToken = localStorage.getItem('accessToken');
    const apiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/$/, '');
    const websocketUrl = `${apiUrl.replace(/^http/, 'ws')}/ws/chat`;
    
    const client = new Client({
      brokerURL: websocketUrl,
      connectHeaders: { Authorization: `Bearer ${accessToken}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
      onConnect: () => {
        fetchNotifications();
        client.subscribe('/user/queue/notifications', (message) => {
          const notification = JSON.parse(message.body);
          setNotifications((prev) => [
            notification,
            ...prev.filter((item) => item.id !== notification.id),
          ]);
          showToast(notification);
        });
      },
    });

    client.activate();

    return () => {
      window.clearTimeout(toastTimerRef.current);
      client.deactivate();
    };
  }, [fetchNotifications, isLoggedIn, showToast]);

  // 드롭다운 외부 영역 클릭 시 닫기 처리
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(noti => !noti.read).length;
  const hasUnread = unreadCount > 0;

  // 알림 드롭다운 토글 및 로그인 상태 확인
  const handleToggle = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      onNavigate('login');
      return;
    }
    setIsOpen(!isOpen);
  };

  // 알림 시간 포맷 변환
  const formatTime = (createdAt) => {
    if (!createdAt) return '';
    return createdAt.replace('T', ' ').slice(0, 16);
  };

  // 개별 알림 읽음 처리
  const handleRead = async (noti) => {
    if (!noti.read) {
      try {
        await api.patch(`/api/notifications/${noti.id}/read`);
        setNotifications(prev => prev.map(item => item.id === noti.id ? { ...item, read: true } : item));
      } catch (error) {
        // 실패 시 무시
      }
    }
  };

  // 모든 알림 읽음 처리
  const handleReadAll = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(item => ({ ...item, read: true })));
    } catch {
      alert('모두 읽음 처리에 실패했습니다.');
    }
  };

  // 모든 알림 삭제 처리
  const handleDeleteAll = async () => {
    if (window.confirm('모든 알림을 삭제하시겠습니까?')) {
      try {
        await api.delete('/api/notifications');
        setNotifications([]); 
      } catch (error) {
        alert('알림 전체 삭제에 실패했습니다.');
      }
    }
  };

  // 알림 유형별 분류 텍스트 반환
  const getCategoryText = (type) => {
    if (type === 'CHAT') return '[채팅]';
    if (type === 'CHAT_MATCHED') return '[완료]';
    if (type === 'MATCH') return '[유사]';
    if (type === 'REPORT_RESOLVED' || type === 'REPORT_PENALTY') return '[신고]';
    return '[알림]';
  };

  return (
    <div style={containerStyle} ref={dropdownRef}>
      <div 
        style={navItemStyle} 
        onClick={handleToggle}
      >
        알림
        {isLoggedIn && hasUnread && <span style={badgeStyle}>{unreadCount}</span>}
      </div>

      {isOpen && (
        <div style={dropdownStyle}>
          <div style={headerStyle}>
            <h4 style={headerTitleStyle}>알림</h4>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={actionBtnStyle} onClick={handleReadAll} disabled={!hasUnread}>
                모두 읽음
              </button>
              <button style={{ ...actionBtnStyle, color: '#ef4444' }} onClick={handleDeleteAll} disabled={notifications.length === 0}>
                모두 삭제
              </button>
            </div>
          </div>

          <ul style={listStyle}>
            {notifications.length === 0 ? (
              <li style={{ ...listItemStyle, cursor: 'default', color: '#9ca3af', justifyContent: 'center' }}>새 알림이 없습니다.</li>
            ) : notifications.map((noti) => (
              <li 
                key={noti.id} 
                style={{
                  ...listItemStyle,
                  backgroundColor: noti.read ? '#f3f4f6' : '#eff6ff',
                  color: noti.read ? '#9ca3af' : '#374151',
                  opacity: noti.read ? 0.7 : 1
                }}
                onClick={async () => {
                  await handleRead(noti);
                  setIsOpen(false);
                  
                  if (noti.type === 'CHAT' || noti.type === 'CHAT_MATCHED') {
                    if (noti.targetId) {
                      onNavigate('chat-room', { room: { id: noti.targetId } });
                    } else {
                      onNavigate('mypage');
                    }
                  } else if (noti.type === 'REPORT_RESOLVED' || noti.type === 'REPORT_PENALTY') {
                    onNavigate('mypage');
                  } else {
                    if (noti.targetId) {
                      onNavigate('detail', noti.targetId);
                    } else {
                      onNavigate('mypage');
                    }
                  }
                }}
              >
                <div style={{ ...iconBoxStyle, filter: noti.read ? 'grayscale(100%)' : 'none' }}>
                  {getCategoryText(noti.type)}
                </div>
                <div style={contentStyle}>
                  <p style={{ ...messageStyle, color: noti.read ? '#6b7280' : '#374151' }}>{noti.message}</p>
                  <span style={timeStyle}>{formatTime(noti.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
          {isRefreshing && <div style={refreshingStyle}>알림을 불러오는 중...</div>}
        </div>
      )}
      {toast && (
        <button
          type="button"
          style={toastStyle}
          onClick={() => {
            setIsOpen(true);
            setToast(null);
          }}
        >
          <span style={toastIconStyle}>{getCategoryText(toast.type)}</span>
          <span style={toastMessageStyle}>{toast.message}</span>
        </button>
      )}
    </div>
  );
}

// 스타일 설정
const containerStyle = { position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '24px' };
const navItemStyle = { cursor: 'pointer', fontWeight: '500', color: '#374151', fontSize: '15px', display: 'flex', alignItems: 'center', position: 'relative', paddingBottom: '4px' };
const badgeStyle = { position: 'absolute', top: '-10px', right: '-16px', minWidth: '18px', height: '18px', padding: '0 5px', backgroundColor: '#ef4444', color: '#ffffff', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' };
const dropdownStyle = { position: 'absolute', top: '35px', right: '-10px', width: '320px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', zIndex: 1000, overflow: 'hidden' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#ffffff' };
const headerTitleStyle = { margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' };
const actionBtnStyle = { background: 'none', border: 'none', fontSize: '12px', color: '#6b7280', cursor: 'pointer', padding: 0, fontWeight: '500' };
const listStyle = { listStyle: 'none', margin: 0, padding: 0, maxHeight: '360px', overflowY: 'auto' };
const listItemStyle = { display: 'flex', alignItems: 'flex-start', padding: '14px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background-color 0.2s' };
const iconBoxStyle = { fontSize: '12px', fontWeight: 'bold', color: '#2563eb', marginRight: '10px', marginTop: '2px', minWidth: '36px' };
const contentStyle = { flex: 1 };
const messageStyle = { margin: '0 0 4px 0', fontSize: '14px', lineHeight: '1.4', wordBreak: 'keep-all' };
const timeStyle = { fontSize: '11px', color: '#9ca3af' };
const refreshingStyle = { padding: '8px 16px', fontSize: '11px', color: '#9ca3af', textAlign: 'center', borderTop: '1px solid #f3f4f6' };
const toastStyle = { position: 'fixed', top: '72px', right: '24px', width: 'min(360px, calc(100vw - 32px))', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', backgroundColor: '#ffffff', color: '#1f2937', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', borderRadius: '8px', boxShadow: '0 12px 24px rgba(15, 23, 42, 0.16)', cursor: 'pointer', textAlign: 'left', zIndex: 1100, fontFamily: 'inherit' };
const toastIconStyle = { flex: '0 0 auto', fontSize: '13px', fontWeight: 'bold', color: '#2563eb' };
const toastMessageStyle = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '600' };
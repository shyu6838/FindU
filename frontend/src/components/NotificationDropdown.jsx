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

  const fetchNotifications = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await api.get('/api/notifications');
      setNotifications(res.data || []);
    } catch {
      setNotifications([]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const showToast = useCallback((notification) => {
    setToast(notification);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 4000);
  }, []);

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

  // 드롭다운 외부 영역 클릭 시 닫기
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

  // 알림 토글 핸들러
  const handleToggle = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 서비스입니다.");
      onNavigate('login');
      return;
    }
    setIsOpen(!isOpen);
  };

  const formatTime = (createdAt) => {
    if (!createdAt) return '';
    return createdAt.replace('T', ' ').slice(0, 16);
  };

  const handleRead = async (noti) => {
    if (!noti.read) {
      try {
        await api.patch(`/api/notifications/${noti.id}/read`);
        setNotifications(prev => prev.map(item => item.id === noti.id ? { ...item, read: true } : item));
      } catch (error) {
        console.error('알림 읽음 처리 실패:', error);
      }
    }
  };

  const handleReadAll = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications(prev => prev.map(item => ({ ...item, read: true })));
      await fetchNotifications();
    } catch {
      alert('모두 읽음 처리에 실패했습니다.');
    }
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
            <button style={readAllBtnStyle} onClick={handleReadAll} disabled={!hasUnread}>
              모두 읽음
            </button>
          </div>

          <ul style={listStyle}>
            {notifications.length === 0 ? (
              <li style={{ ...listItemStyle, cursor: 'default', color: '#9ca3af' }}>새 알림이 없습니다.</li>
            ) : notifications.map((noti) => (
              <li 
                key={noti.id} 
                style={{
                  ...listItemStyle,
                  backgroundColor: noti.read ? '#ffffff' : '#eff6ff'
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
                  } else {
                    onNavigate('detail');
                  }
                }}
              >
                <div style={iconBoxStyle}>
                  {noti.type === 'CHAT' ? '💬' : noti.type === 'CHAT_MATCHED' ? '✅' : noti.type === 'MATCH' ? '🚨' : '❓'}
                </div>
                <div style={contentStyle}>
                  <p style={messageStyle}>{noti.message}</p>
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
          <span style={toastIconStyle}>{toast.type === 'CHAT' ? '💬' : '✅'}</span>
          <span style={toastMessageStyle}>{toast.message}</span>
        </button>
      )}
    </div>
  );
}

// 스타일 설정
const containerStyle = { position: 'relative', display: 'inline-block', marginLeft: '24px' };
const navItemStyle = { cursor: 'pointer', fontWeight: '500', color: '#374151', fontSize: '15px', display: 'flex', alignItems: 'center', position: 'relative' };
const badgeStyle = { position: 'absolute', top: '-10px', right: '-16px', minWidth: '18px', height: '18px', padding: '0 5px', backgroundColor: '#ef4444', color: '#ffffff', borderRadius: '999px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', boxSizing: 'border-box' };
const dropdownStyle = { position: 'absolute', top: '35px', right: '-10px', width: '320px', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb', zIndex: 1000, overflow: 'hidden' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#ffffff' };
const headerTitleStyle = { margin: 0, fontSize: '15px', fontWeight: 'bold', color: '#111827' };
const readAllBtnStyle = { background: 'none', border: 'none', fontSize: '12px', color: '#6b7280', cursor: 'pointer', padding: 0 };
const listStyle = { listStyle: 'none', margin: 0, padding: 0, maxHeight: '360px', overflowY: 'auto' };
const listItemStyle = { display: 'flex', alignItems: 'flex-start', padding: '14px 16px', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', transition: 'background-color 0.2s' };
const iconBoxStyle = { fontSize: '18px', marginRight: '12px', marginTop: '2px' };
const contentStyle = { flex: 1 };
const messageStyle = { margin: '0 0 4px 0', fontSize: '14px', color: '#374151', lineHeight: '1.4', wordBreak: 'keep-all' };
const timeStyle = { fontSize: '11px', color: '#9ca3af' };
const refreshingStyle = { padding: '8px 16px', fontSize: '11px', color: '#9ca3af', textAlign: 'center', borderTop: '1px solid #f3f4f6' };
const toastStyle = { position: 'fixed', top: '72px', right: '24px', width: 'min(360px, calc(100vw - 32px))', display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', backgroundColor: '#ffffff', color: '#1f2937', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', borderRadius: '8px', boxShadow: '0 12px 24px rgba(15, 23, 42, 0.16)', cursor: 'pointer', textAlign: 'left', zIndex: 1100, fontFamily: 'inherit' };
const toastIconStyle = { flex: '0 0 auto', fontSize: '18px' };
const toastMessageStyle = { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: '600' };

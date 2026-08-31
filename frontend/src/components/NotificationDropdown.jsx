// NotificationDropdown.jsx

import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';

// 네비게이션바 알림 드롭다운 컴포넌트
export default function NotificationDropdown({ onNavigate, isLoggedIn }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }

    api.get('/api/notifications')
      .then(res => setNotifications(res.data || []))
      .catch(() => setNotifications([]));
  }, [isLoggedIn]);

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

  const hasUnread = notifications.some(noti => !noti.read);

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
    await Promise.all(notifications.filter(noti => !noti.read).map(handleRead));
  };

  return (
    <div style={containerStyle} ref={dropdownRef}>
      <div 
        style={navItemStyle} 
        onClick={handleToggle}
      >
        알림
        {isLoggedIn && hasUnread && <span style={redDotStyle}></span>}
      </div>

      {isOpen && (
        <div style={dropdownStyle}>
          <div style={headerStyle}>
            <h4 style={headerTitleStyle}>알림</h4>
            <button style={readAllBtnStyle} onClick={handleReadAll}>
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
                  if (noti.type === 'CHAT') onNavigate('chat-room');
                  else onNavigate('detail');
                }}
              >
                <div style={iconBoxStyle}>
                  {noti.type === 'CHAT' ? '💬' : noti.type === 'MATCH' ? '🚨' : '❓'}
                </div>
                <div style={contentStyle}>
                  <p style={messageStyle}>{noti.message}</p>
                  <span style={timeStyle}>{formatTime(noti.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// 스타일 설정
const containerStyle = { position: 'relative', display: 'inline-block', marginLeft: '24px' };
const navItemStyle = { cursor: 'pointer', fontWeight: '500', color: '#374151', fontSize: '15px', display: 'flex', alignItems: 'center', position: 'relative' };
const redDotStyle = { position: 'absolute', top: '-2px', right: '-6px', width: '6px', height: '6px', backgroundColor: '#ef4444', borderRadius: '50%' };
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

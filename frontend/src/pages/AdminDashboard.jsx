import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminDashboard({ onNavigate }) {
  // 탭 및 신고 데이터 상태 관리
  const [activeTab, setActiveTab] = useState('post');
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 채팅 대화 내역 모달 상태 관리
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  const [selectedChatHistory, setSelectedChatHistory] = useState([]);
  const [chatHistoryLoading, setChatHistoryLoading] = useState(false);

  // 신고 처리 액션(패널티) 상태 관리
  const [actions, setActions] = useState({
    deletePost: false,
    decreaseTrust: false,
    rejectReport: false,
  });

  // 초기 데이터 로드
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/reports');
      setReports(res.data);
    } catch (err) {
      // 에러 시 빈 목록 유지
    } finally {
      setLoading(false);
    }
  };

  const handleActionChange = (e) => {
    const { name, checked } = e.target;
    setActions((prev) => ({ ...prev, [name]: checked }));
  };

  // 신고 처리 및 패널티 부여 로직
  const handleProcessSubmit = async () => {
    if (!actions.deletePost && !actions.decreaseTrust && !actions.rejectReport) {
      alert("처리할 액션을 하나 이상 선택해주세요.");
      return;
    }

    try {
      const newStatus = actions.rejectReport ? 'REJECTED' : 'RESOLVED';
      
      const res = await api.patch(`/api/reports/${selectedReport.id}/process`, {
        status: newStatus,
        deleteTarget: actions.deletePost,
        decreaseTrust: actions.decreaseTrust,
        sendNotification: true
      });
      
      setReports(prev => prev.map(r => 
        r.id === selectedReport.id 
          ? { ...r, status: newStatus, penaltyDetails: res.data.penaltyDetails } 
          : r
      ));
      
      alert("신고 처리가 완료되었으며 관련 알림이 발송되었습니다.");
      setSelectedReport(null);
      setActions({ deletePost: false, decreaseTrust: false, rejectReport: false });
    } catch (err) {
      alert("신고 처리에 실패했습니다.");
    }
  };

  // 채팅 대화 내역 조회 로직 (스냅샷 우선 확인 후 API 호출)
  const handleOpenChatHistory = async (report) => {
    setIsChatHistoryOpen(true);
    setChatHistoryLoading(true);

    if (report.snapshotChatLogs) {
      const lines = report.snapshotChatLogs.split('\n');
      const mockHistory = lines.map((line, index) => {
        const colonIndex = line.indexOf(':');
        const nickname = colonIndex > -1 ? line.substring(0, colonIndex) : '알 수 없음';
        const message = colonIndex > -1 ? line.substring(colonIndex + 1).trim() : line;
        return { id: index, senderNickname: nickname, message: message, createdAt: '' };
      });
      setSelectedChatHistory(mockHistory);
      setChatHistoryLoading(false);
      return;
    }

    try {
      const res = await api.get(`/api/chat-rooms/${report.targetId}/messages`);
      setSelectedChatHistory(res.data);
    } catch (error) {
      alert("대화 내역을 불러오지 못했습니다.");
    } finally {
      setChatHistoryLoading(false);
    }
  };

  // 현재 활성화된 탭에 따른 데이터 필터링
  const filteredReports = activeTab === 'post'
    ? reports.filter(r => r.targetType === 'ITEM' && r.status === 'PENDING')
    : activeTab === 'chat'
    ? reports.filter(r => r.targetType === 'CHAT' && r.status === 'PENDING')
    : reports.filter(r => r.status !== 'PENDING');

  return (
    <div style={styles.container}>
      {/* 좌측 네비게이션 메뉴 */}
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>관리</h2>
        <ul style={styles.menuList}>
          <li style={activeTab === 'post' ? styles.activeMenuItem : styles.menuItem} onClick={() => setActiveTab('post')}>
            게시글 신고 관리
          </li>
          <li style={activeTab === 'chat' ? styles.activeMenuItem : styles.menuItem} onClick={() => setActiveTab('chat')}>
            채팅 신고 관리
          </li>
          <li style={activeTab === 'resolved' ? styles.activeMenuItem : styles.menuItem} onClick={() => setActiveTab('resolved')}>
            처리 완료 내역
          </li>
        </ul>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main style={styles.mainContent}>
        <h2 style={styles.contentTitle}>
          {activeTab === 'post' ? '게시글 신고 관리' : activeTab === 'chat' ? '채팅 신고 관리' : '처리 완료 내역'}
        </h2>
        
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>신고일시</th>
                <th style={styles.th}>신고자</th>
                <th style={styles.th}>신고대상</th>
                <th style={styles.th}>사유</th>
                <th style={styles.th}>상세 사유</th>
                <th style={styles.th}>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={styles.emptyRow}>데이터를 불러오는 중입니다...</td></tr>
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report) => {
                  // 채팅 신고건이면서 삭제(패널티) 처리된 상태인지 확인
                  const isChatDeleted = report.targetType === 'CHAT' && report.status !== 'PENDING' && report.penaltyDetails?.includes('삭제');

                  return (
                    <tr key={report.id} style={styles.tr}>
                      <td style={styles.td}>{new Date(report.createdAt).toLocaleString()}</td>
                      
                      <td style={styles.td}>
                        <div style={{ fontSize: '14px', color: '#111827', fontWeight: 'bold' }}>
                          {report.reporterNickname || '알 수 없음'}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>
                          ({report.reporterEmail || '이메일 없음'})
                        </div>
                      </td>
                      
                      <td style={styles.td}>
                        {report.targetType === 'ITEM' ? (
                          <div 
                            style={styles.targetItemCard} 
                            onClick={() => onNavigate && onNavigate('post-detail', report.targetId)}
                          >
                            <div style={styles.targetImageWrapper}>
                              {report.targetImageUrl ? (
                                <img 
                                  src={report.targetImageUrl} 
                                  alt="물품 썸네일" 
                                  style={styles.targetImage} 
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div style={{ ...styles.targetImage, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', color: '#9ca3af', fontSize: '12px' }}>
                                  없음
                                </div>
                              )}
                              {report.targetItemType && (
                                <span style={{ 
                                  ...styles.targetBadge, 
                                  backgroundColor: report.targetItemType === 'LOST' ? '#ef4444' : '#10b981' 
                                }}>
                                  {report.targetItemType === 'LOST' ? '분실' : '습득'}
                                </span>
                              )}
                            </div>
                            <span style={styles.targetLinkText}>{report.targetTitle || `게시글 ID: ${report.targetId}`}</span>
                          </div>
                        ) : (
                          <div style={styles.targetChatCard}>
                            <div style={styles.chatUserInfo}>
                              <span style={{ 
                                ...styles.chatAvatar, 
                                backgroundColor: isChatDeleted ? '#fee2e2' : '#f3f4f6', 
                                color: isChatDeleted ? '#ef4444' : '#374151' 
                              }}>
                                {isChatDeleted ? '삭제' : 'User'}
                              </span>
                              <span style={{ 
                                fontWeight: 'bold', 
                                color: isChatDeleted ? '#6b7280' : '#111827' 
                              }}>
                                {report.targetUserNickname || '알 수 없음'}
                              </span>
                              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                                ({report.targetUserEmail || `ID: ${report.targetId}`})
                              </span>
                              {isChatDeleted && (
                                <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold', marginLeft: '2px' }}>
                                  (삭제됨)
                                </span>
                              )}
                            </div>
                            <button 
                              style={styles.chatLogBtn}
                              onClick={() => handleOpenChatHistory(report)}
                            >
                              대화 내역 열람
                            </button>
                          </div>
                        )}
                      </td>
                      
                      <td style={styles.td}>{report.reason}</td>
                      <td style={{ ...styles.td, maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {report.description || '없음'}
                      </td>
                      <td style={styles.td}>
                        {report.status === 'PENDING' ? (
                          <button 
                            style={styles.processBtn} 
                            onClick={() => setSelectedReport(report)}
                          >
                            처리하기
                          </button>
                        ) : (
                          <span style={{ fontSize: '13px', color: '#111827', fontWeight: 'bold', display: 'block', wordBreak: 'keep-all' }}>
                            {report.penaltyDetails || '처리 완료'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={styles.emptyRow}>해당하는 신고 내역이 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* 신고 상세 처리 모달 */}
      {selectedReport && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={styles.modalTitle}>신고 내역 상세 처리</h3>
            <div style={styles.modalDetails}>
              <p>
                <strong>신고 대상:</strong> {selectedReport.targetType === 'ITEM' ? `${selectedReport.targetTitle || '알 수 없음'}(게시글ID : ${selectedReport.targetId})` : `채팅(ID : ${selectedReport.targetId})`}
              </p>
              <p><strong>신고 사유:</strong> {selectedReport.reason}</p>
              <p><strong>상세 내용:</strong> {selectedReport.description || '없음'}</p>
            </div>

            {selectedReport.status === 'PENDING' && (
              <div style={styles.actionBox}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>패널티 부여 (중복 선택 가능)</h4>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" name="deletePost" checked={actions.deletePost} onChange={handleActionChange} />
                  대상 게시글 삭제
                </label>
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" name="decreaseTrust" checked={actions.decreaseTrust} onChange={handleActionChange} />
                  신고 대상자 신뢰도 5도 하락
                </label>
                <hr style={{ margin: '12px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                <label style={styles.checkboxLabel}>
                  <input type="checkbox" name="rejectReport" checked={actions.rejectReport} onChange={handleActionChange} />
                  허위 신고로 반려
                </label>
              </div>
            )}

            <div style={styles.modalButtonGroup}>
              <button style={styles.cancelBtn} onClick={() => setSelectedReport(null)}>닫기</button>
              {selectedReport.status === 'PENDING' && (
                <button style={styles.submitBtn} onClick={handleProcessSubmit}>처리 완료 적용</button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 채팅 대화 내역 모달 */}
      {isChatHistoryOpen && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalContent, width: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <h3 style={styles.modalTitle}>채팅 대화 내역</h3>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              {chatHistoryLoading ? (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>내역을 불러오는 중입니다...</div>
              ) : selectedChatHistory.length > 0 ? (
                selectedChatHistory.map((msg) => (
                  <div key={msg.id} style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#374151' }}>{msg.senderNickname || '익명 사용자'}</span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ''}</span>
                    </div>
                    <div style={{ padding: '10px 14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', color: '#111827', width: 'fit-content' }}>
                      {msg.message || msg.content || '메시지 내용 없음'}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#6b7280', padding: '20px' }}>대화 내역이 없습니다.</div>
              )}
            </div>

            <div style={styles.modalButtonGroup}>
              <button style={styles.cancelBtn} onClick={() => setIsChatHistoryOpen(false)}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: 'calc(100vh - 70px)', backgroundColor: '#f9fafb', fontFamily: "'Pretendard', sans-serif" },
  sidebar: { width: '260px', backgroundColor: '#ffffff', borderRight: '1px solid #e5e7eb', padding: '32px 20px' },
  sidebarTitle: { fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '24px', paddingLeft: '12px' },
  menuList: { listStyle: 'none', padding: 0, margin: 0 },
  menuItem: { padding: '12px', marginBottom: '8px', borderRadius: '8px', cursor: 'pointer', color: '#4b5563', fontSize: '15px', fontWeight: '500', transition: 'all 0.2s' },
  activeMenuItem: { padding: '12px', marginBottom: '8px', borderRadius: '8px', cursor: 'pointer', color: '#ef4444', backgroundColor: '#fef2f2', fontSize: '15px', fontWeight: 'bold', transition: 'all 0.2s' },
  mainContent: { flex: 1, padding: '40px' },
  contentTitle: { fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0 0 24px 0' },
  tableWrapper: { backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thead: { backgroundColor: '#f3f4f6', borderBottom: '1px solid #e5e7eb' },
  th: { padding: '16px', fontSize: '14px', fontWeight: 'bold', color: '#374151' },
  tr: { borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.1s' },
  td: { padding: '16px', fontSize: '14px', color: '#111827', verticalAlign: 'middle' },
  emptyRow: { padding: '32px', textAlign: 'center', color: '#6b7280' },
  processBtn: { padding: '6px 12px', backgroundColor: '#111827', color: '#ffffff', border: 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' },
  targetItemCard: { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background-color 0.2s' },
  targetImageWrapper: { position: 'relative', width: '48px', height: '48px', backgroundColor: '#e5e7eb', borderRadius: '8px' },
  targetImage: { width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' },
  targetBadge: { position: 'absolute', top: '-4px', left: '-4px', color: '#ffffff', fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px' },
  targetLinkText: { fontSize: '13px', color: '#111827', fontWeight: 'bold' },
  targetChatCard: { display: 'flex', flexDirection: 'column', gap: '8px' },
  chatUserInfo: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#374151' },
  chatAvatar: { backgroundColor: '#f3f4f6', borderRadius: '50%', padding: '4px', fontSize: '12px', fontWeight: 'bold' },
  chatLogBtn: { alignSelf: 'flex-start', padding: '4px 8px', backgroundColor: '#f3f4f6', color: '#4b5563', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  modalContent: { backgroundColor: '#ffffff', padding: '32px', borderRadius: '16px', width: '450px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' },
  modalTitle: { margin: '0 0 20px 0', fontSize: '20px', fontWeight: 'bold', color: '#111827' },
  modalDetails: { backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', color: '#374151', lineHeight: '1.6', textAlign: 'left' },
  actionBox: { marginBottom: '24px' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', fontSize: '14px', color: '#111827', cursor: 'pointer' },
  modalButtonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '12px' },
  cancelBtn: { padding: '10px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  submitBtn: { padding: '10px 16px', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
};
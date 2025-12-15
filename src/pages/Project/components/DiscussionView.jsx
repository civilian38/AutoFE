import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { authApi } from '../../../api/axios';
import DiscussionDetail from './DiscussionDetail';
import styles from './DiscussionView.module.css';

const DiscussionView = ({ projectId }) => {
  const [discussions, setDiscussions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Create Mode State
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  // Summary Modal State
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [summaryContent, setSummaryContent] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Fetch List
  const fetchList = useCallback(async () => {
    try {
      const response = await authApi.get(`/discussion/${projectId}/`);
      setDiscussions(response.data || []);
    } catch (err) {
      console.error("Failed to fetch discussion list:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      fetchList();
    }
  }, [projectId, fetchList]);

  // Handler: Start Creation
  const handleStartCreate = () => {
    setSelectedId(null);
    setIsCreating(true);
    setNewTitle('');
  };

  // Handler: Submit Creation
  const handleSubmitCreate = async () => {
    if (!newTitle.trim()) return alert("제목을 입력해주세요.");
    try {
      const response = await authApi.post(`/discussion/${projectId}/`, {
        title: newTitle
      });
      await fetchList();
      setIsCreating(false);
      setSelectedId(response.data.id);
    } catch (err) {
      console.error("Failed to create discussion:", err);
      alert("Discussion 생성에 실패했습니다.");
    }
  };

  // [New] Handler: After Deletion
  const handleDeleteSuccess = async () => {
    setSelectedId(null); // Detail 뷰 닫기
    await fetchList();   // 리스트 갱신
  };

  // Handler: Open Summary Modal
  const handleViewSummary = async (e, discussionId) => {
    e.stopPropagation(); // 리스트 선택 방지
    setSummaryModalOpen(true);
    setLoadingSummary(true);
    setSummaryContent(null);

    try {
      const response = await authApi.get(`/discussion/detail/${discussionId}/`);
      setSummaryContent(response.data.summary);
    } catch (err) {
      console.error("Failed to fetch summary:", err);
      setSummaryContent("요약을 불러오는데 실패했습니다.");
    } finally {
      setLoadingSummary(false);
    }
  };

  return (
    <div className={styles.viewContainer}>
      {/* --- Left Pane (List) --- */}
      <div className={styles.listPane}>
        <div className={styles.paneHeader}>
          <span>Discussions</span>
          <button className={styles.createButton} onClick={handleStartCreate}>
            + New
          </button>
        </div>
        <div className={styles.listContent}>
          {loading && discussions.length === 0 ? (
            <div style={{ padding: '16px', color: '#8b949e', textAlign: 'center' }}>Loading...</div>
          ) : discussions.length === 0 ? (
            <div style={{ padding: '16px', color: '#8b949e', textAlign: 'center' }}>No discussions yet.</div>
          ) : (
            discussions.map((item) => (
              <div
                key={item.id}
                className={`${styles.listItem} ${selectedId === item.id && !isCreating ? styles.selected : ''}`}
                onClick={() => {
                  setSelectedId(item.id);
                  setIsCreating(false);
                }}
              >
                <div className={styles.itemTitleRow}>
                  <div className={styles.itemTitle}>
                    <span className={styles.titleText}>{item.title}</span>
                    {item.is_occupied && <span className={styles.statusDot} title="AI Generating..." />}
                  </div>

                  {/* Hover View Summary Button */}
                  <button
                    className={styles.viewSummaryBtn}
                    onClick={(e) => handleViewSummary(e, item.id)}
                  >
                    View Summary
                  </button>
                </div>
                <div className={styles.itemDate}>
                  {new Date(item.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- Right Pane (Detail or Create Form) --- */}
      {isCreating ? (
        <div className={styles.detailPane}>
          <div className={styles.creationForm}>
            <h3 className={styles.formTitle}>Create New Discussion</h3>
            <input
              type="text"
              className={styles.createInput}
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Enter discussion title..."
              autoFocus
            />
            <div className={styles.createActions}>
              <button className={styles.btnSecondary} onClick={() => setIsCreating(false)}>Cancel</button>
              <button className={styles.btnPrimary} onClick={handleSubmitCreate}>Create</button>
            </div>
          </div>
        </div>
      ) : selectedId ? (
        <DiscussionDetail
          key={selectedId}
          discussionId={selectedId}
          projectId={projectId}
          onDiscussionUpdate={fetchList}
          onDeleteSuccess={handleDeleteSuccess} // [Added]
        />
      ) : (
        <div className={styles.detailPane}>
          <div className={styles.placeholderState}>
            Select a discussion from the list<br/>or create a new one.
          </div>
        </div>
      )}

      {/* Summary Modal */}
      {summaryModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setSummaryModalOpen(false)}>
          <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalTitle}>Discussion Summary</span>
              <button className={styles.closeBtn} onClick={() => setSummaryModalOpen(false)}>
                &times;
              </button>
            </div>
            <div className={styles.modalContent}>
              {loadingSummary ? (
                <div style={{textAlign: 'center', color: '#8b949e'}}>Loading Summary...</div>
              ) : summaryContent ? (
                <div className={styles.markdownBody}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {summaryContent}
                  </ReactMarkdown>
                </div>
              ) : (
                <span className={styles.emptySummary}>
                  생성된 요약이 없습니다.<br/>
                  (Discussion Detail에서 'Summarize Chat' 버튼을 눌러 요약을 생성할 수 있습니다.)
                </span>
              )}
            </div>
            <div className={styles.modalFooter}>
              <button className={styles.btnSecondary} onClick={() => setSummaryModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionView;
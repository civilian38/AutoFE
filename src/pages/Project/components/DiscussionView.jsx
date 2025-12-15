import React, { useState, useEffect, useCallback } from 'react';
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

  // Fetch List
  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      // GET /api/discussion/{project_id}/
      const response = await authApi.get(`/discussion/${projectId}/`);
      setDiscussions(response.data || []);
    } catch (err) {
      console.error("Failed to fetch discussion list:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) fetchList();
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
      setLoading(true);
      // POST /api/discussion/detail/{project_id}/ (Based on API Doc Description)
      const response = await authApi.post(`/discussion/detail/${projectId}/`, {
        title: newTitle
      });

      // Refresh List & Select New Item
      await fetchList();
      setIsCreating(false);
      setSelectedId(response.data.id);
    } catch (err) {
      console.error("Failed to create discussion:", err);
      alert("Discussion 생성에 실패했습니다.");
      setLoading(false);
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
                <div className={styles.itemTitle}>{item.title}</div>
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
          key={selectedId} // Key change forces remount on selection change
          discussionId={selectedId}
          projectId={projectId}
          onUpdateTitle={fetchList} // 제목 수정 시 리스트 갱신
        />
      ) : (
        <div className={styles.detailPane}>
          <div className={styles.placeholderState}>
            Select a discussion from the list<br/>or create a new one.
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionView;
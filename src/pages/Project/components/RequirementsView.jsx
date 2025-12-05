import React, { useEffect, useState, useCallback } from 'react';
import { authApi } from '../../../api/axios';
import RequirementDetail from './RequirementDetail';
import styles from './RequirementsView.module.css';

const RequirementsView = ({ projectId }) => {
  const [reqList, setReqList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false); // 생성 모드 상태

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await authApi.get(`/frontpages/${projectId}/`);
      setReqList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch requirements list:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchList();
    }
  }, [projectId, fetchList]);

  // 새로운 항목 생성 모드 진입
  const handleCreateStart = () => {
    setSelectedId(null);
    setIsCreating(true);
  };

  // 생성/수정/삭제 완료 후 리스트 갱신 및 선택 처리
  const handleRefresh = async (newId = null) => {
    await fetchList();
    setIsCreating(false);
    if (newId) {
      setSelectedId(newId);
    } else {
      setSelectedId(null);
    }
  };

  if (loading && reqList.length === 0) return <div className={styles.loading}>Loading requirements...</div>;

  return (
    <div className={styles.viewContainer}>
      {/* 왼쪽: 리스트 영역 */}
      <div className={styles.listPane}>
        <div className={styles.paneHeader}>
          <span>Pages List</span>
          <button className={styles.createButton} onClick={handleCreateStart}>
            + New
          </button>
        </div>
        <div className={styles.listContent}>
          {reqList.length === 0 ? (
            <div className={styles.emptyState}>등록된 페이지가 없습니다.</div>
          ) : (
            reqList.map((item) => (
              <div
                key={item.id}
                className={`${styles.listItem} ${selectedId === item.id && !isCreating ? styles.selected : ''}`}
                onClick={() => {
                  setSelectedId(item.id);
                  setIsCreating(false);
                }}
              >
                <div className={styles.itemUrl}>{item.url}</div>
                <div className={styles.itemStatus}>
                  {item.is_implemented ?
                    <span className={styles.dotDone} title="Implemented">●</span> :
                    <span className={styles.dotTodo} title="Pending">●</span>
                  }
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 오른쪽: 상세 영역 */}
      <div className={styles.detailPane}>
        {isCreating ? (
          <RequirementDetail
            projectId={projectId}
            isNew={true}
            onRefresh={handleRefresh}
            onCancel={() => setIsCreating(false)}
          />
        ) : selectedId ? (
          <RequirementDetail
            key={selectedId} // ID 변경 시 컴포넌트 리마운트
            reqId={selectedId}
            projectId={projectId}
            onRefresh={handleRefresh}
          />
        ) : (
          <div className={styles.placeholderState}>
            왼쪽 목록에서 페이지를 선택하거나<br />
            [+ New] 버튼을 눌러 새 요구사항을 추가하세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default RequirementsView;
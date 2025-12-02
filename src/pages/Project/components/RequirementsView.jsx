import React, { useEffect, useState } from 'react';
import { authApi } from '../../../api/axios';
import RequirementDetail from './RequirementDetail';
import styles from './RequirementsView.module.css';

const RequirementsView = ({ projectId }) => {
  const [reqList, setReqList] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // 리스트 조회
  useEffect(() => {
    const fetchList = async () => {
      try {
        // [수정됨] API 문서(apidocs)가 아닌 페이지 요구사항(frontpages) 목록을 호출합니다.
        // URL: /frontpages/{project_id}/
        const response = await authApi.get(`/frontpages/${projectId}/`);
        setReqList(response.data || []);
      } catch (error) {
        console.error("Failed to fetch requirements list:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchList();
    }
  }, [projectId]);

  if (loading) return <div className={styles.loading}>Loading requirements...</div>;

  return (
    <div className={styles.viewContainer}>
      {/* 왼쪽: 리스트 영역 */}
      <div className={styles.listPane}>
        <div className={styles.paneHeader}>
          Pages List
        </div>
        <div className={styles.listContent}>
          {reqList.length === 0 ? (
            <div className={styles.emptyState}>등록된 페이지가 없습니다.</div>
          ) : (
            reqList.map((item) => (
              <div
                key={item.id}
                className={`${styles.listItem} ${selectedId === item.id ? styles.selected : ''}`}
                onClick={() => setSelectedId(item.id)}
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
        {selectedId ? (
          <RequirementDetail reqId={selectedId} />
        ) : (
          <div className={styles.placeholderState}>
            왼쪽 목록에서 페이지를 선택하여<br/>상세 요구사항을 확인하세요.
          </div>
        )}
      </div>
    </div>
  );
};

export default RequirementsView;
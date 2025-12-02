import React, { useEffect, useState } from 'react';
import { authApi } from '../../../api/axios'; // src/api/axios.js 경로 확인
import styles from './ApiDocList.module.css';

const ApiDocList = ({ projectId }) => {
  const [apiList, setApiList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApiDocs = async () => {
      try {
        // [수정됨] 사용자 요청에 따른 올바른 API 엔드포인트 적용
        // Base URL이 '.../api'로 설정되어 있으므로 뒷부분만 작성합니다.
        const response = await authApi.get(`/apidocs/${projectId}/`);

        // 응답 샘플이 배열 형태이므로 바로 state에 저장합니다.
        setApiList(response.data || []);
      } catch (error) {
        console.error("Failed to fetch API docs:", error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchApiDocs();
    }
  }, [projectId]);

  if (loading) return <div className={styles.loading}>Loading API documents...</div>;

  return (
    <div className={styles.listContainer}>
      <div className={styles.listHeader}>
        <h2>API Documents</h2>
      </div>

      {apiList.length === 0 ? (
        <div className={styles.emptyState}>등록된 API 문서가 없습니다.</div>
      ) : (
        <div className={styles.apiStack}>
          {apiList.map((api) => (
            <div key={api.id} className={`${styles.apiRow} ${styles[api.http_method.toLowerCase()]}`}>
              <div className={styles.methodBadge}>
                {api.http_method}
              </div>
              <div className={styles.path}>
                {api.url}
              </div>
              <div className={styles.description}>
                {/* API 응답에 name/description 필드가 없으므로
                  URL의 마지막 경로를 UI용 임시 이름으로 파싱하여 표시
                */}
                <span className={styles.apiName}>
                    {api.url.split('/').filter(Boolean).pop() || 'endpoint'}
                </span>
                <svg className={styles.lockIcon} viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-9-2c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiDocList;
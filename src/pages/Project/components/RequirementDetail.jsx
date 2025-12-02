import React, { useEffect, useState } from 'react';
import { authApi } from '../../../api/axios';
import styles from './RequirementsView.module.css'; // 스타일 공유

const RequirementDetail = ({ reqId }) => {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!reqId) return;

      setLoading(true);
      setError(null);
      try {
        // 요구사항 종류: GET /frontpages/detail/{id}/
        const response = await authApi.get(`/frontpages/detail/${reqId}/`);
        setDetail(response.data);
      } catch (err) {
        console.error("Failed to fetch requirement detail:", err);
        setError("상세 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [reqId]);

  if (loading) {
    return <div className={styles.detailLoading}>Loading details...</div>;
  }

  if (error) {
    return <div className={styles.detailError}>{error}</div>;
  }

  if (!detail) {
    return <div className={styles.detailEmpty}>정보가 없습니다.</div>;
  }

  return (
    <div className={styles.detailContainer}>
      <div className={styles.detailHeader}>
        <h3 className={styles.detailTitle}>Page Requirement Detail</h3>
        <span className={`${styles.statusBadge} ${detail.is_implemented ? styles.done : styles.todo}`}>
          {detail.is_implemented ? 'Implemented' : 'To Do'}
        </span>
      </div>

      <div className={styles.fieldGroup}>
        <label>Target URL</label>
        <div className={styles.fieldValue}>{detail.url}</div>
      </div>

      <div className={styles.fieldGroup}>
        <label>Description</label>
        <div className={styles.descriptionBox}>
          {detail.page_description || "작성된 상세 설명이 없습니다."}
        </div>
      </div>
    </div>
  );
};

export default RequirementDetail;
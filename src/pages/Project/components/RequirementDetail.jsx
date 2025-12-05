import React, { useEffect, useState } from 'react';
import { authApi } from '../../../api/axios';
import styles from './RequirementsView.module.css';

const RequirementDetail = ({ reqId, projectId, isNew = false, onRefresh, onCancel }) => {
  const [isEditMode, setIsEditMode] = useState(isNew);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState(null);

  const [data, setData] = useState({
    url: '',
    page_description: '',
    is_implemented: false,
    project_under: projectId
  });

  useEffect(() => {
    if (isNew) return;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await authApi.get(`/frontpages/detail/${reqId}/`);
        setData(response.data);
      } catch (err) {
        console.error("Failed to fetch requirement detail:", err);
        setError("상세 정보를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [reqId, isNew]);

  const handleChange = (field, value) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // is_implemented는 시스템이 판단하므로 Payload에서 제외
      const payload = {
        url: data.url,
        page_description: data.page_description
      };

      if (isNew) {
        const response = await authApi.post(`/frontpages/${projectId}/`, payload);
        onRefresh(response.data.id);
      } else {
        await authApi.put(`/frontpages/detail/${reqId}/`, payload);
        setIsEditMode(false);
        onRefresh(reqId);
      }
    } catch (err) {
      console.error("Failed to save:", err);
      alert("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 요구사항을 삭제하시겠습니까?")) return;
    try {
      setLoading(true);
      await authApi.delete(`/frontpages/detail/${reqId}/`);
      onRefresh(null);
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("삭제에 실패했습니다.");
      setLoading(false);
    }
  };

  if (loading && !isNew && !data.id) return <div className={styles.detailLoading}>Loading...</div>;
  if (error) return <div className={styles.detailError}>{error}</div>;

  return (
    <div className={styles.detailContainer}>
      {/* --- Header Area (버튼 영역 복구됨) --- */}
      <div className={styles.detailHeader}>
        <h3 className={styles.detailTitle}>
          {isNew ? 'New Requirement' : 'Page Requirement Detail'}
        </h3>
        <div className={styles.actionButtons}>
          {isEditMode ? (
            <>
              <button className={styles.btnSecondary} onClick={isNew ? onCancel : () => setIsEditMode(false)}>
                Cancel
              </button>
              <button className={styles.btnPrimary} onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button className={styles.btnDanger} onClick={handleDelete}>
                Delete
              </button>
              <button className={styles.btnPrimary} onClick={() => setIsEditMode(true)}>
                Edit Mode
              </button>
            </>
          )}
        </div>
      </div>

      {/* --- Content Area --- */}
      <div className={styles.contentBody}>

        {/* URL Field Group */}
        <div className={styles.fieldGroup}>
          <div className={styles.labelHeader}>
            <label>Target URL</label>
            {!isNew && (
              <span className={data.is_implemented ? styles.statusTextDone : styles.statusTextTodo}>
                {data.is_implemented ? 'Implemented' : 'Not Implemented'}
              </span>
            )}
          </div>

          {/* Input/Value */}
          {isEditMode ? (
            <input
              type="text"
              className={styles.inputField}
              value={data.url}
              onChange={(e) => handleChange('url', e.target.value)}
              placeholder="/example/path"
            />
          ) : (
            <div className={styles.fieldValue}>{data.url}</div>
          )}
        </div>

        {/* Description Field Group */}
        <div className={styles.fieldGroup}>
          <label>Description</label>

          {isEditMode ? (
            <textarea
              className={styles.textareaField}
              value={data.page_description}
              onChange={(e) => handleChange('page_description', e.target.value)}
              placeholder="페이지에 대한 요구사항을 상세히 작성하세요."
            />
          ) : (
            /* View Mode: 박스 스타일 적용됨 */
            <div className={styles.descriptionBox}>
              {data.page_description || "작성된 상세 설명이 없습니다."}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default RequirementDetail;
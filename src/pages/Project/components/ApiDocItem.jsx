import React, { useState } from 'react';
import { authApi } from '../../../api/axios';
import JsonEditor from '../../../components/JsonEditor/JsonEditor';
import JsonViewer from '../../../components/JsonViewer/JsonViewer'; // 뷰어 추가
import styles from './ApiDocItem.module.css';

const ApiDocItem = ({ apiSummary, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 수정 모드 상태 관리 (기본값 false)
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    url: '',
    http_method: 'GET',
    description: '',
    request_format: {},
    request_headers: {},
    query_params: {},
    response_format: {}
  });

  const fetchDetail = async () => {
    if (detailData) return;
    setLoading(true);
    try {
      const response = await authApi.get(`/apidocs/detail/${apiSummary.id}/`);
      const data = response.data;
      setDetailData(data);
      setFormData({
        url: data.url,
        http_method: data.http_method,
        description: data.description || '',
        request_format: data.request_format || {},
        request_headers: data.request_headers || {},
        query_params: data.query_params || {},
        response_format: data.response_format || {}
      });
    } catch (error) {
      console.error("Failed to fetch detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = () => {
    if (!isExpanded) {
      fetchDetail();
    }
    setIsExpanded(!isExpanded);
    // 닫을 때 수정 모드였다면 초기화 할지 결정 (여기선 유지 혹은 닫으면 뷰모드로 복귀 가능)
    if (isExpanded) {
        setIsEditing(false); // 닫으면 뷰 모드로 리셋
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJsonChange = (field, newContent) => {
    let value = {};
    if (newContent.json) value = newContent.json;
    else if (newContent.text) {
      try { value = JSON.parse(newContent.text); } catch (e) { return; }
    }
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async () => {
    if (!window.confirm("변경사항을 저장하시겠습니까?")) return;
    setIsSaving(true);
    try {
      const response = await authApi.put(`/apidocs/detail/${apiSummary.id}/`, formData);
      setDetailData(response.data);
      alert("저장되었습니다.");
      setIsEditing(false); // 저장 후 뷰 모드로 전환
    } catch (error) {
      console.error("Update failed:", error);
      alert("수정에 실패했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 API 문서를 삭제하시겠습니까?")) return;
    try {
      await authApi.delete(`/apidocs/detail/${apiSummary.id}/`);
      onDelete(apiSummary.id);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("삭제에 실패했습니다.");
    }
  };

  // 수정 취소 핸들러
  const handleCancelEdit = () => {
    // 폼 데이터를 원래 데이터로 롤백
    if (detailData) {
        setFormData({
            url: detailData.url,
            http_method: detailData.http_method,
            description: detailData.description || '',
            request_format: detailData.request_format || {},
            request_headers: detailData.request_headers || {},
            query_params: detailData.query_params || {},
            response_format: detailData.response_format || {}
        });
    }
    setIsEditing(false);
  };

  return (
    <div className={`${styles.itemContainer} ${styles[apiSummary.http_method.toLowerCase()]}`}>
      {/* 요약 헤더 */}
      <div className={styles.headerRow} onClick={toggleExpand}>
        <div className={styles.methodBadge}>{apiSummary.http_method}</div>
        <div className={styles.path}>{apiSummary.url}</div>
        <div className={styles.description}>
          {apiSummary.url.split('/').filter(Boolean).pop() || 'endpoint'}
        </div>
        <button className={`${styles.expandBtn} ${isExpanded ? styles.open : ''}`}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
      </div>

      {/* 확장 영역 */}
      {isExpanded && (
        <div className={styles.detailBody}>
          {loading ? (
            <div className={styles.loading}>Loading details...</div>
          ) : (
            <>
              {/* 상단 컨트롤 바 (수정/삭제 버튼 위치 이동) */}
              <div className={styles.controlsHeader}>
                {!isEditing ? (
                    <>
                        <button onClick={handleDelete} className={styles.deleteBtn}>Delete</button>
                        <button onClick={() => setIsEditing(true)} className={styles.editModeBtn}>
                            Edit Mode
                        </button>
                    </>
                ) : (
                    <div className={styles.editControls}>
                        <span className={styles.editLabel}>Editing...</span>
                        <button onClick={handleCancelEdit} className={styles.cancelBtn}>Cancel</button>
                        <button onClick={handleUpdate} className={styles.saveBtn} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
              </div>

              {/* 기본 정보 폼 */}
              <div className={styles.formGrid}>
                <div className={styles.inputGroup}>
                  <label>HTTP Method</label>
                  {isEditing ? (
                      <select name="http_method" value={formData.http_method} onChange={handleInputChange} className={styles.select}>
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                      </select>
                  ) : (
                      <div className={styles.readOnlyText}>{formData.http_method}</div>
                  )}
                </div>
                <div className={styles.inputGroup} style={{ flexGrow: 1 }}>
                  <label>URL Endpoint</label>
                  {isEditing ? (
                      <input type="text" name="url" value={formData.url} onChange={handleInputChange} className={styles.input} />
                  ) : (
                      <div className={styles.readOnlyText}>{formData.url}</div>
                  )}
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Description</label>
                {isEditing ? (
                    <textarea name="description" value={formData.description} onChange={handleInputChange} className={styles.textarea} rows={2} />
                ) : (
                    <div className={styles.readOnlyText}>{formData.description || '(No description)'}</div>
                )}
              </div>

              {/* JSON Sections (Conditional Rendering) */}
              <div className={styles.jsonSection}>
                <h3>Request Body Format</h3>
                {isEditing ? (
                    <JsonEditor
                        content={{ json: formData.request_format }}
                        onChange={(c) => handleJsonChange('request_format', c)}
                    />
                ) : (
                    <JsonViewer data={formData.request_format} />
                )}
              </div>

              <div className={styles.jsonSection}>
                <h3>Response Format</h3>
                {isEditing ? (
                    <JsonEditor
                        content={{ json: formData.response_format }}
                        onChange={(c) => handleJsonChange('response_format', c)}
                    />
                ) : (
                    <JsonViewer data={formData.response_format} />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiDocItem;
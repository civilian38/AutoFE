import React, { useEffect, useState } from 'react';
import { authApi } from '../../../api/axios';
import ApiDocItem from './ApiDocItem';
import JsonEditor from '../../../components/JsonEditor/JsonEditor'; // 생성 폼용
import styles from './ApiDocList.module.css';

const ApiDocList = ({ projectId }) => {
  const [apiList, setApiList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Form State
  const [showCreate, setShowCreate] = useState(false);
  const [createData, setCreateData] = useState({
    url: '',
    http_method: 'GET',
    description: '',
    request_format: { },
    response_format: { }
  });

  const fetchApiDocs = async () => {
    try {
      const response = await authApi.get(`/apidocs/${projectId}/`);
      setApiList(response.data || []);
    } catch (error) {
      console.error("Failed to fetch API docs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchApiDocs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Create Handlers
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateJsonChange = (field, newContent) => {
     let value = {};
    if (newContent.json) value = newContent.json;
    else if (newContent.text) {
      try { value = JSON.parse(newContent.text); } catch (e) { return; }
    }
    setCreateData(prev => ({ ...prev, [field]: value }));
  };

  const submitCreate = async () => {
    if (!createData.url) {
      alert("URL을 입력해주세요.");
      return;
    }
    try {
      // POST 요청
      await authApi.post(`/apidocs/${projectId}/`, createData);

      // 초기화 및 목록 갱신
      setShowCreate(false);
      setCreateData({
        url: '',
        http_method: 'GET',
        description: '',
        request_format: {},
        response_format: {}
      });
      fetchApiDocs();
      alert("새로운 API 문서가 생성되었습니다.");
    } catch (error) {
      console.error("Create failed:", error);
      alert("생성에 실패했습니다.");
    }
  };

  const handleDeleteItem = (deletedId) => {
    setApiList(prev => prev.filter(item => item.id !== deletedId));
  };

  if (loading) return <div className={styles.loading}>Loading API documents...</div>;

  return (
    <div className={styles.listContainer}>
      <div className={styles.listHeader}>
        <h2>API Documents</h2>
        <button
          className={styles.createBtn}
          onClick={() => setShowCreate(!showCreate)}
        >
          {showCreate ? 'Cancel' : '+ New Endpoint'}
        </button>
      </div>

      {/* Create Form Area */}
      {showCreate && (
        <div className={styles.createFormContainer}>
          <h3>Create New API Endpoint</h3>
          <div className={styles.formRow}>
             <select
                name="http_method"
                value={createData.http_method}
                onChange={handleCreateChange}
                className={styles.select}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
              <input
                type="text"
                name="url"
                placeholder="URL (e.g. /api/users)"
                value={createData.url}
                onChange={handleCreateChange}
                className={styles.input}
                style={{ flexGrow: 1 }}
              />
          </div>
          <div className={styles.formRow}>
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={createData.description}
              onChange={handleCreateChange}
              className={styles.input}
              style={{ width: '100%' }}
            />
          </div>

          <div className={styles.jsonRow}>
            <div className={styles.jsonCol}>
              <label>Request Format</label>
              <JsonEditor
                content={{ json: createData.request_format }}
                onChange={(c) => handleCreateJsonChange('request_format', c)}
              />
            </div>
            <div className={styles.jsonCol}>
              <label>Response Format</label>
              <JsonEditor
                content={{ json: createData.response_format }}
                onChange={(c) => handleCreateJsonChange('response_format', c)}
              />
            </div>
          </div>

          <div className={styles.createActions}>
            <button onClick={submitCreate} className={styles.confirmBtn}>Create API</button>
          </div>
        </div>
      )}

      {/* API List */}
      {apiList.length === 0 ? (
        <div className={styles.emptyState}>등록된 API 문서가 없습니다.</div>
      ) : (
        <div className={styles.apiStack}>
          {apiList.map((api) => (
            <ApiDocItem
              key={api.id}
              apiSummary={api}
              onDelete={handleDeleteItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApiDocList;
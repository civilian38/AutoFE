// src/pages/Project/components/ReactFilesView.jsx
import React, { useEffect, useState, useCallback } from 'react';

// [1] API 관련 임포트 합치기
// 구조 조회는 authApi(새 방식), 액션(생성/수정/삭제)은 기존 fileService 활용
import { authApi } from '../../../api/axios';
import {
  createFolder,
  createFile,
  updateFolder,
  updateFile,
  deleteFolder,
  deleteFile,
  getFileDetail
} from '../../../api/fileService';

// [2] 컴포넌트 임포트 합치기
import FileTreeView from './FileTreeView';
import FileDetailView from './FileDetailView';
import ContextMenu from './overlays/ContextMenu'; // 복구됨
import InputModal from './overlays/InputModal';   // 복구됨
import MoveModal from './overlays/MoveModal';     // 복구됨
import styles from './ReactFilesView.module.css';

const ReactFilesView = ({ projectId }) => {
  // --- State 관리 (기존 + 신규) ---
  const [rootFolder, setRootFolder] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [loading, setLoading] = useState(true);

  // [복구] Overlays State
  const [contextMenu, setContextMenu] = useState(null);
  const [modal, setModal] = useState(null);

  // --- Data Fetching (신규 방식인 authApi + useCallback 유지) ---
  const fetchFolderStructure = useCallback(async () => {
    try {
      const response = await authApi.get(`/frontfiles/${projectId}/folders/`);
      setRootFolder(response.data);
    } catch (error) {
      console.error("Failed to fetch folder structure:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchFolderStructure();
    }
  }, [projectId, fetchFolderStructure]);

  // [신규 기능] 파일 업데이트 시 트리 구조 갱신 (Draft 적용 등)
  const handleFileUpdate = () => {
    fetchFolderStructure();
  };

  // --- [복구] Event Handlers (Context Menu & Modals) ---

  // 1. 우클릭 핸들러
  const handleContextMenu = (e, type, target) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      target
    });
  };

  // 2. 메뉴 액션 핸들러 (Delete or Open Modal)
  const handleMenuAction = async (action, target) => {
    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${target.name}?`)) {
        try {
          if (contextMenu.type === 'folder') await deleteFolder(target.id);
          else await deleteFile(target.id);

          // 삭제된 파일이 선택되어 있었다면 선택 해제
          if (selectedFileId === target.id) setSelectedFileId(null);
          
          await fetchFolderStructure(); // 구조 갱신
        } catch (error) {
          alert("Failed to delete item.");
        }
      }
    } else {
      // Rename, Create, Move 등의 모달 열기
      setModal({ type: action, target, itemType: contextMenu.type });
    }
  };

  // 3. 모달 확인(Confirm) 핸들러
  const handleModalConfirm = async (value) => {
    const { type, target, itemType } = modal;

    try {
      if (type === 'create_folder') {
        await createFolder(projectId, value, target.id);
      } else if (type === 'create_file') {
        await createFile(projectId, value, target.id);
      } else if (type === 'rename') {
        if (itemType === 'folder') {
          await updateFolder(target.id, { name: value, parent_folder: target.parent_folder });
        } else {
          // 파일 이름 변경 시 내용 유지를 위해 getFileDetail 호출
          const currentFile = await getFileDetail(target.id);
          await updateFile(target.id, {
            name: value,
            content: currentFile.content,
            folder: currentFile.folder
          });
        }
      } else if (type === 'move') {
        const destinationFolderId = value;
        if (itemType === 'folder') {
          await updateFolder(target.id, { name: target.name, parent_folder: destinationFolderId });
        } else {
          const currentFile = await getFileDetail(target.id);
          await updateFile(target.id, {
            name: currentFile.name,
            content: currentFile.content,
            folder: destinationFolderId
          });
        }
      }

      await fetchFolderStructure(); // 성공 후 트리 갱신
      setModal(null); // 모달 닫기
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.non_field_errors?.[0] || error.response?.data?.detail || "Operation failed.";
      alert(`Error: ${msg}`);
    }
  };

  if (loading) return <div className={styles.loading}>Loading file structure...</div>;

  return (
    <div className={styles.viewContainer}>
      {/* 왼쪽: 파일 트리 영역 */}
      <div className={styles.treePane}>
        <div className={styles.paneHeader}>
          Explorer
        </div>
        <div className={styles.treeContent}>
          {rootFolder ? (
            <FileTreeView
              rootFolder={rootFolder}
              onSelectFile={setSelectedFileId}
              selectedFileId={selectedFileId}
              // [핵심 수정] 여기에 핸들러를 다시 연결해서 에러 해결!
              onContextMenu={handleContextMenu} 
            />
          ) : (
            <div className={styles.emptyState}>No files found.</div>
          )}
        </div>
      </div>

      {/* 오른쪽: 파일 상세 영역 */}
      <div className={styles.detailPane}>
        {selectedFileId ? (
          <FileDetailView 
            fileId={selectedFileId} 
            onFileUpdate={handleFileUpdate} 
          />
        ) : (
          <div className={styles.placeholderState}>
            Select a file to view code.<br/>
            Right-click on explorer to manage files.
          </div>
        )}
      </div>

      {/* [복구] Overlays: ContextMenu & Modals */}
      {contextMenu && (
        <ContextMenu
          {...contextMenu}
          onClose={() => setContextMenu(null)}
          onAction={handleMenuAction}
        />
      )}

      {(modal?.type === 'create_file' || modal?.type === 'create_folder' || modal?.type === 'rename') && (
        <InputModal
          title={
            modal.type === 'rename' ? `Rename ${modal.target.name}` :
            modal.type === 'create_file' ? 'New File Name' : 'New Folder Name'
          }
          defaultValue={modal.type === 'rename' ? modal.target.name : ''}
          placeholder="Enter name..."
          onConfirm={handleModalConfirm}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'move' && (
        <MoveModal
          rootFolder={rootFolder}
          targetItem={modal.target}
          targetType={modal.itemType}
          onConfirm={handleModalConfirm}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default ReactFilesView;
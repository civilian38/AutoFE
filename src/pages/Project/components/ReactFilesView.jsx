import React, { useEffect, useState } from 'react';
import {
  getFolderStructure,
  createFolder,
  createFile,
  updateFolder,
  updateFile,
  deleteFolder,
  deleteFile,
  getFileDetail
} from '../../../api/fileService';
import FileTreeView from './FileTreeView';
import FileDetailView from './FileDetailView';
import ContextMenu from './overlays/ContextMenu';
import InputModal from './overlays/InputModal';
import MoveModal from './overlays/MoveModal';
import styles from './ReactFilesView.module.css';

const ReactFilesView = ({ projectId }) => {
  const [rootFolder, setRootFolder] = useState(null);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Overlays State
  const [contextMenu, setContextMenu] = useState(null); // { x, y, type, target }
  const [modal, setModal] = useState(null); // { type: 'rename'|'create_file'|'create_folder'|'move', target }

  const refreshStructure = async () => {
    try {
      const data = await getFolderStructure(projectId);
      setRootFolder(data);
    } catch (error) {
      console.error("Failed to refresh folder structure:", error);
    }
  };

  useEffect(() => {
    if (projectId) {
      refreshStructure().finally(() => setLoading(false));
    }
  }, [projectId]);

  // Context Menu Handler
  const handleContextMenu = (e, type, target) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      type,
      target
    });
  };

  // Context Menu Action Handler
  const handleMenuAction = async (action, target) => {
    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${target.name}?`)) {
        try {
          if (contextMenu.type === 'folder') await deleteFolder(target.id);
          else await deleteFile(target.id);

          if (selectedFileId === target.id) setSelectedFileId(null);
          await refreshStructure();
        } catch (error) {
          alert("Failed to delete item.");
        }
      }
    } else {
      // Open Modal for other actions
      setModal({ type: action, target, itemType: contextMenu.type });
    }
  };

  // Modal Confirm Handler
  const handleModalConfirm = async (value) => {
    // value: Input string (rename/create) or Folder ID (move)
    const { type, target, itemType } = modal;

    try {
      if (type === 'create_folder') {
        // target is parent folder
        await createFolder(projectId, value, target.id);
      } else if (type === 'create_file') {
        // target is parent folder
        await createFile(projectId, value, target.id);
      } else if (type === 'rename') {
        if (itemType === 'folder') {
          await updateFolder(target.id, { name: value, parent_folder: target.parent_folder });
        } else {
          // File rename: need to preserve content and folder
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
          // File move
          const currentFile = await getFileDetail(target.id);
          await updateFile(target.id, {
            name: currentFile.name,
            content: currentFile.content,
            folder: destinationFolderId
          });
        }
      }

      await refreshStructure();
      setModal(null);
    } catch (error) {
      console.error(error);
      const msg = error.response?.data?.non_field_errors?.[0] || error.response?.data?.detail || "Operation failed.";
      alert(`Error: ${msg}`);
    }
  };

  if (loading) return <div className={styles.loading}>Loading file structure...</div>;

  return (
    <div className={styles.viewContainer}>
      <div className={styles.treePane}>
        <div className={styles.paneHeader}>Explorer</div>
        <div className={styles.treeContent}>
          {rootFolder ? (
            <FileTreeView
              rootFolder={rootFolder}
              onSelectFile={setSelectedFileId}
              selectedFileId={selectedFileId}
              onContextMenu={handleContextMenu}
            />
          ) : (
            <div className={styles.emptyState}>No files found.</div>
          )}
        </div>
      </div>

      <div className={styles.detailPane}>
        {selectedFileId ? (
          <FileDetailView fileId={selectedFileId} />
        ) : (
          <div className={styles.placeholderState}>
            Select a file to view code.<br/>
            Right-click on explorer to manage files.
          </div>
        )}
      </div>

      {/* Overlays */}
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
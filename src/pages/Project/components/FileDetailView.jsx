// src/pages/Project/components/FileDetailView.jsx
import React, { useEffect, useState } from 'react';
import { getFileDetail, patchFileContent, applyFileDraft } from '../../../api/fileService';
import styles from './ReactFilesView.module.css';

const FileDetailView = ({ fileId, onFileUpdate }) => {
    const [fileData, setFileData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Copy State
    const [isCopied, setIsCopied] = useState(false);

    // [NEW] Draft View State
    // 'current' | 'draft'
    const [viewMode, setViewMode] = useState('current');
    const [isApplying, setIsApplying] = useState(false);

    useEffect(() => {
        const fetchFileDetail = async () => {
            if (!fileId) return;

            setLoading(true);
            setError(null);
            setFileData(null);
            setIsEditing(false);
            setIsCopied(false);
            setIsApplying(false);

            try {
                const data = await getFileDetail(fileId);
                setFileData(data);
                
                // [NEW] Draft가 존재하면 기본적으로 Draft 모드로 시작
                if (data.has_draft) {
                    setViewMode('draft');
                } else {
                    setViewMode('current');
                }
                
                setEditContent(data.content || '');
            } catch (err) {
                console.error("Failed to fetch file detail:", err);
                setError("파일 내용을 불러오는 데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchFileDetail();
    }, [fileId]);

    // 내용 저장 (Current Content만 수정 가능)
    const handleSave = async () => {
        if (!fileId) return;
        setIsSaving(true);
        try {
            const updatedData = await patchFileContent(fileId, editContent);
            setFileData(updatedData);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to save file content:", err);
            alert("저장에 실패했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditContent(fileData.content);
        setIsEditing(false);
    };

    // [NEW] Apply Draft Handler
    const handleApplyDraft = async () => {
        if (!fileId) return;
        if (!window.confirm("Draft 내용을 원본에 덮어쓰시겠습니까?")) return;

        setIsApplying(true);
        try {
            const updatedData = await applyFileDraft(fileId);
            setFileData(updatedData);
            
            // 적용 후 Draft가 사라졌으므로 Current 뷰로 전환
            setViewMode('current');
            setEditContent(updatedData.content); // 에디터 내용도 갱신
            
            // 상위 컴포넌트에 알림 (트리 뷰의 파란색 표시 제거 등을 위해 필요하다면 callback 사용)
            if (onFileUpdate) onFileUpdate(updatedData);
            
            alert("Draft applied successfully!");
        } catch (err) {
            console.error("Failed to apply draft:", err);
            alert("Draft 적용에 실패했습니다.");
        } finally {
            setIsApplying(false);
        }
    };

    const handleCopy = async () => {
        // 현재 보고 있는 모드에 따라 복사할 내용 결정
        const contentToCopy = viewMode === 'draft' 
            ? fileData?.draft_content 
            : (isEditing ? editContent : fileData?.content);

        if (!contentToCopy) return;

        try {
            await navigator.clipboard.writeText(contentToCopy);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('클립보드 복사에 실패했습니다.');
        }
    };

    if (loading) return <div className={styles.detailLoading}>Loading file content...</div>;
    if (error) return <div className={styles.detailError}>{error}</div>;
    if (!fileData) return <div className={styles.detailEmpty}>파일을 선택해주세요.</div>;

    // 현재 표시할 컨텐츠 결정
    const displayContent = viewMode === 'draft' ? fileData.draft_content : fileData.content;
    const isDraftAvailable = fileData.has_draft;

    return (
        <div className={styles.detailContainer}>
            {/* [NEW] Draft Mode Tabs (Draft가 있을 때만 표시) */}
            {isDraftAvailable && (
                <div className={styles.draftTabs}>
                    <div 
                        className={`${styles.draftTabItem} ${viewMode === 'draft' ? styles.active : ''}`}
                        onClick={() => setViewMode('draft')}
                    >
                        Draft Preview <span className={styles.draftBadge}>New</span>
                    </div>
                    <div 
                        className={`${styles.draftTabItem} ${viewMode === 'current' ? styles.active : ''}`}
                        onClick={() => setViewMode('current')}
                    >
                        Current Content
                    </div>
                </div>
            )}

            <div className={styles.detailHeader}>
                <div className={styles.headerLeft}>
                    <h3 className={styles.detailTitle}>{fileData.name}</h3>
                    <span className={styles.filePath}>{fileData.file_path}</span>
                </div>

                <div className={styles.headerRight}>
                    <button
                        className={`${styles.actionBtn} ${styles.copyBtn}`}
                        onClick={handleCopy}
                        title="Copy to clipboard"
                    >
                        {isCopied ? 'Copied! ✅' : 'Copy'}
                    </button>

                    {/* Draft Mode일 때는 Apply 버튼 노출, Edit 숨김 */}
                    {viewMode === 'draft' ? (
                        <button
                            className={`${styles.actionBtn} ${styles.applyDraftBtn}`}
                            onClick={handleApplyDraft}
                            disabled={isApplying}
                        >
                            {isApplying ? 'Applying...' : 'Apply Draft to Content'}
                        </button>
                    ) : (
                        // Current Mode일 때 Edit 기능 노출
                        <>
                            {isEditing ? (
                                <>
                                    <button
                                        className={`${styles.actionBtn} ${styles.cancelBtn}`}
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className={`${styles.actionBtn} ${styles.saveBtn}`}
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </>
                            ) : (
                                <button
                                    className={`${styles.actionBtn} ${styles.editBtn}`}
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Content
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            <div className={styles.codeContainer}>
                {/* Draft Mode이거나, Edit 모드가 아닐 때는 단순 조회 */}
                {(viewMode === 'draft' || !isEditing) ? (
                    <pre className={styles.codeBlock}>
                        <code>{displayContent}</code>
                    </pre>
                ) : (
                    // Current Mode이고 Edit 중일 때만 Textarea
                    <textarea
                        className={styles.codeEditor}
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        spellCheck="false"
                    />
                )}
            </div>

            <div className={styles.metaInfo}>
                <span>
                    Last updated: {new Date(fileData.updated_at).toLocaleString()}
                    {viewMode === 'draft' && " (Viewing Draft)"}
                </span>
                {isEditing && <span className={styles.editingIndicator}> (Editing...)</span>}
            </div>
        </div>
    );
};

export default FileDetailView;
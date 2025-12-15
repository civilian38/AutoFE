import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/axios';
import ApiDocList from './components/ApiDocList';
import RequirementsView from './components/RequirementsView';
import ReactFilesView from './components/ReactFilesView';
import DiscussionView from './components/DiscussionView'; // [Import New Component]
import styles from './Detail.module.css';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // 탭 및 데이터 상태
  const [activeTab, setActiveTab] = useState('api_docs');
  const [projectInfo, setProjectInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 설명글 토글 상태
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      try {
        setLoading(true);
        const response = await authApi.get(`/project/${projectId}/`);
        setProjectInfo(response.data);
      } catch (err) {
        console.error("Failed to fetch project detail:", err);
        setError("프로젝트 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProjectDetail();
    }
  }, [projectId]);

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  const toggleDescription = () => {
    setShowDescription((prev) => !prev);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}>Loading Project...</div>
      </div>
    );
  }

  if (error || !projectInfo) {
    return (
      <div className={styles.errorContainer}>
        <p>{error || "Project not found."}</p>
        <button className={styles.backBtn} onClick={() => navigate('/')}>Go to Home</button>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header Area */}
      <header className={styles.header}>
        <div className={styles.breadcrumb}>
          <span className={styles.backLink} onClick={() => navigate('/')}>Projects</span>
          <span className={styles.separator}>/</span>
          <span className={styles.currentTitle}>{projectInfo.name}</span>
          <span className={styles.visibilityBadge}>Private</span>
        </div>

        <div className={styles.headerMain}>
          <h1 className={styles.projectTitle}>{projectInfo.name}</h1>

          <div className={styles.projectMeta}>
            {projectInfo.created_by && (
              <span className={styles.metaItem}>
                Created by <strong>{projectInfo.created_by.nickname || projectInfo.created_by.username}</strong>
              </span>
            )}
            <span className={styles.metaSeparator}>•</span>
            <span className={styles.metaItem}>
              Base URL: <a href={projectInfo.base_url} target="_blank" rel="noopener noreferrer" className={styles.link}>{projectInfo.base_url}</a>
            </span>
            <span className={styles.metaSeparator}>•</span>
            <span className={styles.metaItem}>
              {new Date(projectInfo.created_at).toLocaleDateString()}
            </span>

            {/* Description Toggle Button */}
            {projectInfo.description && (
              <>
                <span className={styles.metaSeparator}>•</span>
                <button
                  className={styles.toggleDescBtn}
                  onClick={toggleDescription}
                >
                  {showDescription ? 'Hide description' : 'Show description'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Conditional Rendering for Description */}
        {showDescription && projectInfo.description && (
          <div className={styles.descriptionContainer}>
            <p className={styles.description}>{projectInfo.description}</p>
          </div>
        )}
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabsNav}>
        <button
          className={`${styles.tabItem} ${activeTab === 'api_docs' ? styles.active : ''}`}
          onClick={() => handleTabClick('api_docs')}
        >
          API Document
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === 'requirements' ? styles.active : ''}`}
          onClick={() => handleTabClick('requirements')}
        >
          Requirements
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === 'react_files' ? styles.active : ''}`}
          onClick={() => handleTabClick('react_files')}
        >
          React Files
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === 'discussion' ? styles.active : ''}`}
          onClick={() => handleTabClick('discussion')}
        >
          Discussion
        </button>
      </nav>

      {/* Content Area */}
      <main className={styles.contentArea}>
        {activeTab === 'api_docs' && <ApiDocList projectId={projectId} />}
        {activeTab === 'requirements' && <RequirementsView projectId={projectId} />}
        {activeTab === 'react_files' && <ReactFilesView projectId={projectId} />}
        {/* [Replaced Placeholder with Component] */}
        {activeTab === 'discussion' && <DiscussionView projectId={projectId} />}
      </main>
    </div>
  );
};

export default ProjectDetail;
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/axios';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await authApi.get('/project/');
        setProjects(response.data.results || []);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleNewProject = () => {
    navigate('/project/create');
  };

  // [수정됨] 프로젝트 상세 페이지로 이동하는 핸들러 추가
  const handleProjectClick = (e, projectId) => {
    e.preventDefault(); // a 태그의 기본 페이지 리로드 방지
    navigate(`/project/${projectId}`);
  };

  const handleStarClick = () => {
    alert("Star(즐겨찾기) 기능은 백엔드 API 작업이 필요합니다.");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `Updated on ${date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`;
  };

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className={styles.pageContainer}><p>Loading...</p></div>;
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTitle}>AutoReact Generator</div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Sign out
        </button>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>

        {/* Top Controls */}
        <div className={styles.topControls}>
          <div className={styles.searchGroup}>
            <input
              type="text"
              placeholder="프로젝트 검색"
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.newProjectBtn} onClick={handleNewProject}>
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor" style={{marginRight: '4px'}}>
              <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
            </svg>
            New
          </button>
        </div>

        {/* Project List */}
        <ul className={styles.projectList}>
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <li key={project.id} className={styles.projectItem}>
                <div className={styles.itemLeft}>
                  <div className={styles.titleRow}>
                    {/* [수정됨] onClick 핸들러 교체 */}
                    <a
                      href={`/project/${project.id}`}
                      className={styles.projectName}
                      onClick={(e) => handleProjectClick(e, project.id)}
                    >
                      {project.name}
                    </a>
                    <span className={styles.visibilityBadge}>Private</span>
                  </div>
                  <p className={styles.description}>
                    {project.description || "설명이 없습니다."}
                  </p>
                  <div className={styles.metaRow}>
                    <span>{formatDate(project.created_at)}</span>
                  </div>
                </div>

                <div className={styles.itemRight}>
                  <button className={styles.starBtn} onClick={handleStarClick}>
                    <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="#8b949e">
                      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
                    </svg>
                    Star
                  </button>
                </div>
              </li>
            ))
          ) : (
            <div className={styles.emptyState}>
              진행 중인 프로젝트가 없습니다.
            </div>
          )}
        </ul>
      </main>
    </div>
  );
};

export default Home;
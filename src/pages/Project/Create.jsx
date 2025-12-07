import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/axios';
import styles from './Create.module.css';

const Create = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    base_url: '', // [New] API 변경으로 추가된 필드
    description: ''
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // 유효성 검사
    if (!formData.name.trim()) {
      setError("프로젝트 이름을 입력해주세요.");
      setIsSubmitting(false);
      return;
    }

    // base_url이 필수라고 가정하고 검사 (필수가 아니라면 이 부분 제거 가능)
    if (!formData.base_url.trim()) {
        setError("Base URL을 입력해주세요.");
        setIsSubmitting(false);
        return;
    }

    try {
      // API 문서에 명시된 Endpoint로 POST 요청
      // Payload: { name, base_url, description }
      const response = await authApi.post('/project/', formData);

      // 생성된 프로젝트의 ID를 받아 상세 페이지로 이동
      const newProjectId = response.data.id;
      navigate(`/project/${newProjectId}`);

    } catch (err) {
      console.error("Project creation failed:", err);
      // DRF 에러 응답 처리
      if (err.response && err.response.data) {
        // 에러 메시지가 객체나 배열로 올 경우를 대비한 단순화 처리
        const serverError = err.response.data;
        if (typeof serverError === 'object') {
             // 첫 번째 에러 메시지만 추출하여 표시
            const firstKey = Object.keys(serverError)[0];
            const msg = Array.isArray(serverError[firstKey]) ? serverError[firstKey][0] : serverError[firstKey];
            setError(`${firstKey}: ${msg}`);
        } else {
            setError("프로젝트 생성 중 오류가 발생했습니다. 입력을 확인해주세요.");
        }
      } else {
        setError("서버와 통신할 수 없습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Create a new project</h1>
        <p className={styles.subtitle}>
          백엔드 API 문서를 기반으로 React 코드를 자동 생성할 프로젝트를 만듭니다.
        </p>

        <hr className={styles.divider} />

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Project Name Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>
              Project name <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.input}
              value={formData.name}
              onChange={handleChange}
              placeholder="my-awesome-project"
              autoComplete="off"
            />
            <p className={styles.helpText}>
              프로젝트를 식별할 수 있는 고유한 이름을 입력하세요.
            </p>
          </div>

          {/* [New] Base URL Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="base_url" className={styles.label}>
              Base URL <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              id="base_url"
              name="base_url"
              className={styles.input}
              value={formData.base_url}
              onChange={handleChange}
              placeholder="http://example.com"
              autoComplete="off"
            />
            <p className={styles.helpText}>
              API 요청을 보낼 백엔드 서버의 기본 주소입니다.
            </p>
          </div>

          {/* Description Input */}
          <div className={styles.inputGroup}>
            <label htmlFor="description" className={styles.label}>
              Description <span className={styles.optional}>(optional)</span>
            </label>
            <input
              type="text"
              id="description"
              name="description"
              className={styles.input}
              value={formData.description}
              onChange={handleChange}
              placeholder="간단한 프로젝트 설명을 입력하세요."
            />
          </div>

          <hr className={styles.divider} />

          {error && <div className={styles.errorMessage}>{error}</div>}

          <div className={styles.buttonGroup}>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create project'}
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Create;
'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './post-new.module.css';

const CATEGORIES = ['정치', '사회', '게임', '스포츠', '연예', '자유'];

export default function PostForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('자유');
  const [isPoll, setIsPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function addOption() {
    if (options.length < 5) setOptions([...options, '']);
  }

  function removeOption(i: number) {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  }

  function updateOption(i: number, val: string) {
    setOptions(options.map((o, idx) => idx === i ? val : o));
  }

  function canSubmit() {
    if (!title.trim() || !content.trim()) return false;
    if (isPoll) {
      if (options.filter(o => o.trim()).length < 2) return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (!canSubmit()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category,
          is_poll: isPoll,
          poll_question: isPoll ? pollQuestion.trim() : null,
          poll_options: isPoll ? options.filter(o => o.trim()) : [],
        }),
      });
      if (!res.ok) throw new Error('글 작성 실패');
      const { postId } = await res.json();
      router.push(`/post/${postId}`);
    } catch {
      setError('글 작성 중 오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>
          <BackIcon />
        </button>
        <h1 className={styles.headerTitle}>새 글 작성</h1>
        <button
          className={`${styles.submitBtn} ${!canSubmit() ? styles.submitBtnDisabled : ''}`}
          onClick={handleSubmit}
          disabled={!canSubmit() || loading}
        >
          {loading ? '올리는 중...' : '올리기'}
        </button>
      </header>

      <div className={styles.form}>
        {/* 카테고리 */}
        <div className={styles.section}>
          <div className={styles.chips}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`${styles.chip} ${category === cat ? styles.chipActive : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div className={styles.section}>
          <input
            className={styles.titleInput}
            placeholder="제목을 입력해주세요"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        {/* 내용 */}
        <div className={styles.section}>
          <textarea
            ref={textareaRef}
            className={styles.contentInput}
            placeholder="어떤 생각을 나누고 싶나요?"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={6}
          />
        </div>

        {/* 투표 토글 */}
        <div className={styles.pollToggleSection}>
          <div className={styles.pollToggleInfo}>
            <span className={styles.pollToggleIcon}><PollIcon /></span>
            <div>
              <p className={styles.pollToggleTitle}>투표 추가</p>
              <p className={styles.pollToggleDesc}>사람들의 생각을 물어보세요</p>
            </div>
          </div>
          <button
            className={`${styles.toggle} ${isPoll ? styles.toggleOn : ''}`}
            onClick={() => setIsPoll(!isPoll)}
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>

        {/* 투표 옵션 */}
        {isPoll && (
          <div className={styles.pollSection}>
            <input
              className={styles.pollQuestionInput}
              placeholder="투표 질문 (선택, 비우면 제목 사용)"
              value={pollQuestion}
              onChange={e => setPollQuestion(e.target.value)}
              maxLength={100}
            />
            <div className={styles.optionsList}>
              {options.map((opt, i) => (
                <div key={i} className={styles.optionRow}>
                  <span className={styles.optionNum}>{i + 1}</span>
                  <input
                    className={styles.optionInput}
                    placeholder={`선택지 ${i + 1}`}
                    value={opt}
                    onChange={e => updateOption(i, e.target.value)}
                    maxLength={60}
                  />
                  {options.length > 2 && (
                    <button className={styles.removeOption} onClick={() => removeOption(i)}>
                      <CloseIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 5 && (
              <button className={styles.addOptionBtn} onClick={addOption}>
                <PlusIcon /> 선택지 추가
              </button>
            )}
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}

function BackIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6"/></svg>;
}
function PollIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="13" width="4" height="9" rx="1"/><rect x="9" y="8" width="4" height="14" rx="1"/><rect x="16" y="3" width="4" height="19" rx="1"/></svg>;
}
function PlusIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}
function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

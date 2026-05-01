'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './onboarding.module.css';
import type { Gender, AgeGroup, PoliticalLeaning } from '@/lib/database.types';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other', label: '기타' },
];

const REGIONS = [
  '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
  '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
];

const POLITICAL_MAIN: { value: PoliticalLeaning; label: string }[] = [
  { value: 'progressive', label: '진보' },
  { value: 'moderate', label: '중도' },
  { value: 'conservative', label: '보수' },
];

const CURRENT_YEAR = new Date().getFullYear();

function birthYearToAgeGroup(year: number): AgeGroup {
  const age = CURRENT_YEAR - year;
  if (age < 20) return '10s';
  if (age < 30) return '20s';
  if (age < 40) return '30s';
  if (age < 50) return '40s';
  if (age < 60) return '50s';
  return '60s+';
}

function isValidBirthYear(year: string) {
  const n = Number(year);
  return year.length === 4 && !isNaN(n) && n >= 1924 && n <= CURRENT_YEAR - 10;
}

type FormState = {
  nickname: string;
  gender: Gender | null;
  birthYear: string;
  region: string | null;
  political_leaning: PoliticalLeaning | null;
};

const STEPS = [
  { title: '닉네임을 만들어주세요', subtitle: '서비스에서 표시될 이름이에요', field: 'nickname' as const },
  { title: '성별을 알려주세요', subtitle: '더 정확한 통계를 위해 필요해요', field: 'gender' as const },
  { title: '몇 년생이세요?', subtitle: '같은 연령대는 어떻게 생각할지 볼 수 있어요', field: 'birthYear' as const },
  { title: '사는 곳을 알려주세요', subtitle: '지역별 생각 차이를 확인할 수 있어요', field: 'region' as const },
  { title: '정치 성향을 알려주세요', subtitle: '성향별 의견 분포를 볼 수 있어요', field: 'political_leaning' as const },
];

function isValidNickname(nickname: string) {
  const trimmed = nickname.trim();
  return trimmed.length >= 2 && trimmed.length <= 12;
}

type OnboardingFormProps = {
  previewMode?: boolean;
};

export default function OnboardingForm({ previewMode = false }: OnboardingFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({
    nickname: '',
    gender: null,
    birthYear: '',
    region: null,
    political_leaning: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function canNext() {
    if (currentStep.field === 'nickname') return isValidNickname(form.nickname);
    if (currentStep.field === 'gender') return form.gender !== null;
    if (currentStep.field === 'birthYear') return isValidBirthYear(form.birthYear);
    if (currentStep.field === 'region') return form.region !== null;
    if (currentStep.field === 'political_leaning') return form.political_leaning !== null;
    return false;
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  function handleExit() {
    router.push('/feed');
  }

  async function handleNext() {
    if (!canNext()) return;
    if (!isLast) { setStep(step + 1); return; }

    if (previewMode) {
      setError('프리뷰 모드예요. 실제 저장은 /onboarding에서 로그인 후 진행돼요.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: form.nickname.trim(),
          gender: form.gender,
          age_group: birthYearToAgeGroup(Number(form.birthYear)),
          region: form.region,
          political_leaning: form.political_leaning,
        }),
      });
      if (!res.ok) throw new Error('저장 실패');
      router.push('/feed');
    } catch {
      setError('저장 중 오류가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      {/* 상단: 진행바만 노출 */}
      <div className={styles.topBar}>
        <div className={styles.progress}>
          {STEPS.map((_, i) => (
            <div key={i} className={`${styles.dot} ${i <= step ? styles.dotActive : ''}`} />
          ))}
        </div>
        <button type="button" className={styles.exitBtn} onClick={handleExit}>
          나가기
        </button>
      </div>

      <div className={styles.header}>
        <h1 className={styles.title}>{currentStep.title}</h1>
        <p className={styles.subtitle}>{currentStep.subtitle}</p>
      </div>

      <div className={styles.options}>
        {/* 닉네임 */}
        {currentStep.field === 'nickname' && (
          <div className={styles.nicknameWrapper}>
            <div className={styles.nicknameInputRow}>
              <input
                className={styles.nicknameInput}
                type="text"
                placeholder="닉네임 입력 (2~12자)"
                value={form.nickname}
                onChange={e => setForm({ ...form, nickname: e.target.value.slice(0, 12) })}
                maxLength={12}
                autoFocus
              />
            </div>
            <p className={styles.nicknameGuide}>2~12자, 한글/영문/숫자를 사용할 수 있어요</p>
            {form.nickname.length > 0 && !isValidNickname(form.nickname) && (
              <p className={styles.nicknameError}>닉네임은 2~12자로 입력해주세요</p>
            )}
          </div>
        )}

        {/* 성별 */}
        {currentStep.field === 'gender' &&
          GENDERS.map(({ value, label }) => (
            <button
              type="button"
              key={value}
              className={`${styles.optionBtn} ${form.gender === value ? styles.selected : ''}`}
              onClick={() => setForm({ ...form, gender: value })}
            >
              <span>{label}</span>
              <span
                className={`${styles.radioMark} ${form.gender === value ? styles.radioMarkSelected : ''}`}
                aria-hidden="true"
              />
            </button>
          ))}

        {/* 출생연도 */}
        {currentStep.field === 'birthYear' && (
          <div className={styles.birthYearWrapper}>
            <div className={styles.birthYearInputRow}>
              <input
                className={styles.birthYearInput}
                type="text"
                inputMode="numeric"
                placeholder="예) 1990"
                value={form.birthYear}
                onChange={e => {
                  const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setForm({ ...form, birthYear: onlyDigits });
                }}
                maxLength={4}
                autoFocus
              />
              <span className={styles.birthYearUnit}>년생</span>
            </div>
            {form.birthYear.length === 4 && !isValidBirthYear(form.birthYear) && (
              <p className={styles.birthYearError}>1924년~{CURRENT_YEAR - 10}년 사이로 입력해주세요</p>
            )}
          </div>
        )}

        {/* 지역 */}
        {currentStep.field === 'region' && (
          <div className={styles.regionGrid}>
            {REGIONS.map((r) => (
              <button
                type="button"
                key={r}
                className={`${styles.regionBtn} ${form.region === r ? styles.selected : ''}`}
                onClick={() => setForm({ ...form, region: r })}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* 정치 성향 */}
        {currentStep.field === 'political_leaning' && (
          <div className={styles.politicalWrapper}>
            {POLITICAL_MAIN.map(({ value, label }) => (
              <button
                type="button"
                key={value}
                className={`${styles.politicalMainBtn} ${form.political_leaning === value ? styles.selected : ''}`}
                onClick={() => setForm({ ...form, political_leaning: value })}
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              className={`${styles.politicalNoneBtn} ${form.political_leaning === 'none' ? styles.politicalNoneBtnSelected : ''}`}
              onClick={() => setForm({ ...form, political_leaning: 'none' })}
            >
              관심없음
            </button>
          </div>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.footer}>
        {step > 0 ? (
          <button
            type="button"
            className={styles.prevBtn}
            onClick={handleBack}
            disabled={loading}
          >
            이전
          </button>
        ) : (
          <div className={styles.prevBtnPlaceholder} />
        )}
        <button
          type="button"
          className={`${styles.nextBtn} ${!canNext() ? styles.nextBtnDisabled : ''}`}
          onClick={handleNext}
          disabled={!canNext() || loading}
        >
          {loading ? '저장 중...' : isLast ? '시작하기' : '다음'}
        </button>
      </div>
    </div>
  );
}

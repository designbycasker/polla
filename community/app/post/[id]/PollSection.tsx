'use client';

import { useState } from 'react';
import styles from './post-detail.module.css';

type Option = { id: string; text: string; display_order: number };
type Vote = { option_id: string; gender: string | null; age_group: string | null; region: string | null; political_leaning: string | null };

type FilterType = 'total' | 'gender' | 'age' | 'region' | 'political';

const FILTER_LABELS: { key: FilterType; label: string }[] = [
  { key: 'total', label: '전체' },
  { key: 'gender', label: '성별' },
  { key: 'age', label: '연령' },
  { key: 'region', label: '지역' },
  { key: 'political', label: '정치성향' },
];

const GENDER_LABELS: Record<string, string> = { male: '남성', female: '여성', other: '기타' };
const AGE_LABELS: Record<string, string> = { '10s': '10대', '20s': '20대', '30s': '30대', '40s': '40대', '50s': '50대', '60s+': '60대+' };
const POLITICAL_LABELS: Record<string, string> = { progressive: '진보', moderate: '중도', conservative: '보수', none: '없음' };

function computeBreakdown(votes: Vote[], options: Option[], groupKey: keyof Vote) {
  const groups = new Map<string, Map<string, number>>();
  for (const v of votes) {
    const group = (v[groupKey] as string) ?? '미응답';
    if (!groups.has(group)) groups.set(group, new Map());
    const optMap = groups.get(group)!;
    optMap.set(v.option_id, (optMap.get(v.option_id) ?? 0) + 1);
  }
  return groups;
}

export default function PollSection({
  pollId,
  options,
  votes,
  myVote,
}: {
  pollId: string;
  options: Option[];
  votes: Vote[];
  myVote: string | null;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(myVote);
  const [localVotes, setLocalVotes] = useState<Vote[]>(votes);
  const [activeFilter, setActiveFilter] = useState<FilterType>('total');
  const [voting, setVoting] = useState(false);

  const hasVoted = selectedOption !== null;
  const totalVotes = localVotes.length;

  async function handleVote(optionId: string) {
    if (hasVoted || voting) return;
    setVoting(true);
    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ option_id: optionId }),
      });
      if (res.ok) {
        const { vote } = await res.json();
        setSelectedOption(optionId);
        setLocalVotes(prev => [...prev, vote]);
      }
    } finally {
      setVoting(false);
    }
  }

  function getOptionVotes(optionId: string) {
    return localVotes.filter(v => v.option_id === optionId).length;
  }

  function getPct(count: number, total: number) {
    if (total === 0) return 0;
    return Math.round((count / total) * 100);
  }

  function renderBreakdown() {
    if (!hasVoted) return null;
    const groupKey = activeFilter === 'gender' ? 'gender'
      : activeFilter === 'age' ? 'age_group'
      : activeFilter === 'region' ? 'region'
      : 'political_leaning';

    const labelMap = activeFilter === 'gender' ? GENDER_LABELS
      : activeFilter === 'age' ? AGE_LABELS
      : activeFilter === 'political' ? POLITICAL_LABELS
      : null;

    const groups = computeBreakdown(localVotes, options, groupKey as keyof Vote);
    const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
      const order = Object.keys(labelMap ?? {});
      return order.indexOf(a[0]) - order.indexOf(b[0]);
    });

    if (activeFilter === 'total') {
      return (
        <div className={styles.resultBars}>
          {options.map(opt => {
            const count = getOptionVotes(opt.id);
            const pct = getPct(count, totalVotes);
            return (
              <div key={opt.id} className={styles.resultRow}>
                <div className={styles.resultLabel}>
                  <span className={`${styles.resultText} ${selectedOption === opt.id ? styles.resultTextSelected : ''}`}>{opt.text}</span>
                  <span className={styles.resultPct}>{pct}%</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${selectedOption === opt.id ? styles.barFillSelected : ''}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className={styles.resultCount}>{count.toLocaleString()}명</span>
              </div>
            );
          })}
          <p className={styles.totalCount}>총 {totalVotes.toLocaleString()}명 참여</p>
        </div>
      );
    }

    return (
      <div className={styles.breakdownContainer}>
        {sortedGroups.length === 0 ? (
          <p className={styles.noData}>아직 데이터가 없어요</p>
        ) : (
          sortedGroups.map(([group, optMap]) => {
            const groupTotal = Array.from(optMap.values()).reduce((a, b) => a + b, 0);
            const label = labelMap ? (labelMap[group] ?? group) : group;
            return (
              <div key={group} className={styles.breakdownGroup}>
                <p className={styles.breakdownGroupLabel}>{label} <span className={styles.breakdownGroupCount}>({groupTotal}명)</span></p>
                {options.map(opt => {
                  const count = optMap.get(opt.id) ?? 0;
                  const pct = getPct(count, groupTotal);
                  return (
                    <div key={opt.id} className={styles.breakdownRow}>
                      <span className={styles.breakdownOptionText}>{opt.text}</span>
                      <div className={styles.barTrackSm}>
                        <div
                          className={`${styles.barFillSm} ${selectedOption === opt.id ? styles.barFillSelected : ''}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className={styles.breakdownPct}>{pct}%</span>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </div>
    );
  }

  return (
    <div className={styles.pollSection}>
      {!hasVoted ? (
        <>
          <p className={styles.pollPrompt}>투표해서 결과를 확인해보세요</p>
          <div className={styles.voteOptions}>
            {options.map(opt => (
              <button
                key={opt.id}
                className={styles.voteOption}
                onClick={() => handleVote(opt.id)}
                disabled={voting}
              >
                {opt.text}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className={styles.filterTabs}>
            {FILTER_LABELS.map(({ key, label }) => (
              <button
                key={key}
                className={`${styles.filterTab} ${activeFilter === key ? styles.filterTabActive : ''}`}
                onClick={() => setActiveFilter(key)}
              >
                {label}
              </button>
            ))}
          </div>
          {renderBreakdown()}
        </>
      )}
    </div>
  );
}

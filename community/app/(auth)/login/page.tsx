import { signIn } from '@/lib/auth';
import styles from './login.module.css';

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <div className={styles.logoMark} />
          <h1 className={styles.logoText}>Polla</h1>
        </div>

        <div className={styles.hero}>
          <h2 className={styles.heroTitle}>다양한 생각을 함께 탐색해요</h2>
          <p className={styles.heroDesc}>나와 비슷한 사람들은 어떻게 생각할까?<br />투표로 확인하고 이야기 나눠요</p>
        </div>

        <div className={styles.actions}>
          <form action={async () => {
            'use server';
            await signIn('kakao', { redirectTo: '/' });
          }}>
            <button type="submit" className={styles.kakaoBtn}>
              <KakaoIcon />
              카카오로 시작하기
            </button>
          </form>
        </div>

        <p className={styles.terms}>
          시작하면 <a href="/terms">이용약관</a> 및 <a href="/privacy">개인정보처리방침</a>에 동의하는 것으로 간주합니다.
        </p>
      </div>
    </main>
  );
}

function KakaoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.636 1.638 4.95 4.125 6.328l-.938 3.375a.375.375 0 0 0 .563.407L9.937 18.3A10.5 10.5 0 0 0 12 18.5C17.523 18.5 22 15.023 22 10.5S17.523 3 12 3z" />
    </svg>
  );
}

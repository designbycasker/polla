# Polla — 작업 히스토리 & 현황

> 세션 시작 시 이 파일 먼저 읽기. 현황 파악 후 작업 재개.

---

## 서비스 개요

**Polla** — 인구통계 기반 여론/투표 커뮤니티
- 누구나 투표 글 올리기 (정치, 게임, 일상 등 모든 주제)
- 투표 결과를 성별/연령/지역/정치성향 필터로 조회 ("나랑 비슷한 사람들은?")
- 운영자가 이슈 주제 큐레이션 (선거, 시사 등)
- 댓글 커뮤니티 (DCInside, 웃긴대학 스타일)
- 이름 유래: Poll + 필라테스(유연함) = Polla (유연한 생각의 공유)

---

## 기술 스택

| 구분 | 선택 |
|------|------|
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | CSS Modules + TDS 토큰 CSS 변수 |
| Auth | NextAuth v5 (beta) + Kakao OAuth |
| DB | Supabase (PostgreSQL) |
| 배포 | Cloudflare Pages (`@cloudflare/next-on-pages`) |
| 디자인 시스템 | TDS (design-system/ 폴더) |

---

## 폴더 구조

```
260430_01_TDS_Test/
├── design-system/          ← TDS 디자인 시스템 (소스)
│   ├── tokens/color.json   ← 원본 컬러 토큰
│   ├── variables.css       ← 빌드된 CSS 변수
│   └── scripts/build-tokens.js
├── community/              ← Polla 서비스 (Next.js 앱)
│   ├── app/
│   │   ├── layout.tsx      ← data-theme="light", #app-shell (max-width 768px)
│   │   ├── page.tsx        ← 루트 → /feed 리디렉트
│   │   ├── (auth)/login/   ← 카카오 로그인 페이지
│   │   ├── feed/           ← 피드 (Supabase 실데이터)
│   │   ├── onboarding/     ← 4단계 온보딩 (성별→출생연도→지역→정치성향)
│   │   ├── post/new/       ← 글쓰기 (투표 첨부 가능)
│   │   ├── post/[id]/      ← 게시글 상세 + 투표 결과 + 댓글
│   │   ├── preview/        ← 미들웨어 우회 (개발용 스크린샷 확인)
│   │   └── api/
│   │       ├── auth/[...nextauth]/  ← NextAuth 엔드포인트
│   │       ├── onboarding/          ← POST: 온보딩 데이터 저장
│   │       ├── posts/               ← POST: 글 생성
│   │       ├── posts/[postId]/comments/  ← POST: 댓글
│   │       └── polls/[pollId]/vote/      ← POST: 투표
│   ├── lib/
│   │   ├── auth.ts         ← NextAuth + Kakao 설정
│   │   ├── supabase.ts     ← Supabase admin 클라이언트
│   │   └── database.types.ts ← Gender, AgeGroup, PoliticalLeaning 등 타입
│   ├── middleware.ts       ← 인증 라우팅 (공개: /login, /api/auth, /preview)
│   ├── supabase/schema.sql ← DB 스키마 (아직 실제 Supabase에 적용 필요)
│   ├── wrangler.toml       ← Cloudflare Pages 설정
│   └── .npmrc              ← legacy-peer-deps=true
├── PROGRESS.md             ← 이 파일
├── CLAUDE.md               ← Claude 작업 규칙 (TDS 토큰 규칙 등)
└── brief.md                ← 서비스 기획 원문
```

---

## 중요 기술 규칙

- **모든 서버 컴포넌트/API route**: `export const runtime = 'edge'` 필수 (Cloudflare Pages 배포)
- **TDS 토큰**: 색상 하드코딩 금지, `var(--color-semantic-*)` 사용
- **`data-theme="light"`**: `app/layout.tsx` `<html>` 태그에 있어야 TDS 토큰 활성화
- **PC 레이아웃**: `#app-shell` max-width 768px 중앙 배치

---

## DB 스키마

### users
```
id, email, name, avatar_url, bio, provider, created_at,
gender (male/female/other),
age_group (10s/20s/30s/40s/50s/60s+),
region (서울/경기/...),
political_leaning (progressive/moderate/conservative/none),
onboarding_completed (boolean)
```

### posts
```
id, user_id, title, content, category, is_poll,
like_count, comment_count, view_count, created_at
```
- category: 정치/사회/게임/스포츠/연예/자유

### polls / poll_options / poll_votes
```
polls: id, post_id, question
poll_options: id, poll_id, text, order
poll_votes: id, poll_id, option_id, user_id,
  gender, age_group, region, political_leaning (투표 시점 스냅샷)
```

### comments
```
id, post_id, user_id, content, like_count, created_at
```

---

## 배포 현황

- **GitHub**: https://github.com/designbycasker/polla
- **Cloudflare Pages**: https://polla.pages.dev
- 빌드 커맨드: `npx @cloudflare/next-on-pages`
- 빌드 아웃풋: `.vercel/output/static`
- root_dir: `""` (레포 루트 = community/ 폴더)

---

## 작업 진행 상황

### ✅ 완료
- **파운데이션 타이포 스크린** (`design-system/screens/foundation-typography.html`)
  - 모든 텍스트 색상 → TDS 시맨틱 토큰 CSS 변수 사용 (헥스 하드코딩 없음)
  - 컬러 유스케이스 섹션: 검정/회색(text hierarchy), 블루(brand), 빨강(danger)
  - 각 컬러 토큰별 스와치 + 사용 맥락 + 실제 UI 예시
- TDS 디자인 시스템 구축 (토큰 191개, CSS 변수)
- Next.js 프로젝트 셋업 + Cloudflare Pages 배포 연결
- Kakao OAuth + NextAuth v5 연동
- Supabase 연결 (admin 클라이언트)
- 로그인 페이지 UI
- 피드 페이지 (Supabase 실데이터, 카테고리 필터)
- 온보딩 4단계 화면 + API
  - 출생연도 숫자 입력 (→ age_group 변환)
  - 정치성향: 진보/중도/보수 가로 3버튼 + 관심없음
  - 이전 버튼 (단계 뒤로가기)
- 글쓰기 화면 (투표 첨부 토글, 2~5개 선택지)
- 게시글 상세 (투표 결과 + 인구통계 필터 + 댓글)
- middleware.ts 라우팅 (미완료 온보딩 → /onboarding)
- PC 레이아웃 (max-width 768px 중앙)

### 🔲 TODO (우선순위 순)
1. **Supabase 환경변수 설정**
   - `.env.local`: `AUTH_SECRET`, `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_URL`
   - Cloudflare Pages 대시보드에도 동일하게 등록
   - `supabase/schema.sql` 실제 Supabase 프로젝트에 적용
2. 검색 화면 (`/search`)
3. 알림 화면 (`/notifications`)
4. 프로필 화면 (`/profile`)
5. 탭바 네비게이션 컴포넌트 (피드/검색/글쓰기/알림/프로필)

---

## 주요 결정 사항

- 소득 정보 수집 안 함 (가입 허들 우려로 제외)
- 투표는 선택 첨부 (일반 글 + 투표 글 모두 가능)
- 인구통계 스냅샷: 투표 시점 사용자 정보를 poll_votes에 복사 저장
- CSS Module 방식 (Tailwind utility 없이 TDS CSS 변수만 사용)
- 연령 입력: 출생연도 직접 입력 → age_group 서버에서 변환 (1924~2016년 허용)

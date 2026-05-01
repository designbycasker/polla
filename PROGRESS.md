# Polla — 작업 히스토리 & 현황

> 세션 시작 시 이 파일 먼저 읽기. 현황 파악 후 작업 재개.

---

## 🚀 다음 세션 — 바로 시작할 것

**1순위: Supabase 환경변수 설정 → 서비스 실제 오픈 가능**

### Step 1. `community/.env.local` 파일 생성
```
AUTH_SECRET=
KAKAO_CLIENT_ID=
KAKAO_CLIENT_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXTAUTH_URL=https://polla.pages.dev
```

### Step 2. Supabase 스키마 적용
`community/supabase/schema.sql` → Supabase 대시보드 SQL Editor에서 실행

### Step 3. Cloudflare Pages 환경변수 등록
https://dash.cloudflare.com → Pages → polla → Settings → Environment variables → Step 1과 동일 값 입력

### Step 4. 나머지 화면 완성
- 탭바 네비게이션 컴포넌트
- 검색 화면 (`/search`)
- 알림 화면 (`/notifications`)
- 프로필 화면 (`/profile`)

### Step 5. 구글 애드센스 신청 (심사 2~4주 → 빨리 신청할수록 유리)
https://adsense.google.com → 사이트 추가 → polla.pages.dev

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

> 조코딩 "AI Product Builder 1인 창업 부트캠프" 5주 커리큘럼 기준으로 정렬
> 핵심 철학: **빠른 배포 → 유입 → 수익화 → 성장**

#### 🟥 1단계 — 서비스 오픈 (1주차: 기획 → 첫 수익)
1. **Supabase 환경변수 설정** ← 이것 없으면 서비스 불가
   - `.env.local`: `AUTH_SECRET`, `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXTAUTH_URL`
   - Cloudflare Pages 대시보드에도 동일하게 등록
   - `supabase/schema.sql` 실제 Supabase 프로젝트에 적용
2. **나머지 화면 완성**
   - 탭바 네비게이션 컴포넌트 (피드/검색/글쓰기/알림/프로필)
   - 검색 화면 (`/search`)
   - 알림 화면 (`/notifications`)
   - 프로필 화면 (`/profile`)
3. **광고 수익화 준비** (트래픽 생기면 즉시 붙일 수 있게)
   - 구글 애드센스 신청 (심사 2~4주 소요 → 지금 신청해야 함)
   - 인피드 광고 슬롯 레이아웃 미리 잡아두기

#### 🟧 2단계 — 유입 & 성장 (2주차: 유입 → 성장)
4. **SEO 최적화**
   - `metadata` 설정 (title, description, og:image)
   - sitemap.xml, robots.txt 생성
   - 구조화 데이터 (투표 결과 → 검색 노출)
5. **데이터 분석 설치**
   - Google Analytics 4 (GA4) 연동
   - 퍼널 추적: 로그인 → 온보딩 → 첫 투표 → 재방문
6. **바이럴 구조**
   - 투표 결과 공유 기능 (카카오톡/X 공유)
   - OG 이미지 동적 생성 (투표 결과 이미지)

#### 🟨 3단계 — 수익화 (3주차: AI → 결제)
7. **토스페이먼츠 결제 연동**
   - 프리미엄 구독 (월 3,900~6,900원): 인구통계 풀 필터 해제
8. **스폰서드 폴 상품 설계**
   - 기업/기관이 돈 내고 폴 올리는 구조
   - 폴 1개당 50~300만원 (데이터 리포트 포함)

#### 🟩 4~5단계 — 스케일업
9. **B2B 데이터 API** — 언론사, 선거캠프, 리서치사 대상
10. **운영자 큐레이션 툴** — 이슈 폴 생성, 데이터 대시보드

---

## 주요 결정 사항

- 소득 정보 수집 안 함 (가입 허들 우려로 제외)
- 투표는 선택 첨부 (일반 글 + 투표 글 모두 가능)
- 인구통계 스냅샷: 투표 시점 사용자 정보를 poll_votes에 복사 저장
- CSS Module 방식 (Tailwind utility 없이 TDS CSS 변수만 사용)
- 연령 입력: 출생연도 직접 입력 → age_group 서버에서 변환 (1924~2016년 허용)

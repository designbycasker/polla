# TDS Design System

Toss Design System(TDS) 기반 컴포넌트/화면 작업 규칙.
Figma 파일: https://www.figma.com/design/9PoK4dXepjSD3hoP9t6G3A/TDS_Mobile_for_Apps_in_Toss_-2602-3-2-

## 폴더 구조

```
design-system/
├── tokens/          ← Figma에서 추출한 원본 토큰 (소스 오브 트루스)
│   └── color.json   ← 컬러 변수 191개 (Base + Semantic, Light/Dark)
├── components/      ← 토큰 기반 컴포넌트
├── screens/         ← 컴포넌트 조합 화면
├── scripts/
│   └── build-tokens.js  ← 빌드 스크립트
└── docs/
tokens.json          ← 머지된 마스터 토큰 (컴포넌트/화면에서 참조)
variables.css        ← CSS Custom Properties (light + dark mode)
```

## 절대 규칙

- **색상 하드코딩 절대 금지** — 반드시 `tokens.json` 또는 CSS 변수 참조
- 화면 작업 전 `components/` 먼저 확인 → 없으면 만든 후 사용
- 토큰 추가/변경: `tokens/` 수정 → `node design-system/scripts/build-tokens.js` → 커밋

## 토큰 사용법

### CSS
```css
color: var(--color-semantic-text-strong);
background: var(--color-semantic-background-default);
border-color: var(--color-semantic-border-default);
```

### JS/TS
```js
import tokens from './tokens.json';
const brandColor = tokens['color.semantic.fill.brand'].value.light;
```

## 컬러 시스템

| 레이어 | 경로 | 설명 |
|--------|------|------|
| Base | `color.base.grey.*` ~ `color.base.purple.*` | 원시 색상 팔레트 |
| Semantic | `color.semantic.text.*` | 텍스트 색상 |
| Semantic | `color.semantic.icon.*` | 아이콘 색상 |
| Semantic | `color.semantic.fill.*` | 채우기 색상 |
| Semantic | `color.semantic.background.*` | 배경 색상 |
| Semantic | `color.semantic.border.*` | 테두리 색상 |
| Semantic | `color.semantic.shadow.*` | 그림자 색상 |

## TDS 컴포넌트 페이지 목록 (Figma)

Asset, Badge, Bar Chart, Board Row, Border, Bottom CTA, Bottom Info,
Bottom Sheet, Bubble, Button, Checkbox, Chip, Dialog, Grid List,
Icon Button, List Footer, List Header V3, List Row, Loader, Menu,
Navigation, Numeric Spinner, Post, Progress Bar, Progress Stepper,
Rating, Result, Search Field, Segmented Control, Slider, Stepper,
Switch, Tab, Tab Bar, Table Row, Text Button, Text Field, Toast,
Tooltip, Top, Keypad, Templates

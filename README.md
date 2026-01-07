# PRD Writer

AI 기반 제품 요구사항 문서(PRD) 작성 및 고도화 도구입니다.

## 소개

PRD Writer는 Claude AI를 활용하여 제품 요구사항 문서를 자동으로 생성하고, 사용자 리서치를 기반으로 지속적으로 개선할 수 있는 웹 애플리케이션입니다.

## 주요 기능

- **접근 코드 기반 인증**: 간단한 접근 코드로 안전하게 프로젝트 관리
- **제품 관리**: 제품 아이디어를 등록하고 핵심 기능, 플랫폼, 기술 스택 정의
- **유저 리서치 추적**: 사용자 인터뷰, 설문조사, 관찰 결과를 체계적으로 문서화
- **AI 기반 PRD 생성**: Claude AI가 제품 정보와 리서치를 분석하여 종합적인 PRD 자동 생성
- **PRD 고도화**: 새로운 인사이트를 추가하여 PRD를 지속적으로 개선하고 버전 관리
- **검증 마커**: AI가 추가 검증이 필요한 가정과 기능을 자동으로 표시

## 시작하기

### 필수 조건

- Node.js 18.0 이상
- npm, yarn, pnpm 또는 bun

### 설치

```bash
npm install
# 또는
yarn install
# 또는
pnpm install
```

### 환경 변수 설정 ⚠️ 필수

**PRD 생성을 위해 Anthropic API 키가 반드시 필요합니다.**

1. [Anthropic Console](https://console.anthropic.com/)에 접속하여 API 키를 발급받으세요
2. 프로젝트 루트에 `.env.local` 파일을 생성하세요
3. 다음 내용을 추가하세요:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

**주의사항:**
- API 키는 `sk-ant-api03-`로 시작합니다
- `.env.local` 파일은 Git에 커밋되지 않습니다 (보안상 중요)
- 키를 잘못 입력하면 PRD 생성이 실패합니다

### 개발 서버 실행

```bash
npm run dev
# 또는
yarn dev
# 또는
pnpm dev
# 또는
bun dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 애플리케이션을 확인하세요.

## 사용 방법

1. **접근 코드 생성**: 홈페이지에서 새 접근 코드를 생성하거나 기존 코드를 입력
2. **제품 만들기**: 제품 아이디어, 핵심 기능, 타겟 플랫폼, 기술 스택 입력
3. **유저 리서치 추가**: 사용자 리서치 결과와 인사이트를 추가
4. **PRD 생성**: AI가 입력된 정보를 바탕으로 포괄적인 PRD 생성
5. **PRD 고도화**: 새로운 리서치나 피드백을 바탕으로 PRD를 반복적으로 개선

## 기술 스택

- **프레임워크**: Next.js 15 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **데이터베이스**: SQLite (better-sqlite3)
- **AI**: Claude API (Anthropic)
- **마크다운 렌더링**: react-markdown

## 프로젝트 구조

```
prdwriter/
├── app/                    # Next.js App Router 페이지 및 API routes
│   ├── api/               # API 엔드포인트
│   ├── [accessCode]/      # 인증된 사용자 페이지
│   └── page.tsx           # 홈페이지
├── components/            # React 컴포넌트
│   ├── forms/            # 폼 컴포넌트
│   ├── layout/           # 레이아웃 컴포넌트
│   ├── prd/              # PRD 관련 컴포넌트
│   └── ui/               # 재사용 가능한 UI 컴포넌트
├── lib/                   # 유틸리티 및 라이브러리
│   ├── anthropic/        # Claude AI 통합
│   ├── db/               # 데이터베이스 쿼리 및 스키마
│   └── types/            # TypeScript 타입 정의
└── data/                  # SQLite 데이터베이스 파일
```

## 배포

이 Next.js 앱을 배포하는 가장 쉬운 방법은 [Vercel 플랫폼](https://vercel.com/new)을 사용하는 것입니다.

자세한 내용은 [Next.js 배포 문서](https://nextjs.org/docs/app/building-your-application/deploying)를 참조하세요.

## 라이선스

MIT License

## 기여

기여는 언제나 환영합니다! 이슈를 열거나 Pull Request를 제출해 주세요.

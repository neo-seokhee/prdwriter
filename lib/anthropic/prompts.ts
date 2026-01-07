import type { ProductWithPlatforms, UserResearch } from '../types/database';

export const generateInitialPRDPrompt = (
  product: ProductWithPlatforms,
  research: UserResearch[]
): string => {
  const researchContent = research
    .map((r) => `Research #${r.sequence_number}:\n${r.research_content}`)
    .join('\n\n');

  const isActionCamp = product.is_action_camp === 1;
  const actionCampConstraint = isActionCamp
    ? `\n\n🎓 **AI 액션캠프 모드 활성화**
- 서버 없이 프론트엔드만 사용
- Google AI Studio API 또는 Replit Agent 환경에서 실행
- 모든 데이터는 로컬 스토리지 또는 브라우저 내 상태 관리
- 외부 API는 클라이언트에서 직접 호출 (CORS 고려)
- 백엔드, 서버, 데이터베이스 사용 금지`
    : '';

  return `MVP PRD 작성 - 초기 가설 검증 중심

## 제품
- ${product.one_liner}
- 핵심: ${product.core_features}
- 플랫폼: ${product.platforms.join(', ')}
${product.tech_stack ? `- 스택: ${product.tech_stack}` : ''}${actionCampConstraint}

## 유저 리서치 (필수 반영)
${researchContent || '없음'}

## MVP 작성 원칙
**중요**: 이것은 초기 가설 검증을 위한 MVP PRD입니다.
- Phase 구분 없이 MVP 단일 스펙만 작성
- 가설 검증에 필요한 최소 기능만 포함
- 사용자 스펙이 MVP 범위를 벗어나면 "⚠️ MVP 범위 초과" 표시

## 필수 섹션 (바이브 코딩 중심으로 상세 작성)
1. **핵심 가설** (4-5문장)
   - 유저 리서치에서 발견한 인사이트를 기반으로 작성
   - 검증하려는 핵심 가설 명확히 기술
   - 리서치 내용을 직접 인용하거나 참조

2. **문제 정의** (5-6문장)
   - 유저 리서치에서 도출된 문제점 상세히 기술
   - 현재 사용자가 겪고 있는 pain point
   - 문제의 심각성과 발생 빈도

3. **타겟 사용자** (4-5문장)
   - 1개 페르소나 상세 묘사
   - 리서치 기반 사용자 특성
   - 행동 패턴과 니즈

4. **상세 기능 명세** (각 기능당 8-10문장) **← 가장 중요!**
   
   기능 1: [기능명]
   - 기능 설명 (2-3문장)
   - 사용자 플로우 (3-4문장: 어떻게 접근 → 어떻게 사용 → 결과)
   - UI/UX 상세 (3-4문장: 화면 구성, 버튼/입력란 위치, 인터랙션)
   - 기술 구현 힌트 (1-2문장: 사용할 기술, API 구조 등)
   - 수락 기준 (2-3개 bullet points)
   
   기능 2: [기능명]
   - (동일한 형식으로 상세 작성)
   
   기능 3: [기능명]
   - (동일한 형식으로 상세 작성)

5. **화면 구성 및 UX 플로우** (6-8문장)
   - 전체 화면 구조 및 네비게이션
   - 각 화면 간 전환 플로우
   - 주요 인터랙션 패턴
   - 사용자 여정 (User Journey)

6. **MVP 목표** (간단히 2-3문장)
   - 이 MVP로 무엇을 검증하나

7. **성공 지표** (간단히 2-3개, 각 1문장)

8. **주요 가정** (간단히 2-3개)

검증 마커:
- user_need_verification: 사용자 니즈 불명확
- additional_research_needed: 추가 리서치 필요  
- unclear_problem_solution: 문제-해결 연결 불명확

## JSON 출력
{
  "prd_content": "상세한 MVP PRD (한국어, 목표 3000자)",
  "validation_markers": [{"feature_name":"","marker_type":"","description":"","section_context":""}]
}

**중요 작성 규칙**:
1. PRD 본문에는 실제 제품 내용만 포함
2. 경고 메시지나 메타 정보는 절대 포함 금지
   - ❌ "⚠️ 현재 유저 리서치가 부재하여..."
   - ❌ "가정에 기반합니다"
   - ❌ "추가 검증이 필요합니다"
3. 이런 메타 정보는 validation_markers에만 포함
4. PRD 맨 끝에 다음 섹션 추가:

## MVP 생성용 프롬프트

다음 프롬프트를 Claude나 ChatGPT에 입력하여 바이브 코딩을 시작하세요:

\`\`\`
당신은 ${product.platforms.join(', ')} 플랫폼을 위한 MVP를 개발하는 시니어 ${isActionCamp ? '프론트엔드' : '풀스택'} 개발자입니다.

제품: ${product.one_liner}

다음 PRD를 기반으로 MVP 개발을 시작하세요:
[위 PRD 전체 내용을 여기에 붙여넣기]

MVP 구현 시:
- 핵심 기능 3개에 집중
- 간단하고 실행 가능한 코드 작성
- 각 기능의 수락 기준 충족
- 프로덕션 레벨이 아닌 검증 가능한 프로토타입 수준${
      isActionCamp
        ? `
- **중요**: 서버 없이 프론트엔드만 사용 (Google AI Studio, Replit Agent)
- 모든 상태는 브라우저 로컬 스토리지 또는 클라이언트 상태 관리
- 백엔드, 서버, 데이터베이스 사용 금지`
        : ''
    }

필요한 파일 구조, 코드, 설정을 단계별로 제공해주세요.
\`\`\`

주의: 순수 JSON만. 리서치 인사이트 충분히 반영. { 시작 } 끝`;
};

export const generateIterationPRDPrompt = (
  product: ProductWithPlatforms,
  existingPRD: string,
  newInsights: string,
  currentVersion: number
): string => {
  const isActionCamp = product.is_action_camp === 1;
  const actionCampConstraint = isActionCamp
    ? `\n\n🎓 **AI 액션캠프 모드**: 서버 없이 프론트엔드만 사용 (백엔드/DB 금지)`
    : '';

  return `MVP PRD 개선 v${currentVersion} → v${currentVersion + 1}

## 제품: ${product.one_liner}${actionCampConstraint}

## 기존 MVP PRD (v${currentVersion})
${existingPRD}

## 새 인사이트
${newInsights}

## 업데이트 원칙
**MVP 범위 유지**: 초기 가설 검증 범위 내에서만 수정
- 관련 섹션만 수정 (전체 재작성 금지)
- **새 인사이트를 핵심 가설과 문제 정의에 적극 반영**
- 인사이트가 MVP 범위 벗어나면 "⚠️ MVP 범위 초과" 표시
- 가설 검증에 불필요한 기능은 제외 사항으로 이동
- 변경사항 표시: [v${currentVersion + 1}] 수정, [신규] 추가, [제거] 삭제
- 상단에 변경 요약 추가

## 상세 작성
- 핵심 가설: 새 인사이트 기반으로 보강 (4-5문장)
- 문제 정의: 새 인사이트로 문제 더욱 명확히 (5-6문장)
- 각 섹션을 기존 수준의 상세도 유지
- 전체 분량 약 3000자 목표

## JSON 출력
{
  "prd_content": "업데이트된 MVP PRD (한국어, 목표 3000자)",
  "validation_markers": [{"feature_name":"","marker_type":"","description":"","section_context":""}],
  "change_summary": "변경사항 요약 (2-3문장)"
}

**중요 작성 규칙**:
1. PRD 본문에는 실제 제품 내용만 포함
2. 경고 메시지나 메타 정보는 절대 포함 금지
3. 이런 메타 정보는 validation_markers에만 포함
4. PRD 맨 끝에 "## MVP 생성용 프롬프트" 섹션 유지

주의: 순수 JSON만. 인사이트 충분히 반영. { 시작 } 끝`;
};

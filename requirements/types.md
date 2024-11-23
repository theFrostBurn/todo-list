# TypeScript 타입 시스템

## Todo 타입 정의

### TodoCategory
// 할 일의 카테고리를 분류하는 타입으로, 다음 값들만 허용됩니다:
// - work: 업무 관련
// - personal: 개인적인 일
// - shopping: 쇼핑 목록
// - study: 학습 관련
// - health: 건강 관련
export type TodoCategory = 'work' | 'personal' | 'shopping' | 'study' | 'health';

### Todo 인터페이스
// 할 일 항목의 전체 데이터 구조를 정의합니다.
export interface Todo {
  // 필수 필드
  id: string;                // UUID v4로 생성되는 고유 식별자
  title: string;             // 할 일의 제목
  priority: 1 | 2 | 3;       // 우선순위 (1: 낮음, 2: 중간, 3: 높음)
  completed: boolean;        // 완료 상태
  createdAt: Date;          // 생성 시간
  updatedAt: Date;          // 마지막 수정 시간
  order: number;            // 드래그 앤 드롭으로 변경 가능한 정렬 순서
  category: TodoCategory;    // 할 일의 카테고리

  // 선택적 필드
  description?: string;      // 추가 설명 (선택 사항)
}

// 사용 예시
const example: Todo = {
  id: "uuid-v4-string",
  title: "프로젝트 문서화",
  description: "타입 시스템 문서 작성",
  priority: 2,
  completed: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  order: 1,
  category: "work"
}; 
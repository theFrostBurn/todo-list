# Firebase Firestore 설정 및 구조

## 데이터베이스 구조

### todos 컬렉션
- 문서 ID: 자동 생성 (uuid)
  - title: string (할 일 제목)
  - description: string (할 일 설명)
  - priority: number (우선순위: 1-높음, 2-중간, 3-낮음)
  - completed: boolean (완료 여부)
  - createdAt: timestamp (생성 시간)
  - updatedAt: timestamp (수정 시간)
  - order: number (정렬 순서)
  - category: string (카테고리: 'work' | 'personal' | 'shopping' | 'study' | 'health')

## 보안 규칙 설명
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /todos/{todoId} {
      // 읽기: 모든 사용자에게 허용
      allow read: if true;
      
      // 쓰기: 데이터 유효성 검사 포함
      allow write: if true && 
        // 1. 필수 필드 존재 여부 검사
        request.resource.data.keys().hasAll(['title', 'priority', 'completed']) &&
        
        // 2. 데이터 타입 검사
        request.resource.data.title is string &&
        request.resource.data.priority is number &&
        request.resource.data.completed is bool &&
        
        // 3. 우선순위 범위 검사 (1-3)
        request.resource.data.priority >= 1 &&
        request.resource.data.priority <= 3 &&
        
        // 4. 제목 길이 제한 (100자)
        request.resource.data.title.size() <= 100;
    }
    
    // 다른 모든 문서에 대한 접근 제한
    match /{document=**} {
      allow read, write: if false;
    }
  }
}

### 규칙 설명
1. 읽기 권한: 현재는 모든 사용자에게 읽기 권한이 허용됨
2. 쓰기 권한: 다음 조건을 만족해야 함
   - 필수 필드(title, priority, completed) 포함
   - 각 필드의 데이터 타입 검증
   - 우선순위는 1-3 범위 내
   - 제목은 100자 이내
3. 보안 고려사항: 
   - 현재는 인증 없이 접근 가능
   - 추후 사용자 인증 추가 시 규칙 업데이트 필요
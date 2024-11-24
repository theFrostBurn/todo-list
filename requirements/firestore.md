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



## 사용 방법

### 1. Firebase 초기화
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Firebase 콘솔에서 가져온 설정
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

### 2. CRUD 작업
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';

// 할 일 추가
const addTodo = async (todo) => {
  await addDoc(collection(db, 'todos'), {
    ...todo,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

// 할 일 수정
const updateTodo = async (id, data) => {
  const todoRef = doc(db, 'todos', id);
  await updateDoc(todoRef, {
    ...data,
    updatedAt: new Date()
  });
};

// 할 일 삭제
const deleteTodo = async (id) => {
  await deleteDoc(doc(db, 'todos', id));
};

// 실시간 데이터 동기화
const subscribeTodos = (callback) => {
  const q = query(collection(db, 'todos'));
  return onSnapshot(q, (snapshot) => {
    const todos = [];
    snapshot.forEach((doc) => {
      todos.push({ id: doc.id, ...doc.data() });
    });
    callback(todos);
  });
};



## 보안 규칙
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // todos 컬렉션에 대한 규칙
    match /todos/{todoId} {
      // 읽기: 모든 사용자 허용
      allow read: if true;
      
      // 쓰기: 기본 유효성 검사
      allow write: if true && 
        // 필수 필드 검사
        request.resource.data.keys().hasAll(['title', 'priority', 'completed']) &&
        // 타입 검사
        request.resource.data.title is string &&
        request.resource.data.priority is number &&
        request.resource.data.completed is bool &&
        // 우선순위 범위 검사
        request.resource.data.priority >= 1 &&
        request.resource.data.priority <= 3 &&
        // 제목 길이 제한
        request.resource.data.title.size() <= 100;
    }
  }
}
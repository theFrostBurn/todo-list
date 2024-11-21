# 데이터 규칙

## Users 테이블

- `id`: UUID, 기본 키
- `firebase_uid`: 문자열, 고유, Firebase 사용자 ID
- `email`: 문자열, 고유, 사용자 이메일
- `display_name`: 문자열, 최대 100자, 사용자 표시 이름
- `profile_image_url`: 문자열, 프로필 이미지 URL
- `created_at`: 타임스탬프, 생성 시간
- `updated_at`: 타임스탬프, 최종 수정 시간

## Newsletters 테이블

- `id`: UUID, 기본 키
- `name`: 문자열, 최대 255자, 뉴스레터 이름
- `category`: 문자열, 최대 100자, 뉴스레터 카테고리
- `url`: 문자열, 최대 255자, 뉴스레터 URL
- `is_paid`: 불리언, 유료 여부
- `created_at`: 타임스탬프, 생성 시간
- `updated_at`: 타임스탬프, 최종 수정 시간
- `description`: 텍스트, 뉴스레터 설명


## Reviews 테이블

- `id`: UUID, 기본 키
- `newsletter_id`: UUID, 외래 키 (Newsletters 테이블 참조)
- `user_id`: UUID, 외래 키 (Users 테이블 참조)
- `rating`: 정수, 1-5 사이의 값
- `comment`: 텍스트, 리뷰 내용
- `created_at`: 타임스탬프, 생성 시간
- `updated_at`: 타임스탬프, 최종 수정 시간

## Likes 테이블

- `id`: UUID, 기본 키
- `review_id`: UUID, 외래 키 (Reviews 테이블 참조)
- `user_id`: 문자열, 외래 키 (Users 테이블의 firebase_uid 참조)
- `created_at`: 타임스탬프, 생성 시간

## 규칙

1. 모든 테이블의 `id`는 자동 생성되는 UUID입니다.
2. `Users` 테이블의 `firebase_uid`와 `email`은 고유해야 합니다.
3. `Newsletters` 테이블의 `name`과 `url`은 고유해야 합니다.
4. `Reviews` 테이블의 `rating`은 1에서 5 사이의 정수여야 합니다.
5. `Likes` 테이블은 각 사용자가 특정 리뷰에 대해 한 번만 '좋아요'를 할 수 있도록 `review_id`와 `user_id`의 조합이 고유해야 합니다.
6. `Likes` 테이블의 `user_id`는 `Users` 테이블의 `firebase_uid`를 참조합니다.
7. 모든 날짜/시간 필드는 UTC 기준으로 저장됩니다.

## Supabase 규칙

## 데이터 관리 지침

1. 사용자 정보 업데이트 시 `updated_at` 필드를 현재 시간으로 설정해야 합니다.
2. 뉴스레터 정보 변경 시 `updated_at` 필드를 현재 시간으로 설정해야 합니다.
3. 리뷰 수정 시 `updated_at` 필드를 현재 시간으로 설정해야 합니다.
4. 데이터베이스 쿼리 시 적절한 인덱스를 사용하여 성능을 최적화해야 합니다.
5. 민감한 사용자 정보는 암호화하여 저장해야 합니다.
6. `Likes` 테이블의 `user_id`에 대한 쿼리 시 `Users` 테이블의 `firebase_uid`와 조인해야 합니다.
7. 리뷰의 좋아요 수는 `Likes` 테이블에서 동적으로 계산해야 합니다. `Reviews` 테이블에는 좋아요 수를 저장하지 않습니다.

## 추가 규칙

8. `Newsletters` 테이블의 `author_id`는 `Users` 테이블의 `id`를 참조합니다.

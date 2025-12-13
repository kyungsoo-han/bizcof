# Bizcof WMS

`Bizcof WMS`는 실시간 입출고 및 재고 관리가 필요한 제조/물류 기업을 위한 **창고 관리 시스템(WMS)**입니다.
**Kafka, Redis, RealGrid2** 등을 활용해 대량 트랜잭션 처리와 고가용성을 실무 수준으로 설계했습니다.

> 본 프로젝트는 설계부터 개발, 배포까지 전 과정을 직접 수행한 개인 프로젝트입니다.

---

## 주요 기능

- **입고/출고 관리**: 실시간 데이터 기반의 입출고 처리
- **재고 관리**: Redis + Kafka 기반 실시간 재고 반영
- **로케이션 관리**: 창고 내 위치 정보 트래킹
- **거래처/품목 관리**: 마스터 데이터 등록 및 검색
- **BOM 관리**: 제품 구성 자재 관리
- **이력 조회**: 작업 히스토리 실시간 추적
- **JWT 인증**: Access Token + Refresh Token 기반 보안

---

## URL

- **운영 사이트:**
  [https://wms.bizcof.com](https://wms.bizcof.com)

- **백엔드 (API 서버 - Swagger 문서):**
  [https://wms.bizcof.com/swagger-ui/index.html](https://wms.bizcof.com/swagger-ui/index.html)

---

## 프로젝트 구조

```
bizcof/
├── bizcof-wms-app/            # Spring Boot 실행 애플리케이션
├── bizcof-wms-api/            # 도메인 비즈니스 로직 (API 모듈)
│   └── src/main/java/com/bizcof/
│       ├── config/            # 설정 (Security, Redis, Kafka 등)
│       └── wms/               # WMS 도메인
│           ├── inbound/       # 입고 관리
│           ├── outbound/      # 출고 관리
│           ├── inventory/     # 재고 관리
│           ├── allocation/    # 재고 할당
│           ├── master/        # 기준정보 (품목, 거래처, BOM)
│           ├── order/         # 주문 관리
│           └── system/        # 시스템 (사용자, 메뉴)
├── bizcof-wms-web/            # React 프론트엔드 (신규)
│   └── src/
│       ├── components/        # UI 컴포넌트
│       ├── routes/            # 페이지 라우팅
│       ├── services/api/      # API 서비스
│       ├── hooks/             # 커스텀 훅
│       └── stores/            # 상태 관리
├── bizcof-common-core/        # 공통 유틸, 예외 처리
├── build.gradle               # 루트 Gradle 설정
└── settings.gradle            # 멀티모듈 프로젝트 설정
```

---

## 기술 스택

### Backend

| 분류 | 기술 |
|------|------|
| Language | Java 17 |
| Framework | Spring Boot 3.4, Spring Security |
| ORM | Spring Data JPA, QueryDSL |
| Database | PostgreSQL |
| Cache | Redis (Redisson) |
| Message Queue | Apache Kafka (KRaft) |
| Authentication | JWT (Access Token + Refresh Token) |
| Documentation | Swagger (springdoc-openapi) |

### Frontend (신규)

| 분류 | 기술 |
|------|------|
| Language | TypeScript |
| Framework | React 18, Vite |
| Routing | TanStack Router |
| State Management | TanStack Query, Zustand |
| UI Components | shadcn/ui, Radix UI |
| Styling | Tailwind CSS |
| Form | React Hook Form, Zod |
| Grid | RealGrid2 |
| HTTP Client | ky |

### Infrastructure

| 분류 | 기술 |
|------|------|
| OS | Ubuntu 20.04.6 LTS |
| Web Server | Nginx |
| CI/CD | GitHub Actions |
| Version Control | Git |
| Build Tool | Gradle |

---

## 인증 구조

```
┌─────────────────────────────────────────────────────────┐
│                    JWT 인증 흐름                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [로그인]                                               │
│     ├─→ Access Token (15분) → API 호출 시 사용          │
│     └─→ Refresh Token (7일) → 토큰 갱신 시 사용         │
│                                                         │
│  [토큰 만료 시]                                         │
│     └─→ 401 반환 → Refresh Token으로 자동 갱신          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- **Access Token**: localStorage 저장, 15분 만료
- **Refresh Token**: HttpOnly Cookie 저장, 7일 만료
- **서버 검증**: Redis에 Refresh Token 저장하여 검증

---

## 실행 방법

### Backend

```bash
# 프로젝트 빌드
./gradlew clean build

# 애플리케이션 실행
./gradlew :bizcof-wms-app:bootRun
```

### Frontend

```bash
# 디렉토리 이동
cd bizcof-wms-web

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

---

## 개발 가이드

새로운 화면(기능)을 개발할 때의 순서:

```
1. Domain (Entity)           → 데이터 구조 정의
2. Repository                → 데이터 접근 계층
3. DTO (Request/Response)    → API 요청/응답 객체
4. Service                   → 비즈니스 로직
5. Controller                → API 엔드포인트
6. Frontend API Service      → 백엔드 API 호출
7. Frontend Component        → UI 컴포넌트
8. Frontend Route            → 페이지 라우팅
```

자세한 내용은 [개발 가이드](./docs/development-guide.md)를 참고하세요.

---

## 문서

- [개발 가이드](./docs/development-guide.md) - 새 화면 개발 순서
- [JWT 토큰 가이드](./docs/jwt-token-refresh-guide.md) - JWT 인증 구조 설명

---

## 화면 예시

### 로그인 화면
![로그인](/zfile/image-0.png)

### 품목 관리
![품목 관리](/zfile/image-1.png)

### 품목 등록 (모달)
![품목 등록](/zfile/image-2.png)

### 거래처 조회 (모달)
![거래처 조회](/zfile/image-3.png)

### 입고 관리
![입고 관리](image-1.png)

### 입고 등록 (모달)
![입고 등록](image-2.png)

### 유효성 검사
![유효성 검사](image-3.png)

### 입고 삭제
![입고 삭제 1](image-5.png)
![입고 삭제 2](image-4.png)

### 메뉴 관리
![메뉴 관리](/zfile/image-6.png)

### 사용자 관리
![사용자 관리](/zfile/image-7.png)

---

## 라이선스

이 프로젝트는 개인 학습 및 포트폴리오 목적으로 제작되었습니다.

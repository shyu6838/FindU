# 🔍 FindU

> **AI 기반 교내 분실물 · 습득물 스마트 매칭 플랫폼**  
> 이미지, 텍스트, 위치 정보를 활용하여 잃어버린 물건을 빠르게 찾을 수 있도록 지원하는 서비스입니다.

---

# ✨ 주요 기능

- 📦 **분실물 / 습득물 등록**
  - 사진, 위치, 시간, 상세 설명을 등록

- 🤖 **AI 유사도 추천**
  - CLIP 기반 이미지 임베딩
  - S-BERT 기반 텍스트 임베딩
  - PostgreSQL(pgvector)을 이용한 유사도 검색

- 🎯 **복합 추천 알고리즘**
  - 이미지 유사도
  - 텍스트 유사도
  - 위치
  - 시간
  을 종합하여 추천 점수 계산

- 💬 **실시간 채팅**
  - 분실자와 습득자 간 대화

- ✅ **본인 확인 질문**
  - 실제 소유자 확인을 위한 인증 질문 기능

- 🔔 **알림 서비스**
  - 유사 물건 등록
  - 채팅
  - 물건 전달 완료 등의 알림 제공

- ⭐ **사용자 신뢰도 시스템**
  - 활동 내역에 따른 EXP 및 등급 관리

- 🚨 **신고 시스템**
  - 허위 등록 및 악의적인 사용자를 신고

---

# 🛠 Tech Stack

## 💻 Frontend

![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=Axios&logoColor=white)

---

## ⚙️ Backend

![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat-square&logo=SpringBoot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=flat-square&logo=SpringSecurity&logoColor=white)
![Spring Data JPA](https://img.shields.io/badge/Spring_Data_JPA-6DB33F?style=flat-square&logo=Spring&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=PostgreSQL&logoColor=white)
![AWS_S3](https://img.shields.io/badge/AWS_S3-569A31?style=flat-square&logo=AmazonS3&logoColor=white)

---

## 🧠 AI

![Python](https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=Python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=FastAPI&logoColor=white)
![OpenCLIP](https://img.shields.io/badge/OpenCLIP-000000?style=flat-square)
![FAISS](https://img.shields.io/badge/FAISS-4285F4?style=flat-square)

---

# 🏗️ System Architecture

```text
React Frontend
        │
        ▼
Spring Boot Backend
        │
        ├──────────────► PostgreSQL
        │                 ├─ 사용자 정보
        │                 ├─ 게시글 정보
        │                 ├─ 이미지 URL
        │                 └─ Vector(pgvector)
        │
        ├──────────────► AWS S3
        │                 └─ 이미지 저장
        │
        ▼
Python AI Module
        ├─ OpenCLIP
        ├─ FAISS
        └─ Similarity Search
```

---

# 📂 프로젝트 구조

```text
FindU
├── backend
│   └── Spring Boot
├── frontend
│   └── React
└── README.md
```

---

# 🌿 Git 브랜치 전략

```
main
 └── develop
      ├── feature/auth
      ├── feature/user
      ├── feature/lost-item
      ├── feature/found-item
      ├── feature/search
      ├── feature/chat
      └── feature/ai
```

| 브랜치 | 설명 |
|---------|------|
| main | 최종 배포 브랜치 |
| develop | 개발 통합 브랜치 |
| feature/* | 기능 개발 브랜치 |
| hotfix/* | 긴급 수정 브랜치 |

---

# 📝 Commit Convention

| 태그 | 설명 |
|------|------|
| feat | 새로운 기능 추가 |
| fix | 버그 수정 |
| docs | 문서 수정 |
| style | 코드 스타일 변경 (기능 변경 없음) |
| refactor | 코드 리팩토링 |
| test | 테스트 코드 작성 및 수정 |
| chore | 빌드, 환경설정, 기타 작업 |

### 예시

```bash
feat: Google OAuth2 로그인 기능 구현
feat: 분실물 등록 API 구현

fix: JWT 토큰 만료 오류 수정

docs: README 업데이트

refactor: UserService 비즈니스 로직 분리

test: LostItemService 테스트 코드 추가

chore: application.yml 환경 변수 설정
```

---

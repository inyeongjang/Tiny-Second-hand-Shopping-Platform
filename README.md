# 중고 거래 플랫폼 실행 가이드

이 문서는 Tiny-Second-hand-Shopping-Platform 프로젝트를 새로운 환경에서 설치하고 실행하는 방법을 안내합니다.

## 사전 요구사항

프로젝트를 실행하기 위해 다음 소프트웨어가 필요합니다:

- Node.js (v16 이상)
- npm (v8 이상)
- MySQL (v8 이상)
- Git

## 프로젝트 클론

1. 터미널을 열고 프로젝트를 저장할 디렉토리로 이동합니다.
2. 다음 명령어를 실행하여 프로젝트를 클론합니다:

```bash
git clone https://github.com/inyeongjang/Tiny-Second-hand-Shopping-Platform.git
cd Tiny-Second-hand-Shopping-Platform
```

## 백엔드 설정

1. 프로젝트 루트 디렉토리에서 필요한 의존성을 설치합니다:

```bash
npm install
```

2. 환경 변수 파일을 생성합니다:

```bash
# .env 파일 생성
cp .env.example .env
```

3. 생성된 `.env` 파일을 텍스트 에디터로 열고 다음 변수들을 설정합니다:

```
# 서버 설정
PORT=3000

# 데이터베이스 설정
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=second_hand_db

# JWT 설정
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d
```

## 데이터베이스 설정

1. MySQL 데이터베이스를 생성합니다:

```bash
# MySQL 콘솔 접속
mysql -u root -p

# 데이터베이스 생성 (MySQL 콘솔에서)
CREATE DATABASE second_hand_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit
```

2. 프로젝트 디렉토리에서 데이터베이스 마이그레이션을 실행합니다:

```bash
# 데이터베이스 테이블 생성
npm run db:create
npm run db:migrate
```

## 프로젝트 실행

1. 개발 서버를 시작합니다:

```bash
npm run dev
```

2. 브라우저에서 다음 주소로 접속합니다:
   - http://localhost:3000

## 주요 기능

- **사용자 관리**: 회원가입, 로그인, 프로필 관리
- **상품 관리**: 상품 등록, 수정, 삭제, 조회
- **채팅 기능**: 판매자와 구매자 간의 실시간 채팅
- **거래 관리**: 결제 처리 및 거래 상태 추적
- **카테고리**: 상품 카테고리 관리
- **검색 및 필터링**: 상품 검색 및 필터링 기능

## 문제 해결

- **서버 시작 실패**: `.env` 파일이 올바르게 구성되어 있는지 확인하세요.
- **데이터베이스 연결 오류**: MySQL 서비스가 실행 중인지 확인하고, 데이터베이스 인증 정보가 올바른지 확인하세요.
- **모듈 오류**: `npm install`을 다시 실행하여 모든 의존성이 올바르게 설치되었는지 확인하세요.

---




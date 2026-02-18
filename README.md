# 명문학원 - 대입 전문 학원 웹사이트

명문학원은 체계적인 커리큘럼과 전문 강사진을 통해 학생들의 대입 성공을 지원하는 입시 전문 학원 웹사이트입니다.

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: MySQL (mysql2)
- **Theme**: next-themes (다크모드 지원)
- **Process Manager**: PM2
- **Web Server**: Apache2 (Reverse Proxy) + Let's Encrypt SSL

## 주요 기능

### 사용자 페이지
- **메인 페이지** - 학원 소개 및 주요 정보
- **입학 안내** - 상담 신청, Q&A 게시판
- **학습 관리** - 주간 급식 식단표
- **커뮤니티** - 공지사항, 학부모 게시판
- **합격 수기** - 합격 성공 사례

### 관리자 페이지 (`/admin`)
- 대시보드, 공지사항 관리
- 상담 신청 관리, Q&A 관리
- 급식 식단 관리, 학부모 게시판 관리
- 합격 수기 관리

### API (`/api`)
- 공지사항, 상담, Q&A, 급식 식단, 학부모 게시판, 합격 수기 CRUD
- 관리자 인증 (로그인/로그아웃)

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 실행
npm run start
```

## 배포

```bash
# PM2로 실행
pm2 start ecosystem.config.cjs

# PM2 상태 확인
pm2 status

# 로그 확인
pm2 logs academy
```

- **도메인**: https://academy.gnuboard.net
- **포트**: 5002
- **PM2 앱 이름**: academy

## 프로젝트 구조

```
src/
├── app/
│   ├── admin/          # 관리자 페이지
│   ├── api/            # API 라우트
│   ├── community/      # 커뮤니티 (공지사항, 학부모)
│   ├── entrance/       # 입학 안내 (상담, Q&A)
│   ├── learn/          # 학습 관리 (급식 식단)
│   ├── story/          # 합격 수기
│   ├── layout.tsx      # 루트 레이아웃
│   └── page.tsx        # 메인 페이지
├── components/         # 공통 컴포넌트
└── lib/                # 유틸리티
```

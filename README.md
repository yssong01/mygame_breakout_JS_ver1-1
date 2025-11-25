# 🎮 JS Breakout

Python(Pygame)으로 만들었던 벽돌깨기 게임을 **HTML5 Canvas + 순수 JavaScript(OOP)**로 포팅한 버전입니다. 기존 Python 코드의 구조와 기능을 최대한 유지하면서, 브라우저에서 바로 실행 가능한 교육용 예제로 구성했습니다.

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Canvas](https://img.shields.io/badge/Canvas_API-5A29E4?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

## 📌 프로젝트 개요

Python Pygame 기반 벽돌깨기 게임을 **웹 브라우저에서 실행 가능하도록** 완전 포팅한 프로젝트입니다.

객체 지향 프로그래밍(OOP) 구조를 유지하면서, HTML5 Canvas API를 활용하여 동일한 게임플레이를 구현했습니다.

### ✨ 주요 특징

- 🎯 **Python 코드 구조 유지** - 기존 클래스 설계를 그대로 JavaScript로 변환
- 🌐 **브라우저 실행** - 별도 설치 없이 웹에서 바로 플레이
- 🎨 **Canvas 렌더링** - HTML5 Canvas API 활용
- 🔊 **사운드 시스템** - 효과음 및 배경음악 통합
- 🎁 **다양한 파워업** - 7가지 아이템으로 전략적 플레이
- 📚 **교육용 예제** - OOP 및 게임 개발 학습에 적합

---

## 🎮 게임 방법

### 조작키

| 키 | 기능 |
|---|------|
| **←/→** | 패들 좌우 이동 |
| **Space** | 일시정지 / 재개 |
| **F** | 총알 발사 (SH 파워업 상태) |
| **←/→** | 게임 시작 (공 발사) |

### 🎁 파워업 종류

| 아이템 | 효과 | 설명 |
|--------|------|------|
| **A+** | 🔺 공격력 증가 | 공/총알 데미지 +1 |
| **A-** | 🔻 공격력 감소 | 공/총알 데미지 -1 (최소 1) |
| **SU** | ⚡ 속도 상승 | 공 이동 속도 +10% |
| **SD** | 🐌 속도 하락 | 공 이동 속도 -5% |
| **P+** | ↔️ 패들 확장 | 패들 길이 증가 |
| **P-** | ↕️ 패들 축소 | 패들 길이 감소 |
| **SH** | 🔫 슈팅 모드 | F키로 총알 연사 가능 |

### 🎯 게임 규칙

- 공은 게임 시작 시 패들 위에 고정되어 있음
- 좌우 방향키를 누르면 해당 방향으로 공 발사
- 벽돌은 HP(1~9)를 가지며, 중앙에 숫자로 표시
- 벽돌을 파괴하면 랜덤으로 파워업 드롭
- 모든 벽돌을 파괴하면 스테이지 클리어
- 공을 놓치면 생명 -1, 생명이 0이 되면 게임 오버

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| **언어** | JavaScript (ES6+) |
| **렌더링** | HTML5 Canvas API |
| **마크업** | HTML5 |
| **스타일** | CSS3 |
| **사운드** | Web Audio API |
| **설계 패턴** | OOP (Object-Oriented Programming) |

---

## 🏗️ 핵심 OOP 구조

### 클래스 다이어그램

```
        ┌──────────────┐
        │     Game     │ ◄─── 게임 컨트롤러
        │  (Core)      │
        └──────┬───────┘
               │
    ┌──────────┼───────────────────┐
    │          │                   │
┌───▼────┐ ┌──▼───┐  ┌────▼──────────┐
│ Paddle │ │ Ball │  │ Level/Bricks  │
└────────┘ └──┬───┘  └───────────────┘
              │
         ┌────┴────┬──────────┐
    ┌────▼───┐  ┌─▼──────┐ ┌─▼──────────┐
    │ Bullet │  │PowerUp │ │ SoundBank  │
    └────────┘  └────────┘ └────────────┘
```

### 주요 클래스 설명

#### 🎯 Game
- 전체 게임 루프 및 상태 관리
- 입력 처리, 충돌 판정, HUD 표시
- 점수, 라이프, 아이템 효과 통합 관리

#### 🏓 Paddle
- 플레이어 입력에 따른 좌우 이동
- P+/P- 파워업으로 길이 조절
- Canvas에 렌더링

#### ⚽ Ball
- 방향 벡터 × 속도로 이동 관리
- 공격력(ATK) 및 속도 버프 시스템
- 벽/패들/벽돌 충돌 처리

#### 🔫 Bullet
- SH 파워업 시 F키로 발사
- 직선 궤도로 벽돌 파괴
- 공격력은 현재 ATK 값 적용

#### 🧱 Brick
- HP(1~9)를 가진 벽돌
- HP에 따라 색상이 점점 어두워짐
- 중앙에 HP 숫자 표시

#### 🗺️ Level
- 5행 x 20열 그리드 배치
- 팔레트에서 랜덤 색상 선택
- 클리어 조건 체크

#### 🎁 PowerUp
- 벽돌 파괴 시 랜덤 드롭
- 패들과 충돌 시 효과 적용
- 7가지 종류의 아이템

#### 🔊 SoundBank
- 효과음 및 BGM 로딩 관리
- 충돌, 파괴, 아이템 획득 사운드
- 배경음악 재생 및 일시정지

---

## 📂 프로젝트 구조

```
js-breakout/
├── index.html                  # 메인 HTML 페이지
├── game.js                     # 게임 로직 (모든 클래스)
├── assets/
│   ├── bg/
│   │   └── 용골자리성운.jpg    # 배경 이미지
│   ├── bgm/
│   │   └── Heroes_Tonight.mp3 # 배경음악
│   └── sfx/                   # 효과음 폴더
│       ├── hit.wav
│       ├── break.wav
│       ├── powerup.wav
│       ├── shoot.wav
│       └── ...
└── README.md
```

---

## 🚀 실행 방법

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/js-breakout.git
cd js-breakout
```

### 2. 로컬 서버 실행

#### VSCode Live Server (권장)

```
1. VSCode에서 index.html 열기
2. 우클릭 → "Open with Live Server"
```

#### Python 간이 서버

```bash
python -m http.server 8000
```

#### Node.js http-server

```bash
npx http-server
```

### 3. 브라우저 접속

```
http://localhost:8000
```

### 4. 게임 시작

페이지 접속 후 **Start Game** 버튼을 클릭하면 플레이할 수 있습니다.

---

## 🎵 사운드 출처

### 효과음

- **출처**: [Pixabay - Royalty-free sound effects](https://pixabay.com/sound-effects/)
- **용도**: 충돌, 파괴, 아이템 획득, 발사 등

### 배경음악

- **곡명**: Heroes Tonight (feat. Johnning)
- **아티스트**: Janji, Johnning
- **레이블**: NCS Release
- **링크**: [Audio.com](https://audio.com/manish-shirodkar/audio/janji-johnning-heroes-tonight-feat-johnning-ncs-release)

---

## 🎓 학습 포인트

이 프로젝트를 통해 배울 수 있는 것들:

- ✅ Python → JavaScript 포팅 경험
- ✅ HTML5 Canvas API 활용
- ✅ 객체 지향 프로그래밍 (OOP) 실전
- ✅ 게임 루프 및 충돌 처리
- ✅ 이벤트 기반 프로그래밍
- ✅ Web Audio API 사운드 통합
- ✅ 타이머 및 버프 시스템 구현
- ✅ Canvas 렌더링 최적화

---

## 💡 Python vs JavaScript 주요 차이점

### 렌더링

| Python (Pygame) | JavaScript (Canvas) |
|----------------|---------------------|
| `pygame.draw.rect()` | `ctx.fillRect()` |
| `screen.blit()` | `ctx.drawImage()` |
| `pygame.font.Font()` | `ctx.fillText()` |

### 게임 루프

| Python (Pygame) | JavaScript (Canvas) |
|----------------|---------------------|
| `while running:` 루프 | `requestAnimationFrame()` |
| `clock.tick(60)` | 타임스탬프 기반 델타타임 |

### 입력 처리

| Python (Pygame) | JavaScript (Canvas) |
|----------------|---------------------|
| `pygame.key.get_pressed()` | `keydown/keyup` 이벤트 |
| `event.type == KEYDOWN` | `addEventListener('keydown')` |

### 사운드

| Python (Pygame) | JavaScript (Canvas) |
|----------------|---------------------|
| `pygame.mixer.Sound()` | `new Audio()` |
| `sound.play()` | `audio.play()` |

---

## 🔧 커스터마이징 가이드

### 레벨 구조 변경

`Level` 클래스에서 행/열 개수 조정:

```javascript
// 5행 x 20열 → 10행 x 15열로 변경
const rows = 10;
const cols = 15;
```

### 파워업 확률 조정

`Game` 클래스의 파워업 드롭 로직 수정:

```javascript
// 파워업 드롭 확률 (기본 30% → 50%로 변경)
if (Math.random() < 0.5) {
  // 파워업 생성
}
```

### 배경 이미지 변경

`assets/bg/` 폴더의 이미지를 교체하고 `game.js`에서 경로 수정

이미지 출처 : 제임스웹_용골자리성운 Level` 클래스에서 행/열 개수 조정:

출처 : https://science.nasa.gov/missions/webb/nasas-webb-reveals-cosmic-cliffs-glittering-landscape-of-star-birth/

```javascript
// 5행 x 20열 → 10행 x 15열로 변경
const rows = 10;
const cols = 15;
```

### 파워업 확률 조정

`Game` 클래스의 파워업 드롭 로직 수정:

```javascript
// 파워업 드롭 확률 (기본 30% → 50%로 변경)
if (Math.random() < 0.5) {
  // 파워업 생성
}
```

### 배경 이미지 변경

`assets/bg/` 폴더의 이미지를 교체하고 `game.js`에서 경로 수정

---

## 📝 향후 계획

- [ ] 보스 벽돌 추가
- [ ] 멀티 볼 파워업
- [ ] 리더보드 시스템
- [ ] 난이도 선택 기능
- [ ] 모바일 터치 지원
- [ ] 파티클 이펙트 추가

---

## 📄 라이선스

이 프로젝트는 교육 목적으로 제작되었습니다. 사운드 자료는 각 출처의 라이선스를 따릅니다.

---

## 👨‍💻 개발자

**Original Python Version** → **JavaScript Port**

---

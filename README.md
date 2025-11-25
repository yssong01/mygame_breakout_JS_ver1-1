# JS Breakout (Python Pygame → JavaScript 포팅)

Python(Pygame)으로 만들었던 벽돌깨기 게임을  
**HTML5 Canvas + 순수 JavaScript(OOP)** 로 옮긴 버전입니다.  
기존 Python 코드의 구조와 기능을 최대한 유지하면서,  
브라우저에서 바로 실행 가능한 교육용 예제로 구성했습니다.

## 핵심 특징

- **OOP 구조**
  - `SoundBank` : 효과음 / BGM 관리
  - `Paddle` : 패들 이동 + 길이 조절(P+/P- 파워업)
  - `Ball` : 공, 공격력(ATK) & 속도(Speed Up/Down) 제어
  - `Brick` : HP(1~9)를 가진 벽돌, 중앙에 HP 숫자 표기
  - `Level` : 5행 x 20열 정사각형 벽돌 배치
  - `PowerUp` : 공격력/속도/패들/슈팅 관련 아이템
  - `Bullet` : Shoot 모드에서 발사되는 총알
  - `Game` : 전체 게임 루프, 입력, 충돌 판정, HUD, 상태 관리

- **벽돌 & 레벨**
  - 5 x 20 그리드의 작은 정사각형 벽돌
  - 팔레트에서 랜덤 색상을 선택하고, HP에 따라 점점 어두워짐
  - Python 버전처럼 점수/게임오버/클리어 로직 유지

- **파워업**
  - `A+` : ATK 증가 (공/총알 공격력 +1)
  - `A-` : ATK 감소 (최소 1 보장)
  - `SU` : Speed Up (공 속도 +10%)
  - `SD` : Speed Down (공 속도 -5%)
  - `P+ / P-` : 패들 길이 확장 / 축소
  - `SH` : 일정 시간 동안 F 키로 연속 총알 발사 가능

- **조작법**
  - ← / → : 패들 이동
  - Space : 일시정지 / 재개
  - F : `SH` 파워업 상태에서 연사 (누르고 있는 동안)
  - 시작 시 공은 패들 위에 붙어 있다가,  
    ← 또는 → 입력 시 그 방향으로 발사됨

## 실행 방법

1. 이 레포지토리를 클론 또는 다운로드 합니다.
2. 구조 예시:
   - `index.html`
   - `game.js`
   - `assets/bg/용골자리성운.jpg`
   - `assets/bgm/Heroes_Tonight.mp3`
   - `assets/sfx/*.wav` (충돌, 파괴, 아이템, 발사 등)
3. VS Code에서 **Live Server** 또는 간단한 로컬 서버로 `index.html`을 실행합니다.
4. 브라우저에서 페이지 접속 후 **Start Game** 버튼을 클릭하면 플레이할 수 있습니다.

## 🎵 사운드 출처

- **효과음**
  - 출처: Pixabay – Royalty-free sound effects  
  - 용도: 충돌, 파괴, 아이템 획득, 발사 등 다양한 효과음

- **배경음악**
  - 곡명: *Heroes Tonight (feat. Johnning)*  
  - 아티스트: Janji, Johnning  
  - 레이블: NCS Release  
  - 링크: Audio.com

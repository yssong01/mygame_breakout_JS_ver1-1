/* 
  > Breakout-style 벽돌깨기 게임을 HTML5 Canvas + 순수 JavaScript로 구현한 코드입니다.
  > OOP 구조(Game / Paddle / Ball / Brick / Level / PowerUp / Bullet / SoundBank)로 구성되어 있습니다.
  > 5x20 랜덤 색상 벽돌과 HP(1~9)를 지원하며, HP에 따라 벽돌 색이 어두워집니다.
  > 파워업: ATK+/-, Speed Up/Down, Paddle 길이 확장/축소, Shoot(연사 모드)를 제공합니다.
  > 공은 처음에 패들 위에 붙어 있다가 ← / → 키 입력 시 발사됩니다.
  > Space: 일시정지/재개, F: Shoot 모드에서 연속 발사, ← →: 패들 이동입니다.
  > Python Pygame 버전에서 사용하던 BGM, 효과음 파일을 재활용합니다. 배경사진만 교체함.
  > 학습/연습을 위해 단일 game.js 파일로 작성되었으며, 수정과 확장이 쉽도록 구성되어 있습니다.
*/


// ─────────────────────────────
// 기본 캔버스/상수
// ─────────────────────────────
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

const startBtn = document.getElementById("startBtn");

// 파워업 타입 상수
const POWER_ATK_UP = "atk_up";
const POWER_ATK_DOWN = "atk_down";
const POWER_SHOOT = "shoot";
const POWER_SPD_UP = "spd_up";
const POWER_SPD_DOWN = "spd_down";
const POWER_PAD_EXPAND = "pad_expand";
const POWER_PAD_SHRINK = "pad_shrink";

// 벽돌 색상 팔레트 (랜덤 선택)
const BRICK_COLORS = [
  { r: 243, g: 156, b: 18 },  // 주황
  { r: 231, g: 76,  b: 60 },  // 빨강
  { r: 46,  g: 204, b: 113 }, // 초록
  { r: 52,  g: 152, b: 219 }, // 파랑
  { r: 155, g: 89,  b: 182 }, // 보라
  { r: 26,  g: 188, b: 156 }, // 민트
];

// ─────────────────────────────
// 사운드 담당 클래스
// ─────────────────────────────
class SoundBank {
  constructor() {
    // 효과음
    this.paddleThud = this.load("assets/sfx/paddle_thud.wav", 0.7);
    this.brickPing = this.load("assets/sfx/brick_ping.wav", 0.6);
    this.brickBreak = this.load("assets/sfx/brick_break.wav", 0.8);
    this.gameOver = this.load("assets/sfx/game_over.wav", 0.9);
    this.clearVictory = this.load("assets/sfx/clear_victory.wav", 0.9);
    this.itemGet = this.load("assets/sfx/item_get.wav", 0.8);
    this.shootFire = this.load("assets/sfx/shoot_fire.wav", 0.8);

    // 배경 음악
    this.bgm = new Audio("assets/bgm/Heroes_Tonight.mp3");
    this.bgm.loop = true;
    this.bgm.volume = 0.35;
  }

  load(path, volume = 1.0) {
    const a = new Audio(path);
    a.volume = volume;
    return a;
  }

  play(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  playBgm() {
    this.bgm.currentTime = 0;
    this.bgm.play().catch(() => {});
  }

  stopBgm() {
    this.bgm.pause();
  }
}

// ─────────────────────────────
// 패들 클래스
// ─────────────────────────────
class Paddle {
  constructor(x, y) {
    this.w = 110;
    this.h = 16;
    this.x = x - this.w / 2;
    this.y = y;
    this.speed = 420; // px/sec
  }

  update(dt, keys) {
    let vx = 0;
    if (keys.left) vx -= this.speed;
    if (keys.right) vx += this.speed;
    this.x += vx * dt;

    // 화면 밖으로 안 나가게
    if (this.x < 0) this.x = 0;
    if (this.x + this.w > WIDTH) this.x = WIDTH - this.w;
  }

  // 패들 폭 스케일 (확장/축소 공용)
  scaleWidth(factor) {
    const minW = 80;
    const maxW = 260;
    let newW = this.w * factor;
    newW = Math.max(minW, Math.min(maxW, newW));
    const center = this.x + this.w / 2;
    this.w = newW;
    this.x = center - this.w / 2;

    if (this.x < 0) this.x = 0;
    if (this.x + this.w > WIDTH) this.x = WIDTH - this.w;
  }

  draw(ctx) {
    ctx.fillStyle = "#4da3ff";
    ctx.fillRect(this.x, this.y, this.w, this.h);

    // 중앙에 텍스트
    ctx.fillStyle = "#fff9c4";
    ctx.font = "12px sans-serif";
    const text = "Enjoy JavaScript";
    const tw = ctx.measureText(text).width;
    ctx.fillText(text, this.x + this.w / 2 - tw / 2, this.y + this.h / 2 + 4);
  }

  get rect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}

// ─────────────────────────────
// 공 클래스 (damage + speed 변경 가능)
// ─────────────────────────────
class Ball {
  constructor(x, y) {
    this.r = 8;
    this.damage = 1;    // 벽돌/총알 공격력
    this.speed = 360 * 0.9; // ★ 초기 속도: 기존의 60%
    this.reset(x, y);
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    const dirX = 0.7;
    const dirY = -1;
    this.dx = dirX * this.speed;
    this.dy = dirY * this.speed;
  }

  // 스피드를 factor 배로 조절
  changeSpeed(factor) {
    this.speed *= factor;
    const len = Math.hypot(this.dx, this.dy);
    if (len > 0) {
      const dirX = this.dx / len;
      const dirY = this.dy / len;
      this.dx = dirX * this.speed;
      this.dy = dirY * this.speed;
    }
  }

  update(dt) {
    this.x += this.dx * dt;
    this.y += this.dy * dt;

    // 좌우 벽
    if (this.x - this.r < 0 && this.dx < 0) {
      this.x = this.r;
      this.dx *= -1;
    }
    if (this.x + this.r > WIDTH && this.dx > 0) {
      this.x = WIDTH - this.r;
      this.dx *= -1;
    }
    // 천장
    if (this.y - this.r < 0 && this.dy < 0) {
      this.y = this.r;
      this.dy *= -1;
    }
  }

  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.closePath();
  }

  get rect() {
    return {
      x: this.x - this.r,
      y: this.y - this.r,
      w: this.r * 2,
      h: this.r * 2,
    };
  }
}

// ─────────────────────────────
// 벽돌 / 레벨 (5행 20열, 랜덤 색상, HP 1~9)
// ─────────────────────────────
class Brick {
  constructor(x, y, w, h, hp = 1) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.maxHp = hp;
    this.hp = hp;
    this.alive = true;

    const color =
      BRICK_COLORS[Math.floor(Math.random() * BRICK_COLORS.length)];
    this.baseR = color.r;
    this.baseG = color.g;
    this.baseB = color.b;
  }

  hit(damage) {
    this.hp -= Math.max(1, damage);
    if (this.hp <= 0) {
      this.hp = 0;
      this.alive = false;
      return true; // 파괴됨
    }
    return false; // 아직 살아있음
  }

  draw(ctx) {
    if (!this.alive) return;

    // HP 비율에 따라 색 살짝 어둡게
    const ratio = this.hp / this.maxHp;
    const r = Math.floor(this.baseR * ratio);
    const g = Math.floor(this.baseG * ratio);
    const b = Math.floor(this.baseB * ratio);

    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(this.x, this.y, this.w, this.h);
    ctx.strokeStyle = "#222";
    ctx.strokeRect(this.x, this.y, this.w, this.h);

    // 중앙에 HP 숫자 표시
    ctx.fillStyle = "#111";
    ctx.font = "14px bold sans-serif";
    const text = String(this.hp);
    const tw = ctx.measureText(text).width;
    const th = 10;
    ctx.fillText(
      text,
      this.x + this.w / 2 - tw / 2,
      this.y + this.h / 2 + th / 2
    );
  }

  get rect() {
    return { x: this.x, y: this.y, w: this.w, h: this.h };
  }
}

class Level {
  constructor() {
    this.rows = 5;   // 5행
    this.cols = 20;  // 20열

    // 작은 정사각형 벽돌
    this.brickSize = 26;
    this.brickWidth = this.brickSize;
    this.brickHeight = this.brickSize;

    this.padding = 6;
    this.offsetTop = 80;

    const totalWidth =
      this.cols * (this.brickWidth + this.padding) - this.padding;
    this.offsetLeft = (WIDTH - totalWidth) / 2;

    this.bricks = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = this.offsetLeft + c * (this.brickWidth + this.padding);
        const y = this.offsetTop + r * (this.brickHeight + this.padding);

        // HP 1~9 랜덤
        const hp = 1 + Math.floor(Math.random() * 9);

        this.bricks.push(
          new Brick(x, y, this.brickWidth, this.brickHeight, hp)
        );
      }
    }
  }

  draw(ctx) {
    this.bricks.forEach((b) => b.draw(ctx));
  }

  get aliveCount() {
    return this.bricks.filter((b) => b.alive).length;
  }
}

// ─────────────────────────────
// PowerUp / Bullet
// ─────────────────────────────
class PowerUp {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type; // POWER_XXXX
    this.size = 24;
    this.speed = 160;
  }

  update(dt) {
    this.y += this.speed * dt;
  }

  draw(ctx) {
    let color = "#e91e63";
    let symbol = "A+";

    switch (this.type) {
      case POWER_ATK_UP:
        color = "#e91e63";
        symbol = "A+";
        break;
      case POWER_ATK_DOWN:
        color = "#9c27b0";
        symbol = "A-";
        break;
      case POWER_SHOOT:
        color = "#90caf9";
        symbol = "SH";
        break;
      case POWER_SPD_UP:
        color = "#4caf50";
        symbol = "SU";
        break;
      case POWER_SPD_DOWN:
        color = "#ff9800";
        symbol = "SD";
        break;
      case POWER_PAD_EXPAND:
        color = "#00bcd4";
        symbol = "P+";
        break;
      case POWER_PAD_SHRINK:
        color = "#ffc107";
        symbol = "P-";
        break;
    }

    const half = this.size / 2;
    ctx.fillStyle = color;
    ctx.fillRect(this.x - half, this.y - half, this.size, this.size);
    ctx.strokeStyle = "#222";
    ctx.strokeRect(this.x - half, this.y - half, this.size, this.size);

    ctx.fillStyle = "#000";
    ctx.font = "12px bold sans-serif";
    const tw = ctx.measureText(symbol).width;
    ctx.fillText(symbol, this.x - tw / 2, this.y + 4);
  }

  get rect() {
    const half = this.size / 2;
    return { x: this.x - half, y: this.y - half, w: this.size, h: this.size };
  }
}

class Bullet {
  constructor(x, y, damage = 1) {
    this.x = x;
    this.y = y;
    this.w = 4;
    this.h = 14;
    this.speed = 700;
    this.damage = damage;
  }

  update(dt) {
    this.y -= this.speed * dt;
  }

  draw(ctx) {
    ctx.fillStyle = "#fff59d";
    ctx.fillRect(this.x - this.w / 2, this.y - this.h, this.w, this.h);
  }

  get rect() {
    return {
      x: this.x - this.w / 2,
      y: this.y - this.h,
      w: this.w,
      h: this.h,
    };
  }
}

// ─────────────────────────────
// Game 클래스 (Space: pause, F 연사, 공 패들에 붙어서 시작)
// ─────────────────────────────
class Game {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    // fire 키 추가
    this.keys = { left: false, right: false, fire: false };
    this.sound = new SoundBank();

    // 배경 이미지
    this.bg = new Image();
    this.bgLoaded = false;
    this.bg.onload = () => (this.bgLoaded = true);
    this.bg.src = "assets/bg/용골자리성운.jpg";

    // POWERUP / BULLET 관련
    this.powerups = [];
    this.bullets = [];
    this.canShoot = false;
    this.shootTimer = 0;      // SHOOT 남은 시간
    this.shootCooldown = 0;   // 다음 발사까지 쿨다운

    // 일시정지 상태
    this.paused = false;

    // 공이 패들에 붙어 있는지 여부
    this.ballStuck = true;

    this.reset();

    // 루프용 타임스탬프/바인딩
    this.lastTime = 0;
    this.loop = this.loop.bind(this);

    // 키보드 입력 등록
    document.addEventListener("keydown", (e) => this.onKeyDown(e));
    document.addEventListener("keyup", (e) => this.onKeyUp(e));

    this.running = false;
  }

  reset() {
    this.level = new Level();
    this.paddle = new Paddle(WIDTH / 2, HEIGHT - 40);
    this.ball = new Ball(WIDTH / 2, HEIGHT - 70);
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.cleared = false;

    this.powerups = [];
    this.bullets = [];
    this.canShoot = false;
    this.shootTimer = 0;
    this.shootCooldown = 0;

    // 재시작 시 일시정지 해제 + 공 다시 패들에 붙이기
    this.paused = false;
    this.ballStuck = true;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.sound.playBgm();
    requestAnimationFrame(this.loop);
  }

  onKeyDown(e) {
    if (e.key === "ArrowLeft") {
      this.keys.left = true;
    } else if (e.key === "ArrowRight") {
      this.keys.right = true;
    } else if (e.key === "f" || e.key === "F") {
      // 누르고 있는 동안 연사 (update에서 처리)
      this.keys.fire = true;
    } else if (e.code === "Space") {
      // Space : pause 토글
      e.preventDefault(); // 페이지 스크롤 방지
      if (!this.gameOver && !this.cleared) {
        this.paused = !this.paused;
      }
    }
  }

  onKeyUp(e) {
    if (e.key === "ArrowLeft") this.keys.left = false;
    if (e.key === "ArrowRight") this.keys.right = false;
    if (e.key === "f" || e.key === "F") this.keys.fire = false;
  }

  loop(timestamp) {
    if (!this.running) return;
    const dt = (timestamp - this.lastTime) / 1000;
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame(this.loop);
  }

  // ── POWERUP 관련 유틸 ─────────────────────
  spawnPowerUp(x, y) {
    // 여러 타입을 weight 개념으로 섞어서 랜덤
    const pool = [
      POWER_ATK_UP, POWER_ATK_UP, POWER_ATK_UP,
      POWER_ATK_DOWN,
      POWER_SHOOT, POWER_SHOOT,
      POWER_SPD_UP, POWER_SPD_UP,
      POWER_SPD_DOWN,
      POWER_PAD_EXPAND, POWER_PAD_EXPAND,
      POWER_PAD_SHRINK,
    ];
    const type = pool[Math.floor(Math.random() * pool.length)];
    this.powerups.push(new PowerUp(x, y, type));
  }

  applyPowerUp(p) {
    switch (p.type) {
      case POWER_ATK_UP:
        this.ball.damage += 1;
        break;
      case POWER_ATK_DOWN:
        this.ball.damage = Math.max(1, this.ball.damage - 1);
        break;
      case POWER_SHOOT:
        this.canShoot = true;
        this.shootTimer = Math.max(this.shootTimer, 10); // 10초 유지
        break;
      case POWER_SPD_UP:
        this.ball.changeSpeed(1.1); // +10%
        break;
      case POWER_SPD_DOWN:
        this.ball.changeSpeed(0.95); // -5%
        break;
      case POWER_PAD_EXPAND:
        this.paddle.scaleWidth(1.3);
        break;
      case POWER_PAD_SHRINK:
        this.paddle.scaleWidth(0.8);
        break;
    }
    this.sound.play(this.sound.itemGet); // 아이템 획득 효과음
  }

  fireBullet() {
    if (!this.canShoot) return;
    if (this.gameOver || this.cleared) return;
    if (this.shootCooldown > 0) return;

    const bx = this.paddle.x + this.paddle.w / 2;
    const by = this.paddle.y;
    // 공 공격력과 동일한 데미지의 총알
    this.bullets.push(new Bullet(bx, by, this.ball.damage));
    this.shootCooldown = 0.25; // 0.25초 쿨다운
    this.sound.play(this.sound.shootFire); // 총알 발사 효과음
  }

  // 공 발사 (dirSign: -1 왼쪽, +1 오른쪽)
  launchBall(dirSign) {
    const dirX = dirSign * 0.7;
    const dirY = -1;
    const len = Math.hypot(dirX, dirY);
    this.ball.dx = (dirX / len) * this.ball.speed;
    this.ball.dy = (dirY / len) * this.ball.speed;
    this.ballStuck = false;
  }

  // ── 업데이트 로직 ──────────────────────────
  update(dt) {
    // 게임오버/클리어일 때는 멈춤, 일시정지는 여기서 처리
    if (this.gameOver || this.cleared || this.paused) return;

    // 패들은 항상 키 입력에 따라 움직임
    this.paddle.update(dt, this.keys);

    // 공이 패들에 붙어 있는 상태 처리
    if (this.ballStuck) {
      // 패들 위에 공을 고정
      this.ball.x = this.paddle.x + this.paddle.w / 2;
      this.ball.y = this.paddle.y - this.ball.r - 2;

      // 아무 좌/우 방향키를 누르면 해당 방향으로 발사
      if (this.keys.left) {
        this.launchBall(-1);
        return;
      } else if (this.keys.right) {
        this.launchBall(+1);
        return;
      }
      // 아직 발사 안 했으면 여기서 종료
      return;
    }

    // 여기까지 왔다는 것은 이미 공이 발사된 상태
    this.ball.update(dt);

    // SHOOT 타이머/쿨다운 감소
    if (this.canShoot) {
      this.shootTimer -= dt;
      if (this.shootTimer <= 0) {
        this.canShoot = false;
        this.shootTimer = 0;
      }
    }
    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }

    // F 키를 누르고 있고, SHOOT 가능하면 자동 연사
    if (this.canShoot && this.keys.fire && this.shootCooldown <= 0) {
      this.fireBullet();
    }

    // 패들과 충돌
    if (
      this.checkRectCollision(this.ball.rect, this.paddle.rect) &&
      this.ball.dy > 0
    ) {
      this.ball.dy *= -1;
      const center = this.paddle.x + this.paddle.w / 2;
      const diff = (this.ball.x - center) / (this.paddle.w / 2);
      this.ball.dx = diff * this.ball.speed;
      this.sound.play(this.sound.paddleThud);
    }

    // 벽돌과 충돌 (공)
    for (const b of this.level.bricks) {
      if (!b.alive) continue;
      if (this.checkRectCollision(this.ball.rect, b.rect)) {
        this.ball.dy *= -1;
        const destroyed = b.hit(this.ball.damage);
        this.score += 10;

        if (destroyed) {
          this.sound.play(this.sound.brickBreak);
          // 파괴 시 일정 확률(40%)로 파워업 드랍
          if (Math.random() < 0.4) {
            this.spawnPowerUp(b.x + b.w / 2, b.y + b.h / 2);
          }
        } else {
          this.sound.play(this.sound.brickPing);
        }
      }
    }

    // Bullet 업데이트 & 벽돌 충돌
    this.bullets = this.bullets.filter((bullet) => {
      bullet.update(dt);
      if (bullet.y + bullet.h < 0) return false; // 화면 위로 나감

      for (const b of this.level.bricks) {
        if (!b.alive) continue;
        if (this.checkRectCollision(bullet.rect, b.rect)) {
          const destroyed = b.hit(bullet.damage);
          this.score += 10;

          if (destroyed) {
            this.sound.play(this.sound.brickBreak);
            // 총알로 파괴해도 25% 확률로 파워업
            if (Math.random() < 0.25) {
              this.spawnPowerUp(b.x + b.w / 2, b.y + b.h / 2);
            }
          } else {
            this.sound.play(this.sound.brickPing);
          }
          return false; // 총알 삭제
        }
      }
      return true; // 남겨두기
    });

    // PowerUp 업데이트 & 획득 처리
    this.powerups = this.powerups.filter((p) => {
      p.update(dt);
      if (p.y - p.size / 2 > HEIGHT) return false; // 화면 아래로 나감
      if (this.checkRectCollision(p.rect, this.paddle.rect)) {
        this.applyPowerUp(p);
        return false;
      }
      return true;
    });

    // 바닥으로 떨어졌는지 확인
    if (this.ball.y - this.ball.r > HEIGHT) {
      this.lives -= 1;
      if (this.lives <= 0) {
        this.gameOver = true;
        this.sound.stopBgm();
        this.sound.play(this.sound.gameOver);
      } else {
        // 공/패들만 소프트 리셋 + 다시 패들에 붙이기
        this.paddle = new Paddle(WIDTH / 2, HEIGHT - 40);
        this.ball.reset(WIDTH / 2, HEIGHT - 70);
        this.ballStuck = true;
      }
    }

    // 스테이지 클리어
    if (!this.gameOver && this.level.aliveCount === 0) {
      this.cleared = true;
      this.sound.stopBgm();
      this.sound.play(this.sound.clearVictory);
    }
  }

  checkRectCollision(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  // ── 그리기 ─────────────────────────────
  draw() {
    // 배경
    if (this.bgLoaded) {
      this.ctx.drawImage(this.bg, 0, 0, WIDTH, HEIGHT);
      this.ctx.fillStyle = "rgba(0,0,0,0.35)";
      this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    } else {
      this.ctx.fillStyle = "#000";
      this.ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }

    this.level.draw(this.ctx);
    this.powerups.forEach((p) => p.draw(this.ctx));
    this.bullets.forEach((b) => b.draw(this.ctx));
    this.paddle.draw(this.ctx);
    this.ball.draw(this.ctx);

    // ── HUD ─────────────────────────────
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "18px sans-serif";

    // 왼쪽 상단: Score, Lives, ATK, Shoot
    let x = 16;
    const yTop = 26;
    const gap = 50;

    // ... Score / Lives / ATK / Shoot 그리는 코드 ...
    const shootLabel = this.canShoot
      ? `Shoot: ON (${Math.ceil(this.shootTimer)}s)`
      : "Shoot: OFF";

    const items = [
      `Score: ${this.score}`,
      `Lives: ${this.lives}`,
      `ATK: ${this.ball.damage}`,
      shootLabel,
    ];

    for (const text of items) {
      this.ctx.fillText(text, x, yTop);
      x += this.ctx.measureText(text).width + gap;
    }

    // 오른쪽 상단: 조작 설명
    const helpText = "Space: Pause  |  F: Shoot  |  ← →: Move";
    this.ctx.font = "14px sans-serif";
    const wHelp = this.ctx.measureText(helpText).width;
    const helpX = WIDTH - wHelp - 16;
    const helpY = yTop; //48;
    this.ctx.fillText(helpText, helpX, helpY);

    // 상태 메시지
    if (this.gameOver) {
      this.drawCenterText("GAME OVER", "Press F5 to restart");
    } else if (this.cleared) {
      this.drawCenterText("STAGE CLEAR!", "Press F5 to play again");
    } else if (this.paused) {
      this.drawCenterText("PAUSED", "Press Space to resume");
    }

    // 하단 BGM 제목
    this.ctx.font = "14px italic";
    this.ctx.fillStyle = "#c5cae9";
    const msg = "Song : Heroes Tonight - Lyrics";
    const wMsg = this.ctx.measureText(msg).width;
    this.ctx.fillText(msg, WIDTH / 2 - wMsg / 2, HEIGHT - 14);
  }

  drawCenterText(main, sub) {
    this.ctx.fillStyle = "#ffffff";
    this.ctx.font = "40px sans-serif";
    const w1 = this.ctx.measureText(main).width;
    this.ctx.fillText(main, WIDTH / 2 - w1 / 2, HEIGHT / 2 - 20);

    this.ctx.font = "18px sans-serif";
    const w2 = this.ctx.measureText(sub).width;
    this.ctx.fillText(sub, WIDTH / 2 - w2 / 2, HEIGHT / 2 + 16);
  }
}

// ─────────────────────────────
// 실제 게임 시작
// ─────────────────────────────
const game = new Game(canvas, ctx);

startBtn.addEventListener("click", () => {
  game.start();
  startBtn.disabled = true;
  startBtn.textContent = "Playing...";
});

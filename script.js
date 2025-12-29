// --- 基礎設定 ---
const mottos = [
  "你沒有被落下。",
  "與其埋怨別人，不如把人埋了。",
  "還撐得住。",
  "急也沒比較快。",
  "一切都是最好的安排"
];
let fishCount = 0;
let cookProgress = 0;
const maxProgress = 5;
let isPlaying = false;
let isRainy = Math.random() > 0.5; // 隨機決定天氣

// --- Canvas 初始化 ---
const canvas = document.getElementById("fireCanvas");
const ctx = canvas.getContext("2d");
const rainCanvas = document.getElementById("rainCanvas");
const rainCtx = rainCanvas.getContext("2d");
let particles = [];
let raindrops = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  rainCanvas.width = window.innerWidth;
  rainCanvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --- 煙霧粒子系統 ---
class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = canvas.width / 2 - 110 + (Math.random() * 40 - 20);
    this.y = canvas.height * 0.78;
    this.size = Math.random() * 10 + 5;
    this.speedY = Math.random() * -0.6 - 0.3;
    this.speedX = (Math.random() - 0.5) * 0.4;
    this.angle = Math.random() * Math.PI * 2;
    this.maxLife = Math.random() * 200 + 150;
    this.life = this.maxLife;
    this.color = { r: 245, g: 245, b: 240 };
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX + Math.sin(this.angle) * 0.4;
    this.angle += 0.02;
    this.life--;
    this.size += 0.25;
    if (this.life <= 0) this.reset();
  }
  draw() {
    const ratio = this.life / this.maxLife;
    const opacity = Math.pow(ratio, 2) * 0.08;
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    let grad = ctx.createRadialGradient(
      this.x,
      this.y,
      0,
      this.x,
      this.y,
      this.size
    );
    grad.addColorStop(
      0,
      `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${opacity})`
    );
    grad.addColorStop(
      0.5,
      `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${
        opacity * 0.3
      })`
    );
    grad.addColorStop(
      1,
      `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`
    );
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(
      this.x,
      this.y,
      this.size * 1.3,
      this.size * 0.8,
      this.angle * 0.1,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();
  }
}

// --- 下雨系統 ---
class RainDrop {
  constructor() {
    this.x = Math.random() * rainCanvas.width;
    this.y = Math.random() * rainCanvas.height;
    this.length = Math.random() * 20 + 10;
    this.speed = Math.random() * 10 + 10;
    this.opacity = Math.random() * 0.3;
  }
  update() {
    this.y += this.speed;
    if (this.y > rainCanvas.height) {
      this.y = -this.length;
      this.x = Math.random() * rainCanvas.width;
    }
  }
  draw() {
    rainCtx.strokeStyle = `rgba(174, 194, 224, ${this.opacity})`;
    rainCtx.lineWidth = 1;
    rainCtx.beginPath();
    rainCtx.moveTo(this.x, this.y);
    rainCtx.lineTo(this.x, this.y + this.length);
    rainCtx.stroke();
  }
}

// 初始化
for (let i = 0; i < 100; i++) particles.push(new Particle());
if (isRainy) {
  for (let i = 0; i < 150; i++) raindrops.push(new RainDrop());
}

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });

  if (isRainy) {
    rainCtx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
    raindrops.forEach((r) => {
      r.update();
      r.draw();
    });
  }
  requestAnimationFrame(animate);
}
animate();

// --- 遊戲邏輯 ---
function startGame(name) {
  document.getElementById("selection").classList.add("hidden");
  document.getElementById("main-scene").classList.remove("hidden");

  if (isRainy) {
    document.body.classList.add("rainy-day");
    document.getElementById("weather-text").innerText = "雨";
  } else {
    document.getElementById("weather-text").innerText = "晴";
  }

  initEnvironment();

  const bgMusic = document.getElementById("bg-music");
  const fireSound = document.getElementById("fire-sound");
  const playBtn = document.getElementById("play-btn");

  if (bgMusic && fireSound) {
    bgMusic.volume = isRainy ? 0.2 : 0.4; // 雨天背景音樂小聲點
    fireSound.volume = 0.8;
    bgMusic.play().catch((e) => console.log("播放受阻"));
    fireSound.play();
    isPlaying = true;
    playBtn.innerHTML = " 🔊 ";
    playBtn.style.background = "#444444";
    playBtn.style.color = "#444444";
  }
}

function initEnvironment() {
  const distantContainer = document.getElementById("distant-lights");
  if (distantContainer) {
    for (let i = 0; i < 15; i++) {
      let dot = document.createElement("div");
      dot.className = "distant-dot";
      dot.style.left = Math.random() * 100 + "%";
      dot.style.top = 45 + Math.random() * 5 + "%";
      distantContainer.appendChild(dot);
    }
  }
  setInterval(() => {
    const m = document.getElementById("motto");
    if (m) {
      m.style.opacity = 0;
      setTimeout(() => {
        m.innerText = mottos[Math.floor(Math.random() * mottos.length)];
        m.style.opacity = 1;
      }, 1000);
    }
  }, 6000);
}

function handleInteraction() {
  const poses = ["發呆", "翻魚", "伸懶腰", "換個姿勢"];
  const bubble = document.querySelector(".status-bubble");
  const fishImg = document.getElementById("fish-img");
  const fishRaw = document.getElementById("fish-raw");

  if (cookProgress === -1) return;
  bubble.innerText = poses[Math.floor(Math.random() * poses.length)];
  cookProgress++;

  let ratio = cookProgress / maxProgress;
  if (fishImg && fishRaw) {
    fishImg.style.opacity = ratio;
    fishRaw.style.opacity = 1 - ratio;
  }

  if (cookProgress === maxProgress) {
    bubble.innerText = "烤熟了！好香";
    fishCount++;
    document.getElementById("count").innerText = fishCount;
    cookProgress = -1;
    setTimeout(() => {
      cookProgress = 0;
      if (fishImg && fishRaw) {
        fishImg.style.opacity = 0;
        fishRaw.style.opacity = 1;
      }
      bubble.innerText = "換下一隻...";
    }, 1500);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const playBtn = document.getElementById("play-btn");
  const bgMusic = document.getElementById("bg-music");
  const fireSound = document.getElementById("fire-sound");

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (!isPlaying) {
        bgMusic.play();
        fireSound.play();
        playBtn.innerHTML = " 🔊 ";
        playBtn.style.background = "#444444";
        isPlaying = true;
      } else {
        bgMusic.pause();
        fireSound.pause();
        playBtn.innerHTML = " 🔇 ";
        playBtn.style.background = "#44444499";
        isPlaying = false;
      }
    });
  }
});

setTimeout(() => {
  const intro = document.getElementById("intro");
  if (intro) intro.classList.add("hidden");
  setTimeout(() => {
    const selection = document.getElementById("selection");
    if (selection) selection.classList.remove("hidden");
  }, 1500);
}, 3000);
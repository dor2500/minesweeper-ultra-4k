// High-Performance Hardware Accelerated Canvas Particle & Confetti Engine
// Supports 4K displays, screen-shake, explosion bursts, and victory confetti.

class ParticleSystem {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationFrame = null;
    this.shakeIntensity = 0;
  }

  init(container) {
    if (this.canvas) return;
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'minesweeper-particle-canvas';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '9999';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.loop();
  }

  resize() {
    if (!this.canvas) return;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  loop() {
    const update = () => {
      if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.alpha -= p.decay;
          p.rotation += p.vRot || 0;

          if (p.alpha <= 0) {
            this.particles.splice(i, 1);
            continue;
          }

          this.ctx.save();
          this.ctx.globalAlpha = Math.max(0, p.alpha);
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation);

          if (p.type === 'confetti') {
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          } else if (p.type === 'spark') {
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            this.ctx.fill();
          } else if (p.type === 'shockwave') {
            p.radius += p.speed;
            this.ctx.strokeStyle = p.color;
            this.ctx.lineWidth = p.lineWidth * p.alpha;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
            this.ctx.stroke();
          }

          this.ctx.restore();
        }
      }

      this.animationFrame = requestAnimationFrame(update);
    };
    this.animationFrame = requestAnimationFrame(update);
  }

  // Trigger grand victory confetti explosion
  confetti() {
    this.init();
    const colors = ['#00e5ff', '#ff007f', '#ffe600', '#00ff66', '#9d00ff', '#ff3d00'];
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 3;

    for (let i = 0; i < 180; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      this.particles.push({
        type: 'confetti',
        x: centerX + (Math.random() - 0.5) * 60,
        y: centerY + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 6,
        gravity: 0.25,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 8 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.012 + 0.006,
      });
    }
  }

  // Trigger high-tech explosion with screen-shake
  explosion(x, y) {
    this.init();
    const colors = ['#ff1744', '#ff5722', '#ff9800', '#ffd600', '#fff'];

    // Shockwave ring
    this.particles.push({
      type: 'shockwave',
      x: x || window.innerWidth / 2,
      y: y || window.innerHeight / 2,
      vx: 0,
      vy: 0,
      gravity: 0,
      radius: 5,
      speed: 7,
      lineWidth: 4,
      color: '#ff3d00',
      alpha: 1,
      decay: 0.035,
    });

    // Sparks
    for (let i = 0; i < 70; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 2;
      this.particles.push({
        type: 'spark',
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.15,
        rotation: 0,
        size: Math.random() * 3.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.03 + 0.015,
      });
    }

    // Screen Shake effect
    this.triggerScreenShake();
  }

  // Defused / Shield deflect animation
  shieldDeflect(x, y) {
    this.init();
    this.particles.push({
      type: 'shockwave',
      x: x || window.innerWidth / 2,
      y: y || window.innerHeight / 2,
      vx: 0,
      vy: 0,
      gravity: 0,
      radius: 10,
      speed: 6,
      lineWidth: 5,
      color: '#00e5ff',
      alpha: 1,
      decay: 0.03,
    });

    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        type: 'spark',
        x: x || window.innerWidth / 2,
        y: y || window.innerHeight / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        gravity: 0.05,
        rotation: 0,
        size: Math.random() * 3 + 1,
        color: '#00e5ff',
        alpha: 1,
        decay: 0.025,
      });
    }
  }

  triggerScreenShake() {
    const root = document.getElementById('root') || document.body;
    root.classList.add('screen-shake');
    setTimeout(() => {
      root.classList.remove('screen-shake');
    }, 450);
  }
}

export const particles = new ParticleSystem();


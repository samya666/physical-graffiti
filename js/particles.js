// Ambient Gaslight Embers & Incense Mist Canvas Engine
class GothicAtmosphere {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 65;
    this.mouse = { x: -1000, y: -1000, radius: 120 };

    this.resize();
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    this.init();
    this.animate();
  }

  resize() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.maxParticles; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: Math.random() * 2.5 + 0.8,
      speedY: -(Math.random() * 0.6 + 0.2),
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.1,
      fadeRate: Math.random() * 0.003 + 0.001,
      color: Math.random() > 0.35 
        ? { r: 245, g: 180, b: 60 } // Warm gaslight amber
        : { r: 180, g: 140, b: 100 } // Incense dust
    };
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // Float upwards with gentle sway
      p.y += p.speedY;
      p.x += p.speedX + Math.sin(p.y * 0.01) * 0.25;

      // Mouse repulsion
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.mouse.radius) {
        const angle = Math.atan2(dy, dx);
        p.x -= Math.cos(angle) * 1.5;
        p.y -= Math.sin(angle) * 1.5;
      }

      // Draw glowing ember
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.opacity})`;
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.5)`;
      this.ctx.fill();

      // Reset when particle floats off screen
      if (p.y < -10 || p.x < -10 || p.x > this.width + 10) {
        this.particles[i] = this.createParticle();
        this.particles[i].y = this.height + 10;
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GothicAtmosphere('atmosphere-canvas');
});

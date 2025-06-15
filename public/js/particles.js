// Particle system for enhanced visual effects
class ParticleSystem {
  constructor() {
    this.particles = []
    this.canvas = null
    this.ctx = null
    this.init()
  }

  init() {
    this.canvas = document.createElement("canvas")
    this.canvas.style.position = "fixed"
    this.canvas.style.top = "0"
    this.canvas.style.left = "0"
    this.canvas.style.width = "100%"
    this.canvas.style.height = "100%"
    this.canvas.style.pointerEvents = "none"
    this.canvas.style.zIndex = "-1"
    document.body.appendChild(this.canvas)

    this.ctx = this.canvas.getContext("2d")
    this.resize()

    window.addEventListener("resize", () => this.resize())
    this.createParticles()
    this.animate()
  }

  resize() {
    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight
  }

  createParticles() {
    for (let i = 0; i < 50; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: this.getRandomColor(),
      })
    }
  }

  getRandomColor() {
    const colors = ["#FFD700", "#4A90E2", "#9B59B6", "#74C2A8", "#FF6B35"]
    return colors[Math.floor(Math.random() * colors.length)]
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.particles.forEach((particle) => {
      particle.x += particle.speedX
      particle.y += particle.speedY

      // Wrap around screen
      if (particle.x > this.canvas.width) particle.x = 0
      if (particle.x < 0) particle.x = this.canvas.width
      if (particle.y > this.canvas.height) particle.y = 0
      if (particle.y < 0) particle.y = this.canvas.height

      // Draw particle
      this.ctx.beginPath()
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
      this.ctx.fillStyle = particle.color
      this.ctx.globalAlpha = particle.opacity
      this.ctx.fill()
    })

    this.ctx.globalAlpha = 1
    requestAnimationFrame(() => this.animate())
  }
}

// Initialize particle system on landing page
if (document.body.classList.contains("landing-page")) {
  new ParticleSystem()
}

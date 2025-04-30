document.addEventListener("DOMContentLoaded", () => {
    // Start button transition
    document.getElementById("startSimulationBtn").addEventListener("click", function (e) {
      e.preventDefault()
      document.body.classList.add("fade-out")
      setTimeout(() => {
        window.location.href = this.href
      }, 1000) // Match the animation duration
    })
  
    // Create particle effect
    createParticles()
  })
  
  function createParticles() {
    const particlesContainer = document.getElementById("particles")
    const particleCount = 50
  
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div")
      particle.classList.add("particle")
  
      // Random position
      const posX = Math.random() * 100
      const posY = Math.random() * 100
  
      // Random size
      const size = Math.random() * 3 + 1
  
      // Random color
      const colors = ["#00ffff", "#ff00ff", "#ffff00"]
      const color = colors[Math.floor(Math.random() * colors.length)]
  
      // Random opacity
      const opacity = Math.random() * 0.5 + 0.1
  
      // Set styles
      particle.style.cssText = `
              position: absolute;
              top: ${posY}%;
              left: ${posX}%;
              width: ${size}px;
              height: ${size}px;
              background-color: ${color};
              border-radius: 50%;
              opacity: ${opacity};
              box-shadow: 0 0 ${size * 2}px ${color};
              pointer-events: none;
          `
  
      // Add animation
      const duration = Math.random() * 20 + 10
      const delay = Math.random() * 5
  
      particle.animate(
        [
          { transform: "translateY(0) rotate(0deg)" },
          {
            transform: `translateY(${Math.random() > 0.5 ? "-" : ""}${Math.random() * 100 + 50}px) rotate(${Math.random() * 360}deg)`,
          },
        ],
        {
          duration: duration * 1000,
          delay: delay * 1000,
          iterations: Number.POSITIVE_INFINITY,
          direction: "alternate",
          easing: "ease-in-out",
        },
      )
  
      particlesContainer.appendChild(particle)
    }
  }
  
  // Add typing animation to the title
  setTimeout(() => {
    const title = document.querySelector("h1")
    const text = title.textContent
    title.textContent = ""
  
    let i = 0
    const typeWriter = () => {
      if (i < text.length) {
        title.textContent += text.charAt(i)
        i++
        setTimeout(typeWriter, 50)
      }
    }
  
    typeWriter()
  }, 500)
  
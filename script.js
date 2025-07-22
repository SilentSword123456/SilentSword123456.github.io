setInterval(() => {
    // Pick a random particle (1-5)
    const randomParticle = Math.floor(Math.random() * 5) + 1;
    const particle = document.querySelector(`.particle:nth-child(${randomParticle})`);
    
    // Trigger animation by adding/removing a class
    particle.classList.remove('fire');
    setTimeout(() => particle.classList.add('fire'), 10);
}, 1200);
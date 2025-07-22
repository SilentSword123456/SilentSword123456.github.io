// Track which particles are currently animating
const particleStates = [false, false, false, false, false]; // all particles start as available

function animateParticle() {
    // Find available particles (not currently animating)
    const availableParticles = [];
    for (let i = 0; i < 5; i++) {
        if (!particleStates[i]) {
            availableParticles.push(i + 1); // particle numbers are 1-5
        }
    }

    // If we have available particles, pick one randomly
    if (availableParticles.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableParticles.length);
        const particleNumber = availableParticles[randomIndex];
        const particle = document.querySelector(`.particle:nth-child(${particleNumber})`);

        if (particle) {
            // Mark this particle as busy
            particleStates[particleNumber - 1] = true;

            // Remove any existing animation class and trigger reflow
            particle.classList.remove('animate');
            particle.offsetHeight; // Trigger reflow

            // Add the animation class
            particle.classList.add('animate');

            // Mark as available again after animation completes (5 seconds)
            setTimeout(() => {
                particleStates[particleNumber - 1] = false;
                particle.classList.remove('animate');
            }, 5000);
        }
    }
}

// Start the random particle animation after a short delay
setTimeout(() => {
    animateParticle(); // Fire first particle immediately
    setInterval(animateParticle, 2500); // Then continue every 2.5 seconds
}, 500); // Small initial delay to let page settle
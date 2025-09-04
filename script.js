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

// Custom Cursor Trail
const cursorTrail = document.getElementById('cursor-trail');
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    if (cursorTrail) {
        cursorTrail.style.left = mouseX - 10 + 'px';
        cursorTrail.style.top = mouseY - 10 + 'px';
    }
});

// Typing Effect
function typeText(element, text, speed = 100) {
    element.textContent = '';
    let i = 0;
    const timer = setInterval(() => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, speed);
}

// Initialize typing effect
document.addEventListener('DOMContentLoaded', () => {
    const typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        const text = typingElement.getAttribute('data-text');
        setTimeout(() => {
            typeText(typingElement, text, 80);
        }, 1000);
    }
});

// Navigation System
const navCommands = document.querySelectorAll('.nav-command');
const contentSections = document.querySelectorAll('.content-section');

// Initially hide all sections
contentSections.forEach(section => {
    section.style.display = 'none';
});

navCommands.forEach(command => {
    command.addEventListener('click', () => {
        const targetSection = command.getAttribute('data-section');
        
        // Remove active class from all commands
        navCommands.forEach(cmd => cmd.classList.remove('active'));
        
        // Add active class to clicked command
        command.classList.add('active');
        
        // Hide all sections
        contentSections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('visible');
        });
        
        // Show target section
        const targetElement = document.getElementById(targetSection);
        if (targetElement) {
            targetElement.style.display = 'block';
            setTimeout(() => {
                targetElement.classList.add('visible');
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        }
    });
});

// Animate skill progress bars when visible
function animateSkills() {
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        const progressBar = item.querySelector('.skill-progress');
        const level = progressBar.getAttribute('data-level');
        progressBar.style.width = level + '%';
    });
}

// Intersection Observer for scroll animations (disabled for navigation-controlled sections)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

// Only observe non-navigation controlled elements
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Only animate if element is visible (not hidden by navigation)
        if (entry.isIntersecting && entry.target.style.display !== 'none') {
            entry.target.classList.add('visible');
            
            // Animate skills when skills section becomes visible
            if (entry.target.id === 'skills') {
                setTimeout(animateSkills, 500);
            }
        }
    });
}, observerOptions);

// Don't observe content sections since they're controlled by navigation
// observer is kept for potential future elements

// Contact item interactions
const contactItems = document.querySelectorAll('.contact-item');
contactItems.forEach(item => {
    item.addEventListener('click', () => {
        const contactType = item.getAttribute('data-contact');
        
        if (contactType === 'github') {
            window.open('https://github.com/SilentSword123456', '_blank');
        } else {
            // Add some interactive feedback
            item.style.transform = 'scale(0.95)';
            setTimeout(() => {
                item.style.transform = 'translateX(10px)';
            }, 100);
        }
    });
});

// Add glitch effect to logo on click
const logo = document.querySelector('.main-logo');
logo.addEventListener('click', () => {
    logo.classList.add('glitch');
    setTimeout(() => {
        logo.classList.remove('glitch');
    }, 300);
});

// Project card interactions
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('click', () => {
        // Add some interactive feedback
        card.style.transform = 'scale(1.02) translateY(-10px)';
        setTimeout(() => {
            card.style.transform = 'translateY(-5px)';
        }, 200);
    });
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.altKey) {
        switch(e.key) {
            case '1':
                document.querySelector('[data-section="about"]').click();
                break;
            case '2':
                document.querySelector('[data-section="skills"]').click();
                break;
            case '3':
                document.querySelector('[data-section="projects"]').click();
                break;
            case '4':
                document.querySelector('[data-section="collaborate"]').click();
                break;
        }
    }
});

// Enhanced particle system with mouse interaction
let particleArray = [];

class InteractiveParticle {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = window.innerHeight + 10;
        this.size = Math.random() * 3 + 1;
        this.speedY = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.color = Math.random() > 0.5 ? '#00ffcc' : '#ff00ff';
        this.opacity = 0;
        this.life = 0;
    }
    
    update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.life++;
        
        if (this.life < 50) {
            this.opacity = this.life / 50;
        } else if (this.y < 50) {
            this.opacity -= 0.02;
        }
        
        // Mouse interaction
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            this.x -= dx * 0.02;
            this.y -= dy * 0.02;
        }
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Start the random particle animation after a short delay
setTimeout(() => {
    animateParticle(); // Fire first particle immediately
    setInterval(animateParticle, 2500); // Then continue every 2.5 seconds
}, 500); // Small initial delay to let page settle

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    // Add some initial interactivity hints
    setTimeout(() => {
        if (window.innerWidth > 768) {
            const hint = document.createElement('div');
            hint.innerHTML = '💡 Try clicking the logo or use Alt+1,2,3,4 for navigation!';
            hint.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 255, 204, 0.1);
                border: 1px solid rgba(0, 255, 204, 0.3);
                padding: 10px 15px;
                border-radius: 5px;
                font-size: 12px;
                color: #00ffcc;
                z-index: 1000;
                animation: slideInUp 0.5s ease;
            `;
            document.body.appendChild(hint);
            
            setTimeout(() => {
                hint.style.opacity = '0';
                hint.style.transform = 'translateY(20px)';
                hint.style.transition = 'all 0.5s ease';
                setTimeout(() => hint.remove(), 500);
            }, 5000);
        }
    }, 3000);
});
// Dynamic Content Management System
class SilentLabCMS {
    constructor() {
        this.sections = [];
        this.currentSection = null;
        this.init();
    }

    async init() {
        await this.loadSections();
        this.renderNavigation();
        this.renderSections();
        this.setupEventListeners();
        this.initializeTypingEffect();
        this.startParticleAnimation();
    }

    async loadSections() {
        // Get list of section files
        const sectionFiles = ['about', 'skills', 'projects', 'collaborate'];
        
        for (const file of sectionFiles) {
            try {
                const response = await fetch(`./sections/${file}.json`);
                if (response.ok) {
                    const sectionData = await response.json();
                    this.sections.push(sectionData);
                }
            } catch (error) {
                console.log(`Could not load section: ${file}`);
            }
        }
    }

    renderNavigation() {
        const navContainer = document.getElementById('nav-commands');
        navContainer.innerHTML = '';

        this.sections.forEach((section, index) => {
            const navCommand = document.createElement('span');
            navCommand.className = 'nav-command';
            navCommand.setAttribute('data-section', section.id);
            navCommand.textContent = section.command;
            navContainer.appendChild(navCommand);
        });
    }

    renderSections() {
        const contentContainer = document.getElementById('content-sections');
        contentContainer.innerHTML = '';

        this.sections.forEach(section => {
            const sectionElement = this.createSectionElement(section);
            contentContainer.appendChild(sectionElement);
        });
    }

    createSectionElement(section) {
        const sectionEl = document.createElement('section');
        sectionEl.id = section.id;
        sectionEl.className = 'content-section';
        sectionEl.style.display = 'none';

        const header = document.createElement('div');
        header.className = 'section-header';
        header.innerHTML = `<h2>${section.title}</h2>`;

        const content = document.createElement('div');
        content.className = 'section-content';

        // Render content based on section type
        switch (section.id) {
            case 'about':
                content.appendChild(this.renderAboutContent(section.content));
                break;
            case 'skills':
                content.appendChild(this.renderSkillsContent(section.content));
                break;
            case 'projects':
                content.appendChild(this.renderProjectsContent(section.content));
                break;
            case 'collaborate':
                content.appendChild(this.renderCollaborateContent(section.content));
                break;
            default:
                content.innerHTML = '<p>Content renderer not implemented for this section type.</p>';
        }

        sectionEl.appendChild(header);
        sectionEl.appendChild(content);
        return sectionEl;
    }

    renderAboutContent(content) {
        const wrapper = document.createElement('div');
        
        // Add description paragraphs
        content.description.forEach(desc => {
            const p = document.createElement('p');
            p.textContent = desc;
            wrapper.appendChild(p);
        });

        // Add stats
        const statsDiv = document.createElement('div');
        statsDiv.className = 'about-stats';
        
        content.stats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.innerHTML = `
                <span class="stat-number">${stat.number}</span>
                <span class="stat-label">${stat.label}</span>
            `;
            statsDiv.appendChild(statItem);
        });

        wrapper.appendChild(statsDiv);
        return wrapper;
    }

    renderSkillsContent(content) {
        const skillsGrid = document.createElement('div');
        skillsGrid.className = 'skills-grid';

        content.skills.forEach(skill => {
            const skillItem = document.createElement('div');
            skillItem.className = 'skill-item';
            skillItem.setAttribute('data-skill', skill.name);
            skillItem.innerHTML = `
                <div class="skill-icon">${skill.icon}</div>
                <div class="skill-name">${skill.name}</div>
                <div class="skill-bar">
                    <div class="skill-progress" data-level="${skill.level}"></div>
                </div>
            `;
            skillsGrid.appendChild(skillItem);
        });

        return skillsGrid;
    }

    renderProjectsContent(content) {
        const projectGrid = document.createElement('div');
        projectGrid.className = 'project-grid';

        content.projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <h3>${project.name}</h3>
                <p>${project.description}</p>
                <div class="project-tech">${project.technologies.join(' • ')}</div>
                <div class="project-status">Status: ${project.status}</div>
            `;
            projectGrid.appendChild(projectCard);
        });

        return projectGrid;
    }

    renderCollaborateContent(content) {
        const wrapper = document.createElement('div');
        
        const desc = document.createElement('p');
        desc.textContent = content.description;
        wrapper.appendChild(desc);

        const contactMethods = document.createElement('div');
        contactMethods.className = 'contact-methods';

        content.contacts.forEach(contact => {
            const contactItem = document.createElement('div');
            contactItem.className = 'contact-item';
            contactItem.setAttribute('data-contact', contact.type);
            contactItem.innerHTML = `
                <div class="contact-icon">${contact.icon}</div>
                <span>${contact.text}</span>
            `;
            
            if (contact.url) {
                contactItem.style.cursor = 'pointer';
            }
            
            contactMethods.appendChild(contactItem);
        });

        const quote = document.createElement('div');
        quote.className = 'collaboration-quote';
        quote.innerHTML = `<p>${content.quote}</p>`;

        wrapper.appendChild(contactMethods);
        wrapper.appendChild(quote);
        return wrapper;
    }

    setupEventListeners() {
        // Navigation clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-command')) {
                const sectionId = e.target.getAttribute('data-section');
                this.showSection(sectionId);
            }

            // Contact item clicks
            if (e.target.closest('.contact-item')) {
                const contactItem = e.target.closest('.contact-item');
                const contactType = contactItem.getAttribute('data-contact');
                
                if (contactType === 'github') {
                    const section = this.sections.find(s => s.id === 'collaborate');
                    const contact = section.content.contacts.find(c => c.type === 'github');
                    if (contact.url) {
                        window.open(contact.url, '_blank');
                    }
                } else {
                    // Add interactive feedback
                    contactItem.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        contactItem.style.transform = 'translateX(10px)';
                    }, 100);
                    setTimeout(() => {
                        contactItem.style.transform = '';
                    }, 300);
                }
            }

            // Project card clicks
            if (e.target.closest('.project-card')) {
                const card = e.target.closest('.project-card');
                card.style.transform = 'scale(1.02) translateY(-10px)';
                setTimeout(() => {
                    card.style.transform = 'translateY(-5px)';
                }, 200);
                setTimeout(() => {
                    card.style.transform = '';
                }, 400);
            }

            // Logo clicks
            if (e.target.classList.contains('main-logo')) {
                e.target.classList.add('glitch');
                setTimeout(() => {
                    e.target.classList.remove('glitch');
                }, 300);
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.altKey) {
                const keyMap = {
                    '1': 0,
                    '2': 1,
                    '3': 2,
                    '4': 3
                };
                
                if (keyMap.hasOwnProperty(e.key) && this.sections[keyMap[e.key]]) {
                    this.showSection(this.sections[keyMap[e.key]].id);
                }
            }
        });
    }

    showSection(sectionId) {
        // Remove active from all nav commands
        document.querySelectorAll('.nav-command').forEach(cmd => {
            cmd.classList.remove('active');
        });

        // Add active to clicked command
        const activeCmd = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeCmd) {
            activeCmd.classList.add('active');
        }

        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.style.display = 'none';
            section.classList.remove('visible');
        });

        // Show target section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            setTimeout(() => {
                targetSection.classList.add('visible');
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Animate skills if it's the skills section
                if (sectionId === 'skills') {
                    setTimeout(() => this.animateSkills(), 500);
                }
            }, 50);
        }

        this.currentSection = sectionId;
    }

    animateSkills() {
        const skillItems = document.querySelectorAll('.skill-item');
        skillItems.forEach(item => {
            const progressBar = item.querySelector('.skill-progress');
            const level = progressBar.getAttribute('data-level');
            progressBar.style.width = level + '%';
        });
    }

    initializeTypingEffect() {
        const typingElement = document.querySelector('.typing-text');
        if (typingElement) {
            const text = typingElement.getAttribute('data-text');
            setTimeout(() => {
                this.typeText(typingElement, text, 80);
            }, 1000);
        }
    }

    typeText(element, text, speed = 100) {
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

    startParticleAnimation() {
        // Track which particles are currently animating
        const particleStates = [false, false, false, false, false];
        
        const animateParticle = () => {
            // Find available particles
            const availableParticles = [];
            for (let i = 0; i < 5; i++) {
                if (!particleStates[i]) {
                    availableParticles.push(i + 1);
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

                    // Mark as available again after animation completes
                    setTimeout(() => {
                        particleStates[particleNumber - 1] = false;
                        particle.classList.remove('animate');
                    }, 5000);
                }
            }
        };

        // Start the animation
        setTimeout(() => {
            animateParticle();
            setInterval(animateParticle, 2500);
        }, 500);

        // Show helpful hint for desktop users
        if (window.innerWidth > 768) {
            setTimeout(() => {
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
            }, 3000);
        }
    }
}

// Custom Cursor Effect System
class CursorEffect {
    constructor() {
        this.cursorGlow = null;
        this.circuitLines = [];
        this.lastMoveTime = 0;
        this.init();
    }

    init() {
        this.createCursorGlow();
        this.setupMouseTracking();
    }

    createCursorGlow() {
        this.cursorGlow = document.createElement('div');
        this.cursorGlow.className = 'cursor-glow';
        document.body.appendChild(this.cursorGlow);
    }

    setupMouseTracking() {
        let mouseX = 0, mouseY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // Update cursor glow position
            this.cursorGlow.style.left = mouseX + 'px';
            this.cursorGlow.style.top = mouseY + 'px';
            
            // Create circuit lines occasionally
            const now = Date.now();
            if (now - this.lastMoveTime > 150) {
                this.createCircuitLine(mouseX, mouseY);
                this.lastMoveTime = now;
            }
        });

        // Enhanced effects on click
        document.addEventListener('click', (e) => {
            this.createClickEffect(e.clientX, e.clientY);
        });
    }

    createCircuitLine(x, y) {
        const directions = ['horizontal', 'vertical'];
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
        const line = document.createElement('div');
        line.className = `circuit-line ${direction === 'vertical' ? 'vertical' : ''}`;
        
        if (direction === 'horizontal') {
            line.style.left = (x - 40) + 'px';
            line.style.top = y + 'px';
        } else {
            line.style.left = x + 'px';
            line.style.top = (y - 40) + 'px';
        }
        
        document.body.appendChild(line);
        
        // Trigger animation
        setTimeout(() => line.classList.add('active'), 10);
        
        // Remove after animation
        setTimeout(() => {
            line.remove();
        }, 1500);
    }

    createClickEffect(x, y) {
        // Create multiple circuit lines on click
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                this.createCircuitLine(x + (Math.random() - 0.5) * 100, y + (Math.random() - 0.5) * 100);
            }, i * 100);
        }
        
        // Create a pulse effect
        const pulse = document.createElement('div');
        pulse.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: 4px;
            height: 4px;
            background: #00ffcc;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            pointer-events: none;
            z-index: 9999;
            animation: click-pulse 0.6s ease-out forwards;
        `;
        
        // Add click pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes click-pulse {
                0% { 
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                    box-shadow: 0 0 0 0 rgba(0, 255, 204, 0.7);
                }
                100% { 
                    transform: translate(-50%, -50%) scale(15);
                    opacity: 0;
                    box-shadow: 0 0 0 10px rgba(0, 255, 204, 0);
                }
            }
        `;
        
        if (!document.querySelector('#click-pulse-styles')) {
            style.id = 'click-pulse-styles';
            document.head.appendChild(style);
        }
        
        document.body.appendChild(pulse);
        setTimeout(() => pulse.remove(), 600);
    }
}

// Initialize the CMS and cursor effect when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new SilentLabCMS();
    new CursorEffect();
});
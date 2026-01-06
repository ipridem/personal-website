document.addEventListener('DOMContentLoaded', () => {
    // 0.5 Matrix Rain
    const canvas = document.getElementById('matrix-bg');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01010101ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*()_+-=<>?/";
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = [];

    for (let x = 0; x < columns; x++) {
        drops[x] = 1;
    }

    function drawMatrix() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-primary');
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }

    setInterval(drawMatrix, 33);

    // 1. Typing Effect for Hero (Improved)
    const heroTitle = document.querySelector('.hero h1 .glitch-text');
    if (heroTitle) {
        decryptText(heroTitle);
        heroTitle.addEventListener('mouseover', () => decryptText(heroTitle));
    }


    // 1.5 Header Decryption
    const headers = document.querySelectorAll('.section-title');
    headers.forEach(header => {
        header.addEventListener('mouseover', () => decryptText(header));
    });

    // 1.1 SHA-256 Utility
    async function getSHA256(text) {
        const msgUint8 = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async function decryptText(element) {
        if (element.classList.contains('animating')) return;

        const originalText = element.getAttribute('data-text') || element.innerText;
        element.setAttribute('data-text', originalText);

        // A11y: Respect Reduced Motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            element.innerText = originalText;
            return;
        }

        element.classList.add('animating');

        const hash = await getSHA256(originalText);
        const scrambles = "0123456789abcdef";

        let iteration = 0;
        let interval = null;

        interval = setInterval(() => {
            element.innerText = originalText.split("")
                .map((char, index) => {
                    if (index < iteration) return originalText[index];
                    return hash[index % hash.length] || scrambles[Math.floor(Math.random() * scrambles.length)];
                })
                .join("");

            if (iteration >= originalText.length) {
                clearInterval(interval);
                // Hold Phase (7s) - Increased for better readability/A11y
                setTimeout(() => {
                    encryptText(element, originalText);
                }, 7000);
            }
            iteration += 1 / 2;
        }, 15);
    }

    async function encryptText(element, originalText) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            element.innerText = originalText;
            element.classList.remove('animating');
            return;
        }

        const hash = await getSHA256(originalText);
        let iteration = originalText.length;
        let interval = null;
        const scrambles = "0123456789abcdef";

        interval = setInterval(() => {
            element.innerText = originalText.split("")
                .map((char, index) => {
                    if (index < iteration) return originalText[index];
                    return hash[index % hash.length] || scrambles[Math.floor(Math.random() * scrambles.length)];
                })
                .join("");

            if (iteration <= 0) {
                clearInterval(interval);
                element.classList.remove('animating');
            }
            iteration -= 1 / 2;
        }, 15);
    }

    // 2. Interactive Terminal Logic
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');

    let commandHistory = [];
    let historyIndex = -1;

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = terminalInput.value.trim();
                if (command) {
                    processCommand(command.toLowerCase());
                    commandHistory.unshift(command);
                    historyIndex = -1;
                }
                terminalInput.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    terminalInput.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    terminalInput.value = commandHistory[historyIndex];
                } else if (historyIndex === 0) {
                    historyIndex = -1;
                    terminalInput.value = '';
                }
            }
        });
    }

    function processCommand(cmd) {
        const line = document.createElement('div');
        const promptSpan = document.createElement('span');
        promptSpan.className = 'prompt';
        promptSpan.textContent = '> root@student:~$';

        line.appendChild(promptSpan);
        line.appendChild(document.createTextNode(` ${cmd}`));
        terminalOutput.appendChild(line);

        const response = document.createElement('div');
        response.className = 'response';

        const jokes = [
            "Why did the hacker get lost? Because he was using a proxy!",
            "A SQL query walks into a bar, walks up to two tables, and asks, 'Can I join you?'",
            "Why do hackers prefer dark mode? Because light attracts bugs.",
            "What do you call a group of 8 hobbits? A hobbyte.",
            "Knock knock. Who's there? (Long pause) Java.",
            "I'd tell you a DNS joke but it might take 24 hours to propagate.",
            "Why was the cell phone wearing glasses? Because it lost its contacts."
        ];

        switch (cmd) {
            case 'help':
                response.textContent = 'Available commands: help, whoami, projects, clear, status, joke, hack, sudo';
                break;
            case 'joke':
                const randomIndex = Math.floor(Math.random() * jokes.length);
                response.textContent = jokes[randomIndex];
                break;
            case 'hack':
                response.textContent = 'Access authorized. Entering stealth mode...';
                break;
            case 'sudo':
                response.textContent = 'Nice try. This incident will be reported.';
                break;
            case 'whoami':
                response.textContent = 'Pride Mazwimairi (ipridem) | Cybersecurity Student @ UZ | Aspiring Ethical Hacker';
                break;
            case 'projects':
                response.textContent = 'Loading deployments: [Scanner, IDS, Sandbox]. Scroll down for details.';
                break;
            case 'clear':
                terminalOutput.innerHTML = '';
                return;
            case 'status':
                response.textContent = 'System: Optimal | Firewall: Active | VPN: Connected';
                break;
            case '':
                break;
            default:
                response.textContent = `Command not found: ${cmd}. Type 'help' for options.`;
        }

        terminalOutput.appendChild(response);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    // 3. Intersection Observer for Scroll Animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                if (entry.target.classList.contains('section-title')) {
                    decryptText(entry.target);
                }
            }
        });
    }, observerOptions);

    document.querySelectorAll('section, .glass-card, .section-title').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // 1. Interactive Terminal Logic
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
        promptSpan.textContent = 'root@student:~$';

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
                response.textContent = jokes[Math.floor(Math.random() * jokes.length)];
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
            default:
                response.textContent = `Command not found: ${cmd}. Type 'help' for options.`;
        }

        terminalOutput.appendChild(response);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    // 2. Restrained scroll reveal
    const revealables = document.querySelectorAll('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        revealables.forEach(el => el.classList.add('in-view'));
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealables.forEach(el => observer.observe(el));
    }
});

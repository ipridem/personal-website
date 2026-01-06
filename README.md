# personal-website
Interactive cybersecurity portfolio built with HTML5 Canvas matrix rain, SHA-256 text decryption effects, and a functional validated command-line interface.


## 🛠️ TECHNICAL ARCHITECTURE

### **Frontend & Visuals**

- **Dynamic Aesthetic**: A curated glassmorphism design system that adapts to system-level light/dark modes.
- **HTML5 Canvas Matrix Rain**: A custom-built, layered digital background animation.
- **Cryptographic Animations**: Text elements utilize **SHA-256 hex signatures** to "decrypt" into readable headers, providing an authentic cybersecurity feel.
- **Interactive Terminal**: A fully functional mock shell environment that supports custom commands and input history (`ArrowUp`/`ArrowDown`).

### **Security Hardening**

- **Content Security Policy (CSP)**: Robust meta-tags to prevent Cross-Site Scripting (XSS) and data injection.
- **Subresource Integrity (SRI)**: External CDN resources (Font Awesome) are verified against cryptographic hashes (SHA-256).
- **Safe DOM Operations**: Mitigates potential XSS vulnerabilities by using safe DOM node creation methods for terminal echoing.
- **Secure Navigation**: All external links are hardened with `rel="noopener noreferrer"` to prevent tab-nabbing.

### **Accessibility (A11y)**

- **ARIA Standards**: Implemented `aria-label` on all animated/glitch elements to ensure high screen-reader compatibility.
- **Motion Sensitivity**: Automatically detects and respects OS-level `prefers-reduced-motion` settings, disabling flicker animations for sensitive users.
- **Readability Optimization**: Adjustable stabilizers ensure decrypted text remains readable for a minimum of 7 seconds before re-encrypting.

## 📁 PROJECT STRUCTURE

```text
├── index.html       # Semantic structure, Security headers, and ARIA labels.
├── assets/
│   ├── css/
│   │   └── styles.css   # CSS system (Glassmorphism, Neon themes, Layouts).
│   └── js/
│       └── script.js    # Core logic (SHA-256, Matrix Rain, Terminal history).
├── walkthrough.md  # Detailed technical implementation guide.
└── task.md         # Full project development task list.
```

## 🛠️ TERMINAL COMMANDS

Access the interactive terminal via the "System.About" section:

- `whoami`: Professional background and identity.
- `projects`: List of active technical deployments.
- `status`: Real-time system health checks.
- `joke`: Cybersecurity-themed humor logic.
- `sudo`: Simulated privilege escalation response.
- `clear`: Purges the terminal history.

---

## 👤 CONTACT

**Pride Mazwimairi**

- **Alias**: ipridem
- **Role**: Cybersecurity Student @ University of Zimbabwe (UZ)
- **Twitter/X**: [@ipridem](https://x.com/ipridem)
- **GitHub**: [@ipridem](https://github.com/ipridem)

---



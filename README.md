# Pride Mazwimairi — Portfolio (`ipridem`)

A personal security-dossier portfolio for Pride Mazwimairi (**ipridem**),
Cybersecurity & Forensic Auditing student at the University of Zimbabwe.
Static site — no build step, no framework.

**Design:** an editorial "security dossier" — ink-on-paper with a single
restrained accent, large serif display type, and numbered document sections
(Profile · Capabilities · Deployments · Contact). System-aware light/dark.

## Projects on the site

| Ref | Project | Summary |
| --- | --- | --- |
| D-01 | **SDCAMS** | Secure Data Centre Contractor Access Management System — Flask app replacing manual visitor log books; RBAC, admin-approval registration, immutable audit logging, PBKDF2:SHA256, CSV export. Internship project. |
| D-02 | **FinGuard** | Final-year capstone — mobile-money fraud-detection platform (Flask + PostgreSQL) with four analysis engines feeding a forensic case module. |
| D-03 | **SmishGuard ZW** | Hybrid rule-based + ML smishing (SMS-phishing) classifier tuned to Zimbabwe's mobile-money context; handles Shona/English code-switching. |

## Tech

- **Frontend:** semantic HTML5, hand-written CSS (OKLCH tokens, 4-pt spacing scale), vanilla JS.
- **Type:** Newsreader (display) · Inter (body) · Fira Code (mono).
- **Interactive console:** a mock shell in the Profile section — `help`, `whoami`, `projects`, `status`, `joke`, `hack`, `sudo`, `clear`, with `ArrowUp`/`ArrowDown` history.
- **Security:** Content Security Policy, Subresource Integrity on the Font Awesome CDN, safe DOM node creation for terminal output, `rel="noopener noreferrer"` on external links.
- **Accessibility:** respects `prefers-reduced-motion`; visible `:focus-visible` rings; verified with no horizontal scroll down to 320 px.

## Structure

```text
├── index.html            # Markup, security headers, section structure
├── assets/
│   ├── css/styles.css     # Design tokens + all styles
│   └── js/script.js       # Interactive console + scroll reveals
└── scripts/
    └── tunnel.ps1         # Static server + Cloudflare quick tunnel
```

## Run locally

```powershell
python -m http.server 8000
# then open http://localhost:8000
```

## Share via a public URL (Cloudflare quick tunnel)

Requires `cloudflared.exe` in your user profile.

```powershell
powershell -File scripts/tunnel.ps1
# prints:  Live at: https://<random>.trycloudflare.com
# Ctrl+C stops the server and the tunnel
```

## Contact

**Pride Mazwimairi** · alias **ipridem** · Cybersecurity Student, University of Zimbabwe
- X/Twitter: [@ipridem](https://x.com/ipridem)
- GitHub: [@ipridem](https://github.com/ipridem)

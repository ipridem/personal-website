# ipridem — Security Lab & Portfolio

Personal portfolio and interactive security workbench for **Pride Mazwimairi** (`ipridem`), final-year BSc Cybersecurity & Forensic Auditing student at the University of Zimbabwe. Designed as a dark technical telemetry interface with live interactive sandboxes for each flagship project.

Static site — no build step, no dependencies, no framework.

**Live:** https://ipridem.github.io/portfolio/

## Run it

Open `index.html` in a browser, or serve locally:

```bash
python -m http.server 8000
```

## Structure

```text
index.html            # Hero HUD, Interactive Workbench, Deployments, CLI, Capabilities, Contact
assets/css/styles.css # Obsidian dark + daylight schematic theme tokens & responsive layout
assets/js/script.js   # SmishGuard analyzer, purpose-conditioned REST filter, RBAC simulator, CLI
robots.txt
sitemap.xml
scripts/tunnel.ps1    # Local tunnel helper
```

## What's in it

- **Interactive Threat & Forensics Workbench**:
  - **SmishGuard ZW Analyzer** — client-side lexical, URL/TLD, and Shona/English code-switching smishing detector with tokenized payload highlighting and preset lures.
  - **purpose-conditioned-disclosure-control** — interactive REST response filter for Apache Fineract payloads enforcing server-side route-to-purpose binding (`kyc`, `balance`, `history`, fail-closed `403` on unmapped routes), canonical field mapping, `[REDACTED]` filtering, schema-drift testing, baseline comparison, and Web Crypto `SHA-256` audit hashing against UK Open Banking v4.0 ground truth.
  - **SDCAMS RBAC & Audit Simulator** — evaluates contractor/officer/auditor/sysadmin permissions and enforces append-only audit log immutability.
- **Forensic & Security CLI** — virtual filesystem and security commands (`help`, `whoami`, `ls`, `cat`, `filter`, `smish`, `sha256`, `clear`) with `ArrowUp`/`ArrowDown` history and `Tab` completion.
- **Dark / Light Theme Toggle** — defaults to Obsidian Dark Lab with a clean daylight schematic toggle.
- **Strict Security Posture** — strict `Content-Security-Policy` (`script-src 'self'`, `style-src 'self'`, zero inline styles or scripts), XSS-safe DOM node construction (no `innerHTML`), and `rel="noopener noreferrer"` on external links.

## Projects featured

| ID | Project | Notes |
|----|---------|-------|
| D-01 | [SDCAMS](https://github.com/ipridem/SDCAMS) | Data-centre contractor access management — Flask, RBAC, PBKDF2:SHA256, immutable audit logs |
| D-02 | [purpose-conditioned-disclosure-control](https://github.com/ipridem/purpose-conditioned-disclosure-control) | Purpose-bound REST API response filter (Honours Dissertation) — Python/Flask, Apache Fineract, UK Open Banking v4.0 |
| D-03 | [SmishGuard ZW](https://github.com/ipridem/smishguard) | Hybrid rule-based + ML smishing classifier tuned to Zimbabwe's Shona/English threat landscape |

## Contact

- **GitHub:** [@ipridem](https://github.com/ipridem)
- **X:** [@ipridem](https://x.com/ipridem)
- **Email:** pridemazwi03@gmail.com

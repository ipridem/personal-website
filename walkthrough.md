# Portfolio Website Walkthrough

I have completed the creation of a modern, "Cyber-Noir" themed portfolio website for a cybersecurity student.

## Key Features

### 1. Adaptive Design System
The website now supports system-aware themes using the `prefers-color-scheme` media query.
- **Dark Mode**: A professional Midnight Blue and Soft Violet palette.
- **Light Mode**: A clean Slate Gray and Indigo palette.

### 2. Enhanced Glassmorphism
The glass cards have been updated with deeper shadows (`shadow-main`), increased blur (16px), and subtler borders to achieve a high-end, futuristic look that works in both lighting modes.

### 3. Interactive Terminal Simulation
A fully functional (mocked) terminal is integrated into the About section.
- **Commands**: `help`, `whoami`, `projects`, `status`, `clear`.
- **Logic**: Processed via `script.js` with a custom prompt and response history.

### 4. Technical Interactivity
- **Typing Effect**: The Hero headline types out automatically on load.
- **Scroll Reveals**: Content sections use `IntersectionObserver` to slide and fade into view as the user scrolls, creating a dynamic flow.
- **Responsive Layouts**: Interactive elements scale and stack gracefully on mobile devices.

### 5. Maximum Cyber Phase
- **Matrix Rain Background**: A custom HTML5 Canvas animation that creates a subtle, layered digital rain effect.
- **Text Decryption Headers**: Every section title now "decrypts" from random characters whenever it enters the viewport or is hovered.
### 6. Contact Enhancement (Security Focused)
- **Circular Expanding Buttons**: Interactive social links (X, GitHub, Email) that extend on hover to reveal labels.
- **Brand-Specific Themes**: Each button adopts its platform's signature color (e.g., #333 for GitHub) and glow effect on hover.
- **Privacy Hardening**: Removed high-privacy-risk links (WhatsApp/Facebook) to protect personal data.
### 7. Core Security Hardening
- **XSS Mitigation**: Terminal input is now safely handled using `createTextNode`, preventing malicious code injection.
- **Content Security Policy (CSP)**: Implemented via meta tags to restrict resource loading to trusted domains.
- **Subresource Integrity (SRI)**: External scripts and styles (Font Awesome) are verified against cryptographic hashes.
- **Secure Links**: All external links now use `rel="noopener noreferrer"` to prevent tab-nabbing vulnerabilities.
### 8. A11y & Readability Hardening
- **ARIA Labeling**: All animated headers use `aria-label` to ensure screen readers skip the cryptic scramble and read the final text immediately.
- **Reduced Motion Support**: The site detects and respects OS-level "Reduced Motion" preferences, bypassing flicker animations for sensitive users.
- **Readability Stabilization**: Increased the decryption hold time to **7 seconds** to ensure all users have enough time to process labels.
- **SHA-256 Logic**: Replaced random noise with actual cryptographic hashes for an authentic cybersecurity aesthetic.

## Code Overview

- [index.html](file:///c:/Users/mazwi/Desktop/claudecode/index.html): Semantic HTML structure with SEO-friendly meta tags and Google Fonts integration.
- [styles.css](file:///c:/Users/mazwi/Desktop/claudecode/styles.css): Custom CSS variables, flex/grid layouts, and responsive design tokens.

## Verification Results

- [x] **Mobile Responsive**: Tested layout on small screens; grids collapse gracefully to single columns.
- [x] **Typography**: High readability with Inter and Fira Code.
- [x] **Performance**: Fast load times due to minimal external dependencies.
- [x] **Aesthetics**: Premium visual appeal consistent with the "Cybersecurity" theme.

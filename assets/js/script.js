document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    // ---- 0. Pure-JS SHA-256 fallback + Web Crypto helper ----
    const K256 = new Uint32Array([
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ]);

    function sha256Fallback(bytes) {
        const bitLen = bytes.length * 8;
        const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
        const padded = new Uint8Array(paddedLen);
        padded.set(bytes);
        padded[bytes.length] = 0x80;

        const view = new DataView(padded.buffer);
        view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);
        view.setUint32(paddedLen - 4, bitLen >>> 0, false);

        let h0 = 0x6a09e667;
        let h1 = 0xbb67ae85;
        let h2 = 0x3c6ef372;
        let h3 = 0xa54ff53a;
        let h4 = 0x510e527f;
        let h5 = 0x9b05688c;
        let h6 = 0x1f83d9ab;
        let h7 = 0x5be0cd19;

        const w = new Uint32Array(64);
        const rotr = (x, n) => (x >>> n) | (x << (32 - n));

        for (let offset = 0; offset < paddedLen; offset += 64) {
            for (let i = 0; i < 16; i++) {
                w[i] = view.getUint32(offset + i * 4, false);
            }
            for (let i = 16; i < 64; i++) {
                const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
                const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
                w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
            }

            let a = h0;
            let b = h1;
            let c = h2;
            let d = h3;
            let e = h4;
            let f = h5;
            let g = h6;
            let h = h7;

            for (let i = 0; i < 64; i++) {
                const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
                const ch = (e & f) ^ (~e & g);
                const temp1 = (h + S1 + ch + K256[i] + w[i]) >>> 0;
                const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
                const maj = (a & b) ^ (a & c) ^ (b & c);
                const temp2 = (S0 + maj) >>> 0;

                h = g;
                g = f;
                f = e;
                e = (d + temp1) >>> 0;
                d = c;
                c = b;
                b = a;
                a = (temp1 + temp2) >>> 0;
            }

            h0 = (h0 + a) >>> 0;
            h1 = (h1 + b) >>> 0;
            h2 = (h2 + c) >>> 0;
            h3 = (h3 + d) >>> 0;
            h4 = (h4 + e) >>> 0;
            h5 = (h5 + f) >>> 0;
            h6 = (h6 + g) >>> 0;
            h7 = (h7 + h) >>> 0;
        }

        return [h0, h1, h2, h3, h4, h5, h6, h7]
            .map((v) => v.toString(16).padStart(8, '0'))
            .join('');
    }

    async function sha256Hex(text) {
        const bytes = new TextEncoder().encode(text);
        if (window.crypto && window.crypto.subtle) {
            try {
                const digest = await window.crypto.subtle.digest('SHA-256', bytes);
                return Array.from(new Uint8Array(digest))
                    .map((b) => b.toString(16).padStart(2, '0'))
                    .join('');
            } catch (_) {
                return sha256Fallback(bytes);
            }
        }
        return sha256Fallback(bytes);
    }

    // ---- 1. Theme Toggle ----
    const themeToggle = document.getElementById('theme-toggle');
    const themeLabel = document.getElementById('theme-label');

    function applyTheme(theme) {
        const resolved = theme === 'light' ? 'light' : 'dark';
        document.documentElement.dataset.theme = resolved;
        if (themeLabel) {
            themeLabel.textContent = resolved.toUpperCase();
        }
        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', String(resolved === 'light'));
        }
    }

    try {
        const savedTheme = localStorage.getItem('ipridem-theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            applyTheme(savedTheme);
        }
    } catch (_) {
        // Ignore storage restrictions
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
            applyTheme(nextTheme);
            try {
                localStorage.setItem('ipridem-theme', nextTheme);
            } catch (_) {
                // Ignore storage restrictions
            }
        });
    }

    // ---- 2. Workbench Tab Controller ----
    const tabButtons = document.querySelectorAll('.wb-tab');
    const tabPanels = document.querySelectorAll('.wb-panel');

    function activateTab(tabName) {
        tabButtons.forEach((btn) => {
            const active = btn.dataset.tab === tabName;
            btn.classList.toggle('is-active', active);
            btn.setAttribute('aria-selected', String(active));
        });

        tabPanels.forEach((panel) => {
            const matches = panel.id === `panel-${tabName}`;
            panel.hidden = !matches;
        });
    }

    tabButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            activateTab(btn.dataset.tab);
        });
    });

    document.querySelectorAll('[data-open-tab]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.openTab;
            activateTab(targetTab);
            const workbench = document.getElementById('workbench');
            if (workbench) {
                workbench.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ---- 3. SmishGuard ZW Client-Side Heuristic Engine ----
    const SMISH_RULES = {
        suspiciousTlds: /\.(top|xyz|click|tk|ml|ga|cf|gq|zip|work|info)\b/i,
        shorteners: /\b(bit\.ly|tinyurl\.com|t\.co|is\.gd|rb\.gy|cutt\.ly)\b/i,
        brandLookalike: /(ecocash[-_.]|[-_.]ecocash|innbucks[-_.]|zw-secure|[-_.]verify|[-_.]claim)/i,
        shonaLures: [
            'makorokoto', 'yawana', 'baya pa', 'uise pin', 'pin yako',
            'nhamba iyi', 'ne mistake', 'dzorera', 'dzzorera', 'ukabvisa',
            'mukati me', 'bonus', 'claim', 'reward', 'voucher'
        ],
        urgencyTokens: [
            'urgent', 'immediately', 'suspended', 'frozen', 'blocked',
            'failed kyc', '10 mins', '24 hours', 'mukati me', 'expire'
        ],
        askTokens: [
            'uise pin', 'pin yako', 'pin', 'otp', 'password', 'verify',
            'dzorera', 'dzzorera', 'send back', 'login', 'kyc'
        ],
        legitMarkers: [
            'cashout approval', 'txn id:', 'bal usd', 'agent '
        ]
    };

    function analyzeSmishPayload(rawText) {
        const text = (rawText || '').trim();
        if (!text) {
            return {
                score: 0,
                verdict: 'AWAITING PAYLOAD',
                level: 'clean',
                features: {
                    url: { label: 'No input provided', state: 'ok' },
                    lure: { label: 'None detected', state: 'ok' },
                    urgency: { label: 'None detected', state: 'ok' },
                    ask: { label: 'None detected', state: 'ok' }
                },
                matches: { urls: [], lures: [], urgency: [], asks: [], clean: [] }
            };
        }

        const lower = text.toLowerCase();
        const urlMatches = text.match(/https?:\/\/[^\s]+/gi) || [];
        const hasHttp = urlMatches.some((u) => u.toLowerCase().startsWith('http://'));
        const hasSuspiciousTld = SMISH_RULES.suspiciousTlds.test(text);
        const hasShortener = SMISH_RULES.shorteners.test(text);
        const hasLookalike = SMISH_RULES.brandLookalike.test(text);

        const matchedLures = SMISH_RULES.shonaLures.filter((term) => lower.includes(term));
        const matchedUrgency = SMISH_RULES.urgencyTokens.filter((term) => lower.includes(term));
        const matchedAsks = SMISH_RULES.askTokens.filter((term) => lower.includes(term));
        const matchedLegit = SMISH_RULES.legitMarkers.filter((term) => lower.includes(term));
        const hasPhoneReversal = /07[1378]\d{7}/.test(text) && (lower.includes('mistake') || lower.includes('dzorera') || lower.includes('dzzorera') || lower.includes('sorry'));

        let score = 0;

        // URL risk
        let urlSummary = 'No URL detected';
        let urlState = 'ok';
        if (urlMatches.length > 0 || hasSuspiciousTld || hasShortener) {
            const urlFlags = [];
            if (hasHttp) {
                score += 18;
                urlFlags.push('HTTP');
            }
            if (hasSuspiciousTld) {
                score += 24;
                urlFlags.push('Suspicious TLD');
            }
            if (hasShortener) {
                score += 20;
                urlFlags.push('Shortener');
            }
            if (hasLookalike) {
                score += 22;
                urlFlags.push('Brand lookalike');
            }
            if (urlFlags.length === 0) {
                score += 14;
                urlFlags.push('External link');
            }
            urlSummary = urlFlags.join(' + ');
            urlState = score >= 30 ? 'flagged' : 'warn';
        }

        // Lure tokens
        let lureSummary = 'None detected';
        let lureState = 'ok';
        if (matchedLures.length > 0) {
            score += Math.min(34, 14 + matchedLures.length * 8);
            lureSummary = `${matchedLures.slice(0, 3).join(', ')}`;
            lureState = 'flagged';
        } else if (hasPhoneReversal) {
            score += 26;
            lureSummary = 'Mistaken-transfer social lure';
            lureState = 'warn';
        }

        // Urgency
        let urgencySummary = 'None detected';
        let urgencyState = 'ok';
        if (matchedUrgency.length > 0) {
            score += Math.min(24, 12 + matchedUrgency.length * 6);
            urgencySummary = `${matchedUrgency.slice(0, 2).join(', ')}`;
            urgencyState = matchedUrgency.length >= 2 ? 'flagged' : 'warn';
        }

        // Credential / financial ask
        let askSummary = 'None detected';
        let askState = 'ok';
        if (matchedAsks.length > 0 || hasPhoneReversal) {
            score += Math.min(32, 16 + matchedAsks.length * 7 + (hasPhoneReversal ? 12 : 0));
            const askList = [...matchedAsks.slice(0, 2)];
            if (hasPhoneReversal && !askList.includes('reversal')) {
                askList.push('MSISDN reversal');
            }
            askSummary = askList.join(', ');
            askState = 'flagged';
        }

        // Legitimate mobile-money receipt check
        if (matchedLegit.length >= 2 && urlMatches.length === 0 && matchedAsks.length === 0 && !hasPhoneReversal) {
            score = Math.max(4, Math.min(score, 8));
        }

        score = Math.max(0, Math.min(100, score));

        let verdict = 'CLEAN · LEGITIMATE SMS';
        let level = 'clean';
        if (score >= 70) {
            verdict = 'CRITICAL · SMISHING DETECTED';
            level = 'critical';
        } else if (score >= 35) {
            verdict = 'ELEVATED · SOCIAL ENGINEERING';
            level = 'warn';
        }

        return {
            score,
            verdict,
            level,
            features: {
                url: { label: urlSummary, state: urlState },
                lure: { label: lureSummary, state: lureState },
                urgency: { label: urgencySummary, state: urgencyState },
                ask: { label: askSummary, state: askState }
            },
            matches: {
                urls: urlMatches,
                lures: matchedLures,
                urgency: matchedUrgency,
                asks: matchedAsks,
                clean: matchedLegit
            }
        };
    }

    const smishInput = document.getElementById('smish-input');
    const smishAnalyzeBtn = document.getElementById('smish-analyze-btn');
    const smishVerdict = document.getElementById('smish-verdict');
    const smishScore = document.getElementById('smish-score');
    const smishMeterSegs = document.querySelectorAll('#smish-meter .meter-seg');
    const smishTokens = document.getElementById('smish-tokens');
    const featUrl = document.getElementById('feat-url');
    const featLure = document.getElementById('feat-lure');
    const featUrgency = document.getElementById('feat-urgency');
    const featAsk = document.getElementById('feat-ask');
    const sampleButtons = document.querySelectorAll('.sample-btn');

    function setFeatureEl(el, feature) {
        if (!el) return;
        el.textContent = feature.label;
        el.classList.remove('is-flagged', 'is-warn', 'is-ok');
        el.classList.add(`is-${feature.state}`);
    }

    function renderTokenStream(text, analysis) {
        if (!smishTokens) return;
        smishTokens.replaceChildren();
        if (!text.trim()) {
            const emptySpan = document.createElement('span');
            emptySpan.className = 'cli-muted';
            emptySpan.textContent = 'Enter an SMS payload above to inspect flagged tokens.';
            smishTokens.appendChild(emptySpan);
            return;
        }

        const dangerTerms = new Set([
            ...analysis.matches.asks,
            ...analysis.matches.lures
        ]);
        const warnTerms = new Set(analysis.matches.urgency);
        const cleanTerms = new Set(analysis.matches.clean);

        // Tokenize by whitespace while preserving spaces
        const parts = text.split(/(\s+)/);
        parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) {
                smishTokens.appendChild(document.createTextNode(part));
                return;
            }

            const lowerPart = part.toLowerCase();
            const stripped = lowerPart.replace(/[.,!?;:()]+$/g, '');

            if (/^https?:\/\//i.test(part) || SMISH_RULES.suspiciousTlds.test(part) || SMISH_RULES.shorteners.test(part)) {
                const span = document.createElement('span');
                span.className = 'tok-url';
                span.textContent = part;
                smishTokens.appendChild(span);
                return;
            }

            const isDanger = Array.from(dangerTerms).some((t) => stripped.includes(t) || t.split(' ').includes(stripped));
            if (isDanger) {
                const span = document.createElement('span');
                span.className = 'tok-danger';
                span.textContent = part;
                smishTokens.appendChild(span);
                return;
            }

            const isWarn = Array.from(warnTerms).some((t) => stripped.includes(t) || t.split(' ').includes(stripped));
            if (isWarn) {
                const span = document.createElement('span');
                span.className = 'tok-warn';
                span.textContent = part;
                smishTokens.appendChild(span);
                return;
            }

            const isClean = analysis.level === 'clean' && Array.from(cleanTerms).some((t) => t.split(' ').includes(stripped));
            if (isClean) {
                const span = document.createElement('span');
                span.className = 'tok-clean';
                span.textContent = part;
                smishTokens.appendChild(span);
                return;
            }

            smishTokens.appendChild(document.createTextNode(part));
        });
    }

    function updateSmishUI(text) {
        const result = analyzeSmishPayload(text);

        if (smishVerdict) {
            smishVerdict.textContent = result.verdict;
            smishVerdict.classList.remove('is-critical', 'is-warn', 'is-clean');
            smishVerdict.classList.add(`is-${result.level}`);
        }

        if (smishScore) {
            smishScore.textContent = `${result.score} / 100`;
        }

        const activeCount = Math.ceil(result.score / 10);
        const segClass = result.level === 'critical'
            ? 'active-danger'
            : result.level === 'warn'
                ? 'active-warn'
                : 'active-clean';

        smishMeterSegs.forEach((seg, idx) => {
            seg.classList.remove('active-clean', 'active-warn', 'active-danger');
            if (idx < activeCount) {
                seg.classList.add(segClass);
            }
        });

        setFeatureEl(featUrl, result.features.url);
        setFeatureEl(featLure, result.features.lure);
        setFeatureEl(featUrgency, result.features.urgency);
        setFeatureEl(featAsk, result.features.ask);

        renderTokenStream(text, result);
    }

    if (smishInput) {
        const defaultSampleBtn = document.querySelector('.sample-btn.is-selected');
        if (defaultSampleBtn) {
            smishInput.value = defaultSampleBtn.dataset.sample || '';
            updateSmishUI(smishInput.value);
        }

        smishInput.addEventListener('input', () => {
            sampleButtons.forEach((b) => b.classList.remove('is-selected'));
            updateSmishUI(smishInput.value);
        });
    }

    if (smishAnalyzeBtn && smishInput) {
        smishAnalyzeBtn.addEventListener('click', () => {
            updateSmishUI(smishInput.value);
        });
    }

    sampleButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            sampleButtons.forEach((b) => b.classList.remove('is-selected'));
            btn.classList.add('is-selected');
            if (smishInput) {
                smishInput.value = btn.dataset.sample || '';
                updateSmishUI(smishInput.value);
            }
        });
    });

    // ---- 4. purpose-conditioned-disclosure-control (REST API Filter Simulation) ----
    const PCDC_ROUTE_TABLE = {
        '/clients/{id}': {
            purpose: 'kyc',
            requestLine: 'GET /clients/14',
            fields: (drift) => [
                { span: 'status.value', canonical: 'passthrough', value: 'Active', passthrough: true, groundTruth: 'passthrough', piiType: false },
                { span: drift ? 'clientName' : 'displayName', canonical: 'customer.name', value: 'Tendai Moyo', passthrough: false, groundTruth: 'keep', piiType: true, keyAllowedFor: ['kyc'], rawKnownName: 'displayName' },
                { span: 'externalId', canonical: 'identity.national_id', value: '63-2091847-A-21', passthrough: false, groundTruth: 'keep', piiType: true, keyAllowedFor: ['kyc'], rawKnownName: 'externalId' },
                { span: 'dateOfBirth', canonical: 'identity.dob', value: '1996-04-12', passthrough: false, groundTruth: 'keep', piiType: true, keyAllowedFor: ['kyc'], rawKnownName: 'dateOfBirth' },
                { span: 'accountNo', canonical: 'account.number.full', value: '0000104928', passthrough: false, groundTruth: 'keep', piiType: true, keyAllowedFor: ['kyc'], rawKnownName: 'accountNo' },
                { span: 'mobileNo', canonical: 'contact.phone', value: '+263772194821', passthrough: false, groundTruth: 'remove', piiType: true, keyAllowedFor: [], rawKnownName: 'mobileNo' },
                { span: 'officeName', canonical: 'branch.name', value: 'Harare Main Branch', passthrough: false, groundTruth: 'remove', piiType: false, keyAllowedFor: [], rawKnownName: 'officeName' },
                ...(drift ? [
                    { span: 'riskScore', canonical: 'unlisted', value: 0.18, passthrough: false, groundTruth: 'remove', piiType: false, keyAllowedFor: [], rawKnownName: 'riskScore' }
                ] : [])
            ]
        },
        '/savingsaccounts/{id}': {
            purpose: 'balance',
            requestLine: 'GET /savingsaccounts/88',
            fields: (drift) => [
                { span: 'status.value', canonical: 'passthrough', value: 'Active', passthrough: true, groundTruth: 'passthrough', piiType: false },
                { span: 'currency.code', canonical: 'passthrough', value: 'USD', passthrough: true, groundTruth: 'passthrough', piiType: false },
                { span: 'summary.accountBalance', canonical: 'account.balance', value: 1420.50, passthrough: false, groundTruth: 'keep', piiType: false, keyAllowedFor: ['balance'], rawKnownName: 'summary.accountBalance' },
                { span: drift ? 'clientName' : 'displayName', canonical: 'customer.name', value: 'Tendai Moyo', passthrough: false, groundTruth: 'remove', piiType: true, keyAllowedFor: [], rawKnownName: 'displayName' },
                { span: 'accountNo', canonical: 'account.number.full', value: '0000104928', passthrough: false, groundTruth: 'remove', piiType: true, keyAllowedFor: [], rawKnownName: 'accountNo' },
                { span: 'externalId', canonical: 'identity.national_id', value: '63-2091847-A-21', passthrough: false, groundTruth: 'remove', piiType: true, keyAllowedFor: [], rawKnownName: 'externalId' },
                ...(drift ? [
                    { span: 'summary.internalNote', canonical: 'unlisted', value: 'KYC_TIER_2_REVIEW', passthrough: false, groundTruth: 'remove', piiType: false, keyAllowedFor: ['balance'], rawKnownName: 'summary.internalNote' },
                    { span: 'riskScore', canonical: 'unlisted', value: 0.18, passthrough: false, groundTruth: 'remove', piiType: false, keyAllowedFor: [], rawKnownName: 'riskScore' }
                ] : [])
            ]
        },
        '/savingsaccounts/{id}?associations=transactions': {
            purpose: 'history',
            requestLine: 'GET /savingsaccounts/88?associations=transactions',
            fields: (drift) => [
                { span: 'status.value', canonical: 'passthrough', value: 'Active', passthrough: true, groundTruth: 'passthrough', piiType: false },
                { span: 'currency.code', canonical: 'passthrough', value: 'USD', passthrough: true, groundTruth: 'passthrough', piiType: false },
                { span: 'summary.accountBalance', canonical: 'account.balance', value: 1420.50, passthrough: false, groundTruth: 'keep', piiType: false, keyAllowedFor: ['history'], rawKnownName: 'summary.accountBalance' },
                { span: 'transactions[0].date', canonical: 'transaction.date', value: '2026-10-24', passthrough: false, groundTruth: 'keep', piiType: false, keyAllowedFor: ['history'], rawKnownName: 'transactions[0].date' },
                { span: 'transactions[0].amount', canonical: 'transaction.amount', value: 120.00, passthrough: false, groundTruth: 'keep', piiType: false, keyAllowedFor: ['history'], rawKnownName: 'transactions[0].amount' },
                { span: 'transactions[0].transactionType.value', canonical: 'transaction.type', value: 'Withdrawal', passthrough: false, groundTruth: 'keep', piiType: false, keyAllowedFor: ['history'], rawKnownName: 'transactions[0].transactionType.value' },
                { span: 'transactions[0].submittedByUsername', canonical: 'staff.username', value: 'teller_jmunhu', passthrough: false, groundTruth: 'remove', piiType: false, keyAllowedFor: [], rawKnownName: 'transactions[0].submittedByUsername' },
                { span: drift ? 'clientName' : 'displayName', canonical: 'customer.name', value: 'Tendai Moyo', passthrough: false, groundTruth: 'remove', piiType: true, keyAllowedFor: [], rawKnownName: 'displayName' },
                { span: 'accountNo', canonical: 'account.number.full', value: '0000104928', passthrough: false, groundTruth: 'remove', piiType: true, keyAllowedFor: [], rawKnownName: 'accountNo' },
                ...(drift ? [
                    { span: 'riskScore', canonical: 'unlisted', value: 0.18, passthrough: false, groundTruth: 'remove', piiType: false, keyAllowedFor: [], rawKnownName: 'riskScore' }
                ] : [])
            ]
        },
        '/v1/debug/raw-export': {
            purpose: null,
            requestLine: 'GET /v1/debug/raw-export',
            fields: () => [
                { span: 'displayName', canonical: 'customer.name', value: 'Tendai Moyo', passthrough: false, groundTruth: 'remove', piiType: true, keyAllowedFor: [], rawKnownName: 'displayName' },
                { span: 'externalId', canonical: 'identity.national_id', value: '63-2091847-A-21', passthrough: false, groundTruth: 'remove', piiType: true, keyAllowedFor: [], rawKnownName: 'externalId' },
                { span: 'summary.accountBalance', canonical: 'account.balance', value: 1420.50, passthrough: false, groundTruth: 'remove', piiType: false, keyAllowedFor: [], rawKnownName: 'summary.accountBalance' }
            ]
        }
    };

    const PCDC_POLICY_MATRIX = {
        version: 'fineract-ob-v4.0-p1',
        purposes: {
            kyc: new Set(['customer.name', 'identity.national_id', 'identity.dob', 'account.number.full']),
            balance: new Set(['account.balance']),
            history: new Set(['account.balance', 'transaction.date', 'transaction.amount', 'transaction.type'])
        }
    };

    function setNestedValue(target, dottedPath, value) {
        const cleanSegments = dottedPath.replace(/\[(\d+)\]/g, '.$1').split('.');
        let cursor = target;
        for (let i = 0; i < cleanSegments.length - 1; i++) {
            const seg = cleanSegments[i];
            const nextIsIndex = /^\d+$/.test(cleanSegments[i + 1]);
            if (!(seg in cursor)) {
                cursor[seg] = nextIsIndex ? [] : {};
            }
            cursor = cursor[seg];
        }
        cursor[cleanSegments[cleanSegments.length - 1]] = value;
    }

    function evaluatePcdcFilter(routeKey, mode, drift) {
        const routeSpec = PCDC_ROUTE_TABLE[routeKey] || PCDC_ROUTE_TABLE['/clients/{id}'];
        const purpose = routeSpec.purpose;
        const fields = routeSpec.fields(drift);

        if (mode === 'purpose' && !purpose) {
            const refusedBody = {
                error: 'Forbidden',
                status: 403,
                reason: 'Unmapped route refused by RouteTable (fail closed)',
                route: routeSpec.requestLine
            };
            const decisions = fields.map((f) => ({
                ...f,
                decision: 'REDACT',
                evalLabel: 'TRUE REMOVE',
                evalClass: 'eval-ok'
            }));
            return {
                httpStatus: 403,
                purposeLabel: 'UNMAPPED (REFUSED)',
                decisions,
                responseObj: refusedBody,
                leakPreventionRate: 100.0,
                falseBlockRate: 0.0,
                policyVersion: PCDC_POLICY_MATRIX.version
            };
        }

        let removeTotal = 0;
        let removeCaught = 0;
        let keepTotal = 0;
        let keepWronglyBlocked = 0;
        const responseObj = {};

        const decisions = fields.map((f) => {
            let decision = 'REDACT';

            if (f.passthrough) {
                decision = 'PASSTHROUGH';
            } else if (mode === 'purpose') {
                const allowedSet = PCDC_POLICY_MATRIX.purposes[purpose];
                if (f.canonical !== 'unlisted' && allowedSet && allowedSet.has(f.canonical)) {
                    decision = 'PERMIT';
                } else {
                    decision = 'REDACT';
                }
            } else if (mode === 'type') {
                decision = f.piiType ? 'REDACT' : 'PERMIT';
            } else if (mode === 'key') {
                if (!purpose) {
                    // Per-route gateway key allow-list passes unmapped routes through unchanged
                    decision = 'PERMIT';
                } else {
                    const keyMatches = f.span === f.rawKnownName && f.keyAllowedFor.includes(purpose);
                    const subtreeLeak = f.span === 'summary.internalNote' && purpose === 'balance';
                    decision = (keyMatches || subtreeLeak) ? 'PERMIT' : 'REDACT';
                }
            }

            const outValue = decision === 'REDACT' ? '[REDACTED]' : f.value;
            setNestedValue(responseObj, f.span, outValue);

            let evalLabel = 'NON-PERSONAL';
            let evalClass = 'verdict-pass';
            if (f.groundTruth === 'keep') {
                keepTotal++;
                if (decision === 'PERMIT') {
                    evalLabel = 'TRUE KEEP';
                    evalClass = 'eval-ok';
                } else {
                    keepWronglyBlocked++;
                    evalLabel = 'FALSE BLOCK';
                    evalClass = 'eval-fblock';
                }
            } else if (f.groundTruth === 'remove') {
                removeTotal++;
                if (decision === 'REDACT') {
                    removeCaught++;
                    evalLabel = 'TRUE REMOVE';
                    evalClass = 'eval-ok';
                } else {
                    evalLabel = 'LEAKED';
                    evalClass = 'eval-leak';
                }
            }

            return { ...f, decision, evalLabel, evalClass };
        });

        const leakPreventionRate = removeTotal === 0 ? 100.0 : (removeCaught / removeTotal) * 100;
        const falseBlockRate = keepTotal === 0 ? 0.0 : (keepWronglyBlocked / keepTotal) * 100;

        return {
            httpStatus: 200,
            purposeLabel: purpose ? purpose : 'UNMAPPED (BYPASSED)',
            decisions,
            responseObj,
            leakPreventionRate,
            falseBlockRate,
            policyVersion: PCDC_POLICY_MATRIX.version
        };
    }

    let activePcdcRoute = '/clients/{id}';
    let activePcdcMode = 'purpose';
    let activePcdcDrift = false;

    const pcdcRouteBtns = document.querySelectorAll('.pcdc-route-btn');
    const pcdcModeBtns = document.querySelectorAll('.pcdc-mode-btn');
    const pcdcDriftBtn = document.getElementById('pcdc-drift-btn');
    const pcdcHttpStatus = document.getElementById('pcdc-http-status');
    const pcdcLeakRate = document.getElementById('pcdc-leak-rate');
    const pcdcBlockRate = document.getElementById('pcdc-block-rate');
    const pcdcBodyHash = document.getElementById('pcdc-body-hash');
    const pcdcDecisionsBody = document.getElementById('pcdc-decisions-body');
    const pcdcJsonOut = document.getElementById('pcdc-json-out');

    async function renderPcdcWorkbench() {
        const res = evaluatePcdcFilter(activePcdcRoute, activePcdcMode, activePcdcDrift);
        const bodyText = JSON.stringify(res.responseObj, null, 2);
        const bodyHash = await sha256Hex(bodyText);

        if (pcdcHttpStatus) {
            pcdcHttpStatus.textContent = res.httpStatus === 403
                ? `403 FORBIDDEN · ${res.purposeLabel}`
                : `200 OK · PURPOSE: ${res.purposeLabel}`;
            pcdcHttpStatus.classList.remove('is-ok', 'is-warn', 'is-flagged');
            pcdcHttpStatus.classList.add(
                res.httpStatus === 403 ? 'is-warn' : res.purposeLabel.includes('BYPASSED') ? 'is-flagged' : 'is-ok'
            );
        }

        if (pcdcLeakRate) {
            pcdcLeakRate.textContent = `${res.leakPreventionRate.toFixed(1)}%`;
            pcdcLeakRate.classList.remove('is-ok', 'is-warn', 'is-flagged');
            pcdcLeakRate.classList.add(
                res.leakPreventionRate === 100 ? 'is-ok' : res.leakPreventionRate >= 70 ? 'is-warn' : 'is-flagged'
            );
        }

        if (pcdcBlockRate) {
            pcdcBlockRate.textContent = `${res.falseBlockRate.toFixed(1)}%`;
            pcdcBlockRate.classList.remove('is-ok', 'is-warn', 'is-flagged');
            pcdcBlockRate.classList.add(
                res.falseBlockRate === 0 ? 'is-ok' : res.falseBlockRate < 50 ? 'is-warn' : 'is-flagged'
            );
        }

        if (pcdcBodyHash) {
            pcdcBodyHash.textContent = `${bodyHash.slice(0, 24)}...`;
            pcdcBodyHash.title = bodyHash;
        }

        if (pcdcDecisionsBody) {
            pcdcDecisionsBody.replaceChildren();
            res.decisions.forEach((d) => {
                const tr = document.createElement('tr');

                const tdSpan = document.createElement('td');
                tdSpan.textContent = d.span;

                const tdCanonical = document.createElement('td');
                tdCanonical.textContent = d.canonical;

                const tdDecision = document.createElement('td');
                tdDecision.textContent = d.decision;
                tdDecision.className = d.decision === 'PERMIT'
                    ? 'verdict-permit'
                    : d.decision === 'REDACT'
                        ? 'verdict-redact'
                        : 'verdict-pass';

                const tdEval = document.createElement('td');
                tdEval.textContent = d.evalLabel;
                tdEval.className = d.evalClass;

                tr.append(tdSpan, tdCanonical, tdDecision, tdEval);
                pcdcDecisionsBody.appendChild(tr);
            });
        }

        if (pcdcJsonOut) {
            const auditSummary = {
                audit_record: {
                    route: activePcdcRoute,
                    mode: activePcdcMode,
                    purpose: res.purposeLabel,
                    policy_version: res.policyVersion,
                    sha256_body: bodyHash
                },
                released_response: res.responseObj
            };
            pcdcJsonOut.textContent = JSON.stringify(auditSummary, null, 2);
        }

        return { ...res, bodyHash };
    }

    pcdcRouteBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            activePcdcRoute = btn.dataset.route || '/clients/{id}';
            pcdcRouteBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
            renderPcdcWorkbench();
        });
    });

    pcdcModeBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            activePcdcMode = btn.dataset.mode || 'purpose';
            pcdcModeBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
            renderPcdcWorkbench();
        });
    });

    if (pcdcDriftBtn) {
        pcdcDriftBtn.addEventListener('click', () => {
            activePcdcDrift = !activePcdcDrift;
            pcdcDriftBtn.classList.toggle('is-active', activePcdcDrift);
            pcdcDriftBtn.setAttribute('aria-pressed', String(activePcdcDrift));
            renderPcdcWorkbench();
        });
    }

    renderPcdcWorkbench();

    // ---- 5. SDCAMS RBAC & Immutable Audit Simulator ----
    const SDCAMS_ROLES = {
        contractor: {
            label: 'Contractor (T. Moyo)',
            allowed: new Set(['entry_request']),
            reasons: {
                approve_badge: 'DENIED (403 FORBIDDEN) — Contractors cannot self-approve data centre badges.',
                export_csv: 'DENIED (403 FORBIDDEN) — Compliance export restricted to Auditor / SysAdmin.',
                delete_logs: 'DENIED (403 FORBIDDEN) — Immutable audit policy blocks all log deletions.'
            }
        },
        officer: {
            label: 'Security Officer (P. Ndlovu)',
            allowed: new Set(['entry_request', 'approve_badge']),
            reasons: {
                export_csv: 'DENIED (403 FORBIDDEN) — Bulk compliance export requires Auditor clearance.',
                delete_logs: 'DENIED (403 FORBIDDEN) — Immutable audit policy blocks all log deletions.'
            }
        },
        auditor: {
            label: 'Forensic Auditor (ipridem)',
            allowed: new Set(['export_csv']),
            reasons: {
                entry_request: 'DENIED (403 FORBIDDEN) — Auditors operate read-only; physical escort request unavailable.',
                approve_badge: 'DENIED (403 FORBIDDEN) — Separation of duties: Auditors cannot approve badges.',
                delete_logs: 'DENIED (403 FORBIDDEN) — Immutable audit policy blocks all log deletions.'
            }
        },
        sysadmin: {
            label: 'SysAdmin (Root)',
            allowed: new Set(['entry_request', 'approve_badge', 'export_csv']),
            reasons: {
                delete_logs: 'DENIED (403 FORBIDDEN) — Even SysAdmin cannot erase append-only audit records.'
            }
        }
    };

    const SDCAMS_OPERATIONS = {
        entry_request: 'REQUEST_SERVER_ROOM_ENTRY',
        approve_badge: 'APPROVE_CONTRACTOR_BADGE',
        export_csv: 'EXPORT_COMPLIANCE_CSV',
        delete_logs: 'DELETE_AUDIT_LOG_RECORDS'
    };

    let activeSdcamsRole = 'contractor';
    const roleBtns = document.querySelectorAll('.role-btn');
    const actionBtns = document.querySelectorAll('.action-btn');
    const sdcamsDecision = document.getElementById('sdcams-decision');
    const sdcamsAuditBody = document.getElementById('sdcams-audit-body');

    function appendAuditRow(timestamp, actor, operation, allowed, digestHex) {
        if (!sdcamsAuditBody) return;
        const tr = document.createElement('tr');

        const tdTs = document.createElement('td');
        tdTs.textContent = timestamp;

        const tdActor = document.createElement('td');
        tdActor.textContent = actor;

        const tdOp = document.createElement('td');
        tdOp.textContent = operation;

        const tdRes = document.createElement('td');
        tdRes.className = allowed ? 'policy-allow' : 'policy-deny';
        tdRes.textContent = allowed ? '200 OK · PERMITTED' : '403 · DENIED';

        const tdDigest = document.createElement('td');
        tdDigest.textContent = `${digestHex.slice(0, 16)}...`;
        tdDigest.title = digestHex;

        tr.append(tdTs, tdActor, tdOp, tdRes, tdDigest);
        sdcamsAuditBody.insertBefore(tr, sdcamsAuditBody.firstChild);

        while (sdcamsAuditBody.children.length > 8) {
            sdcamsAuditBody.removeChild(sdcamsAuditBody.lastChild);
        }
    }

    async function seedSdcamsLog() {
        const baselineEvents = [
            { ts: '2026-08-20 14:10:04', actor: 'Contractor (T. Moyo)', op: 'REQUEST_SERVER_ROOM_ENTRY', allowed: true },
            { ts: '2026-08-20 14:12:19', actor: 'Security Officer (P. Ndlovu)', op: 'APPROVE_CONTRACTOR_BADGE', allowed: true },
            { ts: '2026-08-20 14:18:55', actor: 'Forensic Auditor (ipridem)', op: 'EXPORT_COMPLIANCE_CSV', allowed: true }
        ];
        for (const ev of baselineEvents) {
            const digest = await sha256Hex(`${ev.ts}|${ev.actor}|${ev.op}|${ev.allowed}`);
            appendAuditRow(ev.ts, ev.actor, ev.op, ev.allowed, digest);
        }
    }

    roleBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            activeSdcamsRole = btn.dataset.role || 'contractor';
            roleBtns.forEach((b) => b.classList.toggle('is-active', b === btn));
        });
    });

    actionBtns.forEach((btn) => {
        btn.addEventListener('click', async () => {
            const actionKey = btn.dataset.action;
            const roleCfg = SDCAMS_ROLES[activeSdcamsRole];
            const opName = SDCAMS_OPERATIONS[actionKey] || actionKey;
            if (!roleCfg) return;

            const isAllowed = roleCfg.allowed.has(actionKey);
            const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
            const digest = await sha256Hex(`${ts}|${roleCfg.label}|${opName}|${isAllowed}`);

            if (sdcamsDecision) {
                sdcamsDecision.classList.remove('is-info', 'is-allow', 'is-deny');
                sdcamsDecision.classList.add(isAllowed ? 'is-allow' : 'is-deny');
                sdcamsDecision.textContent = isAllowed
                    ? `PERMITTED (200 OK) // ${roleCfg.label} executed ${opName}. Signed & appended to audit log.`
                    : `${roleCfg.reasons[actionKey] || 'DENIED (403 FORBIDDEN)'} Attempt recorded.`;
            }

            appendAuditRow(ts, roleCfg.label, opName, isAllowed, digest);
        });
    });

    seedSdcamsLog();

    // ---- 6. Interactive Security & Forensics CLI ----
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const cliChips = document.querySelectorAll('.cli-chip');

    const VFS = {
        'capabilities.json': JSON.stringify({
            operator: 'Pride Mazwimairi (ipridem)',
            institution: 'University of Zimbabwe',
            domains: ['Offensive Security', 'REST API Disclosure Control', 'Digital Forensics'],
            stack: ['Python 3.12', 'Flask', 'Apache Fineract', 'PyYAML', 'Scikit-Learn', 'Burp Suite', 'Docker'],
            standards: ['OWASP API3:2023', 'Zimbabwe CDPA [Chapter 12:07]', 'UK Open Banking v4.0']
        }, null, 2),
        'deployments.md': [
            '# Deployments',
            '- D-01 SDCAMS : Data Centre RBAC & Immutable Audit System (https://github.com/ipridem/SDCAMS)',
            '- D-02 purpose-conditioned-disclosure-control : Purpose-Bound REST Response Filter (https://github.com/ipridem/purpose-conditioned-disclosure-control)',
            '- D-03 SmishGuard ZW : Hybrid Shona/English Smishing Classifier (https://github.com/ipridem/smishguard)'
        ].join('\n'),
        'fineract_policy.yaml': [
            'version: fineract-ob-v4.0-p1',
            'routes:',
            '  /clients/{id}: kyc',
            '  /savingsaccounts/{id}: balance',
            '  /savingsaccounts/{id}?associations=transactions: history',
            'purposes:',
            '  balance: [account.balance]',
            '  history: [account.balance, transaction.date, transaction.amount, transaction.type]',
            '  kyc: [customer.name, identity.national_id, identity.dob, account.number.full]'
        ].join('\n'),
        'contact.txt': [
            'GitHub : https://github.com/ipridem',
            'X      : https://x.com/ipridem',
            'Email  : pridemazwi03@gmail.com',
            'Loc    : Harare, Zimbabwe (UTC+2)'
        ].join('\n')
    };

    const KNOWN_COMMANDS = ['help', 'whoami', 'ls', 'cat', 'filter', 'smish', 'sha256', 'clear'];
    let commandHistory = [];
    let historyIndex = -1;

    function appendCliLine(text, toneClass) {
        if (!terminalOutput) return;
        const div = document.createElement('div');
        div.className = toneClass ? `cli-line ${toneClass}` : 'cli-line';
        div.textContent = text;
        terminalOutput.appendChild(div);
        terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }

    function appendCliEcho(cmdText) {
        if (!terminalOutput) return;
        const line = document.createElement('div');
        line.className = 'cli-line';

        const prompt = document.createElement('span');
        prompt.className = 'cli-prompt';
        prompt.textContent = 'ipridem@uz-sec-lab:~$';

        line.appendChild(prompt);
        line.appendChild(document.createTextNode(` ${cmdText}`));
        terminalOutput.appendChild(line);
    }

    async function runCliCommand(rawCmd) {
        const trimmed = rawCmd.trim();
        if (!trimmed) return;

        appendCliEcho(trimmed);

        const firstSpace = trimmed.indexOf(' ');
        const cmd = (firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace)).toLowerCase();
        const arg = firstSpace === -1 ? '' : trimmed.slice(firstSpace + 1).trim();

        switch (cmd) {
            case 'help':
                appendCliLine([
                    'Available commands:',
                    '  whoami              Display operator profile and research focus',
                    '  ls [-la]            List virtual workspace artifacts',
                    '  cat <filename>      Read artifact contents (e.g. cat fineract_policy.yaml)',
                    '  filter <purpose>    Run purpose-bound REST filter (kyc | balance | history | unmapped)',
                    '  smish <message>     Evaluate SMS payload using SmishGuard ZW heuristics',
                    '  sha256 <text>       Compute live SHA-256 hex digest via Web Crypto',
                    '  clear               Clear terminal output'
                ].join('\n'), 'cli-accent');
                break;

            case 'whoami':
                appendCliLine([
                    'Operator    : Pride Mazwimairi (ipridem)',
                    'Role        : Final-Year BSc Cybersecurity & Forensic Auditing',
                    'Institution : University of Zimbabwe (Harare, ZW)',
                    'Research    : Purpose-Bound REST API Disclosure Control (OWASP API3 / CDPA)'
                ].join('\n'), 'cli-ok');
                break;

            case 'ls':
            case 'll':
                if (arg === '-la' || arg === '-l' || cmd === 'll') {
                    appendCliLine([
                        '-rw-r--r--  1 ipridem  sec-lab   358  Nov 16 14:20 capabilities.json',
                        '-rw-r--r--  1 ipridem  sec-lab   344  Nov 16 14:21 deployments.md',
                        '-r--r--r--  1 ipridem  sec-lab   312  Nov 16 14:22 fineract_policy.yaml',
                        '-rw-r--r--  1 ipridem  sec-lab   124  Nov 16 14:22 contact.txt'
                    ].join('\n'));
                } else {
                    appendCliLine(Object.keys(VFS).join('   '));
                }
                break;

            case 'cat':
                if (!arg) {
                    appendCliLine('Usage: cat <filename> (available: ' + Object.keys(VFS).join(', ') + ')', 'cli-warn');
                } else if (Object.prototype.hasOwnProperty.call(VFS, arg)) {
                    appendCliLine(VFS[arg]);
                } else {
                    appendCliLine(`cat: ${arg}: No such file in sandbox`, 'cli-err');
                }
                break;

            case 'verify':
            case 'verify-chain':
            case 'filter': {
                const purposeArg = (cmd === 'filter' ? (arg || 'kyc') : 'kyc').toLowerCase();
                const routeByPurpose = {
                    kyc: '/clients/{id}',
                    balance: '/savingsaccounts/{id}',
                    history: '/savingsaccounts/{id}?associations=transactions',
                    unmapped: '/v1/debug/raw-export'
                };
                const targetRoute = routeByPurpose[purposeArg];
                if (!targetRoute) {
                    appendCliLine('Usage: filter <kyc | balance | history | unmapped>', 'cli-warn');
                    break;
                }
                const out = evaluatePcdcFilter(targetRoute, 'purpose', false);
                const digest = await sha256Hex(JSON.stringify(out.responseObj, null, 2));
                const lines = out.decisions.map(
                    (d) => `  [${d.decision.padEnd(11)}] ${d.span} -> ${d.canonical} (${d.evalLabel})`
                );
                appendCliLine([
                    `HTTP ${out.httpStatus} | Route: ${targetRoute} | Purpose: ${out.purposeLabel}`,
                    `Leak-Prevention: ${out.leakPreventionRate.toFixed(1)}% | False-Block: ${out.falseBlockRate.toFixed(1)}%`,
                    `SHA-256 Body: ${digest}`,
                    ...lines
                ].join('\n'), out.httpStatus === 403 ? 'cli-warn' : 'cli-ok');
                break;
            }

            case 'smish':
                if (!arg) {
                    appendCliLine('Usage: smish <sms_message_text>', 'cli-warn');
                } else {
                    const analysis = analyzeSmishPayload(arg);
                    const tone = analysis.level === 'critical'
                        ? 'cli-err'
                        : analysis.level === 'warn'
                            ? 'cli-warn'
                            : 'cli-ok';
                    appendCliLine([
                        `Verdict : ${analysis.verdict}`,
                        `Score   : ${analysis.score} / 100`,
                        `URL     : ${analysis.features.url.label}`,
                        `Lure    : ${analysis.features.lure.label}`,
                        `Urgency : ${analysis.features.urgency.label}`,
                        `Ask     : ${analysis.features.ask.label}`
                    ].join('\n'), tone);
                }
                break;

            case 'sha256':
                if (!arg) {
                    appendCliLine('Usage: sha256 <input_string>', 'cli-warn');
                } else {
                    const hex = await sha256Hex(arg);
                    appendCliLine(`SHA-256("${arg}") = ${hex}`, 'cli-accent');
                }
                break;

            case 'clear':
                if (terminalOutput) {
                    terminalOutput.replaceChildren();
                }
                break;

            default:
                appendCliLine(`zsh: command not found: ${cmd}. Type 'help' for supported commands.`, 'cli-err');
        }
    }

    if (terminalInput) {
        terminalInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = terminalInput.value.trim();
                if (val) {
                    commandHistory.unshift(val);
                    historyIndex = -1;
                    runCliCommand(val);
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
            } else if (e.key === 'Tab') {
                e.preventDefault();
                const current = terminalInput.value;
                const trimmedStart = current.trimStart();
                if (!trimmedStart.includes(' ')) {
                    const match = KNOWN_COMMANDS.find((c) => c.startsWith(trimmedStart.toLowerCase()));
                    if (match) {
                        terminalInput.value = match + (['cat', 'filter', 'smish', 'sha256'].includes(match) ? ' ' : '');
                    }
                } else if (trimmedStart.toLowerCase().startsWith('cat ')) {
                    const partialFile = trimmedStart.slice(4);
                    const fileMatch = Object.keys(VFS).find((f) => f.startsWith(partialFile));
                    if (fileMatch) {
                        terminalInput.value = `cat ${fileMatch}`;
                    }
                }
            }
        });
    }

    cliChips.forEach((chip) => {
        chip.addEventListener('click', () => {
            const cmd = chip.dataset.cmd;
            if (cmd) {
                commandHistory.unshift(cmd);
                historyIndex = -1;
                runCliCommand(cmd);
                if (terminalInput) {
                    terminalInput.focus();
                }
            }
        });
    });

    // ---- 7. Copy Email Action ----
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', async () => {
            const email = 'pridemazwi03@gmail.com';
            try {
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(email);
                } else {
                    const temp = document.createElement('textarea');
                    temp.value = email;
                    temp.setAttribute('readonly', '');
                    document.body.appendChild(temp);
                    temp.select();
                    document.execCommand('copy');
                    document.body.removeChild(temp);
                }
                copyEmailBtn.textContent = 'COPIED TO CLIPBOARD';
                copyEmailBtn.classList.add('is-copied');
                setTimeout(() => {
                    copyEmailBtn.textContent = 'Copy Email';
                    copyEmailBtn.classList.remove('is-copied');
                }, 2000);
            } catch (_) {
                copyEmailBtn.textContent = 'pridemazwi03@gmail.com';
            }
        });
    }

    // ---- 8. Restrained Scroll Reveal ----
    const revealables = document.querySelectorAll('[data-reveal]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
        revealables.forEach((el) => el.classList.add('in-view'));
    } else {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08 });
        revealables.forEach((el) => observer.observe(el));
    }
});

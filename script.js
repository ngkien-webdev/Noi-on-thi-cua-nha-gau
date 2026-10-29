// script.js - Hệ thống logic luyện thi trắc nghiệm & Trang con Tiếng Anh 4 Kỹ Năng cho Nhà Gấu

// ==================== STATE MANAGEMENT ====================
let state = {
    currentSubject: null,
    sections: [],
    selectedSections: [],
    availableCount: 0,
    requestedCount: 10,
    mode: 'practice', // 'practice' | 'exam'
    time: 15, // phút
    quizData: [],
    answers: {},
    flagged: {},
    currentIndex: 0,
    timerInt: null,
    timeRem: 0,
    soundEnabled: localStorage.getItem('gau_sound') !== 'false',
    history: JSON.parse(localStorage.getItem('gau_history')) || [],
    reviewFilter: 'all', // 'all' | 'wrong' | 'correct'
    searchQuery: '',
    englishTab: 'listening',
    englishTheme: 'all',
    speechRate: 0.85,
    listeningIndex: 0,
    currentReadingStory: 'story1',
    unscrambleIndex: 0,
    unscrambleWords: [],
    unscrambleBank: [],
    vocabSearchQuery: '',
    vocabMasteredOnly: false,
    masteredVocab: new Set(JSON.parse(localStorage.getItem('gau_en_mastered') || '[]')),
    xp: parseInt(localStorage.getItem('gau_en_xp') || '50', 10),
    streak: parseInt(localStorage.getItem('gau_en_streak') || '1', 10),
    matchingSelected: { col: null, id: null },
    matchedPairs: new Set()
};

// ==================== DAILY MOTIVATIONAL QUOTES ====================
const BEAR_QUOTES = [
    '"Uống một ngụm nước ấm rồi cùng Gấu làm vài câu trắc nghiệm nhé! ☕"',
    '"Mỗi ngày một chút, kiến thức sẽ đầy dần. Cố lên bạn nhé! 🍯"',
    '"Học tập vui vẻ, thi cử nhẹ nhàng cùng Nhà Gấu 🐻"',
    '"Đường dài vạn dặm bắt đầu từ một bước chân. Bắt đầu ngay thôi! 🐾"',
    '"Tập trung một chút thôi, bạn đang làm rất tốt rồi đó! ✨"',
    '"Đừng nản lòng khi gặp câu hỏi khó, Gấu luôn đồng hành cùng bạn! 🌿"',
    '"Kiên trì thêm một chút nữa, bạn sẽ gặt hái kết quả xứng đáng! 🌟"'
];

function initBearQuote() {
    const el = document.getElementById('bear-quote');
    if (!el) return;
    const randomIndex = Math.floor(Math.random() * BEAR_QUOTES.length);
    el.innerText = BEAR_QUOTES[randomIndex];
}

// ==================== AUDIO SYNTHESIZER (WEB AUDIO API) ====================
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playSound(type) {
    if (!state.soundEnabled) return;
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;

        if (type === 'click') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(550, now);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.04);
        } else if (type === 'correct') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(523.25, now); // C5
            osc.frequency.setValueAtTime(659.25, now + 0.07); // E5
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.22);
        } else if (type === 'wrong') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.setValueAtTime(175, now + 0.07);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.18);
        } else if (type === 'fanfare') {
            const notes = [523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.12, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + idx * 0.08);
                osc.stop(now + idx * 0.08 + 0.25);
            });
        }
    } catch (e) {
        console.warn("Audio error:", e);
    }
}

function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    localStorage.setItem('gau_sound', state.soundEnabled);
    updateSoundUI();
    if (state.soundEnabled) playSound('click');
}

function updateSoundUI() {
    const icon = document.getElementById('sound-icon');
    if (!icon) return;
    if (state.soundEnabled) {
        icon.className = 'fa-solid fa-volume-high text-base text-honey';
    } else {
        icon.className = 'fa-solid fa-volume-xmark text-base text-subtext';
    }
}

// ==================== ENGLISH SPEECH SYNTHESIS (VOICE) ====================
function speakEnglish(text, rate = null, onEnd = null) {
    if (!('speechSynthesis' in window)) {
        console.warn("SpeechSynthesis is not supported in this browser.");
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate !== null ? rate : (state.speechRate || 0.85);

    const waveAnim = document.getElementById('listening-audio-wave');
    if (waveAnim) {
        waveAnim.classList.remove('hidden');
        waveAnim.classList.add('audio-playing');
    }

    utterance.onend = () => {
        if (waveAnim) {
            waveAnim.classList.remove('audio-playing');
            waveAnim.classList.add('hidden');
        }
        if (typeof onEnd === 'function') onEnd();
    };

    utterance.onerror = () => {
        if (waveAnim) {
            waveAnim.classList.remove('audio-playing');
            waveAnim.classList.add('hidden');
        }
    };

    window.speechSynthesis.speak(utterance);
}

// ==================== THEME & DARK MODE ====================
function initTheme() {
    const saved = localStorage.getItem('gau_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (saved === 'dark' || (!saved && prefersDark)) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
    } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
    }
    updateThemeIcon();
}

function toggleDarkMode() {
    const isDark = document.documentElement.classList.toggle('dark');
    document.documentElement.classList.toggle('light', !isDark);
    localStorage.setItem('gau_theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
    playSound('click');
}

function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    const isDark = document.documentElement.classList.contains('dark');
    icon.className = isDark ? 'fa-solid fa-sun text-lg text-honey' : 'fa-solid fa-moon text-lg text-honey';
}

// ==================== INITIALIZATION ====================
document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    updateSoundUI();
    initBearQuote();
    renderSubjects();
    renderContinueStudyCard();
    renderRealStats();
    renderHistory();
    attachKeyboardNavigation();
});

// ==================== NAVIGATION ====================
function navigateTo(viewId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`view-${viewId}`);
    if (target) {
        target.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// ==================== REAL STATISTICS ====================
function renderRealStats() {
    let totalQuestions = 0;
    let activeSubs = 0;

    SUBJECTS.forEach(sub => {
        if (sub.active && QUESTION_BANK[sub.id]) {
            totalQuestions += QUESTION_BANK[sub.id].length;
            activeSubs++;
        }
    });

    const activeEl = document.getElementById('stat-active-sub');
    if (activeEl) activeEl.innerText = `${activeSubs} Môn`;

    const totalEl = document.getElementById('stat-total-q');
    if (totalEl) totalEl.innerText = totalQuestions.toLocaleString();

    const histCountEl = document.getElementById('stat-history-count');
    if (histCountEl) histCountEl.innerText = state.history.length;

    const avgScoreEl = document.getElementById('stat-avg-score');
    if (avgScoreEl) {
        if (state.history.length === 0) {
            avgScoreEl.innerText = '-.-';
        } else {
            const sum = state.history.reduce((acc, cur) => acc + Number(cur.score || 0), 0);
            const avg = (sum / state.history.length).toFixed(1);
            avgScoreEl.innerText = `${avg}/10`;
        }
    }

    const badge = document.getElementById('history-badge-count');
    if (badge) badge.innerText = state.history.length;

    const subCountBadge = document.getElementById('subject-count-badge');
    if (subCountBadge) subCountBadge.innerText = `${activeSubs} môn khả dụng`;
}

// ==================== "TIẾP TỤC ÔN TẬP" CARD ====================
function renderContinueStudyCard() {
    const container = document.getElementById('continue-study-container');
    if (!container) return;

    if (state.history.length === 0) {
        container.classList.add('hidden');
        return;
    }

    const last = state.history[0];
    const sub = SUBJECTS.find(s => s.name === last.sub || s.id === last.subId);
    const subId = sub ? sub.id : 'tieng_anh';
    const subIcon = sub ? sub.icon : '📖';

    container.classList.remove('hidden');
    container.innerHTML = `
        <div class="cozy-card rounded-2xl p-4 sm:p-5 border border-honey/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3.5">
                <div class="w-10 h-10 rounded-xl bg-honey/15 text-honey flex items-center justify-center text-xl shrink-0">
                    ${subIcon}
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-[11px] font-bold uppercase tracking-wider text-honey">Tiếp tục ôn tập</span>
                        <span class="text-xs text-subtext">• Lần gần nhất: ${last.date}</span>
                    </div>
                    <h4 class="font-extrabold text-sm sm:text-base text-bear-dark dark:text-[#FAF5F0]">
                        ${last.sub} <span class="text-xs font-semibold text-subtext">(${last.mode} - Đạt ${last.score}đ)</span>
                    </h4>
                </div>
            </div>
            <button onclick="selectSubject('${subId}')" class="self-start sm:self-center px-4 py-2 rounded-xl bg-honey hover:bg-honey-600 text-white font-extrabold text-xs shadow-xs transition-all flex items-center gap-1.5">
                <span>Ôn tập tiếp</span>
                <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
        </div>
    `;
}

// ==================== 1. CHỌN MÔN HỌC (VIEW HOME) ====================
function renderSubjects() {
    const listEl = document.getElementById('subject-list');
    const emptyEl = document.getElementById('subject-empty-search');
    if (!listEl) return;

    const query = state.searchQuery.trim().toLowerCase();
    const filtered = SUBJECTS.filter(s => {
        if (!query) return true;
        return s.name.toLowerCase().includes(query) || s.desc.toLowerCase().includes(query);
    });

    if (filtered.length === 0) {
        listEl.innerHTML = '';
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
    }
    if (emptyEl) emptyEl.classList.add('hidden');

    const pastelBgMap = {
        'cntt_nangcao': { bg: 'bg-pastel-blue dark:bg-[#1e293b]', icon: '💻' },
        'moi_truong_va_con_nguoi': { bg: 'bg-pastel-green dark:bg-[#1e3326]', icon: '🌱' },
        'tu_tuong_ho_chi_minh': { bg: 'bg-pastel-pink dark:bg-[#3b2028]', icon: '🇻🇳' },
        'tieng_anh': { bg: 'bg-pastel-blue dark:bg-[#1f2d3d]', icon: '🇬🇧' }
    };

    const html = filtered.map(sub => {
        const qList = QUESTION_BANK[sub.id] || [];
        const qCount = qList.length;
        const sectionsCount = new Set(qList.map(q => q.s)).size;
        const pastel = pastelBgMap[sub.id] || { bg: 'bg-cream-100 dark:bg-[#2c2018]', icon: sub.icon };

        const isEnglish = sub.id === 'tieng_anh';
        const tagText = isEnglish ? '4 KỸ NĂNG 🇬🇧' : sub.id === 'tu_tuong_ho_chi_minh' ? 'ĐANG MỞ 🇻🇳' : 'ĐANG HỌC';
        const actionText = isEnglish ? 'Khám phá ngay' : 'Ôn ngay';

        return `
        <div onclick="selectSubject('${sub.id}')" 
             class="cozy-card cozy-card-interactive rounded-3xl p-5 sm:p-6 cursor-pointer border border-[#F1E5D5] dark:border-[#3d2d23] flex flex-col justify-between group">
            <div>
                <!-- Top Icon in Pastel Container & Status Tag -->
                <div class="flex items-center justify-between mb-4">
                    <div class="w-12 h-12 rounded-2xl ${pastel.bg} flex items-center justify-center text-2xl shadow-xs transition-transform group-hover:scale-105">
                        ${pastel.icon}
                    </div>
                    <span class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cream-100 dark:bg-[#34241b] text-bear-dark dark:text-honey border border-[#EADBCC] dark:border-[#4d3628]">
                        ${tagText}
                    </span>
                </div>

                <!-- Title & Description -->
                <h3 class="font-extrabold text-base sm:text-lg text-bear-dark dark:text-[#FAF5F0] group-hover:text-honey transition-colors mb-1.5">
                    ${sub.name}
                </h3>
                <p class="text-xs text-subtext dark:text-[#C5B8A8] leading-relaxed mb-5 line-clamp-2">
                    ${sub.desc}
                </p>
            </div>

            <!-- Footer Meta Info & Interactive Action -->
            <div class="pt-3.5 border-t border-[#F1E5D5] dark:border-[#38271e] flex items-center justify-between">
                <div class="flex items-center gap-2 text-[11px] font-bold text-subtext dark:text-[#A0AEC0]">
                    <span>${sectionsCount} phần</span>
                    <span>•</span>
                    <span>${qCount} câu</span>
                </div>
                <span class="text-xs font-extrabold text-honey group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>${actionText}</span>
                    <i class="fa-solid fa-arrow-right text-[10px]"></i>
                </span>
            </div>
        </div>`;
    }).join('');

    listEl.innerHTML = html;
}

// Search handlers
function handleSubjectSearch(val) {
    state.searchQuery = val;
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
        if (val.trim()) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }
    renderSubjects();
}

function clearSubjectSearch() {
    const input = document.getElementById('subject-search-input');
    if (input) input.value = '';
    state.searchQuery = '';
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) clearBtn.classList.add('hidden');
    renderSubjects();
}

// ==================== DEDICATED ENGLISH 4 SKILLS SUB-PAGE ====================

// --- XP & Gamification Helpers ---
function addXP(amount, message = '') {
    state.xp = (state.xp || 0) + amount;
    localStorage.setItem('gau_en_xp', state.xp);
    renderEnglishStats();
    if (message) {
        console.log(`[XP +${amount}] ${message}`);
    }
}

function toggleSpeechRate() {
    playSound('click');
    if (state.speechRate >= 0.85) {
        state.speechRate = 0.7;
        const lbl = document.getElementById('en-speech-rate-label');
        if (lbl) lbl.innerText = "0.7x Chậm";
    } else {
        state.speechRate = 0.85;
        const lbl = document.getElementById('en-speech-rate-label');
        if (lbl) lbl.innerText = "0.85x Chuẩn";
    }
}

function renderEnglishStats() {
    const xpEl = document.getElementById('en-stat-xp');
    if (xpEl) xpEl.innerText = `${state.xp || 0} XP`;

    const streakEl = document.getElementById('en-stat-streak');
    if (streakEl) streakEl.innerText = `${state.streak || 1} ngày`;

    const masteredEl = document.getElementById('en-stat-mastered');
    if (masteredEl) masteredEl.innerText = `${state.masteredVocab ? state.masteredVocab.size : 0} từ thuộc`;

    const rateLbl = document.getElementById('en-speech-rate-label');
    if (rateLbl) rateLbl.innerText = state.speechRate === 0.7 ? "0.7x Chậm" : "0.85x Chuẩn";
}

// --- Main English Entry Point ---
function openEnglishApp() {
    playSound('click');
    state.currentSubject = 'tieng_anh';
    navigateTo('english');
    renderEnglishStats();
    switchEnglishTab(state.englishTab || 'part1');
}

function switchEnglishTab(tabId) {
    playSound('click');
    state.englishTab = tabId;

    // Update Tab Buttons
    document.querySelectorAll('.en-tab-btn').forEach(btn => {
        btn.className = "en-tab-btn px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shrink-0 transition-all text-subtext hover:bg-cream-100 dark:hover:bg-[#2c2018]";
    });
    const activeBtn = document.getElementById(`tab-btn-${tabId}`);
    if (activeBtn) {
        activeBtn.className = "en-tab-btn px-4 py-2 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2 shrink-0 transition-all bg-honey text-white shadow-xs";
    }

    // Update Tab Contents
    document.querySelectorAll('.en-tab-content').forEach(c => c.classList.add('hidden'));
    const targetContent = document.getElementById(`en-tab-${tabId}`);
    if (targetContent) targetContent.classList.remove('hidden');

    // Trigger tab-specific initializers
    if (tabId === 'part1') initPart1();
    else if (tabId === 'theme1') initTheme1();
    else if (tabId === 'shapes') initShapesAndColors();
    else if (tabId === 'speaking') initEnglishSpeaking();
    else if (tabId === 'vocab') initEnglishVocab();
}

function startEnglishQuizFromTab() {
    selectSubject('tieng_anh', true);
}

// ==================== TAB 1: 5 DẠNG BÀI TẬP CỐT LÕI (TRANG 7 - 13) ====================
let part1MatchingState = { selected: null, matched: new Set() };
let colorsMatchState = { selected: null, matched: new Set() };

function initPart1() {
    renderPart1Matching();
    renderPart1Missing();
    renderTrack27Grid();
    renderTrack29();
    renderPart1Context();
}

// Dạng 1: Nối bánh nướng (Trang 8)
function renderPart1Matching() {
    part1MatchingState = { selected: null, matched: new Set() };
    const colA = document.getElementById('part1-matching-a');
    const colB = document.getElementById('part1-matching-b');
    if (!colA || !colB || typeof MCBOOKS_PART1_DATA === 'undefined') return;

    const pairs = MCBOOKS_PART1_DATA.matchingExercise1.pairs;
    const shuffledB = [...pairs].sort(() => Math.random() - 0.5);

    colA.innerHTML = pairs.map(p => `
        <div onclick="handlePart1Match('A', ${p.id}, this)" id="p1-match-a-${p.id}" 
             class="matching-card p-3.5 rounded-2xl border border-[#F1E5D5] dark:border-[#3d2d23] bg-white dark:bg-[#251b15] font-black text-sm text-bear-dark dark:text-[#FAF5F0] flex items-center justify-between">
            <span class="flex items-center gap-2.5">
                <span class="text-xl">${p.icon}</span>
                <span>${p.word}</span>
            </span>
            <button onclick="event.stopPropagation(); speakEnglish('${p.word}')" class="text-subtext hover:text-honey p-1" title="Nghe phát âm">
                <i class="fa-solid fa-volume-high text-xs"></i>
            </button>
        </div>
    `).join('');

    colB.innerHTML = shuffledB.map(p => `
        <div onclick="handlePart1Match('B', ${p.id}, this)" id="p1-match-b-${p.id}" 
             class="matching-card p-3.5 rounded-2xl border border-[#F1E5D5] dark:border-[#3d2d23] bg-white dark:bg-[#251b15] font-semibold text-xs sm:text-sm text-subtext dark:text-[#C5B8A8] flex items-center gap-2">
            <span>🎨</span>
            <span>${p.picLabel}</span>
        </div>
    `).join('');

    updatePart1MatchScore();
}

function handlePart1Match(col, id, el) {
    if (part1MatchingState.matched.has(id)) return;
    playSound('click');

    if (!part1MatchingState.selected) {
        part1MatchingState.selected = { col, id };
        el.classList.add('selected');
    } else if (part1MatchingState.selected.col === col) {
        document.querySelectorAll('#part1-matching-a .selected, #part1-matching-b .selected').forEach(c => c.classList.remove('selected'));
        part1MatchingState.selected = { col, id };
        el.classList.add('selected');
    } else {
        const firstId = part1MatchingState.selected.id;
        const secondId = id;

        if (firstId === secondId) {
            playSound('correct');
            part1MatchingState.matched.add(firstId);
            addXP(10, "Nối đúng bánh nướng");

            const cardA = document.getElementById(`p1-match-a-${firstId}`);
            const cardB = document.getElementById(`p1-match-b-${firstId}`);
            if (cardA) { cardA.classList.remove('selected'); cardA.classList.add('matched'); }
            if (cardB) { cardB.classList.remove('selected'); cardB.classList.add('matched'); }

            part1MatchingState.selected = null;
            updatePart1MatchScore();
        } else {
            playSound('wrong');
            document.querySelectorAll('#part1-matching-a .selected, #part1-matching-b .selected').forEach(c => c.classList.remove('selected'));
            part1MatchingState.selected = null;
        }
    }
}

function updatePart1MatchScore() {
    const badge = document.getElementById('part1-matching-score');
    if (!badge || typeof MCBOOKS_PART1_DATA === 'undefined') return;
    const total = MCBOOKS_PART1_DATA.matchingExercise1.pairs.length;
    badge.innerText = `Đã ghép: ${part1MatchingState.matched.size} / ${total} cặp`;
    if (part1MatchingState.matched.size === total) {
        playSound('fanfare');
        badge.innerHTML = `<span class="text-emerald-600 font-extrabold">🎉 Xuất sắc! Hoàn thành nối toàn bộ bánh nướng trang 8!</span>`;
    }
}

function resetPart1Matching() {
    renderPart1Matching();
}

// Dạng 2: Điền chữ cái còn thiếu (Trang 10)
function renderPart1Missing() {
    const grid = document.getElementById('part1-missing-grid');
    if (!grid || typeof MCBOOKS_PART1_DATA === 'undefined') return;

    grid.innerHTML = MCBOOKS_PART1_DATA.missingLetters.map((item, itemIdx) => {
        let holeIdx = 0;
        const boxes = item.display.map(char => {
            if (char === '_') {
                const currentHole = holeIdx++;
                return `<input type="text" maxlength="1" data-p1-item="${itemIdx}" data-p1-hole="${currentHole}" class="missing-letter-input font-bold" oninput="handlePart1MissingInput(this, ${itemIdx}, ${currentHole})">`;
            } else if (char === ' ') {
                return `<span class="w-3"></span>`;
            } else {
                return `<span class="w-6 h-9 flex items-center justify-center font-black text-base text-bear-dark dark:text-[#FAF5F0]">${char}</span>`;
            }
        }).join('');

        return `
            <div class="cozy-card p-4 rounded-2xl border border-[#F1E5D5] dark:border-[#3d2d23] text-center flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-center gap-2 mb-2">
                        <span class="text-2xl">${item.icon}</span>
                        <span class="text-xs font-bold text-subtext">${item.vn}</span>
                    </div>
                    <div class="flex items-center justify-center gap-1 mb-3 flex-wrap">
                        ${boxes}
                    </div>
                </div>
                <button onclick="speakEnglish('${item.word}')" class="text-[11px] font-bold text-honey hover:underline">
                    <i class="fa-solid fa-volume-high"></i> Nghe: ${item.word}
                </button>
            </div>
        `;
    }).join('');
}

function handlePart1MissingInput(input, itemIdx, holeIdx) {
    input.value = input.value.toUpperCase();
    if (input.value) {
        const next = document.querySelector(`input[data-p1-item="${itemIdx}"][data-p1-hole="${holeIdx + 1}"]`);
        if (next) next.focus();
    }
}

function checkPart1Missing() {
    if (typeof MCBOOKS_PART1_DATA === 'undefined') return;
    let totalHoles = 0;
    let correctHoles = 0;

    MCBOOKS_PART1_DATA.missingLetters.forEach((item, itemIdx) => {
        item.missing.forEach((expectedChar, holeIdx) => {
            totalHoles++;
            const input = document.querySelector(`input[data-p1-item="${itemIdx}"][data-p1-hole="${holeIdx}"]`);
            if (input) {
                if (input.value.trim().toUpperCase() === expectedChar) {
                    correctHoles++;
                    input.className = "missing-letter-input correct";
                } else {
                    input.className = "missing-letter-input wrong";
                }
            }
        });
    });

    const scoreEl = document.getElementById('part1-missing-score');
    if (correctHoles === totalHoles) {
        playSound('correct');
        addXP(25, "Đúng toàn bộ chữ cái thiếu");
        scoreEl.innerHTML = `<span class="text-emerald-600 font-extrabold">🎉 Quá giỏi! Đúng toàn bộ ${correctHoles}/${totalHoles} chữ cái! (+25 XP)</span>`;
    } else {
        playSound('wrong');
        scoreEl.innerHTML = `<span class="text-rose-500 font-bold">Đúng ${correctHoles}/${totalHoles} chữ cái. Hãy chỉnh lại các ô màu đỏ nhé!</span>`;
    }
}

function resetPart1Missing() {
    playSound('click');
    document.querySelectorAll('#part1-missing-grid .missing-letter-input').forEach(input => {
        input.value = '';
        input.className = "missing-letter-input font-bold";
    });
    const scoreEl = document.getElementById('part1-missing-score');
    if (scoreEl) scoreEl.innerText = "Chưa kiểm tra";
}

// Dạng 3: Track 27 Nghe & đánh số thứ tự tranh (Trang 11, 12)
function playTrack27Audio() {
    if (typeof MCBOOKS_PART1_DATA === 'undefined') return;
    speakEnglish(MCBOOKS_PART1_DATA.listenAndNumber.audioDialogue, state.speechRate || 0.85);
}

function renderTrack27Grid() {
    const grid = document.getElementById('part1-track27-grid');
    if (!grid || typeof MCBOOKS_PART1_DATA === 'undefined') return;

    grid.innerHTML = MCBOOKS_PART1_DATA.listenAndNumber.pictures.map(pic => `
        <div class="p-3.5 rounded-2xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e] text-center flex flex-col justify-between">
            <div>
                <span class="text-3xl block mb-1.5">${pic.icon}</span>
                <span class="text-xs font-bold text-bear-dark dark:text-[#FAF5F0] block mb-2">${pic.name}</span>
            </div>
            <div class="flex items-center justify-center gap-1.5 pt-2 border-t border-[#F1E5D5] dark:border-[#38271e]">
                <span class="text-xs font-semibold text-subtext">Số:</span>
                <input type="number" min="1" max="5" id="track27-input-${pic.id}" 
                       class="w-10 h-9 text-center font-black text-sm rounded-lg border border-[#EADBCC] dark:border-[#4d3628] bg-white dark:bg-[#2c2018] text-bear-dark dark:text-honey focus:border-honey focus:outline-none">
            </div>
        </div>
    `).join('');
}

function checkTrack27Order() {
    if (typeof MCBOOKS_PART1_DATA === 'undefined') return;
    const pics = MCBOOKS_PART1_DATA.listenAndNumber.pictures;
    let correctCount = 0;

    pics.forEach(pic => {
        const input = document.getElementById(`track27-input-${pic.id}`);
        if (input) {
            const val = parseInt(input.value.trim(), 10);
            if (val === pic.order) {
                correctCount++;
                input.className = "w-10 h-9 text-center font-black text-sm rounded-lg border-2 border-emerald-500 bg-emerald-50 dark:bg-[#153424] text-emerald-800 dark:text-emerald-300";
            } else {
                input.className = "w-10 h-9 text-center font-black text-sm rounded-lg border-2 border-rose-500 bg-rose-50 dark:bg-[#381a22] text-rose-800 dark:text-rose-300";
            }
        }
    });

    const fb = document.getElementById('part1-track27-feedback');
    if (!fb) return;
    fb.classList.remove('hidden');

    if (correctCount === pics.length) {
        playSound('correct');
        addXP(20, "Đánh số đúng thứ tự Track 27");
        fb.className = "p-4 rounded-2xl text-xs sm:text-sm font-bold bg-pastel-green text-emerald-900 border border-emerald-300 dark:bg-[#153424] dark:text-emerald-300";
        fb.innerHTML = `🎉 Chuẩn xác 100%! Thứ tự xuất hiện trong hội thoại: 1. Beehive 🐝 -> 2. Spiderweb 🕸️ -> 3. Aquarium 🐠 -> 4. Tree hollow 🐿️ -> 5. Birdcage 🦜 (+20 XP)`;
    } else {
        playSound('wrong');
        fb.className = "p-4 rounded-2xl text-xs sm:text-sm font-bold bg-pastel-pink text-rose-900 border border-rose-300 dark:bg-[#381a22] dark:text-rose-300";
        fb.innerHTML = `💡 Bạn đúng ${correctCount}/${pics.length} tranh. Hãy nghe lại audio Track 27 và chú ý loài vật nào được nhắc tới trước nhé!`;
    }
}

// Dạng 4: Nghe chọn đáp án Track 29 (Trang 12, 13)
function renderTrack29() {
    const container = document.getElementById('part1-track29-container');
    if (!container || typeof MCBOOKS_PART1_DATA === 'undefined') return;

    container.innerHTML = MCBOOKS_PART1_DATA.listenAndChoose.map((item, idx) => `
        <div class="p-4 rounded-2xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e]">
            <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-bear-dark dark:text-honey">${item.q}</span>
                <button onclick="speakEnglish('${item.audio.replace(/'/g, "\'")}')" class="px-2.5 py-1 rounded-xl bg-honey hover:bg-honey-600 text-white text-xs font-bold flex items-center gap-1 shadow-2xs">
                    <i class="fa-solid fa-volume-high text-[10px]"></i> Nghe
                </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                ${item.options.map(opt => `
                    <button onclick="checkTrack29Answer(this, '${opt.text}', '${item.correct}', '${item.explain.replace(/'/g, "\'")}')" 
                            class="p-2.5 rounded-xl border border-[#F1E5D5] dark:border-[#3d2d23] bg-white dark:bg-[#251b15] text-xs font-bold text-subtext dark:text-[#FAF5F0] hover:border-honey transition-all text-left">
                        ${opt.label}
                    </button>
                `).join('')}
            </div>
            <div class="track29-explain hidden text-[11px] font-semibold mt-2 pt-2 border-t border-[#F1E5D5] dark:border-[#38271e]"></div>
        </div>
    `).join('');
}

function checkTrack29Answer(btn, selected, correct, explain) {
    const parent = btn.closest('.p-4');
    const explainBox = parent ? parent.querySelector('.track29-explain') : null;

    if (selected === correct) {
        playSound('correct');
        addXP(10, "Chọn đúng Track 29");
        btn.className = "p-2.5 rounded-xl border-2 border-emerald-500 bg-pastel-green text-emerald-900 font-extrabold text-xs dark:bg-[#1a3826] dark:text-emerald-300";
        if (explainBox) {
            explainBox.classList.remove('hidden');
            explainBox.className = "text-[11px] font-semibold mt-2 pt-2 border-t border-emerald-200 text-emerald-700 dark:text-emerald-400";
            explainBox.innerHTML = `🎉 Chính xác! (+10 XP) • ${explain}`;
        }
    } else {
        playSound('wrong');
        btn.className = "p-2.5 rounded-xl border-2 border-rose-500 bg-pastel-pink text-rose-900 font-extrabold text-xs dark:bg-[#381a22] dark:text-rose-300";
        if (explainBox) {
            explainBox.classList.remove('hidden');
            explainBox.className = "text-[11px] font-semibold mt-2 pt-2 border-t border-rose-200 text-rose-600 dark:text-rose-400";
            explainBox.innerHTML = `💡 Chưa chính xác! • ${explain}`;
        }
    }
}

// Dạng 5: Chọn đáp án ngữ cảnh thể thao mùa đông (Trang 13)
function renderPart1Context() {
    const container = document.getElementById('part1-context-container');
    if (!container || typeof MCBOOKS_PART1_DATA === 'undefined') return;

    container.innerHTML = MCBOOKS_PART1_DATA.chooseBestAnswers.map((item, idx) => `
        <div class="p-4 rounded-2xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e]">
            <p class="text-xs sm:text-sm font-bold text-bear-dark dark:text-[#FAF5F0] mb-2.5">${item.q}</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                ${item.options.map((opt, oIdx) => `
                    <button onclick="checkContextAnswer(this, ${oIdx}, ${item.correct}, '${item.explain.replace(/'/g, "\'")}')" 
                            class="p-2.5 rounded-xl border border-[#F1E5D5] dark:border-[#3d2d23] bg-white dark:bg-[#251b15] text-xs font-bold text-subtext dark:text-[#FAF5F0] hover:border-honey transition-all text-left">
                        ${opt}
                    </button>
                `).join('')}
            </div>
            <div class="context-explain hidden text-[11px] font-semibold mt-2 pt-2 border-t border-[#F1E5D5] dark:border-[#38271e]"></div>
        </div>
    `).join('');
}

function checkContextAnswer(btn, selectedIdx, correctIdx, explain) {
    const parent = btn.closest('.p-4');
    const explainBox = parent ? parent.querySelector('.context-explain') : null;

    if (selectedIdx === correctIdx) {
        playSound('correct');
        addXP(10, "Chọn đúng dạng 5");
        btn.className = "p-2.5 rounded-xl border-2 border-emerald-500 bg-pastel-green text-emerald-900 font-extrabold text-xs dark:bg-[#1a3826] dark:text-emerald-300";
        if (explainBox) {
            explainBox.classList.remove('hidden');
            explainBox.className = "text-[11px] font-semibold mt-2 pt-2 border-t border-emerald-200 text-emerald-700 dark:text-emerald-400";
            explainBox.innerHTML = `🎉 Chính xác! (+10 XP) • ${explain}`;
        }
    } else {
        playSound('wrong');
        btn.className = "p-2.5 rounded-xl border-2 border-rose-500 bg-pastel-pink text-rose-900 font-extrabold text-xs dark:bg-[#381a22] dark:text-rose-300";
        if (explainBox) {
            explainBox.classList.remove('hidden');
            explainBox.className = "text-[11px] font-semibold mt-2 pt-2 border-t border-rose-200 text-rose-600 dark:text-rose-400";
            explainBox.innerHTML = `💡 Chưa đúng rồi! • ${explain}`;
        }
    }
}

// ==================== TAB 2: THEME 1 - SỐ ĐẾM & THỜI GIAN (TRANG 14 - 22) ====================
function initTheme1() {
    renderCardinalGrid();
    renderSpotMistakes();
    renderOrdinalQuiz();
    renderPercentages();
    renderTrueFalseTable();
    renderFrequencyScale();
}

function renderCardinalGrid() {
    const grid = document.getElementById('theme1-cardinal-grid');
    if (!grid || typeof MCBOOKS_THEME1_DATA === 'undefined') return;

    grid.innerHTML = MCBOOKS_THEME1_DATA.cardinalNumbers.map((item, idx) => `
        <div class="p-3.5 rounded-2xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e] flex items-center justify-between">
            <span class="text-xs sm:text-sm font-extrabold text-bear-dark dark:text-honey">${idx + 1}. ${item.en}</span>
            <div class="flex gap-1.5">
                ${item.choices.map(choice => `
                    <button onclick="checkCardinalChoice(this, ${choice}, ${item.correct})" 
                            class="px-2.5 py-1 rounded-xl border border-[#F1E5D5] dark:border-[#3d2d23] bg-white dark:bg-[#251b15] font-extrabold text-xs hover:border-honey transition-all">
                        ${choice}
                    </button>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function checkCardinalChoice(btn, choice, correct) {
    if (choice === correct) {
        playSound('correct');
        addXP(5, "Chọn đúng số đếm");
        btn.className = "px-2.5 py-1 rounded-xl border-2 border-emerald-500 bg-pastel-green text-emerald-900 font-black text-xs";
    } else {
        playSound('wrong');
        btn.className = "px-2.5 py-1 rounded-xl border-2 border-rose-500 bg-pastel-pink text-rose-900 font-bold text-xs";
    }
}

function renderSpotMistakes() {
    const container = document.getElementById('theme1-spot-mistakes');
    if (!container || typeof MCBOOKS_THEME1_DATA === 'undefined') return;

    container.innerHTML = MCBOOKS_THEME1_DATA.spotMistakes.map((item, idx) => `
        <div class="p-3.5 rounded-2xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e]">
            <div class="flex items-center justify-between">
                <span class="text-xs sm:text-sm font-bold text-rose-600 dark:text-rose-400">❌ ${item.wrongText}</span>
                <button onclick="toggleSpotMistake(${idx})" class="text-xs font-bold text-honey hover:underline flex items-center gap-1">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Sửa lỗi
                </button>
            </div>
            <div id="spot-mistake-${idx}" class="hidden mt-2 pt-2 border-t border-[#F1E5D5] dark:border-[#38271e] text-xs">
                <div class="font-extrabold text-emerald-600 dark:text-emerald-400">✅ Sửa đúng: "${item.correctText}"</div>
                <div class="text-subtext mt-0.5">${item.explanation}</div>
            </div>
        </div>
    `).join('');
}

function toggleSpotMistake(idx) {
    playSound('click');
    const el = document.getElementById(`spot-mistake-${idx}`);
    if (el) el.classList.toggle('hidden');
}

function renderOrdinalQuiz() {
    const container = document.getElementById('theme1-ordinal-quiz');
    if (!container || typeof MCBOOKS_THEME1_DATA === 'undefined') return;

    container.innerHTML = MCBOOKS_THEME1_DATA.ordinalSentenceQuiz.map((item, idx) => `
        <div class="p-3 rounded-xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span class="text-xs sm:text-sm font-semibold text-bear-dark dark:text-[#FAF5F0]">${item.q}</span>
            <input type="text" id="ordinal-input-${idx}" data-correct="${item.answer}" placeholder="${item.hint}" 
                   class="w-full sm:w-36 px-3 py-1.5 rounded-xl border border-[#EADBCC] dark:border-[#4d3628] bg-white dark:bg-[#2c2018] text-xs font-bold text-bear-dark dark:text-honey focus:border-honey focus:outline-none">
        </div>
    `).join('');
}

function checkOrdinalQuiz() {
    let total = 0;
    let correct = 0;

    document.querySelectorAll('#theme1-ordinal-quiz input').forEach(input => {
        total++;
        const expected = input.getAttribute('data-correct').toLowerCase();
        const actual = input.value.trim().toLowerCase();

        if (actual === expected) {
            correct++;
            input.className = "w-full sm:w-36 px-3 py-1.5 rounded-xl border-2 border-emerald-500 bg-pastel-green text-emerald-900 font-extrabold text-xs";
        } else {
            input.className = "w-full sm:w-36 px-3 py-1.5 rounded-xl border-2 border-rose-500 bg-pastel-pink text-rose-900 font-bold text-xs";
        }
    });

    if (correct === total) {
        playSound('correct');
        addXP(20, "Hoàn thành câu đố số thứ tự");
        alert(`🎉 Xuất sắc! Bạn trả lời đúng cả ${correct}/${total} câu số thứ tự! (+20 XP)`);
    } else {
        playSound('wrong');
        alert(`Bạn đúng ${correct}/${total} câu. Hãy sửa lại các ô màu đỏ nhé! 🐻`);
    }
}

// Fractions Bottle Simulation (Trang 17)
function setBottleLevel(fractionVal, label) {
    playSound('click');
    const waterEl = document.getElementById('bottle-water-fill');
    const lblEl = document.getElementById('bottle-level-label');

    if (waterEl) waterEl.style.height = `${fractionVal * 100}%`;
    if (lblEl) lblEl.innerText = label;
    speakEnglish(label);
}

function renderPercentages() {
    const grid = document.getElementById('theme1-percentages-grid');
    if (!grid || typeof MCBOOKS_THEME1_DATA === 'undefined') return;

    grid.innerHTML = MCBOOKS_THEME1_DATA.decimalsMatch.map(p => `
        <div onclick="speakEnglish('${p.written}')" class="p-3 rounded-2xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e] text-center hover:border-honey cursor-pointer transition-colors shadow-2xs group">
            <span class="text-base font-black text-honey group-hover:scale-105 block">${p.percent}</span>
            <span class="text-[11px] text-subtext block mt-0.5">${p.written}</span>
        </div>
    `).join('');
}

function renderTrueFalseTable() {
    const container = document.getElementById('theme1-truefalse-table');
    if (!container || typeof MCBOOKS_THEME1_DATA === 'undefined') return;

    container.innerHTML = MCBOOKS_THEME1_DATA.calendarTrueFalse.map((item, idx) => `
        <div class="p-3.5 rounded-2xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e]">
            <div class="flex items-center justify-between gap-3">
                <span class="text-xs sm:text-sm font-semibold text-bear-dark dark:text-[#FAF5F0]">${item.statement}</span>
                <div class="flex gap-1.5 shrink-0">
                    <button onclick="checkTrueFalse(this, ${idx}, true, ${item.isTrue}, '${item.explain.replace(/'/g, "\'")}')" 
                            class="px-3 py-1 rounded-xl border border-[#EADBCC] dark:border-[#4d3628] bg-white dark:bg-[#2c2018] text-xs font-black hover:border-honey">
                        T
                    </button>
                    <button onclick="checkTrueFalse(this, ${idx}, false, ${item.isTrue}, '${item.explain.replace(/'/g, "\'")}')" 
                            class="px-3 py-1 rounded-xl border border-[#EADBCC] dark:border-[#4d3628] bg-white dark:bg-[#2c2018] text-xs font-black hover:border-honey">
                        F
                    </button>
                </div>
            </div>
            <div id="tf-explain-${idx}" class="hidden text-[11px] font-semibold mt-2 pt-2 border-t border-[#F1E5D5] dark:border-[#38271e]"></div>
        </div>
    `).join('');
}

function checkTrueFalse(btn, idx, userChoice, isTrue, explain) {
    const parent = btn.closest('.p-3.5');
    const explainBox = document.getElementById(`tf-explain-${idx}`);

    if (userChoice === isTrue) {
        playSound('correct');
        addXP(5, "Chọn đúng True/False");
        btn.className = "px-3 py-1 rounded-xl border-2 border-emerald-500 bg-pastel-green text-emerald-900 font-black text-xs dark:bg-[#1a3826] dark:text-emerald-300";
        if (explainBox) {
            explainBox.classList.remove('hidden');
            explainBox.className = "text-[11px] font-semibold mt-2 pt-2 border-t border-emerald-200 text-emerald-700 dark:text-emerald-400";
            explainBox.innerHTML = `🎉 Chính xác! • ${explain}`;
        }
    } else {
        playSound('wrong');
        btn.className = "px-3 py-1 rounded-xl border-2 border-rose-500 bg-pastel-pink text-rose-900 font-black text-xs dark:bg-[#381a22] dark:text-rose-300";
        if (explainBox) {
            explainBox.classList.remove('hidden');
            explainBox.className = "text-[11px] font-semibold mt-2 pt-2 border-t border-rose-200 text-rose-600 dark:text-rose-400";
            explainBox.innerHTML = `💡 Chưa đúng rồi! • ${explain}`;
        }
    }
}

function renderFrequencyScale() {
    const container = document.getElementById('theme1-frequency-scale');
    if (!container || typeof MCBOOKS_THEME1_DATA === 'undefined') return;

    container.innerHTML = MCBOOKS_THEME1_DATA.frequencyScale.map(item => `
        <div onclick="speakEnglish('${item.word}')" class="p-3 rounded-2xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e] hover:border-honey cursor-pointer transition-colors shadow-2xs group">
            <span class="text-xl block mb-1">${item.icon}</span>
            <span class="text-xs font-black text-bear-dark dark:text-[#FAF5F0] block">${item.word}</span>
            <span class="text-[10px] text-honey font-bold block">${item.percent}</span>
            <span class="text-[10px] text-subtext block">${item.vn}</span>
        </div>
    `).join('');
}

// ==================== TAB 3: HÌNH KHỐI, MÀU SẮC & Ô CHỮ MA TRẬN ====================
let wordSearchFound = new Set();
let wordSearchSelectedCells = [];

function initShapesAndColors() {
    renderShapesGrid();
    renderColorsMatching();
    initWordSearchPuzzle();
}

function renderShapesGrid() {
    const grid = document.getElementById('theme1-shapes-grid');
    if (!grid || typeof MCBOOKS_THEME1_DATA === 'undefined') return;

    grid.innerHTML = MCBOOKS_THEME1_DATA.shapesGallery.map(s => `
        <div onclick="speakEnglish('${s.name}')" class="p-3.5 rounded-2xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e] text-center hover:border-honey cursor-pointer transition-all shadow-2xs group">
            <span class="text-2xl block mb-1 group-hover:scale-110 transition-transform">${s.icon}</span>
            <span class="text-xs font-extrabold text-bear-dark dark:text-[#FAF5F0] block">${s.name}</span>
            <span class="text-[10px] font-mono text-honey block">${s.ipa}</span>
            <span class="text-[10px] text-subtext block mt-0.5">${s.vn}</span>
        </div>
    `).join('');
}

// Nối màu sắc (Trang 24)
function renderColorsMatching() {
    colorsMatchState = { selected: null, matched: new Set() };
    const colA = document.getElementById('colors-col-a');
    const colB = document.getElementById('colors-col-b');
    if (!colA || !colB || typeof MCBOOKS_THEME1_DATA === 'undefined') return;

    const data = MCBOOKS_THEME1_DATA.colorsMatching;
    const shuffledB = [...data].sort(() => Math.random() - 0.5);

    colA.innerHTML = data.map((item, idx) => `
        <div onclick="handleColorMatch('A', ${idx}, this)" id="color-match-a-${idx}" 
             class="color-splash-btn p-3 rounded-2xl border border-[#F1E5D5] dark:border-[#3d2d23] bg-white dark:bg-[#251b15] flex items-center justify-between">
            <div class="flex items-center gap-2.5">
                <span class="w-5 h-5 rounded-full inline-block shadow-2xs" style="background-color: ${item.colorHex};"></span>
                <span class="text-xs sm:text-sm font-extrabold text-bear-dark dark:text-[#FAF5F0]">${idx + 1}. ${item.colorName}</span>
            </div>
            <button onclick="event.stopPropagation(); speakEnglish('${item.colorName}')" class="text-subtext hover:text-honey p-1" title="Nghe phát âm">
                <i class="fa-solid fa-volume-high text-xs"></i>
            </button>
        </div>
    `).join('');

    colB.innerHTML = shuffledB.map((item, sIdx) => {
        const originalIdx = data.findIndex(d => d.colorName === item.colorName);
        return `
            <div onclick="handleColorMatch('B', ${originalIdx}, this)" id="color-match-b-${originalIdx}" 
                 class="color-splash-btn p-3 rounded-2xl border border-[#F1E5D5] dark:border-[#3d2d23] bg-white dark:bg-[#251b15] font-semibold text-xs sm:text-sm text-subtext dark:text-[#C5B8A8] flex items-center gap-2.5">
                <span class="text-xl">${item.icon}</span>
                <span>${item.objectName}</span>
            </div>
        `;
    }).join('');

    updateColorMatchScore();
}

function handleColorMatch(col, idx, el) {
    if (colorsMatchState.matched.has(idx)) return;
    playSound('click');

    if (!colorsMatchState.selected) {
        colorsMatchState.selected = { col, idx };
        el.classList.add('selected');
    } else if (colorsMatchState.selected.col === col) {
        document.querySelectorAll('#colors-col-a .selected, #colors-col-b .selected').forEach(c => c.classList.remove('selected'));
        colorsMatchState.selected = { col, idx };
        el.classList.add('selected');
    } else {
        const firstIdx = colorsMatchState.selected.idx;
        const secondIdx = idx;

        if (firstIdx === secondIdx) {
            playSound('correct');
            colorsMatchState.matched.add(firstIdx);
            addXP(10, "Ghép đúng màu sắc");

            const cardA = document.getElementById(`color-match-a-${firstIdx}`);
            const cardB = document.getElementById(`color-match-b-${firstIdx}`);
            if (cardA) { cardA.classList.remove('selected'); cardA.classList.add('matched'); }
            if (cardB) { cardB.classList.remove('selected'); cardB.classList.add('matched'); }

            colorsMatchState.selected = null;
            updateColorMatchScore();
        } else {
            playSound('wrong');
            document.querySelectorAll('#colors-col-a .selected, #colors-col-b .selected').forEach(c => c.classList.remove('selected'));
            colorsMatchState.selected = null;
        }
    }
}

function updateColorMatchScore() {
    const badge = document.getElementById('colors-match-score');
    if (!badge || typeof MCBOOKS_THEME1_DATA === 'undefined') return;
    const total = MCBOOKS_THEME1_DATA.colorsMatching.length;
    badge.innerText = `Đã ghép: ${colorsMatchState.matched.size} / ${total} màu`;
    if (colorsMatchState.matched.size === total) {
        playSound('fanfare');
        badge.innerHTML = `<span class="text-emerald-600 font-extrabold">🎉 Tuyệt vời! Hoàn thành nối toàn bộ 8 màu sắc! (+25 XP)</span>`;
    }
}

function resetColorsMatching() {
    renderColorsMatching();
}

// Word Search Puzzle Matrix (Trang 25)
function initWordSearchPuzzle() {
    wordSearchFound = new Set();
    wordSearchSelectedCells = [];

    const targetsContainer = document.getElementById('wordsearch-targets-list');
    const gridContainer = document.getElementById('wordsearch-grid');
    if (!targetsContainer || !gridContainer || typeof MCBOOKS_THEME1_DATA === 'undefined') return;

    const matrix = MCBOOKS_THEME1_DATA.wordSearchMatrix;
    const targets = MCBOOKS_THEME1_DATA.hiddenColors;

    // Render Target Word Badges
    targetsContainer.innerHTML = targets.map(t => `
        <span id="ws-target-${t.word}" class="px-2.5 py-1 rounded-xl text-xs font-black border border-[#EADBCC] dark:border-[#4d3628] bg-white dark:bg-[#2c2018] text-bear-dark dark:text-[#FAF5F0] transition-all">
            ${t.word}
        </span>
    `).join('');

    // Render Matrix Cells
    gridContainer.innerHTML = matrix.map((row, r) => 
        row.map((char, c) => `
            <button onclick="handleWordSearchCellClick(${r}, ${c}, this)" id="ws-cell-${r}-${c}" 
                    class="letter-cell">
                ${char}
            </button>
        `).join('')
    ).join('');

    updateWordSearchProgress();
}

function handleWordSearchCellClick(r, c, el) {
    if (el.classList.contains('found')) return;
    playSound('click');

    const cellKey = `${r}-${c}`;
    const existingIdx = wordSearchSelectedCells.findIndex(item => item.key === cellKey);

    if (existingIdx !== -1) {
        // Deselect
        wordSearchSelectedCells.splice(existingIdx, 1);
        el.classList.remove('selected');
    } else {
        // Select
        wordSearchSelectedCells.push({ r, c, char: el.innerText.trim(), key: cellKey, el });
        el.classList.add('selected');
    }

    // Check if currently selected cells form any target word
    checkSelectedWordSearch();
}

function checkSelectedWordSearch() {
    if (typeof MCBOOKS_THEME1_DATA === 'undefined') return;
    const targets = MCBOOKS_THEME1_DATA.hiddenColors;

    targets.forEach(target => {
        if (wordSearchFound.has(target.word)) return;

        // Check if selected cells match target word coordinates exactly
        const expectedKeys = [];
        for (let col = target.colStart; col <= target.colEnd; col++) {
            expectedKeys.push(`${target.row}-${col}`);
        }

        const selectedKeys = new Set(wordSearchSelectedCells.map(c => c.key));
        const allMatch = expectedKeys.every(k => selectedKeys.has(k)) && wordSearchSelectedCells.length === expectedKeys.length;

        if (allMatch) {
            playSound('correct');
            addXP(15, `Tìm thấy từ ${target.word}`);
            wordSearchFound.add(target.word);

            // Mark cells as permanently found with color styling
            expectedKeys.forEach(k => {
                const cell = document.getElementById(`ws-cell-${k}`);
                if (cell) {
                    cell.classList.remove('selected');
                    cell.classList.add('found');
                    cell.style.backgroundColor = target.color;
                    cell.style.borderColor = target.color;
                    cell.style.color = '#FFFFFF';
                }
            });

            // Strike through target badge
            const badge = document.getElementById(`ws-target-${target.word}`);
            if (badge) {
                badge.style.backgroundColor = target.color;
                badge.style.color = '#FFFFFF';
                badge.style.borderColor = target.color;
                badge.innerHTML = `✓ ${target.word}`;
            }

            wordSearchSelectedCells = [];
            updateWordSearchProgress();
        }
    });
}

function updateWordSearchProgress() {
    const counter = document.getElementById('wordsearch-found-count');
    if (!counter || typeof MCBOOKS_THEME1_DATA === 'undefined') return;
    const total = MCBOOKS_THEME1_DATA.hiddenColors.length;
    counter.innerText = `Đã tìm thấy: ${wordSearchFound.size} / ${total} màu`;

    if (wordSearchFound.size === total) {
        playSound('fanfare');
        addXP(30, "Hoàn thành toàn bộ ô chữ tìm từ");
        counter.innerHTML = `<span class="text-emerald-600 font-extrabold">🎉 Xuất sắc! Bạn đã giải trọn vẹn Ma Trận Ô Chữ 9 màu sắc! (+30 XP)</span>`;
    }
}

function resetWordSearchPuzzle() {
    initWordSearchPuzzle();
}

// ==================== TAB 4: NÓI AI & ĐỌC HIỂU (SPEAKING & READING) ====================
function initEnglishSpeaking() {
    renderSpeakingVocab();
    renderDialogues();
    renderReadingPassage();
}

function renderSpeakingVocab() {
    const grid = document.getElementById('speaking-cards-grid');
    if (!grid || typeof ENGLISH_VOCABULARY === 'undefined') return;

    let items = ENGLISH_VOCABULARY.slice(0, 12);
    const badge = document.getElementById('speaking-count-badge');
    if (badge) badge.innerText = `Đang hiển thị ${items.length} từ luyện phát âm`;

    grid.innerHTML = items.map((item, idx) => `
        <div class="cozy-card p-4 rounded-2xl border border-[#F1E5D5] dark:border-[#3d2d23] flex flex-col justify-between">
            <div>
                <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl">${item.icon || '💬'}</span>
                    <span class="text-[10px] font-mono text-subtext bg-cream-100 dark:bg-[#34241b] px-2 py-0.5 rounded-full">${item.ipa}</span>
                </div>
                <h4 class="font-extrabold text-base text-bear-dark dark:text-[#FAF5F0] mb-0.5">${item.word}</h4>
                <p class="text-xs text-subtext mb-3 line-clamp-2">${item.vn}</p>
            </div>
            
            <div class="flex items-center gap-2 pt-3 border-t border-[#F1E5D5] dark:border-[#38271e]">
                <button onclick="speakEnglish('${item.word}')" class="flex-1 py-1.5 rounded-xl bg-cream-100 dark:bg-[#2c2018] hover:bg-cream-300 text-bear-dark dark:text-honey text-xs font-bold transition-all flex items-center justify-center gap-1.5">
                    <i class="fa-solid fa-volume-high text-xs"></i>
                    <span>Nghe</span>
                </button>
                <button onclick="practiceSpeakingVoice('${item.word}', ${idx})" id="spk-btn-${idx}" class="flex-1 py-1.5 rounded-xl bg-honey hover:bg-honey-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs">
                    <i class="fa-solid fa-microphone text-xs"></i>
                    <span>Nói AI</span>
                </button>
            </div>
        </div>
    `).join('');
}

function practiceSpeakingVoice(word, idx) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const btn = document.getElementById(`spk-btn-${idx}`);

    if (!SpeechRecognition) {
        speakEnglish(word, 0.7);
        alert(`Trình duyệt chưa hỗ trợ Web Speech Recognition trực tiếp. Hãy lắng nghe và đọc to từ: "${word}" theo Gấu nhé! 🐻`);
        return;
    }

    try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        if (btn) {
            btn.className = "flex-1 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-bold animate-pulse flex items-center justify-center gap-1.5";
            btn.innerHTML = `<i class="fa-solid fa-circle text-[8px]"></i> <span>Đang nghe...</span>`;
        }

        recognition.onresult = (event) => {
            const spoken = event.results[0][0].transcript.trim().toLowerCase();
            const target = word.toLowerCase();

            if (btn) {
                btn.className = "flex-1 py-1.5 rounded-xl bg-honey hover:bg-honey-600 text-white text-xs font-bold flex items-center justify-center gap-1.5";
                btn.innerHTML = `<i class="fa-solid fa-microphone text-xs"></i> <span>Nói AI</span>`;
            }

            if (spoken.includes(target) || target.includes(spoken)) {
                playSound('correct');
                addXP(15, "Phát âm chuẩn");
                alert(`🌟 Xuất sắc! Bạn phát âm từ "${word}" rất chuẩn xác! (+15 XP)`);
            } else {
                playSound('wrong');
                alert(`Bạn nói là "${spoken}". Hãy bấm nút "Nghe" và thử lại từ "${word}" nhé! 🐻`);
                speakEnglish(word, 0.75);
            }
        };

        recognition.onerror = () => {
            if (btn) {
                btn.className = "flex-1 py-1.5 rounded-xl bg-honey hover:bg-honey-600 text-white text-xs font-bold flex items-center justify-center gap-1.5";
                btn.innerHTML = `<i class="fa-solid fa-microphone text-xs"></i> <span>Nói AI</span>`;
            }
            speakEnglish(word, 0.75);
        };

        recognition.start();
    } catch (e) {
        speakEnglish(word, 0.75);
    }
}

function renderDialogues() {
    const container = document.getElementById('dialogues-container');
    if (!container || typeof ENGLISH_DIALOGUES === 'undefined') return;

    container.innerHTML = ENGLISH_DIALOGUES.map((dlg, dIdx) => `
        <div class="p-5 rounded-2xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e]">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div>
                    <span class="text-xs font-extrabold text-bear-dark dark:text-honey uppercase tracking-wider">${dlg.title}</span>
                    <p class="text-[11px] text-subtext mt-0.5">${dlg.context || ''}</p>
                </div>
                <button onclick="playFullDialogue(${dIdx})" class="self-start sm:self-center px-3 py-1.5 rounded-xl bg-honey hover:bg-honey-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs">
                    <i class="fa-solid fa-play text-[10px]"></i>
                    <span>Nghe cả bài</span>
                </button>
            </div>

            <div class="space-y-2.5 text-xs sm:text-sm">
                ${dlg.lines.map(line => `
                    <div class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#2c2018] border border-[#F1E5D5] dark:border-[#38271e]">
                        <div class="flex items-center gap-2">
                            <span class="text-base">${line.avatar || '👤'}</span>
                            <b class="${line.role === 'A' ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}">${line.speaker}:</b> 
                            <span class="ml-1 text-slate-800 dark:text-[#FAF5F0]">"${line.text}"</span>
                        </div>
                        <button onclick="speakEnglish('${line.text.replace(/'/g, "\'")}')" class="p-1.5 rounded-lg text-honey hover:bg-cream-100 dark:hover:bg-[#34241b] shrink-0" title="Nghe câu này">
                            <i class="fa-solid fa-volume-high"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function playFullDialogue(dIdx) {
    if (typeof ENGLISH_DIALOGUES === 'undefined') return;
    const dlg = ENGLISH_DIALOGUES[dIdx];
    if (!dlg) return;
    const fullText = dlg.lines.map(l => `${l.speaker} says: ${l.text}`).join('. ');
    speakEnglish(fullText, state.speechRate || 0.85);
}

// Reading Comprehension (Đọc Hiểu)
function switchReadingStory(storyId) {
    playSound('click');
    state.currentReadingStory = storyId;

    const btn1 = document.getElementById('btn-story1');
    const btn2 = document.getElementById('btn-story2');
    if (btn1 && btn2) {
        if (storyId === 'story1') {
            btn1.className = "px-2.5 py-1 rounded-xl text-xs font-bold bg-honey text-white transition-all";
            btn2.className = "px-2.5 py-1 rounded-xl text-xs font-bold bg-cream-100 dark:bg-[#2c2018] text-subtext hover:bg-cream-200 transition-all";
        } else {
            btn2.className = "px-2.5 py-1 rounded-xl text-xs font-bold bg-honey text-white transition-all";
            btn1.className = "px-2.5 py-1 rounded-xl text-xs font-bold bg-cream-100 dark:bg-[#2c2018] text-subtext hover:bg-cream-200 transition-all";
        }
    }
    renderReadingPassage();
}

function renderReadingPassage() {
    if (typeof ENGLISH_READING_STORIES === 'undefined') return;
    const story = ENGLISH_READING_STORIES.find(s => s.id === (state.currentReadingStory || 'story1')) || ENGLISH_READING_STORIES[0];
    if (!story) return;

    const passageBox = document.getElementById('reading-passage-box');
    if (passageBox) {
        passageBox.innerHTML = `
            <h4 class="font-extrabold text-sm sm:text-base text-bear-dark dark:text-honey mb-2">${story.title}</h4>
            <p class="leading-relaxed">${story.passage}</p>
        `;
    }

    const glossaryContainer = document.getElementById('reading-glossary-pills');
    if (glossaryContainer && story.glossary) {
        glossaryContainer.innerHTML = story.glossary.map(g => `
            <button onclick="speakEnglish('${g.word}')" class="px-2.5 py-1 rounded-xl bg-white dark:bg-[#2c2018] border border-[#F1E5D5] dark:border-[#3d2d23] hover:border-honey text-xs font-bold text-bear-dark dark:text-[#FAF5F0] flex items-center gap-1.5 transition-colors shadow-2xs">
                <i class="fa-solid fa-volume-high text-[10px] text-honey"></i>
                <span>${g.word}:</span>
                <span class="font-normal text-subtext">${g.vn}</span>
            </button>
        `).join('');
    }

    const qContainer = document.getElementById('reading-questions-container');
    if (qContainer && story.questions) {
        qContainer.innerHTML = story.questions.map((item, qIdx) => `
            <div class="p-4 rounded-2xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e]">
                <p class="text-xs sm:text-sm font-bold text-bear-dark dark:text-[#FAF5F0] mb-2.5">${item.q}</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mb-2">
                    ${item.options.map((opt, oIdx) => `
                        <button onclick="checkReadingAnswer(this, ${qIdx}, ${oIdx}, ${item.correct}, '${(item.explain || '').replace(/'/g, "\'")}')" 
                                class="p-2.5 rounded-xl border border-[#F1E5D5] dark:border-[#3d2d23] bg-white dark:bg-[#251b15] text-xs font-bold text-subtext dark:text-[#FAF5F0] hover:border-honey transition-all text-left">
                            ${opt}
                        </button>
                    `).join('')}
                </div>
                <div id="reading-explain-${qIdx}" class="hidden text-[11px] font-semibold mt-2 pt-2 border-t border-[#F1E5D5] dark:border-[#38271e]"></div>
            </div>
        `).join('');
    }
}

function playCurrentReadingStory() {
    if (typeof ENGLISH_READING_STORIES === 'undefined') return;
    const story = ENGLISH_READING_STORIES.find(s => s.id === (state.currentReadingStory || 'story1')) || ENGLISH_READING_STORIES[0];
    if (story) speakEnglish(story.passage, state.speechRate || 0.85);
}

function checkReadingAnswer(btn, qIdx, oIdx, correctIdx, explain) {
    const explainBox = document.getElementById(`reading-explain-${qIdx}`);
    if (oIdx === correctIdx) {
        playSound('correct');
        addXP(10, "Đọc hiểu đúng");
        btn.className = "p-2.5 rounded-xl border-2 border-emerald-500 bg-pastel-green text-emerald-900 font-extrabold text-xs dark:bg-[#1a3826] dark:text-emerald-300";
        if (explainBox) {
            explainBox.classList.remove('hidden');
            explainBox.className = "text-[11px] font-semibold mt-2 pt-2 border-t border-emerald-200 text-emerald-700 dark:text-emerald-400";
            explainBox.innerHTML = `🎉 Chính xác! (+10 XP) • ${explain}`;
        }
    } else {
        playSound('wrong');
        btn.className = "p-2.5 rounded-xl border-2 border-rose-500 bg-pastel-pink text-rose-900 font-extrabold text-xs dark:bg-[#381a22] dark:text-rose-300";
        if (explainBox) {
            explainBox.classList.remove('hidden');
            explainBox.className = "text-[11px] font-semibold mt-2 pt-2 border-t border-rose-200 text-rose-600 dark:text-rose-400";
            explainBox.innerHTML = `💡 Chưa đúng rồi! • ${explain}`;
        }
    }
}

// ==================== TAB 5: VOCABULARY EXPLORER (TAB 5) ====================
function initEnglishVocab() {
    renderVocabCards();
}

function handleVocabSearch(query) {
    state.vocabSearchQuery = query.trim().toLowerCase();
    const clearBtn = document.getElementById('vocab-search-clear');
    if (clearBtn) {
        if (state.vocabSearchQuery) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }
    renderVocabCards();
}

function clearVocabSearch() {
    const input = document.getElementById('vocab-search-input');
    if (input) input.value = '';
    state.vocabSearchQuery = '';
    const clearBtn = document.getElementById('vocab-search-clear');
    if (clearBtn) clearBtn.classList.add('hidden');
    renderVocabCards();
}

function filterVocabMasteredOnly(flag) {
    playSound('click');
    state.vocabMasteredOnly = flag;

    const btnAll = document.getElementById('btn-vocab-filter-all');
    const btnMastered = document.getElementById('btn-vocab-filter-mastered');
    if (btnAll && btnMastered) {
        if (flag) {
            btnMastered.className = "text-xs font-bold text-honey hover:underline";
            btnAll.className = "text-xs font-bold text-subtext hover:underline";
        } else {
            btnAll.className = "text-xs font-bold text-honey hover:underline";
            btnMastered.className = "text-xs font-bold text-subtext hover:underline";
        }
    }
    renderVocabCards();
}

function renderVocabCards() {
    const grid = document.getElementById('vocab-cards-grid');
    if (!grid || typeof ENGLISH_VOCABULARY === 'undefined') return;

    let items = ENGLISH_VOCABULARY;

    if (state.vocabSearchQuery) {
        const q = state.vocabSearchQuery;
        items = items.filter(v => 
            v.word.toLowerCase().includes(q) || 
            v.vn.toLowerCase().includes(q) || 
            (v.example && v.example.toLowerCase().includes(q))
        );
    }

    if (state.vocabMasteredOnly) {
        items = items.filter(v => state.masteredVocab && state.masteredVocab.has(v.id));
    }

    const counter = document.getElementById('vocab-count-indicator');
    if (counter) {
        counter.innerText = `Đang hiển thị ${items.length} / ${ENGLISH_VOCABULARY.length} từ vựng`;
    }

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <span class="text-4xl block mb-2">🔍</span>
                <p class="text-sm font-bold text-bear-dark dark:text-[#FAF5F0]">Không tìm thấy từ vựng phù hợp</p>
                <p class="text-xs text-subtext mt-1">Hãy thử tìm từ khác hoặc bấm "Tất cả"</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = items.map(v => {
        const isMastered = state.masteredVocab && state.masteredVocab.has(v.id);
        const cardBorder = isMastered 
            ? "border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-[#2e2316]" 
            : "border-[#F1E5D5] dark:border-[#3d2d23] bg-white dark:bg-[#251b15]";

        return `
            <div class="vocab-card p-4 rounded-2xl border ${cardBorder} flex flex-col justify-between">
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-2xl">${v.icon || '📖'}</span>
                        <div class="flex items-center gap-1.5">
                            <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cream-100 dark:bg-[#34241b] text-subtext">${v.type || 'n'}</span>
                            <span class="text-[10px] font-mono text-honey bg-amber-100 dark:bg-[#3a2c1d] px-2 py-0.5 rounded-full">${v.ipa}</span>
                        </div>
                    </div>

                    <h4 class="font-black text-base text-bear-dark dark:text-[#FAF5F0] mb-0.5 flex items-center justify-between">
                        <span>${v.word}</span>
                        <button onclick="speakEnglish('${v.word}')" class="text-honey hover:scale-110 transition-transform p-1" title="Nghe phát âm">
                            <i class="fa-solid fa-volume-high text-xs"></i>
                        </button>
                    </h4>
                    <p class="text-xs font-semibold text-subtext dark:text-[#C5B8A8] mb-3">${v.vn}</p>

                    ${v.example ? `
                        <div class="p-2.5 rounded-xl bg-cream-100 dark:bg-[#1f1611] text-[11px] leading-relaxed text-slate-700 dark:text-[#FAF5F0] mb-3">
                            <i class="fa-solid fa-quote-left text-[9px] text-honey mr-1"></i>
                            <span>${v.example}</span>
                            <button onclick="speakEnglish('${v.example.replace(/'/g, "\'")}')" class="ml-1 text-honey hover:underline text-[10px]" title="Nghe ví dụ">
                                <i class="fa-solid fa-volume-high"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>

                <div class="pt-2 border-t border-[#F1E5D5] dark:border-[#38271e] flex items-center justify-between">
                    <button onclick="toggleMasterVocab('${v.id}')" 
                            class="text-xs font-bold flex items-center gap-1.5 transition-colors ${isMastered ? 'text-amber-600 dark:text-amber-400 font-extrabold' : 'text-subtext hover:text-honey'}">
                        <i class="${isMastered ? 'fa-solid fa-star text-amber-500' : 'fa-regular fa-star'}"></i>
                        <span>${isMastered ? 'Đã thuộc ⭐' : 'Đánh dấu thuộc (+10 XP)'}</span>
                    </button>
                    <button onclick="speakEnglish('${v.word}', 0.7)" class="text-[11px] font-bold text-subtext hover:text-honey flex items-center gap-1" title="Nghe chậm">
                        <i class="fa-solid fa-turtle text-[10px]"></i> Chậm
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function toggleMasterVocab(vocabId) {
    if (!state.masteredVocab) state.masteredVocab = new Set();

    if (state.masteredVocab.has(vocabId)) {
        state.masteredVocab.delete(vocabId);
        playSound('click');
    } else {
        state.masteredVocab.add(vocabId);
        playSound('correct');
        addXP(10, "Học thuộc 1 từ vựng mới");
    }

    localStorage.setItem('gau_en_mastered', JSON.stringify([...state.masteredVocab]));
    renderEnglishStats();
    renderVocabCards();
}

// ==================== 2. CẤU HÌNH BÀI THI (VIEW CONFIG) ====================
function selectSubject(subId, forceConfig = false) {
    playSound('click');
    state.currentSubject = subId;

    // If English and user didn't explicitly request the quiz config, open English 4-skills sub-page!
    if (subId === 'tieng_anh' && !forceConfig) {
        openEnglishApp();
        return;
    }

    const sub = SUBJECTS.find(s => s.id === subId);
    if (!sub) return;

    // Header info
    document.getElementById('config-subject-icon').innerText = sub.icon;
    document.getElementById('config-subject-title').innerText = sub.name;
    document.getElementById('config-subject-desc').innerText = sub.desc;

    // Unique sections
    const allQ = QUESTION_BANK[subId] || [];
    state.sections = [...new Set(allQ.map(q => q.s))];
    state.selectedSections = [...state.sections]; // Default select all

    renderSectionCheckboxes();
    calcAvailableQuestions();
    selectMode('practice'); // Default practice mode
    navigateTo('config');
}

function renderSectionCheckboxes() {
    const allQ = QUESTION_BANK[state.currentSubject] || [];
    const container = document.getElementById('section-checkboxes');
    if (!container) return;

    const html = state.sections.map(sec => {
        const count = allQ.filter(q => q.s === sec).length;
        const isChecked = state.selectedSections.includes(sec);

        return `
        <label class="p-3 rounded-2xl border ${isChecked ? 'border-honey bg-cream-100 dark:bg-[#34241b]' : 'border-[#F1E5D5] dark:border-[#3d2d23] hover:border-honey/50'} cursor-pointer flex items-center justify-between gap-2.5 transition-all select-none">
            <div class="flex items-center gap-2.5">
                <input type="checkbox" value="${sec}" ${isChecked ? 'checked' : ''} onchange="handleSectionChange()" class="sec-cb w-4 h-4 rounded text-honey accent-honey cursor-pointer">
                <span class="text-xs sm:text-sm font-bold text-slate-800 dark:text-[#FAF5F0]">${sec}</span>
            </div>
            <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cream-300 dark:bg-[#201611] text-subtext dark:text-[#A0AEC0]">
                ${count} câu
            </span>
        </label>`;
    }).join('');

    container.innerHTML = html;
}

function toggleAllSections(select) {
    playSound('click');
    if (select) {
        state.selectedSections = [...state.sections];
    } else {
        state.selectedSections = [];
    }
    renderSectionCheckboxes();
    calcAvailableQuestions();
}

function handleSectionChange() {
    playSound('click');
    const cbs = document.querySelectorAll('.sec-cb:checked');
    state.selectedSections = Array.from(cbs).map(cb => cb.value);
    renderSectionCheckboxes();
    calcAvailableQuestions();
}

function calcAvailableQuestions() {
    const allQ = QUESTION_BANK[state.currentSubject] || [];
    const filtered = allQ.filter(q => state.selectedSections.includes(q.s));
    state.availableCount = filtered.length;

    const badge = document.getElementById('config-total-available-badge');
    if (badge) badge.innerText = `${state.availableCount} câu có sẵn`;

    const hint = document.getElementById('max-question-hint');
    if (hint) {
        if (state.availableCount === 0) {
            hint.innerText = "⚠️ Hãy chọn ít nhất 1 phần kiến thức bên trên!";
            hint.className = "text-xs font-bold text-rose-500";
        } else {
            hint.innerText = `Có thể chọn tối đa ${state.availableCount} câu`;
            hint.className = "text-xs font-semibold text-honey";
        }
    }

    if (state.requestedCount > state.availableCount && state.requestedCount !== 'all') {
        state.requestedCount = state.availableCount > 0 ? Math.min(10, state.availableCount) : 0;
    }
    renderCountButtons();
}

function renderCountButtons() {
    const counts = [10, 20, 30, 40, 50, 'all'];
    const container = document.getElementById('question-count-container');
    if (!container) return;

    const html = counts.map(c => {
        const isAll = c === 'all';
        const isDisabled = !isAll && c > state.availableCount;
        const isSelected = state.requestedCount === c || (isAll && state.requestedCount === 'all');

        let cls = "px-3.5 sm:px-4 py-2 rounded-xl text-xs font-extrabold border transition-all ";
        if (isDisabled) {
            cls += "opacity-35 cursor-not-allowed bg-cream-100 dark:bg-[#201611] text-subtext border-[#F1E5D5] dark:border-[#38271e]";
        } else if (isSelected) {
            cls += "bg-honey text-white border-honey shadow-xs";
        } else {
            cls += "hover:bg-cream-100 dark:hover:bg-[#2c2018] text-subtext dark:text-[#FAF5F0] border-[#F1E5D5] dark:border-[#3d2d23]";
        }

        return `<button ${isDisabled ? 'disabled' : `onclick="setCount('${c}')"`} class="${cls}">
            ${isAll ? `Tất cả (${state.availableCount})` : `${c} câu`}
        </button>`;
    }).join('');

    container.innerHTML = html;
}

function setCount(c) {
    playSound('click');
    state.requestedCount = c === 'all' ? 'all' : parseInt(c);
    renderCountButtons();
}

function selectMode(m) {
    playSound('click');
    state.mode = m;
    const pEl = document.getElementById('mode-practice');
    const eEl = document.getElementById('mode-exam');
    const timeEl = document.getElementById('time-config');

    if (m === 'practice') {
        pEl.className = "p-4 rounded-2xl border-2 cursor-pointer transition-all border-emerald-500 bg-pastel-green/30 dark:bg-[#1a2f23]";
        eEl.className = "p-4 rounded-2xl border-2 cursor-pointer transition-all border-[#F1E5D5] dark:border-[#3d2d23]";
        timeEl.classList.add('hidden');
    } else {
        pEl.className = "p-4 rounded-2xl border-2 cursor-pointer transition-all border-[#F1E5D5] dark:border-[#3d2d23]";
        eEl.className = "p-4 rounded-2xl border-2 cursor-pointer transition-all border-rose-500 bg-pastel-pink/30 dark:bg-[#341d24]";
        timeEl.classList.remove('hidden');
    }
    setTime(state.time);
}

function setTime(t) {
    playSound('click');
    state.time = t;
    document.querySelectorAll('.btn-time').forEach(btn => {
        if (btn.innerText.includes(t)) {
            btn.className = "btn-time px-3 py-1.5 rounded-xl bg-rose-500 text-white text-xs font-extrabold shadow-xs";
        } else {
            btn.className = "btn-time px-3 py-1.5 rounded-xl border border-[#F1E5D5] dark:border-[#3d2d23] text-subtext dark:text-[#FAF5F0] text-xs font-bold hover:bg-cream-100 dark:hover:bg-[#2c2018]";
        }
    });
}

// ==================== 3. MÀN HÌNH LÀM BÀI (VIEW QUIZ) ====================
function startQuiz() {
    if (state.selectedSections.length === 0) {
        alert("Vui lòng chọn ít nhất 1 phần hoặc chương kiến thức để ôn tập!");
        return;
    }
    if (state.availableCount === 0) {
        alert("Không có câu hỏi nào trong các phần đã chọn!");
        return;
    }

    playSound('click');
    const allQ = QUESTION_BANK[state.currentSubject] || [];
    let pool = allQ.filter(q => state.selectedSections.includes(q.s));

    // Fisher-Yates Shuffle
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const takeCount = state.requestedCount === 'all' ? pool.length : Math.min(state.requestedCount, pool.length);
    state.quizData = pool.slice(0, takeCount);
    state.answers = {};
    state.flagged = {};
    state.currentIndex = 0;

    const sub = SUBJECTS.find(s => s.id === state.currentSubject);
    document.getElementById('quiz-subject-badge').innerText = sub ? sub.name : 'Trắc nghiệm';

    // Timer setup
    const timerContainer = document.getElementById('quiz-timer');
    if (state.mode === 'exam') {
        state.timeRem = state.time * 60;
        timerContainer.classList.remove('hidden');
        clearInterval(state.timerInt);
        updateTimerDisplay();
        state.timerInt = setInterval(tickTimer, 1000);
    } else {
        timerContainer.classList.add('hidden');
        clearInterval(state.timerInt);
    }

    renderQuiz();
    navigateTo('quiz');
}

function tickTimer() {
    state.timeRem--;
    updateTimerDisplay();

    if (state.timeRem <= 0) {
        clearInterval(state.timerInt);
        alert("⏰ Hết thời gian làm bài! Hệ thống tự động nộp bài thi của bạn.");
        submitQuiz();
    }
}

function updateTimerDisplay() {
    const m = Math.floor(state.timeRem / 60).toString().padStart(2, '0');
    const s = (state.timeRem % 60).toString().padStart(2, '0');
    const timerText = document.getElementById('timer-text');
    if (timerText) timerText.innerText = `${m}:${s}`;
}

function renderQuiz() {
    const total = state.quizData.length;
    const q = state.quizData[state.currentIndex];
    if (!q) return;

    // Counter & Progress Bar
    document.getElementById('quiz-counter').innerText = `Câu ${state.currentIndex + 1} / ${total}`;
    const answeredCount = Object.keys(state.answers).length;
    const pct = Math.round((answeredCount / total) * 100);
    const pBar = document.getElementById('quiz-progress-bar');
    if (pBar) pBar.style.width = `${pct}%`;

    // Section Badge
    document.getElementById('q-section-badge').innerHTML = `<i class="fa-solid fa-bookmark text-[10px]"></i><span>${q.s}</span>`;

    // Clean question prompt
    const cleanPrompt = q.q.replace(/^Câu\s+\d+:\s*/i, '');
    document.getElementById('q-text').innerText = `Câu ${state.currentIndex + 1}: ${cleanPrompt}`;

    // Options Rendering
    const selectedKey = state.answers[state.currentIndex];
    const optsHTML = Object.entries(q.o).map(([k, v]) => {
        const isSelected = selectedKey === k;
        let cardStyle = "border-[#F1E5D5] dark:border-[#3d2d23] bg-white dark:bg-[#251b15] hover:border-honey/60";
        let letterBadge = "bg-cream-100 dark:bg-[#34241b] text-subtext dark:text-[#C5B8A8] border-[#EADBCC] dark:border-[#4d3628]";

        if (state.mode === 'practice' && selectedKey) {
            if (k === q.c) {
                cardStyle = "border-emerald-500 bg-pastel-green/40 dark:bg-[#1a3325] text-emerald-950 dark:text-emerald-100 font-semibold";
                letterBadge = "bg-emerald-600 text-white border-emerald-600 font-bold";
            } else if (isSelected) {
                cardStyle = "border-rose-400 bg-pastel-pink/40 dark:bg-[#3d1e26] text-rose-950 dark:text-rose-100 font-semibold";
                letterBadge = "bg-rose-500 text-white border-rose-500 font-bold";
            }
        } else if (isSelected) {
            cardStyle = "border-honey bg-cream-100 dark:bg-[#34241b] text-bear-dark dark:text-[#FAF5F0] font-semibold";
            letterBadge = "bg-honey text-white border-honey font-bold";
        }

        return `
        <button onclick="ans('${k}')" class="quiz-opt-btn w-full p-3.5 sm:p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${cardStyle} select-none">
            <span class="w-6 h-6 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 border mt-0.5 ${letterBadge}">
                ${k}
            </span>
            <span class="text-xs sm:text-sm leading-relaxed flex-1">${v}</span>
            ${state.mode === 'practice' && selectedKey && k === q.c ? '<i class="fa-solid fa-check text-emerald-600 text-base ml-2 shrink-0"></i>' : ''}
            ${state.mode === 'practice' && isSelected && k !== q.c ? '<i class="fa-solid fa-xmark text-rose-500 text-base ml-2 shrink-0"></i>' : ''}
        </button>`;
    }).join('');

    document.getElementById('q-options').innerHTML = optsHTML;

    // Explanation Box (Practice mode)
    const exp = document.getElementById('q-explanation');
    if (state.mode === 'practice' && selectedKey) {
        exp.classList.remove('hidden');
        const isRight = selectedKey === q.c;
        exp.innerHTML = `
            <div class="flex items-start gap-2.5">
                <span class="text-lg shrink-0">${isRight ? '🎉' : '💡'}</span>
                <div>
                    <h5 class="font-bold text-xs sm:text-sm mb-1 ${isRight ? 'text-emerald-700 dark:text-emerald-300' : 'text-bear-dark dark:text-honey'}">
                        ${isRight ? 'Chính xác!' : 'Đáp án chính xác là'} 
                        <span class="underline">Lựa chọn ${q.c}</span>: ${q.o[q.c]}
                    </h5>
                    <p class="text-[11px] text-subtext">Cùng ghi nhớ kiến thức phần <b>${q.s}</b> nhé!</p>
                </div>
            </div>`;
    } else {
        exp.classList.add('hidden');
    }

    // Flag button styling
    const btnFlag = document.getElementById('btn-flag');
    if (state.flagged[state.currentIndex]) {
        btnFlag.className = "px-3 py-1 rounded-xl border border-honey bg-honey text-white font-bold text-xs flex items-center gap-1.5 shadow-xs";
        btnFlag.innerHTML = `<i class="fa-solid fa-star"></i><span>Đã đánh dấu</span>`;
    } else {
        btnFlag.className = "px-3 py-1 rounded-xl border border-[#F1E5D5] dark:border-[#3d2d23] text-subtext font-bold text-xs hover:border-honey hover:text-honey flex items-center gap-1.5 transition-colors";
        btnFlag.innerHTML = `<i class="fa-regular fa-star"></i><span>Đánh dấu</span>`;
    }

    // Prev / Next button
    const btnPrev = document.getElementById('btn-prev-q');
    const btnNext = document.getElementById('btn-next-q');
    btnPrev.disabled = state.currentIndex === 0;
    btnPrev.classList.toggle('opacity-40', state.currentIndex === 0);
    btnPrev.classList.toggle('cursor-not-allowed', state.currentIndex === 0);

    const isLast = state.currentIndex === total - 1;
    btnNext.innerHTML = isLast ? `<span>Nộp bài</span> <i class="fa-solid fa-check"></i>` : `<span class="hidden sm:inline">Câu tiếp</span> <i class="fa-solid fa-arrow-right"></i>`;

    renderGrid();
}

function ans(k) {
    const q = state.quizData[state.currentIndex];
    state.answers[state.currentIndex] = k;

    if (state.mode === 'practice') {
        if (k === q.c) playSound('correct');
        else playSound('wrong');
    } else {
        playSound('click');
    }

    renderQuiz();
}

function navQ(dir) {
    const total = state.quizData.length;
    const n = state.currentIndex + dir;
    if (n >= 0 && n < total) {
        state.currentIndex = n;
        playSound('click');
        renderQuiz();
    } else if (n === total) {
        promptSubmitQuiz();
    }
}

function toggleFlag() {
    playSound('click');
    state.flagged[state.currentIndex] = !state.flagged[state.currentIndex];
    renderQuiz();
}

function renderGrid() {
    const total = state.quizData.length;
    const gridEl = document.getElementById('q-grid');
    if (!gridEl) return;

    const answeredCount = Object.keys(state.answers).length;
    document.getElementById('grid-answered-badge').innerText = `${answeredCount}/${total} câu`;

    const html = state.quizData.map((_, i) => {
        const isCurrent = i === state.currentIndex;
        const isAnswered = state.answers[i] !== undefined;
        const isFlagged = state.flagged[i];

        let bg = "bg-cream-100 dark:bg-[#34241b] text-subtext dark:text-[#C5B8A8]";
        if (isAnswered) bg = "bg-honey text-white font-bold";
        if (isFlagged) bg = "bg-pastel-yellow dark:bg-[#3a301a] text-bear-dark font-bold border border-amber-400";
        if (isCurrent) bg += " ring-2 ring-bear dark:ring-honey";

        return `<button onclick="jumpToQ(${i})" class="h-8 rounded-xl font-bold text-xs transition-all ${bg}">
            ${i + 1}
        </button>`;
    }).join('');

    gridEl.innerHTML = html;
}

function jumpToQ(idx) {
    playSound('click');
    state.currentIndex = idx;
    renderQuiz();
}

function toggleMobileDrawer() {
    const panel = document.getElementById('drawer-panel');
    if (panel) {
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) {
            panel.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// ==================== 4. XÁC NHẬN & NỘP BÀI ====================
function promptSubmitQuiz() {
    playSound('click');
    const total = state.quizData.length;
    const answeredCount = Object.keys(state.answers).length;
    const unansweredCount = total - answeredCount;
    const flaggedCount = Object.values(state.flagged).filter(Boolean).length;

    let summaryText = `Bạn đã trả lời <b>${answeredCount}/${total}</b> câu.`;
    if (unansweredCount > 0) {
        summaryText += `<br><span class="text-rose-500 font-bold">⚠️ Bạn còn ${unansweredCount} câu chưa làm!</span>`;
    }
    if (flaggedCount > 0) {
        summaryText += `<br><span class="text-honey">⭐ Có ${flaggedCount} câu đang đánh dấu.</span>`;
    }

    document.getElementById('modal-submit-summary').innerHTML = summaryText;
    document.getElementById('modal-submit').classList.remove('hidden');
}

function closeSubmitModal() {
    document.getElementById('modal-submit').classList.add('hidden');
}

function confirmExitQuiz() {
    if (confirm("Bạn muốn rời khỏi bài thi hiện tại? Tiến độ đang làm sẽ bị hủy.")) {
        clearInterval(state.timerInt);
        navigateTo('config');
    }
}

function submitQuiz() {
    closeSubmitModal();
    clearInterval(state.timerInt);

    let correct = 0;
    state.quizData.forEach((q, i) => {
        if (state.answers[i] === q.c) correct++;
    });

    const total = state.quizData.length;
    const score = Number(((correct / total) * 10).toFixed(1));
    const accuracy = Math.round((correct / total) * 100);

    if (score >= 8.0) {
        playSound('fanfare');
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    } else {
        playSound('fanfare');
    }

    document.getElementById('r-score').innerText = score.toFixed(1);
    document.getElementById('r-correct').innerText = correct;
    document.getElementById('r-wrong').innerText = total - correct;
    document.getElementById('r-acc').innerText = `${accuracy}%`;

    const msgEl = document.getElementById('r-message');
    if (score >= 9.0) {
        msgEl.innerText = "🌟 Xuất sắc! Bạn nắm kiến thức cực kỳ vững vàng và tự tin nhé!";
    } else if (score >= 8.0) {
        msgEl.innerText = "🎉 Rất tốt! Bài thi của bạn rất ấn tượng!";
    } else if (score >= 6.5) {
        msgEl.innerText = "👍 Khá tốt! Xem lại chi tiết các câu sai để hoàn thiện nhé!";
    } else if (score >= 5.0) {
        msgEl.innerText = "💪 Đã vượt qua! Hãy bấm 'Luyện lại câu sai' để nắm chắc kiến thức hơn!";
    } else {
        msgEl.innerText = "📚 Cần cố gắng thêm một chút! Cùng Nhà Gấu luyện lại nhé!";
    }

    const btnPW = document.getElementById('btn-practice-wrong');
    btnPW.style.display = (total - correct > 0) ? 'inline-flex' : 'none';

    // Save History
    const subObj = SUBJECTS.find(s => s.id === state.currentSubject);
    state.history.unshift({
        date: new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        sub: subObj ? subObj.name : 'Trắc nghiệm',
        subId: state.currentSubject,
        score: score.toFixed(1),
        mode: state.mode === 'practice' ? 'Luyện tập' : 'Thi thử',
        accuracy: `${accuracy}%`,
        correct: `${correct}/${total}`
    });
    localStorage.setItem('gau_history', JSON.stringify(state.history));
    renderHistory();
    renderRealStats();
    renderContinueStudyCard();

    navigateTo('result');
}

function retryCurrentQuiz() {
    state.answers = {};
    state.flagged = {};
    state.currentIndex = 0;
    if (state.mode === 'exam') {
        state.timeRem = state.time * 60;
        clearInterval(state.timerInt);
        state.timerInt = setInterval(tickTimer, 1000);
    }
    renderQuiz();
    navigateTo('quiz');
}

function practiceWrong() {
    const wrongList = state.quizData.filter((q, i) => state.answers[i] !== q.c);
    if (wrongList.length === 0) {
        alert("Tuyệt vời! Bạn không sai câu nào cả 🐻");
        return;
    }

    state.quizData = wrongList;
    state.answers = {};
    state.flagged = {};
    state.currentIndex = 0;
    state.mode = 'practice';
    selectMode('practice');
    renderQuiz();
    navigateTo('quiz');
}

// ==================== 5. XEM LẠI BÀI LÀM (VIEW REVIEW) ====================
function viewReview() {
    playSound('click');
    filterReview('all');
    navigateTo('review');
}

function filterReview(type) {
    state.reviewFilter = type;
    const btns = {
        'all': document.getElementById('rf-all'),
        'wrong': document.getElementById('rf-wrong'),
        'correct': document.getElementById('rf-correct')
    };

    Object.keys(btns).forEach(k => {
        if (!btns[k]) return;
        if (k === type) {
            btns[k].className = "px-3 py-1 rounded-lg bg-white dark:bg-[#201611] text-slate-900 dark:text-white font-extrabold shadow-xs";
        } else {
            btns[k].className = "px-3 py-1 rounded-lg text-subtext hover:text-bear-dark dark:hover:text-[#FAF5F0] font-bold";
        }
    });

    renderReviewList();
}

function renderReviewList() {
    const container = document.getElementById('review-list');
    if (!container) return;

    let items = state.quizData.map((q, idx) => ({
        q,
        idx,
        userAns: state.answers[idx],
        isCorrect: state.answers[idx] === q.c
    }));

    if (state.reviewFilter === 'wrong') {
        items = items.filter(it => !it.isCorrect);
    } else if (state.reviewFilter === 'correct') {
        items = items.filter(it => it.isCorrect);
    }

    if (items.length === 0) {
        container.innerHTML = `<div class="cozy-card p-6 rounded-2xl text-center text-subtext font-bold">Không có câu hỏi nào trong danh mục này!</div>`;
        return;
    }

    const html = items.map(it => {
        const { q, idx, userAns, isCorrect } = it;
        const cleanPrompt = q.q.replace(/^Câu\s+\d+:\s*/i, '');

        const optsHTML = Object.entries(q.o).map(([k, v]) => {
            let optStyle = "text-subtext dark:text-[#C5B8A8]";
            let badgeStyle = "bg-cream-100 dark:bg-[#34241b] text-subtext border-[#EADBCC] dark:border-[#4d3628]";

            if (k === q.c) {
                optStyle = "text-emerald-700 dark:text-emerald-300 font-bold";
                badgeStyle = "bg-emerald-600 text-white border-emerald-600 font-bold";
            } else if (k === userAns && !isCorrect) {
                optStyle = "text-rose-600 dark:text-rose-400 font-bold line-through";
                badgeStyle = "bg-rose-500 text-white border-rose-500 font-bold";
            }

            return `
            <div class="flex items-center gap-2.5 p-2 rounded-xl border border-transparent ${k === q.c ? 'bg-pastel-green/30 dark:bg-[#1a3325] border-emerald-400/40' : ''}">
                <span class="w-5 h-5 rounded-lg text-xs flex items-center justify-center border shrink-0 ${badgeStyle}">
                    ${k}
                </span>
                <span class="text-xs sm:text-sm ${optStyle}">${v}</span>
                ${k === q.c ? '<i class="fa-solid fa-check text-emerald-600 ml-auto text-xs"></i>' : ''}
                ${k === userAns && !isCorrect ? '<i class="fa-solid fa-xmark text-rose-500 ml-auto text-xs"></i>' : ''}
            </div>`;
        }).join('');

        return `
        <div class="cozy-card p-5 sm:p-6 rounded-3xl border ${isCorrect ? 'border-emerald-300/80 dark:border-emerald-900/60' : 'border-rose-300/80 dark:border-rose-900/60'}">
            <div class="flex items-center justify-between mb-2.5">
                <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full ${isCorrect ? 'bg-pastel-green text-emerald-800' : 'bg-pastel-pink text-rose-800'}">
                    ${isCorrect ? '✅ Trả lời đúng' : '❌ Trả lời sai'} (${q.s})
                </span>
                <span class="text-xs text-subtext">Bạn chọn: <b>${userAns || 'Chưa chọn'}</b></span>
            </div>
            
            <h4 class="font-bold text-sm sm:text-base text-slate-900 dark:text-[#FAF5F0] mb-3">
                Câu ${idx + 1}: ${cleanPrompt}
            </h4>

            <div class="space-y-1 mb-3">
                ${optsHTML}
            </div>

            <div class="p-3 rounded-xl bg-cream-100 dark:bg-[#201611] border border-[#F1E5D5] dark:border-[#38271e] text-xs text-bear-dark dark:text-honey font-medium">
                💡 <b>Đáp án đúng là ${q.c}:</b> ${q.o[q.c]}
            </div>
        </div>`;
    }).join('');

    container.innerHTML = html;
}

// ==================== 6. LỊCH SỬ LÀM BÀI (VIEW HISTORY) ====================
function renderHistory() {
    const tbody = document.getElementById('history-body');
    if (!tbody) return;

    if (state.history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-subtext font-medium">Chưa có bài thi nào được lưu lại. Hãy chọn môn để bắt đầu ôn thi nhé!</td></tr>`;
        return;
    }

    tbody.innerHTML = state.history.map(h => `
        <tr class="hover:bg-cream-100/60 dark:hover:bg-[#2c2018] transition-colors">
            <td class="p-3 sm:p-3.5 text-xs text-subtext dark:text-[#C5B8A8]">${h.date}</td>
            <td class="p-3 sm:p-3.5 text-xs font-bold text-slate-800 dark:text-[#FAF5F0]">${h.sub}</td>
            <td class="p-3 sm:p-3.5 font-extrabold text-xs sm:text-sm ${Number(h.score) >= 8.0 ? 'text-emerald-600 dark:text-emerald-400' : Number(h.score) >= 5.0 ? 'text-honey' : 'text-rose-500'}">
                ${h.score}
            </td>
            <td class="p-3 sm:p-3.5 text-xs">
                <span class="px-2 py-0.5 rounded-lg font-bold text-[10px] ${h.mode === 'Luyện tập' ? 'bg-pastel-green text-emerald-800' : 'bg-pastel-pink text-rose-800'}">
                    ${h.mode}
                </span>
            </td>
        </tr>
    `).join('');
}

function clearHistory() {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử ôn thi không?")) {
        state.history = [];
        localStorage.removeItem('gau_history');
        renderHistory();
        renderRealStats();
        renderContinueStudyCard();
    }
}

// ==================== KEYBOARD NAVIGATION & SHORTCUTS ====================
function attachKeyboardNavigation() {
    window.addEventListener('keydown', (e) => {
        const quizView = document.getElementById('view-quiz');
        if (!quizView || quizView.classList.contains('hidden')) return;

        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

        const key = e.key.toUpperCase();

        if (['A', 'B', 'C', 'D'].includes(key)) {
            e.preventDefault();
            ans(key);
        } else if (['1', '2', '3', '4'].includes(key)) {
            e.preventDefault();
            const map = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
            ans(map[key]);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            navQ(-1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            navQ(1);
        } else if (key === 'F') {
            e.preventDefault();
            toggleFlag();
        } else if (e.key === 'Escape') {
            closeKeyboardModal();
            closeSubmitModal();
        }
    });
}

function openKeyboardModal() {
    playSound('click');
    document.getElementById('modal-keyboard').classList.remove('hidden');
}

function closeKeyboardModal() {
    document.getElementById('modal-keyboard').classList.add('hidden');
}

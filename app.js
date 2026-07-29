// API 設定
const API_URL = '/api/chat'; 
const MODEL_NAME = 'llama-3.1-8b-instant';

// ==========================================
// DOM Elements
// ==========================================
// Screens
const homeScreen = document.getElementById('home-screen');
const chatScreen = document.getElementById('chat-screen');
const recordsScreen = document.getElementById('records-screen');
const vocabScreen = document.getElementById('vocab-screen');
const modalOverlay = document.getElementById('level-modal');

// Home Screen Elements
const modeCards = document.querySelectorAll('.feature-card');
const levelCards = document.querySelectorAll('.level-card');
const scenarioCards = document.querySelectorAll('.scenario-card');
const langSelect = document.getElementById('lang-select');
const navRecordsBtn = document.querySelector('[data-i18n="nav_records"]');
const navHomeBtn = document.querySelector('[data-i18n="nav_home"]');

// Modal Elements
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalLevelBtns = document.querySelectorAll('.modal-level-btn');

// Chat Screen Elements
const backBtn = document.getElementById('back-btn');
const currentLevelBadge = document.getElementById('current-level-badge');
const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Records Screen Elements
const recordsBackBtn = document.getElementById('records-back-btn');
const recordsList = document.getElementById('records-list');
const recordsEmptyState = document.getElementById('records-empty-state');

// Vocab Screen Elements
const vocabBackBtn = document.getElementById('vocab-back-btn');
const vocabTabs = document.querySelectorAll('.vocab-tab');
const vocabList = document.getElementById('vocab-list');

// ==========================================
// State
// ==========================================
let currentLang = 'zh-TW';
let currentMode = 'chat'; // 'chat', 'article', 'scenario'
let selectedLevel = 'N3';
let selectedScenario = '';
let chatHistory = [];
let sessionId = null; // 用於追蹤當前對話，以便儲存記錄

// ==========================================
// i18n Translations
// ==========================================
const i18n = {
    'zh-TW': {
        nav_home: '🏠 首頁', nav_records: '📝 練習記錄', nav_vocab: '📖 單字本', nav_resources: '📚 學習資源', nav_about: '🏛 關於我們',
        hero_subtitle: '你的專屬日語學習夥伴，隨時隨地陪你練日文！',
        card_chat_title: '對話練習', card_chat_desc: '和AI老師自由對話',
        card_article_title: '文章修改', card_article_desc: '日文作文批改與建議',
        card_scenario_title: '情境式日語學習', card_scenario_desc: '真實場景模擬練習',
        level_title: '選擇你的學習程度', level_subtitle: 'AI老師會依照你的程度提供最適合的內容',
        
        n5_label: '初學者', n5_vocab: '⭐ 800+ 單字', n5_note: '適合零基礎',
        n4_label: '基礎對話', n4_vocab: '⭐ 1500+ 單字', n4_note: '能簡單日常對話',
        n3_label: '日常溝通', n3_vocab: '⭐ 3000+ 單字', n3_note: '可進行一般交流',
        n2_label: '進階交流', n2_vocab: '⭐ 6000+ 單字', n2_note: '理解複雜內容',
        n1_label: '流利對答', n1_vocab: '⭐ 10000+ 單字', n1_note: '接近母語程度',
        
        scenario_title: '熱門情境學習', scenario_subtitle: '選擇你想練習的場景，AI老師陪你實戰演練',
        sc_airport: '機場・入境', sc_airport_desc: '旅行必備會話',
        sc_convenience: '超商・購物', sc_convenience_desc: '日常購物對話',
        sc_restaurant: '餐廳・點餐', sc_restaurant_desc: '美食之旅必備',
        sc_hotel: '飯店・住宿', sc_hotel_desc: '入住退房必備',
        sc_interview: '面試・工作', sc_interview_desc: '商務日語必備',
        sc_more: '更多情境', sc_more_desc: '探索更多...',
        
        modal_level_title: '選擇程度開始練習', modal_level_subtitle: 'AI老師會依照你的程度提供最適合的指導',
        footer_cta_title: '喜歡這個AI學習平台嗎？', footer_cta_desc: '訂閱我的YouTube頻道，獲得更多免費日語教學內容！',
        footer_subscribe: '前往頻道 ▶',
        
        back_btn: '← 返回首頁', ai_teacher: '金耳日語 AI老師', send_btn: '發送',
        input_chat: '請輸入日文開始聊天... (支援 Enter 發送)',
        input_article: '請貼上您的日文文章...',
        ai_lang_name: '繁體中文(台灣)',
        correction_label: '💡 老師的指導與糾正：',
        mode_article: ' (文章修改)', mode_chat: ' (自由對話)', mode_scenario: ' (情境演練)',
        
        greeting_article: 'こんにちは！進入「文章修改模式」。請貼上你寫好的日文文章（程度設定為 {level}），我會幫你修改得更自然道地喔！',
        greeting_chat: 'こんにちは！我是你的 AI 日文老師。我們今天的目標是練習 {level} 程度的日文。想聊些什麼呢？去日本旅遊還是最近看起動漫？',
        greeting_scenario: 'こんにちは！現在我們來進行「{scenario}」的情境模擬練習（程度設定為 {level}）。我會扮演對應的角色，準備好了就用日文跟我說話吧！',
        correction_placeholder_article: '（你的文章問題與文法解釋會出現在這裡喔！）',
        correction_placeholder_chat: '（這裡是老師糾正文法的地方喔！）',
        records_empty: '目前還沒有練習記錄喔！<br>趕快開始和 AI 老師對話吧！'
    },
    'zh-HK': {
        nav_home: '🏠 首頁', nav_records: '📝 練習記錄', nav_vocab: '📖 單字本', nav_resources: '📚 學習資源', nav_about: '🏛 關於我哋',
        hero_subtitle: '你嘅專屬日語學習夥伴，隨時隨地陪你練日文！',
        card_chat_title: '對話練習', card_chat_desc: '同AI老師自由對話',
        card_article_title: '文章修改', card_article_desc: '日文作文批改同建議',
        card_scenario_title: '情境式日語學習', card_scenario_desc: '真實場景模擬練習',
        level_title: '選擇你嘅學習程度', level_subtitle: 'AI老師會依照你嘅程度提供最適合嘅內容',
        
        n5_label: '初學者', n5_vocab: '⭐ 800+ 單字', n5_note: '適合零基礎',
        n4_label: '基礎對話', n4_vocab: '⭐ 1500+ 單字', n4_note: '能簡單日常對話',
        n3_label: '日常溝通', n3_vocab: '⭐ 3000+ 單字', n3_note: '可進行一般交流',
        n2_label: '進階交流', n2_vocab: '⭐ 6000+ 單字', n2_note: '理解複雜內容',
        n1_label: '流利對答', n1_vocab: '⭐ 10000+ 單字', n1_note: '接近母語程度',
        
        scenario_title: '熱門情境學習', scenario_subtitle: '選擇你想練習嘅場景，AI老師陪你實戰演練',
        sc_airport: '機場・入境', sc_airport_desc: '旅行必備會話',
        sc_convenience: '超商・購物', sc_convenience_desc: '日常購物對話',
        sc_restaurant: '餐廳・點餐', sc_restaurant_desc: '美食之旅必備',
        sc_hotel: '飯店・住宿', sc_hotel_desc: '入住退房必備',
        sc_interview: '面試・工作', sc_interview_desc: '商務日語必備',
        sc_more: '更多情境', sc_more_desc: '探索更多...',
        
        modal_level_title: '選擇程度開始練習', modal_level_subtitle: 'AI老師會依照你嘅程度提供最適合嘅指導',
        footer_cta_title: '鍾意呢個AI學習平台嗎？', footer_cta_desc: '訂閱我嘅YouTube頻道，獲得更多免費日語教學內容！',
        footer_subscribe: '前往頻道 ▶',
        
        back_btn: '← 返回首頁', ai_teacher: '金耳日語 AI老師', send_btn: '傳送',
        input_chat: '請輸入日文開始傾偈... (支援 Enter 傳送)',
        input_article: '請貼上你嘅日文文章...',
        ai_lang_name: '廣東話(Cantonese)',
        correction_label: '💡 老師嘅指導同糾正：',
        mode_article: ' (文章修改)', mode_chat: ' (自由對話)', mode_scenario: ' (情境演練)',
        
        greeting_article: 'こんにちは！入咗「文章修改模式」。請貼上你寫好嘅日文文章（程度設定為 {level}），我會幫你修改得更自然地道！',
        greeting_chat: 'こんにちは！我係你嘅 AI 日文老師。我哋今日嘅目標係練習 {level} 程度嘅日文。想傾啲咩呢？去日本旅行定係最近睇緊嘅動漫？',
        greeting_scenario: 'こんにちは！而家我哋嚟進行「{scenario}」嘅情境模擬練習（程度設定為 {level}）。我會扮演對應嘅角色，準備好就用日文同我講嘢啦！',
        correction_placeholder_article: '（你嘅文章問題同文法解釋會喺呢度出現！）',
        correction_placeholder_chat: '（呢度係老師糾正文法嘅地方！）',
        records_empty: '目前仲未有練習記錄呀！<br>快啲開始同 AI 老師對話啦！'
    },
    'en': {
        nav_home: '🏠 Home', nav_records: '📝 Records', nav_vocab: '📖 Vocab', nav_resources: '📚 Resources', nav_about: '🏛 About',
        hero_subtitle: 'Your personal Japanese learning partner, practice anytime, anywhere!',
        card_chat_title: 'Conversation', card_chat_desc: 'Free talk with AI Teacher',
        card_article_title: 'Article Correction', card_article_desc: 'Writing feedback & advice',
        card_scenario_title: 'Situational Japanese', card_scenario_desc: 'Real-world scenario practice',
        level_title: 'Select Your Level', level_subtitle: 'The AI teacher will tailor the content to your level',
        
        n5_label: 'Beginner', n5_vocab: '⭐ 800+ Words', n5_note: 'Perfect for starters',
        n4_label: 'Basic Talk', n4_vocab: '⭐ 1500+ Words', n4_note: 'Simple daily conversation',
        n3_label: 'Daily Comm.', n3_vocab: '⭐ 3000+ Words', n3_note: 'General communication',
        n2_label: 'Advanced', n2_vocab: '⭐ 6000+ Words', n2_note: 'Understand complex topics',
        n1_label: 'Fluent', n1_vocab: '⭐ 10000+ Words', n1_note: 'Near-native proficiency',
        
        scenario_title: 'Popular Scenarios', scenario_subtitle: 'Choose a scene to practice, and the AI teacher will roleplay with you',
        sc_airport: 'Airport・Entry', sc_airport_desc: 'Travel essentials',
        sc_convenience: 'Convenience Store', sc_convenience_desc: 'Daily shopping',
        sc_restaurant: 'Restaurant・Order', sc_restaurant_desc: 'Food journey basics',
        sc_hotel: 'Hotel・Check-in', sc_hotel_desc: 'Accommodation essentials',
        sc_interview: 'Job Interview', sc_interview_desc: 'Business Japanese',
        sc_more: 'More Scenarios', sc_more_desc: 'Explore more...',
        
        modal_level_title: 'Select Level to Start', modal_level_subtitle: 'The AI teacher will adapt to your selected level',
        footer_cta_title: 'Like this AI learning platform?', footer_cta_desc: 'Subscribe to my YouTube channel for more free Japanese lessons!',
        footer_subscribe: 'Go to Channel ▶',
        
        back_btn: '← Back to Home', ai_teacher: 'Golden Ear AI Teacher', send_btn: 'Send',
        input_chat: 'Type in Japanese to chat... (Press Enter to send)',
        input_article: 'Paste your Japanese article here...',
        ai_lang_name: 'English',
        correction_label: '💡 Teacher\'s Guidance:',
        mode_article: ' (Article Edit)', mode_chat: ' (Free Talk)', mode_scenario: ' (Scenario)',
        
        greeting_article: 'こんにちは! Entering "Article Correction Mode". Please paste your Japanese article (Level set to {level}), and I will make it sound more natural and native!',
        greeting_chat: 'こんにちは! I am your AI Japanese Teacher. Our goal today is to practice Japanese at the {level} level. What would you like to talk about?',
        greeting_scenario: 'こんにちは! Let\'s start the "{scenario}" simulation (Level: {level}). I will play the corresponding role. Speak to me in Japanese when you are ready!',
        correction_placeholder_article: '(Your article issues and grammar explanations will appear here!)',
        correction_placeholder_chat: '(This is where the teacher will correct your grammar!)',
        records_empty: 'No practice records yet!<br>Start chatting with the AI teacher now!'
    }
};

// ==========================================
// Vocabulary Data (Mockup)
// ==========================================
const vocabData = {
    'N5': [
        { word: '私', kana: 'わたし', zh: '我', en: 'I, me' },
        { word: '今日', kana: 'きょう', zh: '今天', en: 'Today' },
        { word: '食べる', kana: 'たべる', zh: '吃', en: 'To eat' },
        { word: '行く', kana: 'いく', zh: '去', en: 'To go' },
        { word: '学校', kana: 'がっこう', zh: '學校', en: 'School' },
        { word: '車', kana: 'くるま', zh: '車子', en: 'Car' },
        { word: '水', kana: 'みず', zh: '水', en: 'Water' },
        { word: '見る', kana: 'みる', zh: '看', en: 'To see' }
    ],
    'N4': [
        { word: '準備', kana: 'じゅんび', zh: '準備', en: 'Preparation' },
        { word: '複雑', kana: 'ふくざつ', zh: '複雜', en: 'Complex' },
        { word: '連絡', kana: 'れんらく', zh: '聯絡', en: 'Contact' },
        { word: '約束', kana: 'やくそく', zh: '約定', en: 'Promise' },
        { word: '失敗', kana: 'しっぱい', zh: '失敗', en: 'Failure' },
        { word: '安心', kana: 'あんしん', zh: '安心', en: 'Relief' }
    ],
    'N3': [
        { word: '当然', kana: 'とうぜん', zh: '當然', en: 'Naturally' },
        { word: '影響', kana: 'えいきょう', zh: '影響', en: 'Influence' },
        { word: '環境', kana: 'かんきょう', zh: '環境', en: 'Environment' },
        { word: '感謝', kana: 'かんしゃ', zh: '感謝', en: 'Gratitude' },
        { word: '努力', kana: 'どりょく', zh: '努力', en: 'Effort' },
        { word: '成長', kana: 'せいちょう', zh: '成長', en: 'Growth' }
    ],
    'N2': [
        { word: '矛盾', kana: 'むじゅん', zh: '矛盾', en: 'Contradiction' },
        { word: '柔軟', kana: 'じゅうなん', zh: '柔軟、靈活', en: 'Flexible' },
        { word: '妥協', kana: 'だきょう', zh: '妥協', en: 'Compromise' },
        { word: '詳細', kana: 'しょうさい', zh: '詳細', en: 'Details' },
        { word: '把握', kana: 'はおく', zh: '把握、掌握', en: 'Grasp' }
    ],
    'N1': [
        { word: '躊躇', kana: 'ちゅうちょ', zh: '躊躇、猶豫', en: 'Hesitation' },
        { word: '払拭', kana: 'ふっしょく', zh: '拂拭、消除', en: 'Sweep away' },
        { word: '一蹴', kana: 'いっしゅう', zh: '一蹴、輕易拒絕', en: 'Reject flatly' },
        { word: '蔓延', kana: 'まんえん', zh: '蔓延', en: 'Spread' },
        { word: '顕著', kana: 'けんちょ', zh: '顯著', en: 'Remarkable' }
    ]
};

function renderVocab(level) {
    vocabList.innerHTML = '';
    const items = vocabData[level] || [];
    
    // Determine language to show meaning
    const isEnglish = currentLang === 'en';
    
    items.forEach(item => {
        const meaning = isEnglish ? item.en : item.zh;
        const div = document.createElement('div');
        div.className = 'vocab-item';
        div.innerHTML = `
            <div class="vocab-word">${item.word}</div>
            <div class="vocab-kana">${item.kana}</div>
            <div class="vocab-meaning">${meaning}</div>
        `;
        vocabList.appendChild(div);
    });
}

// ==========================================
// LocalStorage Functions for Records
// ==========================================
function getSavedRecords() {
    const records = localStorage.getItem('japaneseChatRecords');
    return records ? JSON.parse(records) : [];
}

function saveRecord(history, mode, level, scenario) {
    if (!sessionId) sessionId = Date.now().toString();
    const records = getSavedRecords();
    const existingIndex = records.findIndex(r => r.id === sessionId);
    
    // 找出第一條使用者訊息作為預覽
    const firstUserMsg = history.find(m => m.role === 'user')?.content || 'No messages yet';
    
    const t = i18n[currentLang] || i18n['zh-TW'];
    let modeText = t['mode_chat'];
    if(mode === 'article') modeText = t['mode_article'];
    if(mode === 'scenario') modeText = `${t['mode_scenario']} - ${getScenarioName(scenario)}`;

    const recordData = {
        id: sessionId,
        date: new Date().toLocaleString(),
        level: level,
        modeText: modeText,
        preview: firstUserMsg,
        history: history
    };

    if (existingIndex > -1) {
        records[existingIndex] = recordData;
    } else {
        records.unshift(recordData); // 加在最前面
    }
    
    localStorage.setItem('japaneseChatRecords', JSON.stringify(records));
}

function renderRecords() {
    const records = getSavedRecords();
    const t = i18n[currentLang] || i18n['zh-TW'];
    
    // Clear list except for empty state
    Array.from(recordsList.children).forEach(child => {
        if (child.id !== 'records-empty-state') child.remove();
    });

    if (records.length === 0) {
        recordsEmptyState.style.display = 'flex';
        recordsEmptyState.querySelector('p').innerHTML = t['records_empty'];
    } else {
        recordsEmptyState.style.display = 'none';
        records.forEach(record => {
            const item = document.createElement('div');
            item.className = 'record-item';
            item.innerHTML = `
                <div class="record-header">
                    <span class="record-title">${record.level} ${record.modeText}</span>
                    <span class="record-date">${record.date}</span>
                </div>
                <div class="record-preview">${escapeHTML(record.preview)}</div>
            `;
            
            // 點擊記錄可以回復對話
            item.addEventListener('click', () => {
                resumeRecord(record);
            });
            
            recordsList.appendChild(item);
        });
    }
}

function resumeRecord(record) {
    sessionId = record.id;
    chatHistory = record.history;
    selectedLevel = record.level;
    
    // Render all messages
    chatMessages.innerHTML = '';
    
    // System message is at index 0, first AI greeting is usually next. 
    // Just parse history and append appropriately.
    // For simplicity, we just look at role. 
    // We assume the stored history contains JSON strings or parsed objects from assistant.
    chatHistory.forEach(msg => {
        if (msg.role === 'user') {
            appendUserMessage(msg.content);
        } else if (msg.role === 'assistant') {
            try {
                // Determine if msg.content is JSON string
                let data = JSON.parse(msg.content);
                appendAIMessage(data);
            } catch (e) {
                // Normal text or fallback
                appendAIMessage({ reply: msg.content, correction: '' });
            }
        }
    });

    currentLevelBadge.textContent = record.level + " (Resumed)";
    recordsScreen.classList.remove('active');
    chatScreen.classList.add('active');
    scrollToBottom();
}

// ==========================================
// Application Functions
// ==========================================
function updateLanguage(lang) {
    const t = i18n[lang] || i18n['zh-TW'];
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            if (el.tagName === 'P' && t[key].includes('<br>')) {
                el.innerHTML = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });
    
    if (currentMode === 'article') userInput.placeholder = t['input_article'];
    else userInput.placeholder = t['input_chat'];
}

function showModal() {
    modalOverlay.style.display = 'flex';
    setTimeout(() => { modalOverlay.classList.add('show'); }, 10);
}

function hideModal() {
    modalOverlay.classList.remove('show');
    setTimeout(() => { modalOverlay.style.display = 'none'; }, 300);
}

function getScenarioName(scenarioKey) {
    const t = i18n[currentLang] || i18n['zh-TW'];
    return t[`sc_${scenarioKey}`] || scenarioKey;
}

function startGame() {
    sessionId = Date.now().toString(); // 產生新會話 ID
    
    const t = i18n[currentLang] || i18n['zh-TW'];
    let modeText = t['mode_chat'];
    if(currentMode === 'article') modeText = t['mode_article'];
    if(currentMode === 'scenario') modeText = t['mode_scenario'];
    
    currentLevelBadge.textContent = selectedLevel + modeText;
    
    homeScreen.classList.remove('active');
    chatScreen.classList.add('active');
    
    setupAI();
}

function setupAI() {
    const t = i18n[currentLang] || i18n['zh-TW'];
    const langName = t['ai_lang_name'];
    let systemPrompt = '';
    let greeting = '';

    if (currentMode === 'article') {
        systemPrompt = `你是一個專業的日文編輯與老師。目前學生的日文程度是 ${selectedLevel}。
學生的任務是貼上一段日文文章，請你幫忙修改。
你的任務是：
1. 將文章修改得更通順、道地，並修正所有文法與單字錯誤。
2. 根據學生的程度，解釋你修改了哪些地方，以及為什麼這樣修改。請務必使用 ${langName} 解釋。

請務必嚴格以 JSON 格式回覆，格式如下，不要輸出任何其他文字：
{
  "reply": "你修改後的一整段完整日文文章（這裡務必只使用純日文）",
  "correction": "你的修改說明與建議（請用 ${langName} 條列式解釋）"
}`;
        greeting = t['greeting_article'].replace('{level}', selectedLevel);
    } 
    else if (currentMode === 'scenario') {
        const scenarioName = getScenarioName(selectedScenario);
        systemPrompt = `你是一個專業且友善的日文會話老師。目前學生的日文程度是 ${selectedLevel}。
我們現在正在進行情境模擬練習，情境是：「${scenarioName}」。
你的任務是：
1. 扮演該情境中的對應角色（例如：店員、海關、面試官等），主動與學生進行對話，引導對話發展。這部分請務必只使用純日文。
2. 仔細檢查學生的日文。如果有文法、單字錯誤，或是有更自然、更道地的表達方式，請務必糾正並說明。如果沒有錯誤，請給予鼓勵。這部分請務必使用 ${langName} 解釋。

請務必嚴格以 JSON 格式回覆，格式如下，不要輸出任何其他文字：
{
  "reply": "你扮演角色回應的日文對話內容（這裡務必只使用純日文）",
  "correction": "給學生的糾正與建議（請用 ${langName} 解釋，若無錯誤則給予簡短鼓勵）"
}`;
        greeting = t['greeting_scenario'].replace('{level}', selectedLevel).replace('{scenario}', scenarioName);
    }
    else { // chat
        systemPrompt = `你是一個專業且友善的日文會話老師。目前學生的日文程度是 ${selectedLevel}。
請用符合該程度的詞彙和文法與學生對話。學生可以跟你聊任何話題（例如便利商店、日本旅遊等）。
你的任務是：
1. 回應學生的話題，自然地延續對話，提出問題引導學生多說話。這部分請務必只使用純日文。
2. 仔細檢查學生的日文。如果有文法、單字錯誤，或是有更自然、更道地的表達方式，請務必糾正並說明。如果沒有錯誤，請給予鼓勵。這部分請務必使用 ${langName} 解釋。

請務必嚴格以 JSON 格式回覆，格式如下，不要輸出任何其他文字：
{
  "reply": "你回應學生的日文對話內容（這裡務必只使用純日文）",
  "correction": "給學生的糾正與建議（請用 ${langName} 解釋，若無錯誤則給予簡短鼓勵）"
}`;
        greeting = t['greeting_chat'].replace('{level}', selectedLevel);
    }

    chatHistory = [{ role: 'system', content: systemPrompt }];
    
    chatMessages.innerHTML = '';
    
    // AI Greeting also gets added to history so it's saved
    const aiGreetingObj = {
        reply: greeting,
        correction: currentMode === 'article' ? t['correction_placeholder_article'] : t['correction_placeholder_chat']
    };
    
    chatHistory.push({ role: 'assistant', content: JSON.stringify(aiGreetingObj) });
    appendAIMessage(aiGreetingObj);
    
    saveRecord(chatHistory, currentMode, selectedLevel, selectedScenario);
}

// ==========================================
// Chat API Functions
// ==========================================
async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    userInput.value = '';
    userInput.style.height = 'auto';
    
    appendUserMessage(text);
    chatHistory.push({ role: 'user', content: text });
    
    // 每次發送訊息就儲存紀錄
    saveRecord(chatHistory, currentMode, selectedLevel, selectedScenario);

    const loadingId = appendLoading();
    sendBtn.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: chatHistory.map(m => {
                    // 如果 assistant 的 content 裡面是 JSON，Groq/OpenAI 要純文字，這裡可以直接送原本的字串
                    return { role: m.role, content: m.content };
                }),
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) throw new Error('API Request Failed');

        const data = await response.json();
        const aiMessageContent = data.choices[0].message.content;
        
        chatHistory.push({ role: 'assistant', content: aiMessageContent });
        saveRecord(chatHistory, currentMode, selectedLevel, selectedScenario);

        let aiResponse;
        try {
            aiResponse = JSON.parse(aiMessageContent);
        } catch (e) {
            aiResponse = { reply: aiMessageContent, correction: "無法解析糾正格式" };
        }

        removeLoading(loadingId);
        appendAIMessage(aiResponse);

    } catch (error) {
        console.error('Error:', error);
        removeLoading(loadingId);
        appendAIMessage({
            reply: '申し訳ありません、系統發生錯誤。',
            correction: `連線失敗。錯誤訊息: ${error.message}`
        });
    } finally {
        sendBtn.disabled = false;
        userInput.focus();
    }
}

// ==========================================
// UI Helpers
// ==========================================
function appendUserMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message user';
    msgDiv.innerHTML = `<div class="bubble">${escapeHTML(text)}</div>`;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
}

function appendAIMessage(data) {
    const t = i18n[currentLang] || i18n['zh-TW'];
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ai';
    
    let html = `<div class="bubble">${escapeHTML(data.reply)}</div>`;
    const correctionLabel = t['correction_label'] || '💡 老師的指導與糾正：';
    if (data.correction && data.correction.trim() !== '') {
        html += `
            <div class="correction-box">
                <span class="correction-title">${correctionLabel}</span>
                ${escapeHTML(data.correction)}
            </div>
        `;
    }
    
    msgDiv.innerHTML = html;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
}

function appendLoading() {
    const id = 'loading-' + Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message ai';
    msgDiv.id = id;
    msgDiv.innerHTML = `
        <div class="bubble">
            <div class="loading-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(msgDiv);
    scrollToBottom();
    return id;
}

function removeLoading(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
}

function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag)
    );
}

// ==========================================
// Vocabulary Render Function
// ==========================================
function renderVocab(level) {
    vocabList.innerHTML = '';
    const items = (typeof vocabData !== 'undefined' && vocabData[level]) ? vocabData[level] : [];
    const isEnglish = currentLang === 'en';

    if (items.length === 0) {
        vocabList.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#999;padding:3rem;">沒有資料</div>';
        return;
    }

    items.forEach(item => {
        const meaning = isEnglish ? item.en : item.zh;
        const div = document.createElement('div');
        div.className = 'vocab-item';
        div.innerHTML = `
            <div class="vocab-word">${item.word}</div>
            <div class="vocab-kana">${item.kana}</div>
            <div class="vocab-meaning">${meaning}</div>
        `;
        vocabList.appendChild(div);
    });
}

// ==========================================
// Event Listeners
// ==========================================
langSelect.addEventListener('change', (e) => {
    currentLang = e.target.value;
    updateLanguage(currentLang);
});

modeCards.forEach(card => {
    card.addEventListener('click', () => {
        const mode = card.getAttribute('data-mode');
        if (mode === 'scenario') {
            document.querySelector('.scenario-section').scrollIntoView({ behavior: 'smooth' });
        } else {
            currentMode = mode;
            modeCards.forEach(c => c.classList.remove('highlighted'));
            card.classList.add('highlighted');
            document.querySelector('.level-section').scrollIntoView({ behavior: 'smooth' });
        }
    });
});

levelCards.forEach(card => {
    card.addEventListener('click', () => {
        if(currentMode === 'scenario') currentMode = 'chat'; 
        selectedLevel = card.getAttribute('data-level');
        startGame();
    });
});

scenarioCards.forEach(card => {
    card.addEventListener('click', () => {
        const scenario = card.getAttribute('data-scenario');
        if (scenario === 'more') return; 
        
        currentMode = 'scenario';
        selectedScenario = scenario;
        
        const t = i18n[currentLang] || i18n['zh-TW'];
        const scName = getScenarioName(scenario);
        document.getElementById('modal-title').textContent = `${scName} - ${t['level_title'].substring(0,4)}`;
        
        showModal();
    });
});

modalLevelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        selectedLevel = btn.getAttribute('data-level');
        hideModal();
        startGame();
    });
});

modalCloseBtn.addEventListener('click', hideModal);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) hideModal();
});

backBtn.addEventListener('click', () => {
    chatScreen.classList.remove('active');
    homeScreen.classList.add('active');
});

recordsBackBtn.addEventListener('click', () => {
    recordsScreen.classList.remove('active');
    homeScreen.classList.add('active');
});

vocabBackBtn.addEventListener('click', () => {
    vocabScreen.classList.remove('active');
    homeScreen.classList.add('active');
});

vocabTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        vocabTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderVocab(tab.getAttribute('data-level'));
    });
});

// Navigation Bar actions
const navVocabBtn = document.querySelector('[data-i18n="nav_vocab"]');

navRecordsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    homeScreen.classList.remove('active');
    chatScreen.classList.remove('active');
    vocabScreen.classList.remove('active');
    recordsScreen.classList.add('active');
    renderRecords();
});

navVocabBtn.addEventListener('click', (e) => {
    e.preventDefault();
    homeScreen.classList.remove('active');
    chatScreen.classList.remove('active');
    recordsScreen.classList.remove('active');
    vocabScreen.classList.add('active');
    
    // 預設渲染 active 的 tab (N5)
    const activeLevel = document.querySelector('.vocab-tab.active').getAttribute('data-level');
    renderVocab(activeLevel);
});

navHomeBtn.addEventListener('click', (e) => {
    e.preventDefault();
    recordsScreen.classList.remove('active');
    chatScreen.classList.remove('active');
    vocabScreen.classList.remove('active');
    homeScreen.classList.add('active');
});

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
    if(this.value === '') this.style.height = 'auto';
});

// Init
updateLanguage(currentLang);

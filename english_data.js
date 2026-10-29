// english_data.js - Kho dữ liệu Tiếng Anh 4 Kỹ Năng & Sách Bài Tập Mind Map Toàn Diện Của Nhà Gấu
// Bám sát giáo trình "Basic English Vocabulary Exercises" (Hoàng Ngân - Nhung Đỗ, NXB Hồng Đức & MCBooks)

// ==================== 1. DANH MỤC 9 CHỦ ĐỀ HỌC TẬP (THEMES) ====================
const ENGLISH_THEMES = [
    { id: "all", name: "Tất cả chủ đề", icon: "🌟", color: "from-amber-500 to-amber-600" },
    { id: "numbers_time", name: "Số đếm & Thời gian", icon: "⏰", color: "from-blue-500 to-indigo-600", desc: "Cardinal, Ordinal, Phân số, Giờ giấc, Lịch" },
    { id: "shapes_colors", name: "Hình khối & Màu sắc", icon: "🎨", color: "from-emerald-500 to-teal-600", desc: "Triangle, Hexagon, Octagon, Crescent, Colors" },
    { id: "food_drinks", name: "Ẩm thực & Đồ uống", icon: "🥐", color: "from-orange-500 to-amber-600", desc: "Bread, Biscuit, Muffin, Bữa ăn, Nấu nướng" },
    { id: "nature_animals", name: "Tự nhiên & Động vật", icon: "🌿", color: "from-green-500 to-emerald-700", desc: "Dandelion, Beehive, Spiderweb, Môi trường" },
    { id: "body_health", name: "Cơ thể & Sức khỏe", icon: "💪", color: "from-rose-500 to-pink-600", desc: "Bộ phận cơ thể, Thể chất, Cảm xúc, Sức khỏe" },
    { id: "leisure_sports", name: "Giải trí & Thể thao", icon: "🛼", color: "from-purple-500 to-indigo-600", desc: "Roller skates, Stopwatch, Skiing, Sở thích" },
    { id: "school_work", name: "Trường học & Công việc", icon: "📚", color: "from-sky-500 to-blue-600", desc: "Dụng cụ học tập, Nghề nghiệp, Nơi làm việc" },
    { id: "grammar_adverbs", name: "Trạng từ & Mẫu câu", icon: "✨", color: "from-amber-600 to-orange-700", desc: "Frequency adverbs: Always, Usually, Often, Never" }
];

// ==================== 2. PHẦN 1 TỪ SÁCH: 5 DẠNG BÀI TẬP TỪ VỰNG CỐT LÕI (TRANG 7 - 13) ====================
const MCBOOKS_PART1_DATA = {
    // Dạng 1: Nối (Matching) - Trang 8, 10
    matchingExercise1: {
        title: "Dạng 1: Nối từ với tranh tương ứng (Bakery Items - Trang 8)",
        instruction: "Click vào từ tiếng Anh ở Cột A, sau đó click vào tranh bánh tương ứng ở Cột B.",
        pairs: [
            { id: 1, word: "bread", icon: "🍞", desc: "Ổ bánh mì nướng vàng thơm", picLabel: "Tranh B (Bánh mì ổ dài nướng vàng)" },
            { id: 2, word: "biscuit", icon: "🍪", desc: "Đĩa bánh quy tròn nướng giòn rụm", picLabel: "Tranh C (Đĩa bánh quy tròn thơm giòn)" },
            { id: 3, word: "muffin", icon: "🧁", desc: "Bánh bông lan nướng trong cốc giấy xanh", picLabel: "Tranh A (Bánh nướng xốp nhỏ cốc giấy)" }
        ]
    },
    matchingExercise2: {
        title: "Dạng 1 (Biến thể): Nối từ với định nghĩa tiếng Anh (Meanings - Trang 10)",
        instruction: "Nối từ vựng với lời giải thích nghĩa tiếng Anh tương ứng:",
        pairs: [
            { id: 101, word: "fail", hint: "thất bại", meaning: "To not succeed in achieving something" },
            { id: 102, word: "beehive", hint: "tổ ong", meaning: "A structure where bees live and make honey" },
            { id: 103, word: "dandelion", hint: "bồ công anh", meaning: "A yellow wild plant with fluffy white seeds flying in the wind" },
            { id: 104, word: "stopwatch", hint: "đồng hồ bấm giờ", meaning: "A watch used to measure exact intervals of time in sports" }
        ]
    },

    // Dạng 2: Viết chữ cái còn thiếu (Spelling Puzzle - Trang 10)
    missingLetters: [
        { id: "m1", word: "CAR", display: ["_", "A", "R"], missing: ["C"], vn: "1. Chiếc ô tô đồ chơi", hint: "_AR", icon: "🚗" },
        { id: "m2", word: "ARROW", display: ["_", "R", "R", "_", "W"], missing: ["A", "O"], vn: "2. Mũi tên chỉ đường", hint: "_RR_W", icon: "🏹" },
        { id: "m3", word: "STOPWATCH", display: ["S", "T", "_", "P", "W", "_", "T", "C", "H"], missing: ["O", "A"], vn: "3. Đồng hồ bấm giờ số điện tử", hint: "ST_PW_TCH", icon: "⏱️" },
        { id: "m4", word: "ROLLER SKATE", display: ["R", "_", "L", "L", "_", "R", " ", "S", "K", "_", "T", "E"], missing: ["O", "E", "A"], vn: "4. Giày trượt patin bánh lăn", hint: "R_LL_R SK_TE", icon: "🛼" },
        { id: "m5", word: "BASEBALL CAP", display: ["B", "_", "S", "_", "B", "A", "L", "L", " ", "C", "_", "P"], missing: ["A", "E", "A"], vn: "5. Mũ lưỡi trai bóng chày", hint: "B_S_BALL C_P", icon: "🧢" },
        { id: "m6", word: "SHUTTLECOCK", display: ["S", "H", "_", "T", "T", "L", "_", "C", "_", "C", "K"], missing: ["U", "E", "O"], vn: "6. Quả cầu lông", hint: "SH_TTL_C_CK", icon: "🏸" }
    ],

    // Dạng 3: Nghe & đánh số thứ tự cho tranh (Track 27 - Trang 11-12)
    listenAndNumber: {
        title: "Dạng 3: Nghe và đánh số thứ tự cho 5 bức tranh (Track 27 - Trang 11, 12)",
        audioDialogue: "Dave: Have you ever seen where bees live? Tia: Yes, they live in a hive! Dave: What about spiders? Tia: They spin a delicate spiderweb. Dave: And the goldfish? Tia: In the aquarium. Dave: Squirrels live in tree hollows, and birds live in birdcages.",
        pictures: [
            { id: "c", name: "Tổ ong (beehive)", icon: "🐝", order: 1, desc: "Hội thoại 1: Dave & Tia nói về 'where bees live -> a hive'" },
            { id: "b", name: "Mạng nhện (spiderweb)", icon: "🕸️", order: 2, desc: "Hội thoại 2: Tia nói về mạng nhện 'delicate spiderweb'" },
            { id: "e", name: "Bể cá kính (aquarium)", icon: "🐠", order: 3, desc: "Hội thoại 3: Cá vàng nuôi trong 'aquarium'" },
            { id: "d", name: "Hốc cây sóc ở (tree hollow)", icon: "🐿️", order: 4, desc: "Hội thoại 4: Sóc sống trong 'tree hollows'" },
            { id: "a", name: "Lồng chim cảnh (birdcage)", icon: "🦜", order: 5, desc: "Hội thoại 5: Chim cảnh sống trong 'birdcages'" }
        ]
    },

    // Dạng 4: Nghe & chọn đáp án đúng (Track 29 - Trang 12-13)
    listenAndChoose: [
        {
            q: "1. Bob's favorite plant in the exhibit is ________ (Trang 12, 13)",
            audio: "Abby: What's your favorite plant in the exhibit? Bob: I love the dandelion. It's simple yet fascinating!",
            options: [
                { text: "dandelion", label: "A. dandelion (Hoa bồ công anh)" },
                { text: "jasmine", label: "B. jasmine (Hoa nhài)" },
                { text: "ivy", label: "C. ivy (Dây thường xuân)" },
                { text: "chestnut", label: "D. chestnut (Cây hạt dẻ)" }
            ],
            correct: "dandelion",
            explain: "Trong hội thoại Track 29: Bob trả lời 'I love the dandelion. It's simple yet fascinating!' nên đáp án là A."
        },
        {
            q: "2. James likes ________",
            audio: "Teacher: What plant do you like, James? James: I like the mimosa with its gentle pink flowers.",
            options: [
                { text: "clover", label: "A. clover (Cỏ ba lá)" },
                { text: "mimosa", label: "B. mimosa (Hoa trinh nữ / mimosa)" },
                { text: "poplar", label: "C. poplar (Cây bạch dương)" },
                { text: "oak", label: "D. oak (Cây sồi cổ thụ)" }
            ],
            correct: "mimosa",
            explain: "James phát biểu 'I like the mimosa' -> chọn B."
        },
        {
            q: "3. Susan prefers the ________",
            audio: "Susan: Between all plants, I prefer the soothing aloe vera because it is good for health.",
            options: [
                { text: "poplar", label: "A. poplar (Cây bạch dương)" },
                { text: "bamboo", label: "B. bamboo (Cây tre)" },
                { text: "aloe", label: "C. aloe (Cây nha đam / lô hội)" },
                { text: "dandelion", label: "D. dandelion (Hoa bồ công anh)" }
            ],
            correct: "aloe",
            explain: "Susan chia sẻ 'I prefer the aloe' -> chọn C."
        }
    ],

    // Dạng 5: Chọn đáp án đúng theo ngữ cảnh (Trang 13)
    chooseBestAnswers: [
        {
            q: "1. A person who enjoys skiing is called a ________",
            options: ["a. skier", "b. sled", "c. skating", "d. snowboarding"],
            correct: 0,
            explain: "Người trượt tuyết dùng danh từ chỉ người 'skier' (thêm hậu tố -er)."
        },
        {
            q: "2. When you fall while skiing or snowboarding, it's called a ________",
            options: ["a. toboggan", "b. wipe out", "c. slope", "d. skating"],
            correct: 1,
            explain: "Cú ngã nhào khi trượt tuyết trong tiếng Anh gọi là 'wipe out'."
        },
        {
            q: "3. You can glide gracefully on ice using ________",
            options: ["a. toboggan", "b. slope", "c. skating", "d. wipe out"],
            correct: 2,
            explain: "Lướt nhẹ nhàng trên băng tuyết gọi là 'ice skating'."
        }
    ]
};

// ==================== 3. PHẦN 2 TỪ SÁCH: THEME 1 CHUYÊN SÂU (TRANG 14 - 25) ====================
const MCBOOKS_THEME1_DATA = {
    // 3.1 CARDINAL NUMBERS (Trang 14)
    cardinalNumbers: [
        { en: "ninety-three", num: 93, choices: [19, 93, 90], correct: 93 },
        { en: "twenty-eight", num: 28, choices: [28, 47, 72], correct: 28 },
        { en: "fifteen", num: 15, choices: [44, 15, 40], correct: 15 },
        { en: "seventy-seven", num: 77, choices: [48, 82, 77], correct: 77 },
        { en: "twelve", num: 12, choices: [12, 13, 20], correct: 12 },
        { en: "a hundred", num: 100, choices: [10, 92, 100], correct: 100 },
        { en: "sixty-six", num: 66, choices: [16, 66, 36], correct: 66 },
        { en: "thirty-nine", num: 39, choices: [39, 93, 19], correct: 39 }
    ],

    // 3.2 ORDINAL NUMBERS (Trang 15)
    ordinalPairs: [
        { ordinal: "29th", written: "twenty-ninth", vn: "Thứ hai mươi chín" },
        { ordinal: "13th", written: "thirteenth", vn: "Thứ mười ba" },
        { ordinal: "2nd", written: "second", vn: "Thứ hai" },
        { ordinal: "71st", written: "seventy-first", vn: "Thứ bảy mươi mốt" },
        { ordinal: "63rd", written: "sixty-third", vn: "Thứ sáu mươi ba" }
    ],
    ordinalSentenceQuiz: [
        { q: "1. February is the ________ month of a year.", answer: "second", hint: "tháng thứ 2" },
        { q: "2. C is the ________ letter in the English alphabet.", answer: "third", hint: "chữ cái thứ 3" },
        { q: "3. August is the ________ month of the year.", answer: "eighth", hint: "tháng thứ 8" },
        { q: "4. What ordinal number comes before tenth? - It's ________.", answer: "ninth", hint: "trước số 10th là số 9th" },
        { q: "5. Some people think that Monday is the ________ day of a week.", answer: "first", hint: "ngày thứ 1" },
        { q: "6. ________ is the 10th letter in the English alphabet.", answer: "J", hint: "chữ cái thứ 10 là J" },
        { q: "7. What ordinal number comes after sixth? - It's ________.", answer: "seventh", hint: "sau số 6th là 7th" }
    ],

    // 3.3 LARGE NUMBERS (Trang 16)
    largeNumbersMatch: [
        { text: "four hundred", num: "400" },
        { text: "three hundred and thirty thousand, six hundred and seventy-eight", num: "330,678" },
        { text: "six million, five hundred and twenty thousand", num: "6,520,000" },
        { text: "thirteen thousand, one hundred and seventy-five", num: "13,175" },
        { text: "four thousand, three hundred and eight", num: "4,308" }
    ],
    spotMistakes: [
        {
            wrongText: "650: Six million and fifty",
            correctText: "Six hundred and fifty",
            explanation: "Số 650 chỉ có 3 chữ số hàng trăm ('six hundred'), không phải hàng triệu ('million')."
        },
        {
            wrongText: "1,884: one million eight hundred and eighty-four",
            correctText: "one thousand, eight hundred and eighty-four",
            explanation: "Số 1,884 thuộc hàng nghìn ('one thousand'), không phải 'one million'."
        },
        {
            wrongText: "50,090: fifty hundred and ninety",
            correctText: "fifty thousand and ninety",
            explanation: "50,000 trong tiếng Anh là 'fifty thousand', không ai nói 'fifty hundred'."
        },
        {
            wrongText: "190,000: one hundred and nineteen thousand",
            correctText: "one hundred and ninety thousand",
            explanation: "190 là 'one hundred and ninety', không phải 'nineteen' (19)."
        },
        {
            wrongText: "5,550,000: five million, five hundred and fifty hundred",
            correctText: "five million, five hundred and fifty thousand",
            explanation: "550,000 là 'five hundred and fifty thousand'."
        }
    ],

    // 3.4 FRACTIONS (Trang 17)
    fractionsData: [
        { name: "a half", fraction: "1/2", decimal: 0.5, desc: "Một nửa bình nước" },
        { name: "a third", fraction: "1/3", decimal: 0.333, desc: "Một phần ba bình nước" },
        { name: "a quarter", fraction: "1/4", decimal: 0.25, desc: "Một phần tư bình nước" },
        { name: "an eighth", fraction: "1/8", decimal: 0.125, desc: "Một phần tám bình nước" },
        { name: "three quarters", fraction: "3/4", decimal: 0.75, desc: "Ba phần tư bình nước" }
    ],

    // 3.5 DECIMALS & PERCENTAGES (Trang 18)
    decimalsMatch: [
        { percent: "100%", written: "one hundred percent" },
        { percent: "90%", written: "ninety percent" },
        { percent: "15%", written: "fifteen percent" },
        { percent: "33%", written: "thirty-three percent" },
        { percent: "76%", written: "seventy-six percent" }
    ],
    decimalsSpelling: [
        { num: "0.6", written: "zero point six" },
        { num: "1.7", written: "one point seven" },
        { num: "7.89", written: "seven point eight nine" },
        { num: "1.268", written: "one point two six eight" }
    ],

    // 3.6 CALENDARS AND SEASONS (Trang 19)
    calendarTrueFalse: [
        { statement: "1. A day consists of 24 hours.", isTrue: true, explain: "Một ngày luôn có 24 giờ." },
        { statement: "2. There are 52 weeks in a year.", isTrue: true, explain: "Một năm có 52 tuần lễ (365 / 7 = 52.14)." },
        { statement: "3. A fortnight is equal to three weeks.", isTrue: false, explain: "Sai! 'Fortnight' chỉ khoảng thời gian 2 tuần lễ (14 ngày), không phải 3 tuần." },
        { statement: "4. February is always a month with 30 days.", isTrue: false, explain: "Sai! Tháng 2 chỉ có 28 hoặc 29 ngày trong năm nhuận, không bao giờ có 30 ngày." },
        { statement: "5. Saturday and Sunday are two weekend days.", isTrue: true, explain: "Đúng! Thứ Bảy và Chủ Nhật là hai ngày cuối tuần (weekend)." }
    ],

    // 3.7 TIME IN A DAY (Trang 20)
    timeInDayQuiz: [
        { q: "1. The time between sunrise and sunset is called ________", options: ["morning", "daytime", "evening", "nighttime"], correct: "daytime", explain: "Khoảng thời gian từ lúc mặt trời mọc đến lặn gọi là 'daytime' (ban ngày)." },
        { q: "2. We usually have breakfast in the ________", options: ["morning", "afternoon", "fall", "nighttime"], correct: "morning", explain: "Bữa sáng ăn vào buổi sáng ('morning')." },
        { q: "3. When does the sky usually get dark?", options: ["winter", "afternoon", "daytime", "nighttime"], correct: "nighttime", explain: "Trời tối sầm vào ban đêm ('nighttime')." },
        { q: "4. When do people usually go to bed?", options: ["morning", "afternoon", "evening", "nighttime"], correct: "nighttime", explain: "Mọi người đi ngủ vào ban đêm." },
        { q: "5. It's 3 p.m. What part of day is it now?", options: ["morning", "daytime", "Friday", "afternoon"], correct: "afternoon", explain: "3 giờ chiều (3 p.m.) là 'afternoon'." }
    ],

    // 3.8 FREQUENCY ADVERBS (Trang 21 - 22)
    frequencyScale: [
        { word: "Always", percent: "100%", vn: "Luôn luôn", icon: "💯" },
        { word: "Usually", percent: "80%", vn: "Thường thường", icon: "🔄" },
        { word: "Often", percent: "60%", vn: "Thường xuyên", icon: "📈" },
        { word: "Sometimes", percent: "40%", vn: "Thỉnh thoảng", icon: "⏳" },
        { word: "Rarely", percent: "20%", vn: "Hiếm khi", icon: "📉" },
        { word: "Never", percent: "0%", vn: "Không bao giờ", icon: "🚫" }
    ],
    rewriteAdverbSentences: [
        { orig: "My mother listens to classical music.", adverb: "often", result: "My mother often listens to classical music." },
        { orig: "He helps his mother with the cooking.", adverb: "always", result: "He always helps his mother with the cooking." },
        { orig: "He smokes if the children are with him.", adverb: "never", result: "He never smokes if the children are with him." },
        { orig: "My parents go for a walk in the evening.", adverb: "usually", result: "My parents usually go for a walk in the evening." },
        { orig: "My children read novels.", adverb: "sometimes", result: "My children sometimes read novels." }
    ],

    // 3.9 SHAPES (Trang 23)
    shapesGallery: [
        { name: "Triangle", icon: "🔺", vn: "Hình tam giác (3 cạnh)", ipa: "/ˈtraɪæŋɡl/" },
        { name: "Circle", icon: "⚪", vn: "Hình tròn", ipa: "/ˈsɜːkl/" },
        { name: "Square", icon: "⏹️", vn: "Hình vuông (4 cạnh bằng nhau)", ipa: "/skweə(r)/" },
        { name: "Rectangle", icon: "▬", vn: "Hình chữ nhật", ipa: "/ˈrektæŋɡl/" },
        { name: "Rhombus", icon: "🔷", vn: "Hình thoi", ipa: "/ˈrɒmbəs/" },
        { name: "Trapezoid", icon: "⏢", vn: "Hình thang", ipa: "/ˈtræpəzɔɪd/" },
        { name: "Parallelogram", icon: "▰", vn: "Hình bình hành", ipa: "/ˌpærəˈleləɡræm/" },
        { name: "Pentagon", icon: "⬠", vn: "Hình ngũ giác (5 cạnh)", ipa: "/ˈpentəɡən/" },
        { name: "Hexagon", icon: "⬡", vn: "Hình lục giác (6 cạnh)", ipa: "/ˈheksəɡən/" },
        { name: "Octagon", icon: "🛑", vn: "Hình bát giác (8 cạnh)", ipa: "/ˈɒktəɡən/" },
        { name: "Crescent", icon: "🌙", vn: "Hình trăng khuyết / lưỡi liềm", ipa: "/ˈkresnt/" },
        { name: "Heart", icon: "❤️", vn: "Hình trái tim", ipa: "/hɑːt/" }
    ],

    // 3.10 COLORS MATCHING & WORD SEARCH MATRIX (Trang 24 - 25)
    colorsMatching: [
        { colorName: "Red", colorHex: "#EF4444", objectName: "Tomato (Quả cà chua chín mọng)", icon: "🍅" },
        { colorName: "Blue", colorHex: "#3B82F6", objectName: "Dolphin (Chú cá heo xanh biển)", icon: "🐬" },
        { colorName: "Green", colorHex: "#10B981", objectName: "Grass (Thảm cỏ non tươi mát)", icon: "🌿" },
        { colorName: "Yellow", colorHex: "#F59E0B", objectName: "Banana (Quả chuối vàng thơm)", icon: "🍌" },
        { colorName: "Purple", colorHex: "#8B5CF6", objectName: "Eggplant (Quả cà tím)", icon: "🍆" },
        { colorName: "White", colorHex: "#94A3B8", objectName: "Snowman (Người tuyết trắng tinh)", icon: "⛄" },
        { colorName: "Brown", colorHex: "#8B4513", objectName: "Chocolate (Thanh sô-cô-la nâu ngọt)", icon: "🍫" },
        { colorName: "Pink", colorHex: "#EC4899", objectName: "Sakura (Hoa anh đào phớt hồng)", icon: "🌸" }
    ],

    // Bảng Ma Trận Ô Chữ Tìm Từ (Word Search Matrix 7 x 13 từ Trang 25)
    wordSearchMatrix: [
        ["E", "D", "O", "P", "I", "N", "K", "J", "K", "L", "M", "N", "Y"],
        ["A", "B", "L", "A", "C", "K", "W", "H", "I", "T", "E", "O", "P"],
        ["C", "G", "R", "E", "E", "N", "U", "H", "E", "D", "U", "S", "T"],
        ["T", "R", "E", "E", "Y", "E", "L", "L", "O", "W", "Q", "Z", "L"],
        ["T", "S", "P", "U", "R", "P", "L", "E", "E", "F", "G", "H", "I"],
        ["S", "B", "L", "U", "E", "X", "X", "E", "Y", "V", "Z", "Y", "A"],
        ["G", "R", "A", "Y", "D", "X", "N", "A", "V", "Y", "Z", "Q", "R"]
    ],
    hiddenColors: [
        { word: "PINK", row: 0, colStart: 3, colEnd: 6, color: "#EC4899" },
        { word: "BLACK", row: 1, colStart: 1, colEnd: 5, color: "#1F2937" },
        { word: "WHITE", row: 1, colStart: 6, colEnd: 10, color: "#64748B" },
        { word: "GREEN", row: 2, colStart: 1, colEnd: 5, color: "#10B981" },
        { word: "YELLOW", row: 3, colStart: 4, colEnd: 9, color: "#F59E0B" },
        { word: "PURPLE", row: 4, colStart: 2, colEnd: 7, color: "#8B5CF6" },
        { word: "BLUE", row: 5, colStart: 1, colEnd: 4, color: "#3B82F6" },
        { word: "GRAY", row: 6, colStart: 0, colEnd: 3, color: "#6B7280" },
        { word: "NAVY", row: 6, colStart: 6, colEnd: 9, color: "#1E3A8A" }
    ]
};

// ==================== 4. TỪ VỰNG CHI TIẾT (68 TỪ CHUẨN IPA & CÂU VÍ DỤ) ====================
const ENGLISH_VOCABULARY = [
    // --- NUMBERS & TIME ---
    { id: "v1", word: "ninety-three", ipa: "/ˈnaɪnti θriː/", type: "num", vn: "Chín mươi ba (93)", theme: "numbers_time", icon: "9️⃣3️⃣", example: "My grandfather is ninety-three years old." },
    { id: "v2", word: "twenty-eight", ipa: "/ˌtwenti ˈeɪt/", type: "num", vn: "Hai mươi tám (28)", theme: "numbers_time", icon: "2️⃣8️⃣", example: "February usually has twenty-eight days." },
    { id: "v3", word: "fifteen", ipa: "/ˌfɪfˈtiːn/", type: "num", vn: "Mười lăm (15)", theme: "numbers_time", icon: "1️⃣5️⃣", example: "The bus arrives in fifteen minutes." },
    { id: "v4", word: "seventy-first", ipa: "/ˌsevnti ˈfɜːst/", type: "adj", vn: "Thứ bảy mươi mốt (71st)", theme: "numbers_time", icon: "7️⃣1️⃣", example: "This is the seventy-first edition of the competition." },
    { id: "v5", word: "a half", ipa: "/ə hɑːf/", type: "n", vn: "Một nửa, một phần hai (1/2)", theme: "numbers_time", icon: "🌗", example: "She gave me a half of her apple." },
    { id: "v6", word: "a quarter", ipa: "/ə ˈkwɔːtə(r)/", type: "n", vn: "Một phần tư (1/4, 15 phút)", theme: "numbers_time", icon: "🌘", example: "It is a quarter past three in the afternoon." },
    { id: "v7", word: "a third", ipa: "/ə θɜːd/", type: "n", vn: "Một phần ba (1/3)", theme: "numbers_time", icon: "🥧", example: "A third of the students passed the exam with flying colors." },
    { id: "v8", word: "an eighth", ipa: "/ən eɪtθ/", type: "n", vn: "Một phần tám (1/8)", theme: "numbers_time", icon: "🍕", example: "Divide the cake into an eighth for each child." },
    { id: "v9", word: "decimal", ipa: "/ˈdesɪml/", type: "n", vn: "Số thập phân", theme: "numbers_time", icon: "🔢", example: "Zero point six (0.6) is a decimal number." },
    { id: "v10", word: "percentage", ipa: "/pəˈsentɪdʒ/", type: "n", vn: "Phần trăm (%)", theme: "numbers_time", icon: "📊", example: "Seventy-six percent (76%) of people love chocolate." },
    { id: "v11", word: "fortnight", ipa: "/ˈfɔːtnaɪt/", type: "n", vn: "Hai tuần lễ (14 ngày)", theme: "numbers_time", icon: "🗓️", example: "We spent a relaxing fortnight in the countryside." },
    { id: "v12", word: "daytime", ipa: "/ˈdeɪtaɪm/", type: "n", vn: "Ban ngày (giữa bình minh và hoàng hôn)", theme: "numbers_time", icon: "☀️", example: "The park is full of cheerful birds during the daytime." },
    { id: "v13", word: "nighttime", ipa: "/ˈnaɪttaɪm/", type: "n", vn: "Ban đêm", theme: "numbers_time", icon: "🌙", example: "Owls hunt for food during nighttime." },
    { id: "v14", word: "sunrise", ipa: "/ˈsʌnraɪz/", type: "n", vn: "Bình minh, mặt trời mọc", theme: "numbers_time", icon: "🌅", example: "We woke up early to watch the sunrise over the sea." },
    { id: "v15", word: "sunset", ipa: "/ˈsʌnset/", type: "n", vn: "Hoàng hôn, mặt trời lặn", theme: "numbers_time", icon: "🌇", example: "The sky turned purple and orange at sunset." },
    { id: "v16", word: "stopwatch", ipa: "/ˈstɒpwɒtʃ/", type: "n", vn: "Đồng hồ bấm giờ", theme: "numbers_time", icon: "⏱️", example: "The coach used a stopwatch to time the runner." },

    // --- SHAPES & COLORS ---
    { id: "v17", word: "triangle", ipa: "/ˈtraɪæŋɡl/", type: "n", vn: "Hình tam giác (3 cạnh)", theme: "shapes_colors", icon: "🔺", example: "A traffic warning sign is often in the shape of a triangle." },
    { id: "v18", word: "crescent", ipa: "/ˈkresnt/", type: "n", vn: "Hình trăng khuyết, trăng lưỡi liềm", theme: "shapes_colors", icon: "🌙", example: "The golden moon was a delicate crescent in the night sky." },
    { id: "v19", word: "hexagon", ipa: "/ˈheksəɡən/", type: "n", vn: "Hình lục giác (6 cạnh và 6 góc)", theme: "shapes_colors", icon: "⬡", example: "Honeycombs inside a beehive are made of tiny hexagons." },
    { id: "v20", word: "octagon", ipa: "/ˈɒktəɡən/", type: "n", vn: "Hình bát giác (8 cạnh)", theme: "shapes_colors", icon: "🛑", example: "A red STOP traffic sign is an octagon." },
    { id: "v21", word: "cube", ipa: "/kjuːb/", type: "n", vn: "Khối lập phương (6 mặt vuông đều)", theme: "shapes_colors", icon: "🧊", example: "Put two ice cubes into the fruit juice." },
    { id: "v22", word: "cylinder", ipa: "/ˈsɪlɪndə(r)/", type: "n", vn: "Khối trụ tròn", theme: "shapes_colors", icon: "🥫", example: "A soda can is shaped like a cylinder." },
    { id: "v23", word: "cross", ipa: "/krɒs/", type: "n", vn: "Hình chữ thập", theme: "shapes_colors", icon: "➕", example: "The first-aid medical kit has a red cross on it." },
    { id: "v24", word: "ellipse", ipa: "/ɪˈlɪps/", type: "n", vn: "Hình elip, hình bầu dục", theme: "shapes_colors", icon: "🥚", example: "The rugby ball has the shape of an ellipse." },
    { id: "v25", word: "pentagon", ipa: "/ˈpentəɡən/", type: "n", vn: "Hình ngũ giác (5 cạnh)", theme: "shapes_colors", icon: "⬠", example: "The headquarters of the US defense department is a pentagon." },
    { id: "v26", word: "purple", ipa: "/ˈpɜːpl/", type: "adj/n", vn: "Màu tím", theme: "shapes_colors", icon: "🟣", example: "Ripe eggplants and plums have a shiny purple skin." },
    { id: "v27", word: "sakura", ipa: "/səˈkʊərə/", type: "n", vn: "Hoa anh đào (màu hồng phấn)", theme: "shapes_colors", icon: "🌸", example: "Sakura blossoms turn the park into a fairy tale of pink." },
    { id: "v28", word: "cyan", ipa: "/ˈsaɪən/", type: "adj/n", vn: "Màu xanh lơ, xanh ngọc bích nhạt", theme: "shapes_colors", icon: "💠", example: "The tropical lagoon had clear cyan water." },

    // --- FOOD & DRINKS ---
    { id: "v29", word: "biscuit", ipa: "/ˈbɪskɪt/", type: "n", vn: "Bánh quy giòn", theme: "food_drinks", icon: "🍪", example: "Little Bear enjoys dipping a crunchy biscuit into warm milk." },
    { id: "v30", word: "muffin", ipa: "/ˈmʌfɪn/", type: "n", vn: "Bánh bông lan nướng xốp nhỏ", theme: "food_drinks", icon: "🧁", example: "Fresh blueberry muffins smell wonderful in the oven." },
    { id: "v31", word: "bread", ipa: "/bred/", type: "n", vn: "Bánh mì", theme: "food_drinks", icon: "🍞", example: "Freshly baked bread with butter is delicious for breakfast." },
    { id: "v32", word: "cocoa", ipa: "/ˈkəʊkəʊ/", type: "n", vn: "Bột ca cao, thức uống ca cao", theme: "food_drinks", icon: "☕", example: "A hot mug of cocoa warms you up on cold winter nights." },
    { id: "v33", word: "honey", ipa: "/ˈhʌni/", type: "n", vn: "Mật ong tự nhiên", theme: "food_drinks", icon: "🍯", example: "Honey is sweet and healthy to add to warm tea." },
    { id: "v34", word: "pancake", ipa: "/ˈpænkeɪk/", type: "n", vn: "Bánh kếp nướng chảo", theme: "food_drinks", icon: "🥞", example: "We made fluffy pancakes topped with maple syrup." },
    { id: "v35", word: "ingredient", ipa: "/ɪnˈɡriːdiənt/", type: "n", vn: "Nguyên liệu nấu ăn", theme: "food_drinks", icon: "🥣", example: "Fresh eggs and pure butter are essential ingredients for baking." },
    { id: "v36", word: "delicious", ipa: "/dɪˈlɪʃəs/", type: "adj", vn: "Ngon tuyệt vời", theme: "food_drinks", icon: "😋", example: "This strawberry cake is absolutely delicious!" },

    // --- NATURE & ANIMALS ---
    { id: "v37", word: "dandelion", ipa: "/ˈdændɪlaɪən/", type: "n", vn: "Hoa bồ công anh", theme: "nature_animals", icon: "🌼", example: "Children love blowing the fluffy seeds of a dandelion." },
    { id: "v38", word: "beehive", ipa: "/ˈbiːhaɪv/", type: "n", vn: "Tổ ong", theme: "nature_animals", icon: "🐝", example: "Bees work tirelessly together inside their beehive." },
    { id: "v39", word: "spiderweb", ipa: "/ˈspaɪdəweb/", type: "n", vn: "Mạng nhện", theme: "nature_animals", icon: "🕸️", example: "Dewdrops sparkled on the delicate spiderweb in the morning sun." },
    { id: "v40", word: "aquarium", ipa: "/əˈkweəriəm/", type: "n", vn: "Bể nuôi cá kính, thủy cung", theme: "nature_animals", icon: "🐠", example: "Colorful tropical clownfish swim peacefully in the glass aquarium." },
    { id: "v41", word: "birdcage", ipa: "/ˈbɜːdkeɪdʒ/", type: "n", vn: "Lồng chim cảnh", theme: "nature_animals", icon: "🦜", example: "The canary sang happily inside its wooden birdcage." },
    { id: "v42", word: "tree hollow", ipa: "/triː ˈhɒləʊ/", type: "n", vn: "Hốc cây tự nhiên", theme: "nature_animals", icon: "🐿️", example: "A friendly squirrel stored acorns inside the tree hollow." },
    { id: "v43", word: "habitat", ipa: "/ˈhæbɪtæt/", type: "n", vn: "Môi trường sống tự nhiên", theme: "nature_animals", icon: "🏞️", example: "The lush rainforest is the primary habitat of thousands of species." },
    { id: "v44", word: "sunflower", ipa: "/ˈsʌnflaʊə(r)/", type: "n", vn: "Hoa hướng dương", theme: "nature_animals", icon: "🌻", example: "Sunflowers always turn their bright golden heads toward the sun." },

    // --- BODY & HEALTH ---
    { id: "v45", word: "headache", ipa: "/ˈhedeɪk/", type: "n", vn: "Chứng đau đầu", theme: "body_health", icon: "🤕", example: "Take a short rest if you have a mild headache." },
    { id: "v46", word: "stomachache", ipa: "/ˈstʌməkeɪk/", type: "n", vn: "Đau bụng, đau dạ dày", theme: "body_health", icon: "🤢", example: "Eating too much candy gave him a stomachache." },
    { id: "v47", word: "medicine", ipa: "/ˈmedsn/", type: "n", vn: "Thuốc thang chữa bệnh", theme: "body_health", icon: "💊", example: "Drink plenty of warm water after taking your prescribed medicine." },
    { id: "v48", word: "healthy", ipa: "/ˈhelθi/", type: "adj", vn: "Lành mạnh, khỏe khoắn", theme: "body_health", icon: "🥗", example: "Eating fresh green vegetables keeps your body fit and healthy." },
    { id: "v49", word: "cheerful", ipa: "/ˈtʃɪəfl/", type: "adj", vn: "Vui tươi, hớn hở", theme: "body_health", icon: "😄", example: "She always greeted everyone with a bright cheerful smile." },
    { id: "v50", word: "exhausted", ipa: "/ɪɡˈzɔːstɪd/", type: "adj", vn: "Kiệt sức, mệt lả", theme: "body_health", icon: "🥱", example: "After a 10-kilometer run, the athletes felt completely exhausted." },

    // --- LEISURE & SPORTS ---
    { id: "v51", word: "roller skates", ipa: "/ˈrəʊlə skeɪts/", type: "n", vn: "Giày trượt patin bánh xe", theme: "leisure_sports", icon: "🛼", example: "Children love gliding on smooth roads with their roller skates." },
    { id: "v52", word: "shuttlecock", ipa: "/ˈʃʌtlkɒk/", type: "n", vn: "Quả cầu lông", theme: "leisure_sports", icon: "🏸", example: "Hit the shuttlecock over the high net with your racket." },
    { id: "v53", word: "skier", ipa: "/ˈskiːə(r)/", type: "n", vn: "Vận động viên / người trượt tuyết", theme: "leisure_sports", icon: "⛷️", example: "The skilled skier dashed smoothly down the snowy mountain slope." },
    { id: "v54", word: "snowboard", ipa: "/ˈsnəʊbɔːd/", type: "n/v", vn: "Ván trượt tuyết", theme: "leisure_sports", icon: "🏂", example: "Young athletes enjoy performing tricks on a snowboard." },
    { id: "v55", word: "sled", ipa: "/sled/", type: "n", vn: "Xe trượt tuyết có dây kéo", theme: "leisure_sports", icon: "🛷", example: "The children had great fun pulling the wooden sled up the hill." },
    { id: "v56", word: "baseball cap", ipa: "/ˈbeɪsbɔːl kæp/", type: "n", vn: "Mũ lưỡi trai thể thao", theme: "leisure_sports", icon: "🧢", example: "Wear a baseball cap to protect your eyes from intense sunlight." },
    { id: "v57", word: "arrow", ipa: "/ˈærəʊ/", type: "n", vn: "Mũi tên chỉ hướng, mũi tên bắn", theme: "leisure_sports", icon: "🏹", example: "Follow the green arrow sign to find the emergency exit." },

    // --- SCHOOL & WORK ---
    { id: "v58", word: "calculator", ipa: "/ˈkælkjuleɪtə(r)/", type: "n", vn: "Máy tính cầm tay", theme: "school_work", icon: "🧮", example: "Students use a scientific calculator during math exams." },
    { id: "v59", word: "dictionary", ipa: "/ˈdɪkʃənri/", type: "n", vn: "Từ điển ngôn ngữ", theme: "school_work", icon: "📖", example: "Look up unfamiliar words in the English learner dictionary." },
    { id: "v60", word: "librarian", ipa: "/laɪˈbreəriən/", type: "n", vn: "Thủ thư thư viện", theme: "school_work", icon: "🧑‍🏫", example: "The friendly librarian helped us locate the geography atlas." },
    { id: "v61", word: "scientist", ipa: "/ˈsaɪəntɪst/", type: "n", vn: "Nhà khoa học", theme: "school_work", icon: "🔬", example: "The scientist discovered a new clean energy method." },
    { id: "v62", word: "architect", ipa: "/ˈɑːkɪtekt/", type: "n", vn: "Kiến trúc sư", theme: "school_work", icon: "📐", example: "An architect designs beautiful, modern and safe buildings." },

    // --- GRAMMAR & ADVERBS ---
    { id: "v63", word: "always", ipa: "/ˈɔːlweɪz/", type: "adv", vn: "Luôn luôn (100% tần suất)", theme: "grammar_adverbs", icon: "💯", example: "Little Bear always brushes his teeth before bedtime." },
    { id: "v64", word: "usually", ipa: "/ˈjuːʒuəli/", type: "adv", vn: "Thường thường (khoảng 80%)", theme: "grammar_adverbs", icon: "🔄", example: "I usually walk to the library after school." },
    { id: "v65", word: "often", ipa: "/ˈɒfn/", type: "adv", vn: "Thường xuyên (khoảng 60%)", theme: "grammar_adverbs", icon: "📈", example: "They often play badminton in the park on weekends." },
    { id: "v66", word: "sometimes", ipa: "/ˈsʌmtaɪmz/", type: "adv", vn: "Thỉnh thoảng, đôi khi (khoảng 40%)", theme: "grammar_adverbs", icon: "⏳", example: "My father sometimes cooks Italian pasta for dinner." },
    { id: "v67", word: "rarely", ipa: "/ˈreəli/", type: "adv", vn: "Hiếm khi (khoảng 20%)", theme: "grammar_adverbs", icon: "📉", example: "We rarely eat junk food because we care about our health." },
    { id: "v68", word: "never", ipa: "/ˈnevə(r)/", type: "adv", vn: "Không bao giờ (0%)", theme: "grammar_adverbs", icon: "🚫", example: "Good students never cheat during an examination." }
];

// ==================== 5. HỘI THOẠI LUYỆN NÓI (ROLEPLAY DIALOGUES) ====================
const ENGLISH_DIALOGUES = [
    {
        id: "d1",
        title: "Dialogue 1: Where Bees Live (Track 27 - Trang 12)",
        context: "Dave và Tia đang quan sát thiên nhiên và nói về nơi ở của loài ong và động vật.",
        lines: [
            { speaker: "Dave", role: "A", avatar: "👦", text: "Have you ever seen where bees live?" },
            { speaker: "Tia", role: "B", avatar: "👧", text: "Yes, they live in a hive!" },
            { speaker: "Dave", role: "A", avatar: "👦", text: "Is it true they store honey in hexagons?" },
            { speaker: "Tia", role: "B", avatar: "👧", text: "Exactly! And spiders spin spiderwebs, while squirrels sleep in tree hollows." }
        ]
    },
    {
        id: "d2",
        title: "Dialogue 2: The Plant Exhibit (Track 29 - Trang 13)",
        context: "Abby và Bob cùng tham quan triển lãm thực vật mùa xuân.",
        lines: [
            { speaker: "Abby", role: "A", avatar: "👩", text: "What's your favorite plant in the exhibit?" },
            { speaker: "Bob", role: "B", avatar: "🧑", text: "I love the dandelion. It's simple yet fascinating!" },
            { speaker: "Abby", role: "A", avatar: "👩", text: "Why do you like it so much?" },
            { speaker: "Bob", role: "B", avatar: "🧑", text: "Because its fluffy white seeds can fly far away in the gentle breeze." }
        ]
    },
    {
        id: "d3",
        title: "Dialogue 3: Baking in Bear's Kitchen (Làm bánh nướng thơm lừng)",
        context: "Gấu và Thỏ cùng làm các món bánh nướng theo trang 8 của sách.",
        lines: [
            { speaker: "Bear", role: "A", avatar: "🐻", text: "Would you like a freshly baked muffin or a crunchy biscuit?" },
            { speaker: "Rabbit", role: "B", avatar: "🐰", text: "I would love a biscuit with a warm cup of cocoa, please!" },
            { speaker: "Bear", role: "A", avatar: "🐻", text: "Here you go! We divide this big plate in a half." },
            { speaker: "Rabbit", role: "B", avatar: "🐰", text: "Thank you so much! It is truly delicious." }
        ]
    }
];

// ==================== 6. BÀI ĐỌC HIỂU MINI (READING STORIES) ====================
const ENGLISH_READING_STORIES = [
    {
        id: "story1",
        title: "A Cozy Sunday with Little Bear 🐻",
        passage: "On a sunny Sunday morning, Little Bear eats a half of a fresh biscuit and drinks a warm cup of sweet cocoa. At two thirty in the afternoon, he heads to the nearby park and glides smoothly with his roller skates. His friend squirrel times him with a digital stopwatch. At nighttime, right after sunset, he always reads twenty pages of his favorite English illustrated book before going to sleep.",
        glossary: [
            { word: "morning", vn: "buổi sáng" },
            { word: "a half", vn: "một nửa (1/2)" },
            { word: "biscuit", vn: "bánh quy nướng giòn" },
            { word: "roller skates", vn: "giày trượt patin" },
            { word: "stopwatch", vn: "đồng hồ bấm giờ" },
            { word: "sunset", vn: "hoàng hôn" }
        ],
        questions: [
            {
                q: "1. What does Little Bear eat for breakfast on Sunday morning?",
                options: ["A full pizza", "A half of a fresh biscuit", "Two apples", "A sandwich"],
                correct: 1,
                explain: "Bài viết ghi rõ: 'Little Bear eats a half of a fresh biscuit'."
            },
            {
                q: "2. What tool does the squirrel use to time Little Bear in the park?",
                options: ["A thermometer", "A compass", "A digital stopwatch", "A ruler"],
                correct: 2,
                explain: "Trong bài: 'His friend squirrel times him with a digital stopwatch'."
            },
            {
                q: "3. How often does Little Bear read his English book before bed?",
                options: ["Never", "Rarely", "He always reads 20 pages", "Only on Mondays"],
                correct: 2,
                explain: "Bài đọc: 'At nighttime, right after sunset, he always reads twenty pages'."
            }
        ]
    },
    {
        id: "story2",
        title: "The Marvels of the Meadow (Kỳ quan đồng cỏ) 🌼",
        passage: "In the green meadow behind the school, thousands of yellow dandelions bloom brightly in spring. Worker bees fly from flower to flower collecting nectar. They carry the sweet nectar back to their wooden beehive hanging safely under an oak branch. Inside the hive, every cell is built as a perfect hexagon to maximize honey storage.",
        glossary: [
            { word: "meadow", vn: "đồng cỏ xanh tươi" },
            { word: "dandelion", vn: "hoa bồ công anh" },
            { word: "nectar", vn: "mật hoa ngọt ngào" },
            { word: "beehive", vn: "tổ ong mật" },
            { word: "hexagon", vn: "hình lục giác 6 cạnh đều" }
        ],
        questions: [
            {
                q: "1. What flower blooms in thousands in the meadow during spring?",
                options: ["Sakura roses", "Yellow dandelions", "White lilies", "Red tulips"],
                correct: 1,
                explain: "Bài đọc: 'thousands of yellow dandelions bloom brightly in spring'."
            },
            {
                q: "2. Where do the bees carry the sweet nectar back to?",
                options: ["To a birdcage", "To an aquarium", "To their wooden beehive", "To a tree hollow"],
                correct: 2,
                explain: "Trong bài: 'They carry the sweet nectar back to their wooden beehive'."
            },
            {
                q: "3. Why are the honey cells built in the shape of a hexagon?",
                options: ["To look colorful", "To maximize honey storage", "To fly faster", "To make noise"],
                correct: 1,
                explain: "Bài viết: 'built as a perfect hexagon to maximize honey storage'."
            }
        ]
    }
];

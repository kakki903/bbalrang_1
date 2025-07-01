class WorkplacePersonalityTest {
    constructor() {
        this.currentQuestion = 0;
        this.scores = {};
        this.questions = [];
        this.results = [];
        this.translations = {};
        this.currentLang = 'ko';
        this.currentTheme = 'light';
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.initializeScores();
        this.setupEventListeners();
        this.loadSettings();
        this.applyTranslations();
    }

    async loadData() {
        try {
            const [questionsResponse, resultsResponse, translationsResponse] = await Promise.all([
                fetch('data/questions.json'),
                fetch('data/results.json'),
                fetch('data/translations.json')
            ]);
            
            this.questions = await questionsResponse.json();
            this.results = await resultsResponse.json();
            this.translations = await translationsResponse.json();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    initializeScores() {
        this.results.forEach(result => {
            this.scores[result.id] = 0;
        });
    }

    setupEventListeners() {
        document.getElementById('start-btn').addEventListener('click', () => this.startQuiz());
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('lang-toggle').addEventListener('click', () => this.toggleLanguage());
        document.getElementById('share-kakao').addEventListener('click', () => this.shareKakao());
        document.getElementById('restart-btn').addEventListener('click', () => this.restartTest());
    }

    loadSettings() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        const savedLang = localStorage.getItem('language') || 'ko';
        
        this.currentTheme = savedTheme;
        this.currentLang = savedLang;
        
        this.applyTheme();
        this.updateLanguageButton();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.currentTheme);
        this.applyTheme();
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeIcon = document.querySelector('#theme-toggle i');
        themeIcon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }

    toggleLanguage() {
        this.currentLang = this.currentLang === 'ko' ? 'en' : 'ko';
        localStorage.setItem('language', this.currentLang);
        this.updateLanguageButton();
        this.applyTranslations();
    }

    updateLanguageButton() {
        document.getElementById('lang-toggle').textContent = this.currentLang === 'ko' ? 'EN' : '한국어';
    }

    applyTranslations() {
        const t = this.translations[this.currentLang];
        if (!t) return;

        // Update static text elements
        Object.keys(t).forEach(key => {
            const element = document.getElementById(key);
            if (element) {
                element.textContent = t[key];
            }
        });

        // Update HTML lang attribute
        document.documentElement.lang = this.currentLang;
    }

    getText(key) {
        return this.translations[this.currentLang]?.[key] || key;
    }

    startQuiz() {
        document.getElementById('start-screen').classList.add('d-none');
        document.getElementById('quiz-screen').classList.remove('d-none');
        this.currentQuestion = 0;
        this.initializeScores();
        this.showQuestion();
    }

    showQuestion() {
        const question = this.questions[this.currentQuestion];
        if (!question) return;

        // Update progress
        const progress = ((this.currentQuestion + 1) / this.questions.length) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
        document.getElementById('question-counter').textContent = `${this.currentQuestion + 1}/${this.questions.length}`;

        // Update question text
        const questionText = this.currentLang === 'ko' ? question.question : question.question_en;
        document.getElementById('question-text').textContent = questionText;

        // Update answer options
        const optionsContainer = document.getElementById('answer-options');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'answer-option';
            optionDiv.textContent = this.currentLang === 'ko' ? option.text : option.text_en;
            optionDiv.addEventListener('click', () => this.selectAnswer(option.scores));
            optionsContainer.appendChild(optionDiv);
        });

        // Add fade-in animation
        document.getElementById('quiz-screen').classList.add('fade-in');
    }

    selectAnswer(scores) {
        // Add scores to totals
        Object.keys(scores).forEach(type => {
            this.scores[type] += scores[type];
        });

        // Visual feedback
        event.target.classList.add('selected');
        
        setTimeout(() => {
            this.currentQuestion++;
            if (this.currentQuestion < this.questions.length) {
                this.showQuestion();
            } else {
                this.showResult();
            }
        }, 500);
    }

    showResult() {
        document.getElementById('quiz-screen').classList.add('d-none');
        document.getElementById('result-screen').classList.remove('d-none');

        // Find highest scoring type
        const maxScore = Math.max(...Object.values(this.scores));
        const resultType = Object.keys(this.scores).find(key => this.scores[key] === maxScore);
        
        const result = this.results.find(r => r.id === resultType);
        if (!result) return;

        // Display result
        this.displayResult(result);
        this.createAbilityChart(result.abilities);

        // Add fade-in animation
        document.getElementById('result-screen').classList.add('fade-in');
    }

    displayResult(result) {
        // Set result title
        document.getElementById('result-type').textContent = 
            this.currentLang === 'ko' ? result.name : result.name_en;

        // Set description
        document.getElementById('result-description').textContent = 
            this.currentLang === 'ko' ? result.description : result.description_en;

        // Handle image/emoji
        const resultImg = document.getElementById('result-img');
        const resultEmoji = document.getElementById('result-emoji');
        
        if (result.image && result.image !== '') {
            resultImg.src = result.image;
            resultImg.classList.remove('d-none');
            resultEmoji.classList.add('d-none');
            
            resultImg.onerror = () => {
                resultImg.classList.add('d-none');
                resultEmoji.classList.remove('d-none');
                resultEmoji.textContent = result.emoji || '🏢';
            };
        } else {
            resultImg.classList.add('d-none');
            resultEmoji.classList.remove('d-none');
            resultEmoji.textContent = result.emoji || '🏢';
        }

        // Display ability details
        this.displayAbilityDetails(result.abilities);

        // Display compatible/incompatible types
        document.getElementById('compatible-desc').textContent = 
            this.currentLang === 'ko' ? result.compatible : result.compatible_en;
        document.getElementById('incompatible-desc').textContent = 
            this.currentLang === 'ko' ? result.incompatible : result.incompatible_en;
    }

    displayAbilityDetails(abilities) {
        const container = document.getElementById('ability-details');
        container.innerHTML = '';

        const abilityNames = {
            responsibility: this.getText('ability-responsibility') || '책임감',
            communication: this.getText('ability-communication') || '소통',
            creativity: this.getText('ability-creativity') || '창의력',
            adaptability: this.getText('ability-adaptability') || '적응력'
        };

        Object.keys(abilities).forEach(ability => {
            const score = abilities[ability];
            const div = document.createElement('div');
            div.className = 'mb-3';
            div.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-medium">${abilityNames[ability]}</span>
                    <span class="badge bg-primary">${score}/5</span>
                </div>
                <div class="ability-bar">
                    <div class="ability-progress bg-primary" style="width: ${(score / 5) * 100}%"></div>
                </div>
            `;
            container.appendChild(div);
        });
    }

    createAbilityChart(abilities) {
        const ctx = document.getElementById('ability-chart').getContext('2d');
        
        const abilityLabels = [
            this.getText('ability-responsibility') || '책임감',
            this.getText('ability-communication') || '소통',
            this.getText('ability-creativity') || '창의력',
            this.getText('ability-adaptability') || '적응력'
        ];

        const abilityValues = [
            abilities.responsibility,
            abilities.communication,
            abilities.creativity,
            abilities.adaptability
        ];

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: abilityLabels,
                datasets: [{
                    label: this.getText('abilities-title') || '능력치',
                    data: abilityValues,
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    borderColor: CONFIG.CHART_COLORS.primary,
                    borderWidth: 2,
                    pointBackgroundColor: CONFIG.CHART_COLORS.primary,
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: CONFIG.CHART_COLORS.primary
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5,
                        ticks: {
                            stepSize: 1,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                        },
                        grid: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        },
                        angleLines: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    shareKakao() {
        if (typeof Kakao === 'undefined') {
            alert('카카오 공유 기능을 사용할 수 없습니다.');
            return;
        }

        const resultType = Object.keys(this.scores).find(key => 
            this.scores[key] === Math.max(...Object.values(this.scores))
        );
        const result = this.results.find(r => r.id === resultType);

        Kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: CONFIG.SHARE_TITLE,
                description: `나의 직장 캐릭터는 "${result.name}"입니다! 당신도 테스트해보세요!`,
                imageUrl: CONFIG.SHARE_IMAGE,
                link: {
                    mobileWebUrl: CONFIG.APP_URL,
                    webUrl: CONFIG.APP_URL
                }
            },
            buttons: [{
                title: '테스트 하러 가기',
                link: {
                    mobileWebUrl: CONFIG.APP_URL,
                    webUrl: CONFIG.APP_URL
                }
            }]
        });
    }

    restartTest() {
        this.currentQuestion = 0;
        this.initializeScores();
        
        document.getElementById('result-screen').classList.add('d-none');
        document.getElementById('start-screen').classList.remove('d-none');
        
        // Reset progress bar
        document.getElementById('progress-bar').style.width = '0%';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WorkplacePersonalityTest();
});

// Service Worker registration removed to avoid 404 errors
// Add SW later if needed for PWA functionality

class WorkplacePersonalityTest {
    constructor() {
        this.currentQuestion = 0;
        this.scores = {};
        this.questions = [];
        this.results = [];
        this.translations = {};
        this.currentLang = 'ko';
        this.currentTheme = 'light';
        this.userAnswers = []; // 사용자 답변 저장
        this.currentResult = null; // 현재 결과 저장
        this.currentChart = null; // 현재 차트 인스턴스 저장
        
        this.init();
    }

    async init() {
        await this.loadData();
        this.initializeScores();
        this.setupEventListeners();
        this.loadSettings();
        this.applyTranslations();
        this.loadFromUrl(); // URL에서 결과 로드
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
        document.getElementById('prev-btn').addEventListener('click', () => this.previousQuestion());
        document.getElementById('share-kakao').addEventListener('click', () => this.shareKakao());
        document.getElementById('share-url').addEventListener('click', () => this.shareUrl());
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
        
        // 결과 화면에서 차트 업데이트
        if (this.currentResult && this.currentChart) {
            this.currentChart.destroy();
            this.createAbilityChart(this.currentResult.abilities);
        }
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
        this.userAnswers = [];
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

        // Show/hide previous button
        const prevBtn = document.getElementById('prev-btn');
        if (this.currentQuestion > 0) {
            prevBtn.style.display = 'block';
        } else {
            prevBtn.style.display = 'none';
        }

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
            optionDiv.addEventListener('click', () => this.selectAnswer(option.scores, index));
            
            // 이전에 선택한 답변이 있으면 표시
            if (this.userAnswers[this.currentQuestion] === index) {
                optionDiv.classList.add('selected');
            }
            
            optionsContainer.appendChild(optionDiv);
        });

        // Add fade-in animation
        document.getElementById('quiz-screen').classList.add('fade-in');
    }

    selectAnswer(scores, optionIndex) {
        // 이전 답변이 있다면 점수에서 제거
        if (this.userAnswers[this.currentQuestion] !== undefined) {
            const prevAnswer = this.questions[this.currentQuestion].options[this.userAnswers[this.currentQuestion]];
            Object.keys(prevAnswer.scores).forEach(type => {
                this.scores[type] -= prevAnswer.scores[type];
            });
        }

        // 새로운 답변 저장
        this.userAnswers[this.currentQuestion] = optionIndex;

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

    previousQuestion() {
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            this.showQuestion();
        }
    }

    showResult() {
        document.getElementById('quiz-screen').classList.add('d-none');
        document.getElementById('result-screen').classList.remove('d-none');

        // Find highest scoring type
        const maxScore = Math.max(...Object.values(this.scores));
        const resultType = Object.keys(this.scores).find(key => this.scores[key] === maxScore);
        
        const result = this.results.find(r => r.id === resultType);
        if (!result) return;

        // Store current result for sharing
        this.currentResult = result;

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

        // 다크모드 여부 확인
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // 다크모드에 따른 색상 설정
        const primaryColor = isDark ? '#4fc3f7' : '#007bff';
        const backgroundColor = isDark ? 'rgba(79, 195, 247, 0.15)' : 'rgba(0, 123, 255, 0.2)';
        const textColor = isDark ? '#e0e0e0' : '#212529';
        const gridColor = isDark ? '#333333' : '#dee2e6';
        const pointBorderColor = isDark ? '#1e1e1e' : '#fff';

        this.currentChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: abilityLabels,
                datasets: [{
                    label: this.getText('abilities-title') || '능력치',
                    data: abilityValues,
                    backgroundColor: backgroundColor,
                    borderColor: primaryColor,
                    borderWidth: 3,
                    pointBackgroundColor: primaryColor,
                    pointBorderColor: pointBorderColor,
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverBackgroundColor: pointBorderColor,
                    pointHoverBorderColor: primaryColor,
                    pointHoverRadius: 8,
                    pointHoverBorderWidth: 3
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
                            color: textColor,
                            font: {
                                size: 12,
                                weight: 'bold'
                            },
                            backdropColor: 'transparent',
                            showLabelBackdrop: false
                        },
                        grid: {
                            color: gridColor,
                            lineWidth: 2
                        },
                        angleLines: {
                            color: gridColor,
                            lineWidth: 2
                        },
                        pointLabels: {
                            color: textColor,
                            font: {
                                size: 13,
                                weight: 'bold'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: isDark ? '#1e1e1e' : '#ffffff',
                        titleColor: textColor,
                        bodyColor: textColor,
                        borderColor: gridColor,
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed.r}/5`;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'point'
                }
            }
        });
    }

    shareKakao() {
        if (typeof Kakao === 'undefined') {
            alert(this.getText('kakao-share-error') || '카카오 공유 기능을 사용할 수 없습니다.');
            return;
        }

        if (!this.currentResult) return;

        const resultName = this.currentLang === 'ko' ? this.currentResult.name : this.currentResult.name_en;
        const shareUrl = this.generateShareUrl();

        Kakao.Link.sendDefault({
            objectType: 'feed',
            content: {
                title: CONFIG.SHARE_TITLE,
                description: `나의 직장 캐릭터는 "${resultName}"입니다! 당신도 테스트해보세요!`,
                imageUrl: CONFIG.SHARE_IMAGE,
                link: {
                    mobileWebUrl: shareUrl,
                    webUrl: shareUrl
                }
            },
            buttons: [{
                title: '결과 보기',
                link: {
                    mobileWebUrl: shareUrl,
                    webUrl: shareUrl
                }
            }, {
                title: '테스트 하러 가기',
                link: {
                    mobileWebUrl: CONFIG.APP_URL,
                    webUrl: CONFIG.APP_URL
                }
            }]
        });
    }

    shareUrl() {
        const shareUrl = this.generateShareUrl();
        
        if (navigator.share) {
            // 모바일에서 네이티브 공유
            navigator.share({
                title: CONFIG.SHARE_TITLE,
                text: `나의 직장 캐릭터는 "${this.currentResult.name}"입니다!`,
                url: shareUrl
            }).catch(err => console.log('Share failed:', err));
        } else {
            // 데스크톱에서 클립보드 복사
            navigator.clipboard.writeText(shareUrl).then(() => {
                const btn = document.getElementById('share-url');
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check me-2"></i>복사됨!';
                btn.classList.add('btn-success');
                btn.classList.remove('btn-primary');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-primary');
                }, 2000);
            }).catch(err => {
                alert('링크 복사에 실패했습니다. ' + shareUrl);
            });
        }
    }

    generateShareUrl() {
        const baseUrl = window.location.origin + window.location.pathname;
        const params = new URLSearchParams({
            result: this.currentResult.id,
            lang: this.currentLang
        });
        return `${baseUrl}?${params.toString()}`;
    }

    // URL에서 결과 로드
    loadFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const resultId = params.get('result');
        const lang = params.get('lang');
        
        if (resultId && this.results.length > 0) {
            const result = this.results.find(r => r.id === resultId);
            if (result) {
                if (lang && (lang === 'ko' || lang === 'en')) {
                    this.currentLang = lang;
                    this.updateLanguageButton();
                    this.applyTranslations();
                }
                
                this.currentResult = result;
                document.getElementById('start-screen').classList.add('d-none');
                document.getElementById('result-screen').classList.remove('d-none');
                this.displayResult(result);
                this.createAbilityChart(result.abilities);
            }
        }
    }

    restartTest() {
        this.currentQuestion = 0;
        this.userAnswers = [];
        this.currentResult = null;
        this.initializeScores();
        
        document.getElementById('result-screen').classList.add('d-none');
        document.getElementById('start-screen').classList.remove('d-none');
        
        // Reset progress bar
        document.getElementById('progress-bar').style.width = '0%';
        
        // Clear URL parameters
        const url = new URL(window.location);
        url.search = '';
        window.history.replaceState({}, '', url);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WorkplacePersonalityTest();
});

// Service Worker registration removed to avoid 404 errors
// Add SW later if needed for PWA functionality

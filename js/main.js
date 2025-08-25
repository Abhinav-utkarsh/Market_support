document.addEventListener('DOMContentLoaded', () => {

    // ---=== Theme Toggler ===---
    const themeSwitch = document.getElementById('checkbox');
    if (themeSwitch) {
        const currentTheme = localStorage.getItem('theme');

        // Default to light mode. Only switch to dark if it's explicitly saved.
        if (currentTheme === 'dark-mode') {
            themeSwitch.checked = false;
        } else {
            document.body.classList.add('light-mode');
            themeSwitch.checked = true;
        }

        themeSwitch.addEventListener('change', function(e) {
            if (e.target.checked) {
                document.body.classList.add('light-mode');
                localStorage.setItem('theme', 'light-mode');
            } else {
                document.body.classList.remove('light-mode');
                localStorage.setItem('theme', 'dark-mode');
            }
        });
    }

    // ---=== Mobile Navigation ===---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }

    // ---=== Chart.js Global Config ===---
    Chart.defaults.color = '#a0a0a0';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';

    // ---=== Helper Functions ===---
    const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

    function syncSliderAndInput(numberInput, sliderInput) {
        if (!numberInput || !sliderInput) return;
        sliderInput.addEventListener('input', (e) => {
            numberInput.value = e.target.value;
            numberInput.dispatchEvent(new Event('input'));
        });
        numberInput.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            const min = parseFloat(sliderInput.min);
            const max = parseFloat(sliderInput.max);
            if (value >= min && value <= max) {
                sliderInput.value = value;
            }
        });
    }

    // ---=== Page-Specific Initializers ===---
    // This structure ensures we only run the code needed for the current page.

    // A. CALCULATORS PAGE
    const calculatorPage = document.querySelector('.calculators-grid');
    if (calculatorPage) {
        let sipChart = null;
        let lumpsumChart = null;
        let loanChart = null;

        const sipAmountEl = document.getElementById('sip-amount');
        const sipRateEl = document.getElementById('sip-rate');
        const sipYearsEl = document.getElementById('sip-years');
        const lumpsumAmountEl = document.getElementById('lumpsum-amount');
        const lumpsumRateEl = document.getElementById('lumpsum-rate');
        const lumpsumYearsEl = document.getElementById('lumpsum-years');
        const loanAmountEl = document.getElementById('loan-amount');
        const loanRateEl = document.getElementById('loan-rate');
        const loanTenureEl = document.getElementById('loan-tenure');
        const buyPriceEl = document.getElementById('buy-price');
        const sellPriceEl = document.getElementById('sell-price');
        const quantityEl = document.getElementById('quantity');

        function calculateSIP() {
            const amount = parseFloat(sipAmountEl.value);
            const rate = parseFloat(sipRateEl.value);
            const years = parseFloat(sipYearsEl.value);
            if (isNaN(amount) || isNaN(rate) || isNaN(years) || years <= 0) return;

            const monthlyRate = rate / 12 / 100;
            const months = years * 12;
            const totalValue = amount * ((((1 + monthlyRate) ** months) - 1) / monthlyRate) * (1 + monthlyRate);
            const investedAmount = amount * months;
            const returns = totalValue - investedAmount;

            document.getElementById('sip-invested').textContent = formatCurrency(investedAmount);
            document.getElementById('sip-returns').textContent = formatCurrency(returns);
            document.getElementById('sip-total').textContent = formatCurrency(totalValue);

            if (sipChart) {
                sipChart.data.datasets[0].data = [investedAmount, returns];
                sipChart.update();
            } else {
                const ctx = document.getElementById('sipChart').getContext('2d');
                sipChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Invested Amount', 'Estimated Returns'],
                        datasets: [{ data: [investedAmount, returns], backgroundColor: ['#2d3748', '#4299e1'], borderWidth: 0 }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, animation: { animateScale: true } }
                });
            }
        }

        function calculateLumpsum() {
            const amount = parseFloat(lumpsumAmountEl.value);
            const rate = parseFloat(lumpsumRateEl.value);
            const years = parseFloat(lumpsumYearsEl.value);
            if (isNaN(amount) || isNaN(rate) || isNaN(years) || years <= 0) return;

            const totalValue = amount * ((1 + rate / 100) ** years);
            const returns = totalValue - amount;

            document.getElementById('lumpsum-invested').textContent = formatCurrency(amount);
            document.getElementById('lumpsum-returns').textContent = formatCurrency(returns);
            document.getElementById('lumpsum-total').textContent = formatCurrency(totalValue);

            if (lumpsumChart) {
                lumpsumChart.data.datasets[0].data = [amount, returns];
                lumpsumChart.update();
            } else {
                const ctx = document.getElementById('lumpsumChart').getContext('2d');
                lumpsumChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Invested Amount', 'Estimated Returns'],
                        datasets: [{ data: [amount, returns], backgroundColor: ['#2d3748', '#4299e1'], borderWidth: 0, }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, animation: { animateScale: true } }
                });
            }
        }

        function calculateLoanEMI() {
            const p = parseFloat(loanAmountEl.value);
            const r = parseFloat(loanRateEl.value) / 12 / 100;
            const n = parseFloat(loanTenureEl.value) * 12;
            if (isNaN(p) || isNaN(r) || isNaN(n) || n <= 0) return;

            const emi = (p * r * (1 + r) ** n) / ((1 + r) ** n - 1);
            const totalPayment = emi * n;
            const totalInterest = totalPayment - p;

            document.getElementById('loan-emi').textContent = formatCurrency(emi);
            document.getElementById('loan-interest').textContent = formatCurrency(totalInterest);
            document.getElementById('loan-total').textContent = formatCurrency(totalPayment);

            if (loanChart) {
                loanChart.data.datasets[0].data = [p, totalInterest];
                loanChart.update();
            } else {
                const ctx = document.getElementById('loanChart').getContext('2d');
                loanChart = new Chart(ctx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Principal Amount', 'Total Interest'],
                        datasets: [{ data: [p, totalInterest], backgroundColor: ['#4299e1', '#2d3748'], borderWidth: 0, }]
                    },
                    options: { responsive: true, maintainAspectRatio: false, animation: { animateScale: true } }
                });
            }
        }

        function calculatePL() {
            const buyPrice = parseFloat(buyPriceEl.value);
            const sellPrice = parseFloat(sellPriceEl.value);
            const quantity = parseFloat(quantityEl.value);
            if (isNaN(buyPrice) || isNaN(sellPrice) || isNaN(quantity)) return;

            const profitLoss = (sellPrice - buyPrice) * quantity;
            const profitLossPercent = (buyPrice > 0) ? ((sellPrice - buyPrice) / buyPrice) * 100 : 0;

            const resultEl = document.getElementById('pl-result');
            resultEl.textContent = formatCurrency(profitLoss);
            resultEl.style.color = profitLoss >= 0 ? 'var(--profit-color)' : 'var(--loss-color)';

            const percentEl = document.getElementById('pl-percent');
            percentEl.textContent = `${profitLossPercent.toFixed(2)}%`;
            percentEl.style.color = profitLoss >= 0 ? 'var(--profit-color)' : 'var(--loss-color)';
        }

        [sipAmountEl, sipRateEl, sipYearsEl].forEach(el => el.addEventListener('input', calculateSIP));
        [lumpsumAmountEl, lumpsumRateEl, lumpsumYearsEl].forEach(el => el.addEventListener('input', calculateLumpsum));
        [loanAmountEl, loanRateEl, loanTenureEl].forEach(el => el.addEventListener('input', calculateLoanEMI));
        [buyPriceEl, sellPriceEl, quantityEl].forEach(el => el.addEventListener('input', calculatePL));

        calculateSIP();
        calculateLumpsum();
        calculateLoanEMI();
        calculatePL();

        syncSliderAndInput(sipAmountEl, document.getElementById('sip-amount-slider'));
        syncSliderAndInput(sipYearsEl, document.getElementById('sip-years-slider'));
        syncSliderAndInput(lumpsumAmountEl, document.getElementById('lumpsum-amount-slider'));
        syncSliderAndInput(lumpsumYearsEl, document.getElementById('lumpsum-years-slider'));
        syncSliderAndInput(loanAmountEl, document.getElementById('loan-amount-slider'));
        syncSliderAndInput(loanTenureEl, document.getElementById('loan-tenure-slider'));
        syncSliderAndInput(sipRateEl, document.getElementById('sip-rate-slider'));
        syncSliderAndInput(lumpsumRateEl, document.getElementById('lumpsum-rate-slider'));
        syncSliderAndInput(loanRateEl, document.getElementById('loan-rate-slider'));
    }

    // B. EXTRA FEATURES PAGE
    const extraFeaturesPage = document.getElementById('goal-target');
    if (extraFeaturesPage) {
        const goalTargetEl = document.getElementById('goal-target');
        const goalYearsEl = document.getElementById('goal-years');
        const goalRateEl = document.getElementById('goal-rate');

        function calculateGoal() {
            const target = parseFloat(goalTargetEl.value);
            const years = parseFloat(goalYearsEl.value);
            const rate = parseFloat(goalRateEl.value);
            if (isNaN(target) || isNaN(years) || isNaN(rate) || years <= 0) return;

            const monthlyRate = rate / 12 / 100;
            const months = years * 12;
            const requiredSip = (target * monthlyRate) / ((((1 + monthlyRate) ** months) - 1) * (1 + monthlyRate));
            document.getElementById('goal-sip').textContent = formatCurrency(requiredSip);
        }

        [goalTargetEl, goalYearsEl, goalRateEl].forEach(el => el.addEventListener('input', calculateGoal));
        calculateGoal();
        syncSliderAndInput(goalRateEl, document.getElementById('goal-rate-slider'));
    }

    // C. LEARNING HUB PAGE
    const quizForm = document.getElementById('investor-quiz');
    if (quizForm) {
        quizForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const selected = document.querySelector('input[name="investor-type"]:checked');
            const resultEl = document.getElementById('quiz-result');
            if (selected) {
                let resultText = '';
                switch (selected.value) {
                    case 'aggressive': resultText = 'You have an Aggressive risk profile. You see market dips as opportunities.'; break;
                    case 'moderate': resultText = 'You have a Moderate risk profile. You are cautious but optimistic for the long term.'; break;
                    case 'conservative': resultText = 'You have a Conservative risk profile. You prioritize capital protection over high returns.'; break;
                }
                resultEl.textContent = resultText;
            } else {
                resultEl.textContent = 'Please select an option.';
            }
        });
    }

    // ---=== Home Page Digital Rain Animation ===---
    const canvas = document.getElementById('background-canvas');
    if (canvas && document.body.classList.contains('home-page')) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const getRainColor = () => document.body.classList.contains('light-mode') ? 'rgba(45, 55, 72, 0.3)' : 'rgba(66, 153, 225, 0.3)';
        const getBackgroundColor = () => document.body.classList.contains('light-mode') ? 'rgba(247, 250, 252, 0.25)' : 'rgba(26, 32, 44, 0.25)';

        let fontSize = 16;
        let columns = Math.floor(canvas.width / fontSize);
        const rainDrops = [];

        for (let x = 0; x < columns; x++) {
            rainDrops[x] = 1;
        }

        const characters = '₹$';

        function draw() {
            ctx.fillStyle = getBackgroundColor();
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = getRainColor();
            ctx.font = fontSize + 'px monospace';

            for (let i = 0; i < rainDrops.length; i++) {
                const text = characters.charAt(Math.floor(Math.random() * characters.length));
                ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

                if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                rainDrops[i]++;
            }
        }

        let animationInterval = setInterval(draw, 80);

        const resetAnimation = () => {
            clearInterval(animationInterval);
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            columns = Math.floor(canvas.width / fontSize);
            for (let x = 0; x < columns; x++) { rainDrops[x] = 1; }
            animationInterval = setInterval(draw, 80);
        };

        window.addEventListener('resize', resetAnimation);
        themeSwitch.addEventListener('change', resetAnimation);
    }
});
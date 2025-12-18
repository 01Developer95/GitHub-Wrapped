/**
 * GitHub Wrapped - Your Coding Year in Review
 * 
 * Copyright (c) 2024-2025 01Developer95
 * Licensed under the MIT License
 * 
 * Project: GitHub Wrapped
 * Repository: https://github.com/01Developer95/GitHub-Wrapped
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Main Application Controller
class GitHubWrappedApp {
    constructor() {
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.githubAPI = null;
        this.aiInsights = null;
        this.data = null;

        this.init();
    }

    init() {
        // Set up event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Auth form submission
        const authForm = document.getElementById('auth-form');
        authForm?.addEventListener('submit', (e) => this.handleAuthSubmit(e));



        // Navigation buttons
        document.getElementById('prev-btn')?.addEventListener('click', () => this.previousSlide());
        document.getElementById('next-btn')?.addEventListener('click', () => this.nextSlide());

        // Action buttons
        document.getElementById('download-btn')?.addEventListener('click', () => this.downloadWrapped());
        document.getElementById('share-btn')?.addEventListener('click', () => this.shareWrapped());
        document.getElementById('restart-btn')?.addEventListener('click', () => this.restart());

        // Error modal
        document.getElementById('close-error-btn')?.addEventListener('click', () => this.closeError());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            const storyContainer = document.getElementById('story-container');
            if (storyContainer && storyContainer.classList.contains('active')) {
                if (e.key === 'ArrowLeft') this.previousSlide();
                if (e.key === 'ArrowRight') this.nextSlide();
            }
        });

        // Touch/Swipe support
        this.setupTouchNavigation();
    }

    setupTouchNavigation() {
        let touchStartX = 0;
        let touchEndX = 0;

        const slidesWrapper = document.getElementById('slides-wrapper');
        if (!slidesWrapper) return;

        slidesWrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slidesWrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });
    }

    handleSwipe(startX, endX) {
        const swipeThreshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left - next slide
                this.nextSlide();
            } else {
                // Swiped right - previous slide
                this.previousSlide();
            }
        }
    }




    async handleAuthSubmit(e) {
        e.preventDefault();

        const username = document.getElementById('github-username').value.trim();
        const token = document.getElementById('github-token').value.trim();
        const geminiKey = document.getElementById('gemini-key').value.trim();
        const year = document.getElementById('year-select').value;

        if (!username || !token || !geminiKey) {
            this.showError('Please fill in all fields');
            return;
        }

        // Show loading page
        this.showPage('loading-page');
        this.updateLoadingStatus('Validating credentials...', 10);

        try {
            // Initialize APIs
            this.githubAPI = new GitHubAPI(username, token);
            this.aiInsights = new AIInsights(geminiKey);

            // Validate credentials
            this.updateLoadingStatus('Connecting to GitHub...', 20);
            const isValidToken = await this.githubAPI.validateToken();
            if (!isValidToken) {
                throw new Error('Invalid GitHub token. Please check your credentials.');
            }


            this.updateLoadingStatus('Validating AI key...', 30);
            const isValidKey = await this.aiInsights.validateKey();
            if (!isValidKey) {
                console.warn('Gemini API key validation failed, but proceeding anyway');
                // Don't throw error - validation might fail due to CORS or network issues
                // The actual API calls will reveal if the key is truly invalid
            }

            // Fetch data
            this.updateLoadingStatus('Fetching your GitHub data...', 40);
            this.data = await this.githubAPI.getContributionSummary(year);

            this.updateLoadingStatus('Analyzing your coding patterns...', 60);
            await this.sleep(500); // Give user time to see progress

            this.updateLoadingStatus('Generating AI insights...', 75);
            const insights = await this.aiInsights.generateInsights(this.data);

            this.updateLoadingStatus('Creating your story...', 85);
            const summary = await this.aiInsights.generateYearSummary(this.data);

            this.updateLoadingStatus('Almost there...', 95);
            await this.sleep(500);

            // Generate slides
            this.generateStory(insights, summary);

            this.updateLoadingStatus('Complete!', 100);
            await this.sleep(500);

            // Show story
            this.showPage('story-container');
            this.initializeCharts();

        } catch (error) {
            console.error('Error:', error);

            // Provide more helpful error messages
            let errorMessage = error.message || 'An unexpected error occurred. Please try again.';

            if (error.message && error.message.includes('GitHub')) {
                errorMessage = 'GitHub API error: ' + error.message + '\n\nPlease check your GitHub username and Personal Access Token.';
            } else if (error.message && error.message.includes('Gemini')) {
                errorMessage = 'AI API error: ' + error.message + '\n\nPlease check your Gemini API Key or try the Demo mode.';
            } else if (error.message && error.message.includes('Rate limit')) {
                errorMessage = 'Rate limit exceeded. Please wait a few minutes and try again.';
            }

            this.showError(errorMessage);
            this.showPage('landing-page');
        }
    }

    generateStory(insights, summary) {
        const slidesHTML = Slides.generateAllSlides(this.data, insights, summary);
        const slidesWrapper = document.getElementById('slides-wrapper');
        slidesWrapper.innerHTML = slidesHTML;

        // Set up slide indicators
        const slides = slidesWrapper.querySelectorAll('.slide');
        this.totalSlides = slides.length;
        this.currentSlide = 0;

        this.createSlideIndicators();
        this.updateNavigation();
    }

    initializeCharts() {
        // Wait for slide to be visible, then initialize charts
        setTimeout(() => {
            // Contribution heatmap (Slide 2)
            Charts.createContributionHeatmap(this.data.commits, 'contribution-heatmap');

            // Language chart (Slide 3)
            Charts.createLanguageChart(this.data.languages, 'language-chart');

            // Productivity chart (Slide 4)
            Charts.createProductivityChart(this.data.commits, 'productivity-chart');

            // Animate commit counter (Slide 2)
            const commitCounter = document.getElementById('commit-counter');
            if (commitCounter) {
                Charts.animateNumber(commitCounter, 0, this.data.commits.total, 2000);
            }
        }, 100);
    }

    createSlideIndicators() {
        const indicatorsContainer = document.getElementById('slide-indicators');
        if (!indicatorsContainer) return;

        indicatorsContainer.innerHTML = '';

        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.className = `indicator-dot ${i === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => this.goToSlide(i));
            indicatorsContainer.appendChild(dot);
        }
    }

    nextSlide() {
        if (!this.data || this.totalSlides === 0) {
            console.warn('No slides loaded yet');
            return;
        }
        if (this.currentSlide < this.totalSlides - 1) {
            this.goToSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (!this.data || this.totalSlides === 0) {
            console.warn('No slides loaded yet');
            return;
        }
        if (this.currentSlide > 0) {
            this.goToSlide(this.currentSlide - 1);
        }
    }

    goToSlide(index) {
        if (!this.data || this.totalSlides === 0) {
            console.warn('No slides loaded yet');
            return;
        }

        const slides = document.querySelectorAll('.slide');
        const indicators = document.querySelectorAll('.indicator-dot');

        if (slides.length === 0) {
            console.error('No slides found in DOM');
            return;
        }

        console.log(`Navigating from slide ${this.currentSlide} to ${index}`);

        // Remove all classes from all slides first
        slides.forEach(slide => {
            slide.classList.remove('active', 'prev');
        });

        // Remove active from all indicators
        indicators.forEach(ind => {
            ind.classList.remove('active');
        });

        // Update current slide index
        this.currentSlide = index;

        // Add active class to current slide
        if (slides[this.currentSlide]) {
            slides[this.currentSlide].classList.add('active');
        }

        // Add active class to current indicator
        if (indicators[this.currentSlide]) {
            indicators[this.currentSlide].classList.add('active');
        }

        this.updateNavigation();

        // Re-initialize charts for the current slide
        this.initializeCurrentSlideCharts();
    }

    initializeCurrentSlideCharts() {
        const currentSlideElement = document.querySelector('.slide.active');
        const slideIndex = parseInt(currentSlideElement?.dataset.slide || '0');

        // Re-render charts based on current slide
        if (slideIndex === 1) {
            const commitCounter = document.getElementById('commit-counter');
            if (commitCounter) {
                Charts.animateNumber(commitCounter, 0, this.data.commits.total, 2000);
            }
        }
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');

        if (prevBtn) {
            prevBtn.disabled = this.currentSlide === 0;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentSlide === this.totalSlides - 1;
        }
    }

    async downloadWrapped() {
        try {
            // Use html2canvas library if available, otherwise show message
            if (typeof html2canvas === 'undefined') {
                alert('To download your wrapped, please install html2canvas library or take a screenshot!');
                return;
            }

            const currentSlide = document.querySelector('.slide.active');
            const canvas = await html2canvas(currentSlide, {
                backgroundColor: '#0d1117', // Force GitHub dark background
                scale: 2, // Higher quality
                useCORS: true, // Handle cross-origin images
                logging: false,
                onclone: (clonedDoc) => {
                    // Fix gradient text for html2canvas
                    const gradientTexts = clonedDoc.querySelectorAll('.gradient-text, .slide-title, .stat-value');
                    gradientTexts.forEach(el => {
                        el.style.background = 'none';
                        el.style.webkitTextFillColor = 'initial';
                        el.style.color = '#388bfd'; // Fallback to solid blue
                    });

                    // Force ALL animated elements to be visible for capture
                    const animatedElements = clonedDoc.querySelectorAll('.productivity-bar-container, .heatmap-cell, .slide-icon, .language-segment');
                    animatedElements.forEach(el => {
                        el.style.animation = 'none';
                        el.style.opacity = '1';
                        el.style.transform = 'none';
                        el.style.visibility = 'visible';
                    });

                    // FORCE styling for the productivity chart to prevent mobile view issues
                    const style = clonedDoc.createElement('style');
                    style.innerHTML = `
                        .productivity-chart {
                            display: grid !important;
                            grid-template-columns: repeat(7, 1fr) !important;
                            gap: 4px !important;
                            align-items: end !important;
                            justify-items: center !important;
                            width: 100% !important;
                        }
                        .productivity-bar-container {
                            width: 100% !important;
                            align-items: center !important;
                        }
                        .productivity-day {
                            font-size: 11px !important;
                            text-align: center !important;
                            width: 100% !important;
                            margin-top: 8px !important;
                        }
                        .heatmap-cell {
                            opacity: 1 !important;
                            visibility: visible !important;
                        }
                        .heatmap-grid {
                            opacity: 1 !important;
                        }
                    `;
                    clonedDoc.head.appendChild(style);
                }
            });

            const link = document.createElement('a');
            link.download = `github-wrapped-${this.data.year}.png`;
            link.href = canvas.toDataURL();
            link.click();
        } catch (error) {
            console.error('Download error:', error);
            alert('Please take a screenshot to save your wrapped!');
        }
    }

    shareWrapped() {
        const text = `Check out my GitHub Wrapped ${this.data.year}! 🎉\n\n` +
            `📊 ${this.data.commits.total} commits\n` +
            `💻 ${this.data.languages[0]?.name || 'Code'} developer\n` +
            `⭐ ${this.data.totalStars} stars earned\n\n` +
            `#GitHubWrapped #${this.data.year}`;

        // Try to use Web Share API
        if (navigator.share) {
            navigator.share({
                title: `My GitHub Wrapped ${this.data.year}`,
                text: text,
            }).catch(err => console.log('Share cancelled', err));
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(text).then(() => {
                alert('Share text copied to clipboard!');
            }).catch(() => {
                alert('Share text:\n\n' + text);
            });
        }
    }

    restart() {
        this.currentSlide = 0;
        this.totalSlides = 0;
        this.githubAPI = null;
        this.aiInsights = null;
        this.data = null;

        // Clean up DOM artifacts
        const slidesWrapper = document.getElementById('slides-wrapper');
        if (slidesWrapper) slidesWrapper.innerHTML = '';

        const indicators = document.getElementById('slide-indicators');
        if (indicators) indicators.innerHTML = '';

        // Clear form
        document.getElementById('auth-form')?.reset();

        // Show landing page
        this.showPage('landing-page');
        document.body.style.overflow = 'auto';
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }

    updateLoadingStatus(status, progress) {
        const statusElement = document.getElementById('loading-status');
        const progressBar = document.getElementById('progress-bar');

        if (statusElement) {
            statusElement.textContent = status;
        }

        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    showError(message) {
        const modal = document.getElementById('error-modal');
        const messageElement = document.getElementById('error-message');

        if (messageElement) {
            messageElement.textContent = message;
        }

        if (modal) {
            modal.classList.add('active');
        }
    }

    closeError() {
        const modal = document.getElementById('error-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new GitHubWrappedApp();
});

// Add social share button handlers
document.addEventListener('click', (e) => {
    // Helper to generate the "written post"
    const getShareText = (data) => {
        if (!data) return '';
        const topLang = data.languages[0]?.name || 'Code';
        return `🚀 My 2024 GitHub Wrapped is here!

📊 Stats for the year:
✅ ${data.commits.total} Total Commits
💻 Top Language: ${topLang}
🌟 ${data.totalStars} Stars Earned
🔥 Most Active: ${data.commits.byMonth ? Slides.getMostActiveMonth(data.commits.byMonth) : 'Unknown'}

🎯 Create your own coding year in review!
👉 Visit: https://01developer95.github.io/GitHub-Wrapped/

#GitHubWrapped #CodingJourney #Developer2024 #YearInReview`;
    };

    if (e.target.closest('.twitter-btn')) {
        const app = window.app;
        if (app && app.data) {
            const text = encodeURIComponent(getShareText(app.data));
            const url = encodeURIComponent(window.location.href);
            // Twitter Intent URL - Auto detects login
            window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
        }
    }

    if (e.target.closest('.linkedin-btn')) {
        const app = window.app;
        if (app && app.data) {
            const text = encodeURIComponent(getShareText(app.data));
            // LinkedIn Feed URL with pre-filled text (Works best for text posts)
            // Note: 'shareActive=true&text=' is a known pattern for posting text to feed
            window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${text}`, '_blank');
        }
    }
});

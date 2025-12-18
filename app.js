// Auto Year Detection and Update
(function () {
    'use strict';

    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-indexed, so add 1

    // Determine which year's wrapped to show
    // If we're in January-March, show previous year
    // Otherwise show current year - 1
    let wrappedYear;
    if (currentMonth <= 3) {
        // Early in the year, show last year's wrapped
        wrappedYear = currentYear - 1;
    } else {
        // Later in the year, still show last year's wrapped
        // (since current year isn't complete yet)
        wrappedYear = currentYear - 1;
    }

    console.log(`Auto-detected wrapped year: ${wrappedYear}`);

    // Update year badge in hero section
    const yearBadge = document.querySelector('.year-badge');
    if (yearBadge) {
        yearBadge.textContent = wrappedYear;
    }

    // Update page title
    document.title = `GitHub Wrapped ${wrappedYear} - Your Coding Year in Review`;

    // Generate year options for select dropdown
    const yearSelect = document.getElementById('year-select');
    if (yearSelect) {
        // Clear existing options
        yearSelect.innerHTML = '';

        // Generate options from current year-1 down to 2020
        const startYear = currentYear - 1;
        const endYear = 2020;

        for (let year = startYear; year >= endYear; year--) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;

            // Select the wrapped year by default
            if (year === wrappedYear) {
                option.selected = true;
            }

            yearSelect.appendChild(option);
        }
    }

    // Update demo data year
    if (window.DemoData && typeof window.DemoData.updateYear === 'function') {
        window.DemoData.updateYear(wrappedYear);
    }

    console.log(`Year selector populated with years ${currentYear - 1} to 2020`);
    console.log(`Default selected year: ${wrappedYear}`);
})();
// GitHub API Integration Module
class GitHubAPI {
    constructor(username, token) {
        this.username = username;
        this.token = token;
        this.baseURL = 'https://api.github.com';
        this.headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json'
        };
        this.cache = {};
    }

    // Fetch with error handling and rate limiting
    async fetchWithRetry(url, retries = 3) {
        for (let i = 0; i < retries; i++) {
            try {
                const response = await fetch(url, { headers: this.headers });

                if (response.status === 403) {
                    const resetTime = response.headers.get('X-RateLimit-Reset');
                    throw new Error(`Rate limit exceeded. Resets at ${new Date(resetTime * 1000).toLocaleTimeString()}`);
                }

                if (!response.ok) {
                    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
                }

                return await response.json();
            } catch (error) {
                if (i === retries - 1) throw error;
                await this.sleep(1000 * (i + 1)); // Exponential backoff
            }
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Get user profile
    async getUserProfile() {
        if (this.cache.profile) return this.cache.profile;

        const data = await this.fetchWithRetry(`${this.baseURL}/users/${this.username}`);
        this.cache.profile = {
            name: data.name || this.username,
            avatar: data.avatar_url,
            bio: data.bio,
            location: data.location,
            company: data.company,
            publicRepos: data.public_repos,
            followers: data.followers,
            following: data.following,
            createdAt: new Date(data.created_at)
        };

        return this.cache.profile;
    }

    // Get all repositories
    async getRepositories() {
        if (this.cache.repos) return this.cache.repos;

        let allRepos = [];
        let page = 1;
        const perPage = 100;

        while (true) {
            const repos = await this.fetchWithRetry(
                `${this.baseURL}/users/${this.username}/repos?per_page=${perPage}&page=${page}&sort=updated`
            );

            if (repos.length === 0) break;
            allRepos = allRepos.concat(repos);
            if (repos.length < perPage) break;
            page++;
        }

        this.cache.repos = allRepos.map(repo => ({
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description,
            language: repo.language,
            stars: repo.stargazers_count,
            forks: repo.forks_count,
            size: repo.size,
            createdAt: new Date(repo.created_at),
            updatedAt: new Date(repo.updated_at),
            url: repo.html_url,
            isPrivate: repo.private,
            isFork: repo.fork
        }));

        return this.cache.repos;
    }

    // Get commits for a specific year
    async getYearCommits(year) {
        const startDate = `${year}-01-01T00:00:00Z`;
        const endDate = `${year}-12-31T23:59:59Z`;

        let totalCommits = 0;
        const commitsByMonth = new Array(12).fill(0);
        const commitsByDay = new Array(7).fill(0);
        const commitsByHour = new Array(24).fill(0);
        const repos = await this.getRepositories();

        // Get commits from each repo
        for (const repo of repos) {
            try {
                const commits = await this.fetchWithRetry(
                    `${this.baseURL}/repos/${repo.fullName}/commits?author=${this.username}&since=${startDate}&until=${endDate}&per_page=100`
                );

                totalCommits += commits.length;

                commits.forEach(commit => {
                    const date = new Date(commit.commit.author.date);
                    const month = date.getMonth();
                    const day = date.getDay();
                    const hour = date.getHours();

                    commitsByMonth[month]++;
                    commitsByDay[day]++;
                    commitsByHour[hour]++;
                });
            } catch (error) {
                console.warn(`Could not fetch commits for ${repo.name}:`, error.message);
            }
        }

        return {
            total: totalCommits,
            byMonth: commitsByMonth,
            byDay: commitsByDay,
            byHour: commitsByHour
        };
    }

    // Analyze language usage
    async getLanguageStats(year) {
        const repos = await this.getRepositories();
        const languageBytes = {};

        // Filter repos updated in the specified year
        const yearRepos = repos.filter(repo => {
            const repoYear = repo.updatedAt.getFullYear();
            return repoYear === parseInt(year);
        });

        for (const repo of yearRepos) {
            try {
                const languages = await this.fetchWithRetry(
                    `${this.baseURL}/repos/${repo.fullName}/languages`
                );

                for (const [lang, bytes] of Object.entries(languages)) {
                    languageBytes[lang] = (languageBytes[lang] || 0) + bytes;
                }
            } catch (error) {
                console.warn(`Could not fetch languages for ${repo.name}:`, error.message);
            }
        }

        // Convert to percentages and sort
        const totalBytes = Object.values(languageBytes).reduce((a, b) => a + b, 0);
        const languageStats = Object.entries(languageBytes)
            .map(([lang, bytes]) => ({
                name: lang,
                bytes: bytes,
                percentage: ((bytes / totalBytes) * 100).toFixed(1)
            }))
            .sort((a, b) => b.bytes - a.bytes);

        return languageStats;
    }

    // Get most productive time
    getMostProductiveTime(commitData) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const mostProductiveDay = commitData.byDay.indexOf(Math.max(...commitData.byDay));
        const mostProductiveHour = commitData.byHour.indexOf(Math.max(...commitData.byHour));

        return {
            day: dayNames[mostProductiveDay],
            hour: mostProductiveHour,
            timeOfDay: this.getTimeOfDay(mostProductiveHour)
        };
    }

    getTimeOfDay(hour) {
        if (hour >= 5 && hour < 12) return 'Morning';
        if (hour >= 12 && hour < 17) return 'Afternoon';
        if (hour >= 17 && hour < 21) return 'Evening';
        return 'Night';
    }

    // Get biggest project
    async getBiggestProject(year) {
        const repos = await this.getRepositories();

        // Filter repos from the specified year
        const yearRepos = repos.filter(repo => {
            const createdYear = repo.createdAt.getFullYear();
            const updatedYear = repo.updatedAt.getFullYear();
            return createdYear === parseInt(year) || updatedYear === parseInt(year);
        });

        if (yearRepos.length === 0) return null;

        // Sort by a combination of stars, forks, and size
        const scoredRepos = yearRepos.map(repo => ({
            ...repo,
            score: (repo.stars * 10) + (repo.forks * 5) + (repo.size / 1000)
        }));

        scoredRepos.sort((a, b) => b.score - a.score);

        return scoredRepos[0];
    }

    // Get contribution summary
    async getContributionSummary(year) {
        const commits = await this.getYearCommits(year);
        const languages = await this.getLanguageStats(year);
        const repos = await this.getRepositories();
        const profile = await this.getUserProfile();
        const productiveTime = this.getMostProductiveTime(commits);
        const biggestProject = await this.getBiggestProject(year);

        // Filter repos created or updated in the year
        const yearRepos = repos.filter(repo => {
            const createdYear = repo.createdAt.getFullYear();
            const updatedYear = repo.updatedAt.getFullYear();
            return createdYear === parseInt(year) || updatedYear === parseInt(year);
        });

        return {
            profile,
            year: parseInt(year),
            commits,
            languages,
            productiveTime,
            biggestProject,
            repoCount: yearRepos.length,
            totalStars: yearRepos.reduce((sum, repo) => sum + repo.stars, 0),
            totalForks: yearRepos.reduce((sum, repo) => sum + repo.forks, 0)
        };
    }

    // Validate token
    async validateToken() {
        try {
            await this.fetchWithRetry(`${this.baseURL}/user`);
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Export for use in other modules
window.GitHubAPI = GitHubAPI;
// AI Insights Module using Gemini API
class AIInsights {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    }

    // Generate insights from GitHub data
    async generateInsights(githubData) {
        const prompt = this.createPrompt(githubData);

        try {
            const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.9,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data = await response.json();
            const generatedText = data.candidates[0].content.parts[0].text;

            return this.parseInsights(generatedText);
        } catch (error) {
            console.error('AI Insights error:', error);
            return this.getFallbackInsights(githubData);
        }
    }

    // Create structured prompt for Gemini
    createPrompt(data) {
        const topLanguages = data.languages.slice(0, 5).map(l => l.name).join(', ');
        const commitCount = data.commits.total;
        const repoCount = data.repoCount;
        const productiveTime = `${data.productiveTime.day}s at ${data.productiveTime.hour}:00 (${data.productiveTime.timeOfDay})`;
        const biggestProject = data.biggestProject ? data.biggestProject.name : 'N/A';

        return `You are analyzing a developer's GitHub activity for the year ${data.year}. Generate personalized, encouraging, and fun insights about their coding journey.

Developer Stats:
- Total Commits: ${commitCount}
- Repositories: ${repoCount}
- Top Languages: ${topLanguages}
- Most Productive Time: ${productiveTime}
- Biggest Project: ${biggestProject}
- Total Stars Earned: ${data.totalStars}
- Profile: ${data.profile.name || 'Developer'}

Generate exactly 5 insights in the following format. Each insight should be unique, personal, and celebratory:

1. ACHIEVEMENT: [A specific achievement based on their stats - be creative and encouraging]
2. PATTERN: [An interesting pattern you notice in their coding behavior]
3. GROWTH: [How they've grown or what they've accomplished this year]
4. FUN_FACT: [A fun, quirky observation about their coding style or habits]
5. MOTIVATION: [An inspiring message for their future coding journey]

Keep each insight to 1-2 sentences. Be enthusiastic, personal, and avoid generic statements. Make it feel like Spotify Wrapped - exciting and shareable!`;
    }

    // Parse AI response into structured insights
    parseInsights(text) {
        const insights = {
            achievement: '',
            pattern: '',
            growth: '',
            funFact: '',
            motivation: ''
        };

        try {
            const lines = text.split('\n').filter(line => line.trim());

            for (const line of lines) {
                if (line.includes('ACHIEVEMENT:')) {
                    insights.achievement = line.split('ACHIEVEMENT:')[1].trim();
                } else if (line.includes('PATTERN:')) {
                    insights.pattern = line.split('PATTERN:')[1].trim();
                } else if (line.includes('GROWTH:')) {
                    insights.growth = line.split('GROWTH:')[1].trim();
                } else if (line.includes('FUN_FACT:')) {
                    insights.funFact = line.split('FUN_FACT:')[1].trim();
                } else if (line.includes('MOTIVATION:')) {
                    insights.motivation = line.split('MOTIVATION:')[1].trim();
                }
            }
        } catch (error) {
            console.error('Error parsing insights:', error);
        }

        return insights;
    }

    // Fallback insights if AI fails
    getFallbackInsights(data) {
        const commitCount = data.commits.total;
        const topLang = data.languages[0]?.name || 'code';
        const repoCount = data.repoCount;

        return {
            achievement: `You made ${commitCount} commits in ${data.year}! That's ${Math.round(commitCount / 365)} commits per day on average. Your dedication is impressive! 🚀`,
            pattern: `You're a ${data.productiveTime.timeOfDay.toLowerCase()} coder! Most of your commits happen on ${data.productiveTime.day}s around ${data.productiveTime.hour}:00. ⏰`,
            growth: `You worked on ${repoCount} repositories this year, with ${topLang} being your language of choice. You're building an impressive portfolio! 📈`,
            funFact: `Your code traveled through ${data.languages.length} different programming languages this year. You're a true polyglot developer! 🌍`,
            motivation: `With ${data.totalStars} stars earned and ${commitCount} commits made, you're making waves in the developer community. Keep pushing boundaries in ${data.year + 1}! ⭐`
        };
    }

    // Generate a personalized year summary
    async generateYearSummary(data) {
        const prompt = `Create a brief, exciting summary (2-3 sentences) of this developer's ${data.year} coding journey:
        
- ${data.commits.total} commits
- ${data.repoCount} repositories
- Top language: ${data.languages[0]?.name || 'various languages'}
- ${data.totalStars} stars earned

Make it celebratory and personal, like Spotify Wrapped. Focus on their achievements and growth.`;

        try {
            const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.8,
                        maxOutputTokens: 200,
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const result = await response.json();
            return result.candidates[0].content.parts[0].text.trim();
        } catch (error) {
            console.error('Summary generation error:', error);
            return `What a year! You made ${data.commits.total} commits across ${data.repoCount} repositories, primarily using ${data.languages[0]?.name || 'various languages'}. Your dedication earned you ${data.totalStars} stars from the community. Here's to an even more amazing ${data.year + 1}! 🎉`;
        }
    }

    // Validate API key (lenient - allows proceeding even if validation fails)
    async validateKey() {
        // Basic format check
        if (!this.apiKey || this.apiKey.length < 20) {
            console.warn('API key seems too short');
            return false;
        }

        try {
            const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: 'Test'
                        }]
                    }],
                    generationConfig: {
                        maxOutputTokens: 10
                    }
                })
            });

            if (response.ok) {
                console.log('Gemini API key validated successfully');
                return true;
            }

            // Check specific error codes
            if (response.status === 400) {
                const errorData = await response.json();
                console.error('Gemini API error:', errorData);

                // If it's just a quota or minor issue, still allow proceeding
                if (errorData.error?.message?.includes('quota')) {
                    console.warn('API quota issue, but key format is valid');
                    return true;
                }
            }

            console.warn(`Gemini API validation returned status: ${response.status}`);
            // Be lenient - allow proceeding even if validation fails
            // The actual API calls will show the real error
            return true;

        } catch (error) {
            console.error('Gemini API validation error:', error);
            // Network error or CORS - be lenient and allow proceeding
            console.warn('Skipping validation due to network error, will try actual API call');
            return true;
        }
    }
}

// Export for use in other modules
window.AIInsights = AIInsights;
// Charts and Visualizations Module
class Charts {
    // Create animated language bar chart
    static createLanguageChart(languages, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const colors = [
            '#2b7489', // TypeScript
            '#f1e05a', // JavaScript
            '#563d7c', // CSS
            '#e34c26', // HTML
            '#3572A5'  // Python
        ];

        // Create the single bar with multiple segments
        const barSegments = languages.slice(0, 5).map((lang, index) => `
            <div class="language-segment" 
                 style="width: ${lang.percentage}%; background-color: ${colors[index % colors.length]};"
                 title="${lang.name}: ${lang.percentage}%">
            </div>
        `).join('');

        // Create the legend list
        const legendItems = languages.slice(0, 5).map((lang, index) => `
            <div class="language-legend-item">
                <span class="language-dot" style="background-color: ${colors[index % colors.length]}"></span>
                <span class="language-name">${lang.name}</span>
                <span class="language-percentage">${lang.percentage}%</span>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="language-chart-container">
                <div class="language-bar-multi">
                    ${barSegments}
                </div>
                <div class="language-legend">
                    ${legendItems}
                </div>
            </div>
        `;

        // Animation handled by CSS
        setTimeout(() => {
            container.classList.add('animate');
        }, 100);
    }

    // Create contribution heatmap
    static createContributionHeatmap(commitData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const maxCommits = Math.max(...commitData.byMonth);

        container.innerHTML = `
            <div class="heatmap-grid">
                ${commitData.byMonth.map((commits, index) => {
            const intensity = maxCommits > 0 ? (commits / maxCommits) : 0;
            const color = this.getHeatmapColor(intensity);
            return `
                        <div class="heatmap-cell" 
                             style="background: ${color}; animation-delay: ${index * 0.05}s"
                             title="${months[index]}: ${commits} commits">
                            <div class="heatmap-month">${months[index]}</div>
                            <div class="heatmap-value">${commits}</div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    // Get heatmap color based on intensity (GitHub Green scale)
    static getHeatmapColor(intensity) {
        if (intensity === 0) return 'var(--gh-canvas-subtle)';
        if (intensity < 0.25) return '#0e4429';
        if (intensity < 0.5) return '#006d32';
        if (intensity < 0.75) return '#26a641';
        return '#39d353';
    }

    // Create productivity time chart
    static createProductivityChart(commitData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const maxCommits = Math.max(...commitData.byDay);

        container.innerHTML = `
            <div class="productivity-chart">
                ${commitData.byDay.map((commits, index) => {
            const height = maxCommits > 0 ? (commits / maxCommits) * 100 : 0;
            return `
                        <div class="productivity-bar-container" style="animation-delay: ${index * 0.1}s">
                            <div class="productivity-bar" 
                                 style="height: ${height}%"
                                 data-height="${height}">
                            </div>
                            <div class="productivity-day">${days[index]}</div>
                            <div class="productivity-count">${commits}</div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    }

    // Helper: Format large numbers
    static formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Animate number counting
    static animateNumber(element, start, end, duration = 1000) {
        const range = end - start;
        const increment = range / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                current = end;
                clearInterval(timer);
            }
            element.textContent = Math.round(current);
        }, 16);
    }
}

// Export for use in other modules
window.Charts = Charts;
// Slides Generation Module
class Slides {
    // Helper to get GitHub Octicons
    static getIcon(name, size = 64) {
        const icons = {
            'graph': `<path d="M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z"></path>`,
            'calendar': `<path d="M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0ZM2.5 7.5v6.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V7.5Zm10.75-4H2.75a.25.25 0 0 0-.25.25V6h11V3.75a.25.25 0 0 0-.25-.25Z"></path>`,
            'flame': `<path d="M8 16a2 2 0 0 0 1.985-1.75c.017-.137-.097-.253-.235-.253h-.01c-.13 0-.173-.081-.133-.186C9.92 12.96 11 11.235 11 9.5c0-1.956-1.556-3.86-2.502-4.992A1 1 0 0 0 8.004 4c-.132 0-.24.108-.24.24 0 .963-.44 1.5-1.168 1.958-.696.438-1.53.66-2.096 1.58C4.168 8.303 4 8.9 4 9.5c0 2.21 1.79 4 4 4 .24 0 .47-.024.69-.069.117-.024.195.105.132.198l-.057.093A1.996 1.996 0 0 0 8 16Z"></path>`,
            'code': `<path d="m11.28 3.22 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734L13.94 8l-3.72-3.72a.749.749 0 0 1 .326-1.275.749.749 0 0 1 .734.215Zm-6.56 0a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042L2.06 8l3.72 3.72a.749.749 0 0 1-.215 1.275.749.749 0 0 1-1.075-.215l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25Z"></path>`,
            'clock': `<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z"></path>`,
            'rocket': `<path d="M14.064 0h.186C15.216 0 16 .784 16 1.75v.186a8.752 8.752 0 0 1-2.564 6.186l-.458.458c-.314.314-.641.616-.979.904v3.207c0 .608-.315 1.172-.833 1.49l-2.774 1.707a.749.749 0 0 1-1.11-.418l-.954-3.102a1.214 1.214 0 0 1-.145-.125L3.754 9.816a1.218 1.218 0 0 1-.124-.145L.528 8.717a.749.749 0 0 1-.418-1.11l1.71-2.774A1.748 1.748 0 0 1 3.31 4.002h3.207c.288-.338.59-.665.904-.979l.458-.458A8.749 8.749 0 0 1 14.064 0ZM8.938 1.623c-.002 0-.004 0-.006.002-.767.245-1.488.583-2.14 1.002l-.658.423c-.322.207-.665.378-1.025.508l-.29.105-2.227.807a.25.25 0 0 0-.06.158l.555.901 3.12 1.013c.245.08.47.218.65.4l2.854 2.853c.182.18.32.404.4.65l1.012 3.12.901.554a.25.25 0 0 0 .158-.06l.807-2.228.105-.29c.13-.36.301-.703.508-1.024l.423-.659a7.258 7.258 0 0 0 1.002-2.14.006.006 0 0 0 .002-.006v-.186a.25.25 0 0 0-.25-.25h-.186a7.257 7.257 0 0 0-2.14 1.002l-.659.423a5.532 5.532 0 0 1-1.024.508l-.29.105-1.743.633a.75.75 0 0 1-.502-1.414l1.743-.633c.373-.135.732-.303 1.071-.503l.66-.423a8.756 8.756 0 0 1 2.502-1.115l.053-.01V1.75a1.75 1.75 0 0 0-1.75-1.75h-.186c-.529.09-1.036.257-1.507.495l-.013.007.017-.052Z"></path>`,
            'star': `<path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>`,
            'fork': `<path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"></path>`,
            'trophy': `<path d="M3.75 2h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1 0-1.5Zm-2 3.5a.75.75 0 0 1 0-1.5h12.5a.75.75 0 0 1 0 1.5H1.75ZM6 10.372a5.228 5.228 0 0 1-2.341-3.693 2.015 2.015 0 0 1 1.054-2.28 2.012 2.012 0 0 1 2.1.28c.189.15.426.222.662.222.238 0 .474-.073.663-.223a2.015 2.015 0 0 1 2.102-.278 2.015 2.015 0 0 1 1.052 2.28A5.226 5.226 0 0 1 8 10.372v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5A2.25 2.25 0 0 1 2 11.25v-.878Zm2-1.9a3.733 3.733 0 0 0 2.204-1.637.514.514 0 0 0-.253-.75.516.516 0 0 0-.585.12c-.225.18-.558.195-.805.006-.497-.38-1.127-.38-1.624 0-.247.19-.58.174-.805-.006a.516.516 0 0 0-.586-.12.514.514 0 0 0-.253.75A3.727 3.727 0 0 0 6 8.472v2.778a.75.75 0 0 0 .75.75h1.5a.75.75 0 0 0 .75-.75V8.472Z"></path>`,
            'search': `<path d="M10.68 11.74a6 6 0 0 1-7.922-8.982 6 6 0 0 1 8.982 7.922l3.04 3.04a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215ZM11.5 6a5.5 5.5 0 1 0-11 0 5.5 5.5 0 0 0 11 0Z"></path>`,
            'gift': `<path d="M2 5.5a3.5 3.5 0 0 1 3.5-3.5h5a3.5 3.5 0 0 1 3.5 3.5v9.75A1.75 1.75 0 0 1 12.25 17H5.5A3.5 3.5 0 0 1 2 13.5V5.5Zm3.5-2A2 2 0 0 0 3.5 5.5v8A2 2 0 0 0 5.5 15.5h6.75a.25.25 0 0 0 .25-.25v-9.75a2 2 0 0 0-2-2h-5Zm6.75 0h-4.5a3.5 3.5 0 0 1 3.5 3.5v1.25c0 .138.112.25.25.25h2a.25.25 0 0 0 .25-.25v-1.25a3.5 3.5 0 0 1-1.5-3.5ZM13 7h-1.5V5.5a2 2 0 0 0-2-2h1.5a2 2 0 0 1 2 2V7Z"></path>`,
            'checklist': `<path d="M3.5 3.75a.25.25 0 0 1 .25-.25h10.5a.25.25 0 0 1 .25.25v10.5a.25.25 0 0 1-.25.25H3.75a.25.25 0 0 1-.25-.25V3.75ZM3.75 2A1.75 1.75 0 0 0 2 3.75v10.5c0 .966.784 1.75 1.75 1.75h10.5A1.75 1.75 0 0 0 16 14.25V3.75C16 2.784 15.216 2 14.25 2H3.75Zm6.02 5.462L8 9.227 6.23 7.462a.75.75 0 0 0-1.06 1.06l2.3 2.3a.75.75 0 0 0 1.06 0l2.3-2.3a.75.75 0 0 0-1.06-1.06Z"></path>`,
            'globe': `<path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM5.78 8.75a9.64 9.64 0 0 0 1.363 4.177c.255.426.542.832.857 1.215.245-.296.551-.705.857-1.215A9.64 9.64 0 0 0 10.22 8.75Zm4.44-1.5a9.64 9.64 0 0 0-1.363-4.177c-.307-.51-.612-.919-.857-1.215a9.927 9.927 0 0 0-.857 1.215A9.64 9.64 0 0 0 5.78 7.25Zm-5.944 1.5H1.543a6.507 6.507 0 0 0 4.666 5.5c-.123-.181-.24-.365-.352-.552-.715-1.192-1.203-2.63-1.418-4.948Zm-1.418-1.5h2.735c.214-2.317.703-3.756 1.418-4.949.11-.186.228-.37.352-.551a6.507 6.507 0 0 0-4.666 5.5Zm10.284 1.5h-2.734c-.214 2.317-.703 3.756-1.418 4.949-.11.186-.228.37-.352.551a6.507 6.507 0 0 0 4.666-5.5Zm-1.418-1.5c-.215-2.318-.703-3.757-1.418-4.949-.11-.186-.227-.37-.352-.551a6.507 6.507 0 0 0 4.666 5.5ZM8 1.5a6.5 6.5 0 0 0-6.5 6.5 6.5 6.5 0 0 0 6.5 6.5 6.5 6.5 0 0 0 6.5-6.5A6.5 6.5 0 0 0 8 1.5Z"></path>`,
            'book': `<path d="M0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0 1 14.25 14H1.75A1.75 1.75 0 0 1 0 12.25Zm1.75-.25a.25.25 0 0 0-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 0 0 .25-.25v-8.5a.25.25 0 0 0-.25-.25Z"></path>`,
            'share': {
                viewBox: '0 0 24 24',
                content: `<g fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M15.75 6C15.75 3.92893 14.0711 2.25 12 2.25C9.92893 2.25 8.25 3.92893 8.25 6C8.25 8.07107 9.92893 9.75 12 9.75C14.0711 9.75 15.75 8.07107 15.75 6ZM12 3.75C13.2426 3.75 14.25 4.75736 14.25 6C14.25 7.24264 13.2426 8.25 12 8.25C10.7574 8.25 9.75 7.24264 9.75 6C9.75 4.75736 10.7574 3.75 12 3.75Z" fill="currentColor"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M9.25 18C9.25 15.9289 7.57107 14.25 5.5 14.25C3.42893 14.25 1.75 15.9289 1.75 18C1.75 20.0711 3.42893 21.75 5.5 21.75C7.57107 21.75 9.25 20.0711 9.25 18ZM5.5 15.75C6.74264 15.75 7.75 16.7574 7.75 18C7.75 19.2426 6.74264 20.25 5.5 20.25C4.25736 20.25 3.25 19.2426 3.25 18C3.25 16.7574 4.25736 15.75 5.5 15.75Z" fill="currentColor"></path> <path fill-rule="evenodd" clip-rule="evenodd" d="M18.5 14.25C20.5711 14.25 22.25 15.9289 22.25 18C22.25 20.0711 20.5711 21.75 18.5 21.75C16.4289 21.75 14.75 20.0711 14.75 18C14.75 15.9289 16.4289 14.25 18.5 14.25ZM20.75 18C20.75 16.7574 19.7426 15.75 18.5 15.75C17.2574 15.75 16.25 16.7574 16.25 18C16.25 19.2426 17.2574 20.25 18.5 20.25C19.7426 20.25 20.75 19.2426 20.75 18Z" fill="currentColor"></path> <path d="M7.20468 7.56231C7.51523 7.28821 7.54478 6.81426 7.27069 6.5037C6.99659 6.19315 6.52264 6.1636 6.21208 6.43769C4.39676 8.03991 3.25 10.3865 3.25 13C3.25 13.4142 3.58579 13.75 4 13.75C4.41421 13.75 4.75 13.4142 4.75 13C4.75 10.8347 5.69828 8.89187 7.20468 7.56231Z" fill="currentColor"></path> <path d="M17.7879 6.43769C17.4774 6.1636 17.0034 6.19315 16.7293 6.5037C16.4552 6.81426 16.4848 7.28821 16.7953 7.56231C18.3017 8.89187 19.25 10.8347 19.25 13C19.25 13.4142 19.5858 13.75 20 13.75C20.4142 13.75 20.75 13.4142 20.75 13C20.75 10.3865 19.6032 8.03991 17.7879 6.43769Z" fill="currentColor"></path> <path d="M10.1869 20.0217C9.7858 19.9184 9.37692 20.1599 9.27367 20.561C9.17043 20.9622 9.41192 21.3711 9.81306 21.4743C10.5129 21.6544 11.2458 21.75 12 21.75C12.7542 21.75 13.4871 21.6544 14.1869 21.4743C14.5881 21.3711 14.8296 20.9622 14.7263 20.561C14.6231 20.1599 14.2142 19.9184 13.8131 20.0217C13.2344 20.1706 12.627 20.25 12 20.25C11.373 20.25 10.7656 20.1706 10.1869 20.0217Z" fill="currentColor"></path></g>`
            },
            'folder': {
                viewBox: '0 0 400 400',
                content: `<g transform="translate(0,-652.36216)"><path fill="currentColor" d="m 237.4297,701.86214 0,40 -186,0 0,49.6914 -51.4297,0 0,211.30866 400,0 0,-300.00006 0,-1 -137.5703,0 z m 25,25 112.5703,0 0,251 -50,0 0,-185.42 -0.1621,0 0,-0.8886 -248.4082,0 0,-24.6914 186,0.9453 z"></path></g>`
            },
            'yearInReview': {
                viewBox: '0 0 16 16',
                content: `<path fill="currentColor" fill-rule="evenodd" d="M8,0 C8.51283143,0 8.93550653,0.386039974 8.9932722,0.883378828 L9,1 L11,1 L11,2 L13,2 C13.51285,2 13.9355092,2.38604429 13.9932725,2.88337975 L14,3 L14,15 C14,15.51285 13.613973,15.9355092 13.1166239,15.9932725 L13,16 L3,16 C2.48716857,16 2.06449347,15.613973 2.0067278,15.1166239 L2,15 L2,3 C2,2.48716857 2.38604429,2.06449347 2.88337975,2.0067278 L3,2 L5,2 L5,1 L7,1 C7,0.447715 7.44772,0 8,0 Z M5,4 L4,4 L4,14 L12,14 L12,4 L11,4 L11,5 L5,5 L5,4 Z M10.5352,7.29289 C10.9258,7.68342 10.9258,8.31658 10.5352,8.70711 L7.70711,11.5352 C7.31658,11.9258 6.68342,11.9258 6.29289,11.5352 L5.29289,10.5352 C4.90237,10.1447 4.90237,9.51154 5.29289,9.12102 C5.68342,8.73049 6.31658,8.73049 6.70711,9.12102 L7,9.41391 L9.12102,7.29289 C9.51154,6.90237 10.1447,6.90237 10.5352,7.29289 Z M8,2 C7.44772,2 7,2.44772 7,3 C7,3.55228 7.44772,4 8,4 C8.55228,4 9,3.55228 9,3 C9,2.44772 8.55228,2 8,2 Z"></path>`
            },
            'insights': {
                viewBox: '0 0 24 24',
                content: `<path d="M11 6C13.7614 6 16 8.23858 16 11M16.6588 16.6549L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>`
            },
            'achievement': {
                viewBox: '0 0 512 512',
                content: `<g><polygon fill="currentColor" points="239.266,387.893 212.245,371.584 212.245,512 299.755,512 299.755,364.066 289.468,358.608 "></polygon><polygon fill="currentColor" points="316.489,512 403.991,512 403.991,419.375 316.489,372.948 "></polygon><polygon fill="currentColor" points="420.725,428.257 420.725,512 494.459,512 494.459,467.379 "></polygon><polygon fill="currentColor" points="108.009,512 195.511,512 195.511,361.476 108.009,308.643 "></polygon><polygon fill="currentColor" points="17.541,512 91.275,512 91.275,298.536 17.541,254.021 "></polygon><path fill="currentColor" d="M228.325,77.514c21.358-1.986,37.071-20.918,35.077-42.276c-1.977-21.343-20.901-37.048-42.267-35.07 c-21.343,1.978-37.055,20.902-35.07,42.268C188.043,63.787,206.959,79.491,228.325,77.514z"></path><path fill="currentColor" d="M359.999,310.898l-18.548-61.044c-0.76,1.324-1.528,2.648-2.402,3.906 c-8.49,12.208-21.841,20.003-36.646,21.368l-6.824,0.465l19.448,47.162c4.126,6.831,9.224,13.025,15.14,18.393l50.57,45.92 c7.133,6.202,17.919,5.614,24.349-1.332l0.458-0.474c6.406-6.928,6.177-17.681-0.498-24.333L359.999,310.898z"></path><polygon fill="currentColor" points="231.324,123.336 244.266,128.532 248.107,114.38 240.115,100.777 224.861,112.314 "></polygon><path fill="currentColor" d="M225.996,350.601l0.687-0.164c9.168-2.272,14.977-11.275,13.253-20.541l-11.137-59.762l73.456-5.099 c10.541-0.736,20.199-6.21,26.229-14.888c6.038-8.694,7.795-19.643,4.813-29.79l-2.762-9.356l-22.968-83.662l39.375,2.124 l31.474,30.322c-1.52,1.855-2.28,4.282-1.667,6.798l2.574,10.418l-18.303,4.519c-4.33,1.054-6.97,5.434-5.899,9.764l12.321,49.998 c1.078,4.339,5.45,6.978,9.773,5.924l77.656-19.152c4.339-1.079,6.978-5.459,5.908-9.797l-12.33-49.989 c-1.062-4.322-5.442-6.978-9.772-5.924l-18.303,4.518l-2.566-10.402c-1.046-4.224-5.319-6.806-9.552-5.768l-1.912,0.474 c-0.433-1.773-1.218-3.489-2.394-5.025l-30.788-40.372c-3.317-4.347-8.048-7.41-13.367-8.645l-50.636-18.123 c-17.134-6.128-36.05-3.554-50.986,6.618l-4.388,62.311l-40.332-28.238l-28.148,21.596l-45.553-16.44 c-7.141-3.162-15.484-0.122-18.899,6.888l-0.474,0.964c-1.683,3.481-1.929,7.476-0.654,11.112c1.266,3.652,3.947,6.635,7.443,8.318 l54.908,26.212c6.831,3.268,14.781,3.236,21.588-0.082l29.276-19.471l20.084,57.588l-48.592,4.257 c-8.178,0.743-15.623,5.098-20.256,11.88c-4.624,6.781-5.973,15.287-3.685,23.189l24.153,82.598 C207.326,347.471,216.731,352.88,225.996,350.601z M410.078,158.062l0.368,0.212l2.566,10.41l-26.318,6.495l-2.492-10.09 c4.886,4.004,11.864,4.306,16.939,0.384l0.294-0.221c2.124-1.643,3.612-3.8,4.461-6.152L410.078,158.062z M275.169,198.076 c0.245,2.656-1.692,4.976-4.339,5.237c-2.639,0.229-4.976-1.7-5.237-4.347c-0.238-2.656,1.7-4.992,4.355-5.229 C272.578,193.491,274.924,195.42,275.169,198.076z M262.357,167.41c2.631-0.245,4.976,1.684,5.222,4.331 c0.245,2.656-1.7,5.001-4.339,5.238c-2.639,0.237-4.984-1.692-5.221-4.339C257.765,169.992,259.709,167.655,262.357,167.41z"></path></g>`
            },
            'pattern': {
                viewBox: '0 0 24 24',
                content: `<g fill="none"><circle cx="3.41" cy="3.41" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="12" cy="3.41" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="20.59" cy="3.41" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="3.41" cy="12" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="12" cy="12" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="20.59" cy="12" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="3.41" cy="20.59" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="12" cy="20.59" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><circle cx="20.59" cy="20.59" r="1.91" stroke="currentColor" stroke-width="1.91"></circle><line x1="10.65" y1="10.65" x2="4.76" y2="4.76" stroke="currentColor" stroke-width="1.91"></line><line x1="12" y1="18.68" x2="12" y2="13.91" stroke="currentColor" stroke-width="1.91"></line><line x1="18.68" y1="3.41" x2="13.91" y2="3.41" stroke="currentColor" stroke-width="1.91"></line><line x1="10.09" y1="3.41" x2="5.32" y2="3.41" stroke="currentColor" stroke-width="1.91"></line></g>`
            },
            'funFact': {
                viewBox: '0 0 24 24',
                content: `<path fill-rule="evenodd" clip-rule="evenodd" d="M3.4 4h17.2A2.4 2.4 0 0 1 23 6.4v11.2a2.4 2.4 0 0 1-2.4 2.4H3.4A2.4 2.4 0 0 1 1 17.6V6.4A2.4 2.4 0 0 1 3.4 4ZM4 9a1 1 0 0 1 1-1h5a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1Zm1 2a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H5Zm0 3a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2H5Zm10.707.707 4-4a1 1 0 0 0-1.414-1.414L15 12.586l-1.293-1.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0Z" fill="currentColor"></path>`
            }

        };

        const iconDef = icons[name] || icons['graph'];
        const viewBox = iconDef.viewBox || "0 0 16 16";
        const content = iconDef.content || iconDef;

        return `<svg viewBox="${viewBox}" width="${size}" height="${size}" fill="currentColor" style="display: inline-block; vertical-align: text-bottom;">${content}</svg>`;
    }

    static generateAllSlides(data, insights, summary) {
        const slides = [
            this.createWelcomeSlide(data),
            this.createContributionsSlide(data),
            this.createLanguagesSlide(data),
            this.createProductivitySlide(data),
            this.createBiggestProjectSlide(data),
            this.createInsightsSlide(insights),
            this.createSummarySlide(data, summary, insights),
            this.createShareSlide(data)
        ];

        return slides.join('');
    }

    // Slide 1: Welcome
    static createWelcomeSlide(data) {
        return `
            <div class="slide active" data-slide="0">
                <div class="slide-content">
                    <div class="welcome-avatar">
                        <img src="${data.profile.avatar}" alt="${data.profile.name}" class="avatar-image">
                        <div class="avatar-ring"></div>
                    </div>
                    <h1 class="slide-title gradient-text">${data.profile.name}</h1>
                    <p class="slide-subtitle">Your ${data.year} GitHub Wrapped</p>
                    <div class="welcome-stats">
                        <div class="welcome-stat">
                            <div class="stat-value">${data.commits.total}</div>
                            <div class="stat-label">Commits</div>
                        </div>
                        <div class="welcome-stat">
                            <div class="stat-value">${data.repoCount}</div>
                            <div class="stat-label">Repositories</div>
                        </div>
                        <div class="welcome-stat">
                            <div class="stat-value">${data.totalStars}</div>
                            <div class="stat-label">Stars</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Slide 2: Total Contributions
    static createContributionsSlide(data) {
        const avgPerDay = (data.commits.total / 365).toFixed(1);
        const mostActiveMonth = this.getMostActiveMonth(data.commits.byMonth);

        return `
            <div class="slide" data-slide="1">
                <div class="slide-content">
                    <div class="slide-icon">${this.getIcon('graph', 80)}</div>
                    <h2 class="slide-title">Your Contribution Story</h2>
                    <div class="big-number gradient-text" id="commit-counter">0</div>
                    <p class="slide-subtitle">commits in ${data.year}</p>
                    <div class="contribution-details">
                        <div class="detail-item">
                            <span class="detail-icon" style="width: 24px">${this.getIcon('calendar', 24)}</span>
                            <span class="detail-text">${avgPerDay} commits per day</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-icon" style="width: 24px">${this.getIcon('flame', 24)}</span>
                            <span class="detail-text">Most active in ${mostActiveMonth}</span>
                        </div>
                    </div>
                    <div id="contribution-heatmap" class="chart-container"></div>
                </div>
            </div>
        `;
    }

    // Slide 3: Top Languages
    static createLanguagesSlide(data) {
        const topLang = data.languages[0]?.name || 'Code';
        const langCount = data.languages.length;

        return `
            <div class="slide" data-slide="2">
                <div class="slide-content">
                    <div class="slide-icon">${this.getIcon('code', 80)}</div>
                    <h2 class="slide-title">Your Language Mix</h2>
                    <p class="slide-subtitle">You coded in ${langCount} different languages</p>
                    <div class="top-language">
                        <div class="top-lang-label">Top Language</div>
                        <div class="top-lang-name gradient-text">${topLang}</div>
                        <div class="top-lang-percentage">${data.languages[0]?.percentage || 0}%</div>
                    </div>
                    <div id="language-chart" class="chart-container"></div>
                </div>
            </div>
        `;
    }

    // Slide 4: Most Productive Time
    static createProductivitySlide(data) {
        const { day, hour, timeOfDay } = data.productiveTime;
        // Use proper clock icon instead of generic emoji
        const icon = this.getIcon('clock', 80);

        return `
            <div class="slide" data-slide="3">
                <div class="slide-content">
                    <div class="slide-icon">${icon}</div>
                    <h2 class="slide-title">Your Peak Coding Time</h2>
                    <div class="productivity-info">
                        <div class="productivity-day-title gradient-text">${day}s</div>
                        <div class="productivity-time">at ${hour}:00 (${timeOfDay})</div>
                    </div>
                    <p class="slide-subtitle">When the magic happens ✨</p>
                    <div id="productivity-chart" class="chart-container"></div>
                </div>
            </div>
        `;
    }

    // Slide 5: Biggest Project
    static createBiggestProjectSlide(data) {
        const project = data.biggestProject;

        if (!project) {
            return `
                <div class="slide" data-slide="4">
                    <div class="slide-content">
                        <div class="slide-icon">${this.getIcon('folder', 80)}</div>
                        <h2 class="slide-title">Your Projects</h2>
                        <p class="slide-subtitle">You worked on ${data.repoCount} repositories this year!</p>
                    </div>
                </div>
            `;
        }

        return `
            <div class="slide" data-slide="4">
                <div class="slide-content">
                    <div class="slide-icon">${this.getIcon('folder', 80)}</div>
                    <h2 class="slide-title">Your Biggest Project</h2>
                    <div class="project-card">
                        <h3 class="project-name gradient-text">${project.name}</h3>
                        ${project.description ? `<p class="project-description">${project.description}</p>` : ''}
                        <div class="project-stats">
                            <div class="project-stat">
                                <span class="stat-icon">${this.getIcon('star', 20)}</span>
                                <span class="stat-value">${project.stars}</span>
                                <span class="stat-label">Stars</span>
                            </div>
                            <div class="project-stat">
                                <span class="stat-icon">${this.getIcon('fork', 20)}</span>
                                <span class="stat-value">${project.forks}</span>
                                <span class="stat-label">Forks</span>
                            </div>
                            ${project.language ? `
                            <div class="project-stat">
                                <span class="stat-icon">${this.getIcon('code', 20)}</span>
                                <span class="stat-value">${project.language}</span>
                                <span class="stat-label">Language</span>
                            </div>
                            ` : ''}
                        </div>
                        <a href="${project.url}" target="_blank" class="project-link">View on GitHub →</a>
                    </div>
                </div>
            </div>
        `;
    }

    // Slide 6: AI Insights
    static createInsightsSlide(insights) {
        return `
            <div class="slide" data-slide="5">
                <div class="slide-content">
                    <div class="slide-icon">${this.getIcon('insights', 80)}</div>
                    <h2 class="slide-title">AI-Powered Insights</h2>
                    <p class="slide-subtitle">What your code says about you</p>
                    <div class="insights-grid">
                        <div class="insight-card">
                            <div class="insight-icon">${this.getIcon('achievement', 32)}</div>
                            <div class="insight-title">Achievement</div>
                            <div class="insight-text">${insights.achievement}</div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-icon">${this.getIcon('pattern', 32)}</div>
                            <div class="insight-title">Pattern</div>
                            <div class="insight-text">${insights.pattern}</div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-icon">${this.getIcon('graph', 32)}</div>
                            <div class="insight-title">Growth</div>
                            <div class="insight-text">${insights.growth}</div>
                        </div>
                        <div class="insight-card">
                            <div class="insight-icon">${this.getIcon('funFact', 32)}</div>
                            <div class="insight-title">Fun Fact</div>
                            <div class="insight-text">${insights.funFact}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Slide 7: Year Summary
    static createSummarySlide(data, summary, insights) {
        return `
            <div class="slide" data-slide="6">
                <div class="slide-content">
                    <div class="slide-icon">${this.getIcon('yearInReview', 80)}</div>
                    <h2 class="slide-title">${data.year} in Review</h2>
                    <div class="summary-text">${summary}</div>
                    <div class="summary-highlights">
                        <div class="highlight-item">
                            <div class="highlight-value gradient-text">${data.commits.total}</div>
                            <div class="highlight-label">Total Commits</div>
                        </div>
                        <div class="highlight-item">
                            <div class="highlight-value gradient-text">${data.languages.length}</div>
                            <div class="highlight-label">Languages Used</div>
                        </div>
                        <div class="highlight-item">
                            <div class="highlight-value gradient-text">${data.repoCount}</div>
                            <div class="highlight-label">Repositories</div>
                        </div>
                        <div class="highlight-item">
                            <div class="highlight-value gradient-text">${data.totalStars}</div>
                            <div class="highlight-label">Stars Earned</div>
                        </div>
                    </div>
                    <div class="motivation-message">
                        <p>${insights.motivation}</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Slide 8: Share
    static createShareSlide(data) {
        return `
            <div class="slide" data-slide="7">
                <div class="slide-content">
                    <div class="slide-icon">${this.getIcon('share', 80)}</div>
                    <h2 class="slide-title">Share Your Wrapped!</h2>
                    <p class="slide-subtitle">Show the world your coding journey</p>
                    <div class="share-preview">
                        <div class="share-card">
                            <div class="share-header">
                                <img src="${data.profile.avatar}" alt="${data.profile.name}" class="share-avatar">
                                <div class="share-info">
                                    <div class="share-name">${data.profile.name}</div>
                                    <div class="share-year">GitHub Wrapped ${data.year}</div>
                                </div>
                            </div>
                            <div class="share-stats">
                                <div class="share-stat">
                                    <div class="share-stat-value">${data.commits.total}</div>
                                    <div class="share-stat-label">Commits</div>
                                </div>
                                <div class="share-stat">
                                    <div class="share-stat-value">${data.languages[0]?.name || 'Code'}</div>
                                    <div class="share-stat-label">Top Language</div>
                                </div>
                                <div class="share-stat">
                                    <div class="share-stat-value">${data.totalStars}</div>
                                    <div class="share-stat-label">Stars</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="share-actions">
                        <button class="share-action-btn twitter-btn">
                            <span>Share on Twitter</span>
                        </button>
                        <button class="share-action-btn linkedin-btn">
                            <span>Share on LinkedIn</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Helper: Get most active month
    static getMostActiveMonth(byMonth) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const maxIndex = byMonth.indexOf(Math.max(...byMonth));
        return months[maxIndex];
    }

    // Helper: Get time emoji
    static getTimeEmoji(timeOfDay) {
        // Keep emojis for text description if needed, but we use icon for main slide
        const emojis = {
            'Morning': '🌅',
            'Afternoon': '☀️',
            'Evening': '🌆',
            'Night': '🌙'
        };
        return emojis[timeOfDay] || '⏰';
    }
}

// Export for use in other modules
window.Slides = Slides;
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

Check out your own coding year in review! 👇
#GitHubWrapped #CodingJourney #Developer2024`;
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

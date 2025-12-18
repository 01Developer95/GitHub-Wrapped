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

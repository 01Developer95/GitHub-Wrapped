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

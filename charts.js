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

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

// Auto Year Detection and Update
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 0-indexed, so add 1

    // Determine which year's wrapped to show
    let wrappedYear;
    if (currentMonth <= 3) {
        wrappedYear = currentYear - 1;
    } else {
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
        // Clear existing fallback options
        yearSelect.innerHTML = '';

        // Generate options from current year down to 2020
        // (Include current year if we're in December, otherwise start from last year)
        const startYear = (currentMonth === 12) ? currentYear : (currentMonth > 6 ? currentYear : currentYear - 1);
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
        console.log(`Year selector populated with years ${startYear} to 2020`);
    } else {
        console.error('Year select element not found!');
    }

    // Update demo data year if exists
    if (window.DemoData && typeof window.DemoData.updateYear === 'function') {
        window.DemoData.updateYear(wrappedYear);
    }
});

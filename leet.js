document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.getElementById("stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.getElementById("stats-cards");
    const loadingSpinner = document.querySelector(".loading-spinner");
    const btnText = document.querySelector(".btn-text");

    // Add enter key support
    usernameInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            searchButton.click();
        }
    });

    // Add input validation with real-time feedback
    usernameInput.addEventListener("input", function() {
        const username = this.value;
        if (username && !validateUsername(username, false)) {
            this.style.borderColor = "#e53e3e";
        } else {
            this.style.borderColor = "#e2e8f0";
        }
    });

    function validateUsername(username, showAlert = true) {
        if (username.trim() === "") {
            if (showAlert) showError("Username cannot be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,40}$/;
        const isMatching = regex.test(username);
        if (!isMatching && showAlert) {
            showError("Invalid username format. Use only letters, numbers, underscores, and hyphens (max 15 characters)");
        }
        return isMatching;
    }

    function showError(message) {
        // Remove existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) existingError.remove();

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        const searchCard = document.querySelector('.search-card');
        searchCard.appendChild(errorDiv);

        // Remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    async function fetchUserData(username) {
        try {
            setLoadingState(true);
            hideStats();

            const url = `https://leetcode-stats-api.herokuapp.com/${username}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }

            const data = await response.json();
            
            if (data.errors) {
                throw new Error('User not found');
            }

            displayUserData(data, username);
            showStats();

        } catch (error) {
            console.error('Error:', error);
            showError(error.message === 'User not found' ? 
                'User not found. Please check the username and try again.' : 
                'Unable to fetch user data. Please try again later.');
        } finally {
            setLoadingState(false);
        }
    }

    function setLoadingState(isLoading) {
        if (isLoading) {
            loadingSpinner.style.display = 'inline-block';
            btnText.textContent = 'Searching...';
            searchButton.disabled = true;
        } else {
            loadingSpinner.style.display = 'none';
            btnText.textContent = 'Search';
            searchButton.disabled = false;
        }
    }

    function hideStats() {
        statsContainer.classList.remove('show');
    }

    function showStats() {
        setTimeout(() => {
            statsContainer.classList.add('show');
        }, 300);
    }

    function displayUserData(data, username) {
        const {totalQuestions: totalQues , totalEasy: totalEasyQues, totalMedium: totalMediumQues, totalHard: totalHardQues, totalSolved: solvedTotalQues, easySolved: solvedEasyQues, mediumSolved: solvedMediumQues, hardSolved: solvedHardQues} = data;
        // Update progress circles with animation
        setTimeout(() => updateProgress(solvedEasyQues, totalEasyQues, easyLabel, easyProgressCircle), 500);
        setTimeout(() => updateProgress(solvedMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle), 700);
        setTimeout(() => updateProgress(solvedHardQues, totalHardQues, hardLabel, hardProgressCircle), 900);

        // Create stats cards
        const cardData = [
            {
                label: "Total Problems Solved",
                value: solvedTotalQues.toLocaleString(),
                icon: "🎯"
            },
            {
                label: "Easy Problems",
                value: solvedEasyQues.toLocaleString(),
                icon: "🟢"
            },
            {
                label: "Medium Problems",
                value: solvedMediumQues.toLocaleString(),
                icon: "🟡"
            },
            {
                label: "Hard Problems",
                value: solvedHardQues.toLocaleString(),
                icon: "🔴"
            }
        ];

        cardStatsContainer.innerHTML = cardData.map((data, index) => `
            <div class="card" style="animation: slideInUp 0.6s ease-out ${0.1 * (index + 1)}s both;">
                <h3>${data.icon} ${data.label}</h3>
                <div class="card-value">${data.value}</div>
            </div>
        `).join('');

        // Add pulse animation to circles after they're displayed
        setTimeout(() => {
            document.querySelectorAll('.circle').forEach(circle => {
                circle.classList.add('pulse');
                setTimeout(() => circle.classList.remove('pulse'), 2000);
            });
        }, 1500);
    }

    function updateProgress(solved, total, label, circle) {
        const progressPercentage = total > 0 ? (solved / total) * 100 : 0;
        
        // Animate progress circle
        let currentProgress = 0;
        const increment = progressPercentage / 30; // 30 frames for smooth animation
        
        const animateProgress = () => {
            if (currentProgress <= progressPercentage) {
                currentProgress += increment;
                circle.style.setProperty("--progress-degree", `${Math.min(currentProgress, progressPercentage)}%`);
                requestAnimationFrame(animateProgress);
            }
        };
        
        animateProgress();
        label.textContent = `${solved}/${total}`;
    }

    searchButton.addEventListener('click', function () {
        const username = usernameInput.value.trim();
        if (validateUsername(username)) {
            fetchUserData(username);
        }
    });
});

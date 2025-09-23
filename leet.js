
document.addEventListener("DOMContentLoaded", function () {
    const searchbutton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easylabel = document.getElementById("easy-label");
    const mediumlabel = document.getElementById("medium-label");
    const hardlabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }
    async function fetchDetails(username) {
        try {
            searchbutton.textContent = "Searching...";
            searchbutton.disabled = true;
            

            // const url = `https://leetcode-stats-api.herokuapp.com/${username}`;
            const url = 'https://leetcode.com/graphql/';

            // another way
            const proxyurl = 'https://cors-anywhere.herokuapp.com/';
            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");
            const graphql = JSON.stringify({
                query: "\n query userSessionProgress($username: String!){\n allQuestionsCount {\ndifficulty\ncount\n}\nmatchedUser(username: $username) {\nsubmitStats {\nacSubmissionNum {\ndifficulty\ncount\nsubmissions\n}\ntotalSubmissionNum {\ndifficulty\ncount\nsubmissions\n}\n}\n }\n}\n ", variables:{"username": `${username}`}
            })
            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphql,
            };
            const response = await fetch(proxyurl+url, requestOptions);
            if (!response.ok) {
                throw new Error("Unable to fecth user details.");
            }
            const parsedData = await response.json();
            console.log("Loaded Data: ", parsedData);

            displayData(parsedData);
        }
        catch (error) {
            statsContainer.innerHtml = `<p>User not found</p>`;
        }
        finally {
            searchbutton.textContent = `Search`;
            searchbutton.disabled = false;
        }
    }
    function displayData(parsedData){
        // const {totalQuestions: totalQues , totalEasy: totalEasyQues, totalMedium: totalMediumQues, totalHard: totalHardQues, totalSolved: solvedTotalQues, easySolved: solvedEasyQues, mediumSolved: solvedMediumQues, hardSolved: solvedHardQues} = parsedData;

        // another way
        const totalQues = parsedData.data.allQuestionsCount[0].count;
        const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
        const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
        const totalHardQues = parsedData.data.allQuestionsCount[3].count;

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
        const solvedEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
        const solvedMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
        const solvedHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

        updateProgress(solvedEasyQues, totalEasyQues, easylabel, easyProgressCircle);
        updateProgress(solvedMediumQues, totalMediumQues, mediumlabel, mediumProgressCircle);
        updateProgress(solvedHardQues, totalHardQues, hardlabel, hardProgressCircle);

        const cardData = [
            {
                label : "Overall Submissions", value: solvedTotalQues
            },
            {
                label : "Overall Easy Submissions", value: solvedEasyQues
            },
            {
                label : "Overall Medium Submissions", value: solvedMediumQues
            },
            {
                label : "Overall Hard Submissions", value: solvedHardQues
            },
        ];
        console.log("data of card: ", cardData);

        cardStatsContainer.innerHTML = cardData.map(
            data => `
                    <div class = "card">
                    <h3>${data.label}</h3>
                    <p>${data.value}</p>
                    </div>`
        ).join("")
    }
    function updateProgress(solved, total, label, circle){
        const progressDegree = (solved/total)*100;
        circle.style.setProperty("--progress-degree", `${progressDegree}%`);
        label.textContent = `${solved}/${total}`;
    }
    searchbutton.addEventListener('click', function () {
        const username = usernameInput.value;
        console.log("logging username: ", username);
        if(validateUsername(username)){
            fetchDetails(username)
        }
    })
}
)

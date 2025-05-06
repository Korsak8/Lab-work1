const frequencies = [16, 8, 4, 2, 1];
const sizes = [128, 256, 512, 1024, 2048];
let totalTests = frequencies.length * sizes.length;
let completedTests = 0;

function updateProgress() {
    completedTests++;
    const percent = Math.round((completedTests / totalTests) * 100);
    document.getElementById('progressBar').style.width = `${percent}%`;
}

async function startTests() {
    const runButton = document.getElementById("runButton");
    runButton.disabled = true;
    const tableBody = document.getElementById("results");
    tableBody.innerHTML = '';
    completedTests = 0;
    document.getElementById('progressBar').style.width = '0%';

    for (let freq of frequencies) {
        for (let size of sizes) {
            await runTest(freq, size);
            updateProgress();
        }
    }

    runButton.disabled = false;
}

async function runTest(freq, size) {
    let results = [];
    const interval = 1000 / freq;

    for (let i = 0; i < 10; i++) {
        let requestData = new Uint8Array(size).fill(65);
        let startTime = Date.now();

        try {
            let response = await fetch("/test", {
                method: "POST",
                body: JSON.stringify({ timestamp: startTime, data: Array.from(requestData) }),
                headers: { "Content-Type": "application/json" }
            });

            let rtt = Date.now() - startTime;
            results.push(rtt);
        } catch (error) {
            console.error("Request failed:", error);
            results.push(0);
        }

        await new Promise(resolve => setTimeout(resolve, interval));
    }

    analyzeResults(freq, size, results);
}

function analyzeResults(freq, size, results) {
    results.sort((a, b) => a - b);
    let min = Math.min(...results);
    let max = Math.max(...results);
    let median = results[Math.floor(results.length / 2)];
    let mean = results.reduce((sum, val) => sum + val, 0) / results.length;
    let stdDev = Math.sqrt(results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length);
    let skewness = stdDev !== 0 
        ? results.reduce((sum, val) => sum + Math.pow(val - mean, 3), 0) / (results.length * Math.pow(stdDev, 3)) 
        : 0;

    const tableBody = document.getElementById("results");
    const row = document.createElement("tr");
    
    row.innerHTML = `
        <td>${freq}</td>
        <td>${size}</td>
        <td>${min.toFixed(2)}</td>
        <td>${max.toFixed(2)}</td>
        <td>${median.toFixed(2)}</td>
        <td>${mean.toFixed(2)}</td>
        <td>${stdDev.toFixed(2)}</td>
        <td>${skewness.toFixed(2)}</td>
    `;
    
    tableBody.appendChild(row);
}
const frequencies = [16, 8, 4, 2, 1]; // Частоти (кількість запитів на секунду)
const sizes = [128, 256, 512, 1024, 2048]; // Розміри даних у байтах

// Функція для запуску всіх тестів
async function startTests() {
    const runButton = document.getElementById("runButton");
    runButton.disabled = true; // Вимикаємо кнопку запуску на час тестування
    const tableBody = document.getElementById("results");
    tableBody.innerHTML = ''; // Очищаємо таблицю результатів

    // Для кожної частоти і кожного розміру проводимо тест
    for (let freq of frequencies) {
        for (let size of sizes) {
            await runTest(freq, size);
        }
    }

    runButton.disabled = false; // Після завершення — знову активуємо кнопку
}

// Функція, що виконує 10 тестових запитів для заданих частоти і розміру
async function runTest(freq, size) {
    let results = [];
    const interval = 1000 / freq; // Інтервал між запитами в мілісекундах

    for (let i = 0; i < 10; i++) {
        let requestData = new Uint8Array(size).fill(65); // Формуємо масив із символом 'A' (ASCII 65)
        let startTime = Date.now(); // Фіксуємо час початку запиту

        try {
            let response = await fetch("/test", {
                method: "POST",
                body: JSON.stringify({ timestamp: startTime, data: Array.from(requestData) }),
                headers: { "Content-Type": "application/json" }
            });

            let rtt = Date.now() - startTime; // Час відповіді (RTT)
            results.push(rtt); // Додаємо результат
            console.log(`RTT: ${rtt}ms`);
        } catch (error) {
            console.error("Request failed:", error); // У разі помилки виводимо її в консоль
        }

        // Затримка перед наступним запитом
        await new Promise(resolve => setTimeout(resolve, interval));
    }

    // Аналізуємо результати після завершення 10 запитів
    analyzeResults(freq, size, results);
}

// Функція аналізу статистичних характеристик результатів
function analyzeResults(freq, size, results) {
    results.sort((a, b) => a - b); // Сортуємо результати
    let min = Math.min(...results); // Мінімальне значення
    let max = Math.max(...results); // Максимальне значення
    let median = results[Math.floor(results.length / 2)]; // Медіана
    let mean = results.reduce((sum, val) => sum + val, 0) / results.length; // Середнє значення
    let stdDev = Math.sqrt(results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length); // Стандартне відхилення
    let skewness = stdDev !== 0 
        ? results.reduce((sum, val) => sum + Math.pow(val - mean, 3), 0) / (results.length * Math.pow(stdDev, 3)) 
        : 0; // Коефіцієнт асиметрії

    const tableBody = document.getElementById("results");
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${freq}</td>
        <td>${size}</td>
        <td>${min.toFixed(2)} ms</td>
        <td>${max.toFixed(2)} ms</td>
        <td>${median.toFixed(2)} ms</td>
        <td>${mean.toFixed(2)} ms</td>
        <td>${stdDev.toFixed(2)} ms</td>
        <td>${skewness.toFixed(2)}</td>
    `;
    tableBody.appendChild(row); // Додаємо рядок до таблиці
}

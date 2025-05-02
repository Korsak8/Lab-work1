const http = require("http"); // Імпортуємо модуль для створення HTTP-сервера
const fs = require("fs"); // Імпортуємо модуль для роботи з файловою системою
const path = require("path"); // Імпортуємо модуль для обробки шляхів до файлів

const PORT = 3000; // Вказуємо порт, на якому буде працювати сервер

// Створюємо HTTP-сервер
const server = http.createServer((req, res) => {
    if (req.method === "GET") {
        let filePath = req.url === "/" ? "index.html" : req.url.slice(1);
        let extname = path.extname(filePath); // Отримуємо розширення файлу

        let contentType = "text/html";
        switch (extname) {
            case ".js":
                contentType = "application/javascript";
                break;
            case ".json":
                contentType = "application/json";
                break;
        }

        // Читаємо файл із файлової системи
        fs.readFile(path.join(__dirname, filePath), (err, data) => {
            if (err) { // Якщо сталася помилка при читанні
                res.writeHead(404, { "Content-Type": "text/plain" }); // Відповідь 404
                res.end("Not Found"); // Повідомлення про помилку
            } else { // Якщо файл успішно прочитано
                res.writeHead(200, { "Content-Type": contentType }); // Відповідь 200 з правильним типом
                res.end(data); // Надсилаємо файл клієнту
            }
        });
    }
    else if (req.method === "POST" && req.url === "/test") {
        // Обробка POST-запиту на /test
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "success" })); // Відповідь у форматі JSON
    }
    else {
        // Якщо метод не підтримується
        res.writeHead(405, { "Content-Type": "text/plain" });
        res.end("Method Not Allowed"); // Відповідь про заборонений метод
    }
});

// Запускаємо сервер на вказаному порту
server.listen(PORT, () => {
    console.log(`Сервер запущений на: http://localhost:${PORT}`);
});

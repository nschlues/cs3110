const http = require('http');

// Global state - declared outside handleRequest so it persists across requests
let items = ["apple", "banana", "cherry"];

const handleRequest = (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const queryParams = parsedUrl.searchParams;
    const pathname = parsedUrl.pathname;

    if (pathname === "/api") {

        // --- GET ---
        if (req.method === "GET") {
            const index = queryParams.get("index");

            if (index === null) {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ items }));
            }
            else if (!items[index]) {
                res.writeHead(404, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Item not found at that index" }));
            }
            else {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ item: items[index] }));
            }
        }

        // --- POST ---
        else if (req.method === "POST") {
            let body = "";
            req.on("data", (chunk) => { body += chunk.toString(); });
            req.on("end", () => {
                const params = new URLSearchParams(body);
                const newItem = params.get("item");

                if (newItem === null) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Missing required field" }));
                    return;
                }

                items.push(newItem);
                console.log("Received POST data:", body);
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Data Created!", items }));
            });
        }

                // --- PUT ---
        else if (req.method === "PUT") {
            let body = "";
            req.on("data", (chunk) => { body += chunk.toString(); }); // fixed =+
            req.on("end", () => {
                const params = new URLSearchParams(body);
                const index = params.get("index");
                const newValue = params.get("item");

                if (index === null || !newValue) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Missing required fields: index and item" }));
                    return;
                }

                if (!items[index]) {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Item not found at specified index." }));
                    return;
                }

                items[index] = newValue;
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Item updated!", items }));
            });
        }

        // --- DELETE ---
        else if (req.method === "DELETE") {
            let body = "";
            req.on("data", (chunk) => { body += chunk.toString(); });
            req.on("end", () => {
                const params = new URLSearchParams(body);
                const index = params.get("index");

                if (index === null) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Missing required field: index" }));
                    return;
                }

                if (!items[index]) {
                    res.writeHead(404, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Item not found at that index." }));
                    return;
                }

                const removed = items.splice(index, 1);
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Item deleted!", removed, items }));
            });
        }
    }

    // Catch-all
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Route not found." }));
    }
};

// AJAX GET on page load
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("https://freechess.crabdance.com/api");
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    
    const json = await response.json();

    // Access a the list from the JSON
    const items = json.items;

    // Create new list items in the DOM
    const ul = document.getElementById("item-list");
    items.forEach(item => {
        console.log(item);
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
    });

  } catch (error) {
    console.error("Fetch failed:", error);
  }
});


const server = http.createServer(handleRequest);
server.listen(3000, () => {
    console.log("Server is running on port 3000...");
});
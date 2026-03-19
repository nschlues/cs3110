// Imports
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');

// Global state - declared outside handleRequest so it persists across requests
let items = ["apple", "banana", "cherry"];

// Authentication helper functions
function sha256(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

function parseBasicAuth(authHeader) {
    if (!authHeader || !authHeader.startsWith("Basic ")) { return null; }

    const base64 = authHeader.split(" ")[1];
    const decoded = Buffer.from(base64, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');
    return { username, password };
}

function authenticate(request) {
    // Parse the credentials to try to authenticate
    const parsedCredentials = parseBasicAuth(request.headers['authorization']);
    if (!parsedCredentials) {
        return null;
    }

    // If credentials were parsed, see if they corespond to an exisiting user
    const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
    return users.find(user =>
        user.username === parsedCredentials.username &&
        user.passHash === sha256(parsedCredentials.password)
    // Otherwise, return null
    ) || null;
}

const handleRequest = (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const queryParams = parsedUrl.searchParams;
    const pathname = parsedUrl.pathname;

    // Logout path
    if (pathname === "/logout") {
        res.writeHead(401, { "WWW-Authenticate": "Basic", "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Logged out" }));
        return;
    }

    // API Routes
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

        // --- POST authenticated---
        else if (req.method === "POST") {
            // Check that the user is authenticated before completing the request
            const user = authenticate(req);
            if (!user){
                res.writeHead(401, { "WWW-Authenticate": "Basic", "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Unauthorized" }));
                return;
            }

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

                // --- PUT Authenticated---
        else if (req.method === "PUT") {
            // Check that the user is authenticated before completing the request
            const user = authenticate(req);
            if (!user){
                res.writeHead(401, { "WWW-Authenticate": "Basic", "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Unauthorized" }));
                return;
            }

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

        // --- DELETE Authenticated---
        else if (req.method === "DELETE") {
            // Check that the user is authenticated before completing the request
            const user = authenticate(req);
            if (!user){
                res.writeHead(401, { "WWW-Authenticate": "Basic", "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Unauthorized" }));
                return;
            }

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

    // --- ADMIN: CREATE USER ---
    else if (pathname === "/admin/users") {
        if (req.method === "POST") {
            const user = authenticate(req);
            if (!user) {
                res.writeHead(401, { "WWW-Authenticate": "Basic", "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Unauthorized" }));
                return;
            }
            if (user.role !== "admin") {
                res.writeHead(403, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Forbidden: admins only" }));
                return;
            }
            let body = "";
            req.on("data", (chunk) => { body += chunk.toString(); });
            req.on("end", () => {
                const params = new URLSearchParams(body);
                const newUsername = params.get("username");
                const newPassword = params.get("password");
                const newRole = params.get("role");
                if (!newUsername || !newPassword || !newRole) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Missing required fields: username, password, role" }));
                    return;
                }
                const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
                if (users.find(u => u.username === newUsername)) {
                    res.writeHead(409, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Username already exists" }));
                    return;
                }
                users.push({ username: newUsername, passHash: sha256(newPassword), role: newRole });
                fs.writeFileSync(`${__dirname}/users.json`, JSON.stringify(users, null, 2));
                res.writeHead(201, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "User created!", username: newUsername, role: newRole }));
            });
        }
    }

    // Catch-all
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Route not found." }));
    }
};


const server = http.createServer(handleRequest);
server.listen(3000, () => {
    console.log("Server is running on port 3000...");
});
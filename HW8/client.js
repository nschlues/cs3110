// Set the last version so lient will always initially upload
let lastVersion = null;
const BASE = "https://freechess.crabdance.com";

// Requests permission once on page load. If denied, the site works normally
// without notifications — all list functionality is unaffected.
async function requestNotificationPermission() {
  if (!("Notification" in window)) return; // browser doesn't support it
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
}
 
// Fires a notification if permission was granted.
function notifyUpdate(message) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  new Notification("Shopping List", {
    body: message,
    icon: "/favicon.ico"
  });
}

function updateNotifStatus() {
    const el = document.getElementById("notif-status");
    if (!el) return;
    if (!("Notification" in window)) {
        el.textContent = "Notifications not supported";
        el.className = "notif-status denied";
        return;
    }
    if (Notification.permission === "granted") {
        el.textContent = "Notifications on";
        el.className = "notif-status granted";
    } else if (Notification.permission === "denied") {
        el.textContent = "Notifications blocked — enable in browser settings";
        el.className = "notif-status denied";
    } else {
        el.textContent = "Notifications off";
        el.className = "notif-status default";
    }
}

// Copies the full shopping list as plain text to the clipboard.
async function copyAllItems() {
  const items = document.querySelectorAll("#item-list li");
  const feedback = document.getElementById("copy-feedback");
 
  const lines = [];
  items.forEach(li => {
    const val = li.querySelector(".item-value");
    const meta = li.querySelector(".item-meta");
    if (val) {
      lines.push(val.textContent.trim() + (meta ? "  " + meta.textContent.trim() : ""));
    } 
    else {
      lines.push(li.textContent.trim());
    }
  });
 
  try {
    await navigator.clipboard.writeText(lines.join("\n"));
    feedback.textContent = "Copied!";
    setTimeout(() => { feedback.textContent = ""; }, 2000);
  } 
  catch (err) {
    feedback.textContent = "Copy failed — permission denied";
    setTimeout(() => { feedback.textContent = ""; }, 3000);
    console.error("Clipboard write failed:", err);
  }
}
 
// Pastes clipboard text into the targeted input field.
async function pasteIntoField(inputId) {
  try {
    const text = await navigator.clipboard.readText();
    const input = document.getElementById(inputId);
    if (input) {
      input.value = text;
      input.focus();
    }
  } 
  catch (err) {
    alert("Paste failed — clipboard permission may be denied.");
    console.error("Clipboard read failed:", err);
  }
}

document.getElementById("copy-all-btn").addEventListener("click", copyAllItems);

document.querySelectorAll(".paste-btn").forEach(btn => {
    btn.addEventListener("click", () => pasteIntoField(btn.dataset.target));
});

// Function to render items list on page
function renderItems(items) {
  // Create new list items in the DOM
  const ul = document.getElementById("item-list");
  ul.replaceChildren();
  items.forEach((item, index) => {
    console.log(item);
    const li = document.createElement("li");
    const when = item.at ? new Date(item.at).toLocaleString() : "?";
    li.innerHTML = `
      <span class="item-value">[${index}] ${item.value}</span>
      <span class="item-meta">by <strong>${item.by}</strong> at ${when}</span>
    `;
    ul.appendChild(li);
  });
};

// Start polling function every 2 seconds
async function startPolling() {
  setInterval(async () => {
    try {
      const response = await fetch(`${BASE}/api/poll`);
      if (!response.ok) return;
      const { version, items } = await response.json();

      if (version !== lastVersion) {
        if (lastVersion !== null) {
          const latest = items[items.length - 1];
          const msg = latest
            ? `"${latest.value}" was added/updated by ${latest.by}`
            : "The list was updated.";
          notifyUpdate(msg);
        }
        lastVersion = version;
        renderItems(items);
      }
    } catch (error) {
      console.error("Poll failed:", error);
    }
  }, 2000);
}

// Logout by overwriting cached credentials with bad ones
async function logout() {
  try {
    await fetch("https://freechess.crabdance.com/logout", {
      headers: { "Authorization": "Basic " + btoa("logout:logout") }
    });
  } catch (e) {}
  window.location.href = "/";
}



// Listen for content to load
document.addEventListener("DOMContentLoaded", async () => {

  await requestNotificationPermission();
  updateNotifStatus();

  // First fetch does not wait for polling
  try {
    const response = await fetch(`${BASE}/api/poll`);
      if (response.ok) {
        const { version, items } = await response.json();
        lastVersion = version;
        renderItems(items);
      }
    } 
    catch (e) {
        console.error("Initial load failed:", e);
    }

  // Start polling after initial load
  startPolling();

  // For event listeners 
  // --- POST ---
  document.getElementById("post-event").addEventListener('submit', async (event) => {
    event.preventDefault();

    const body = Object.fromEntries(new FormData(event.target).entries()); 

    try {
      const response = await fetch("https://freechess.crabdance.com/api", {
        method: 'POST',
        body: new URLSearchParams(body),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded'},
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const responseData = await response.json();
      console.log("POST response:", responseData);
      renderItems(responseData.items); 
    } 
    
    catch (error) {
      console.error("POST failed:", error);
    }
  });

  // --- PUT ---
  document.getElementById("put-event").addEventListener('submit', async (event) => {
    event.preventDefault();

    const body = Object.fromEntries(new FormData(event.target).entries()); 

    try {
      const response = await fetch(`https://freechess.crabdance.com/api?index=${body.index}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(body),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const responseData = await response.json();
      console.log("PUT response:", responseData);
      renderItems(responseData.items);
    } 
    
    catch (error) {
      console.error("PUT failed:", error);
    }
  });

  // --- DELETE ---
  document.getElementById("delete-event").addEventListener('submit', async (event) => {
    event.preventDefault();

    const body = Object.fromEntries(new FormData(event.target).entries()); 

    try {
      const response = await fetch(`https://freechess.crabdance.com/api?index=${body.index}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: new URLSearchParams(body),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const responseData = await response.json();
      console.log("DELETE response:", responseData);
      renderItems(responseData.items);
    } 
    
    catch (error) {
      console.error("DELETE failed:", error);
    }
  });

    // --- CREATE USER (admin only) ---
  document.getElementById("create-user-event").addEventListener('submit', async (event) => {
    event.preventDefault();

    const body = Object.fromEntries(new FormData(event.target).entries());
    try {
      const response = await fetch("https://freechess.crabdance.com/admin/users", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: new URLSearchParams(body),
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      console.log("User created:", await response.json());
      alert("User created successfully!");
      
    } catch (error) {
      console.error("Create user failed:", error);
    }
  });

});

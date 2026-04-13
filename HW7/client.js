// Set the last version so lient will always initially upload
let lastVersion = null;
const BASE = "https://freechess.crabdance.com";


// Function to render items list on page
function renderItems() {
  //try {
  //const response = await fetch("https://freechess.crabdance.com/api");
  //if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      
  //const json = await response.json();

  // Access a the list from the JSON
  //const items = json.items;

  // Create new list items in the DOM
  const ul = document.getElementById("item-list");
  ul.replaceChildren();
  items.forEach((item, index) => {
      console.log(item);
      const li = document.createElement("li");
      const when = item.at ? new Date(item.at).toLocaleTimeString() : "?";
      li.innerHTML = `
        <span class="item-value">[${index}] ${item.value}</span>
        <span class="item-meta">by <strong>${item.by}</strong> at ${when}</span>
      `;
      ul.appendChild(li);
  });

  //} catch (error) {
    //console.error("Fetch failed:", error);  
  //}
};

// Start polling function every 2 seconds
async function startPolling() {
    setInterval(async () => {
        try {
            const response = await fetch(`${BASE}/api/poll`);
            if (!response.ok) return;
            const { version, items } = await response.json();

            if (version !== lastVersion) {
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
      renderItems(); 
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
      renderItems();
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
      renderItems();
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

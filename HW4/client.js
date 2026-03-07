// Listen for content to load
document.addEventListener("DOMContentLoaded", async () => {

  // Load items on page after render
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


  // For event listeners 
  // --- POST ---
document.getElementById("post-event").addEventListener('submit', async (event) => {
    event.preventDefault();

    const body = Object.fromEntries(new FormData(event.target).entries()); 

    try {
      const response = await fetch("https://freechess.crabdance.com/api", {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json'},
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const responseData = await response.json();
      console.log("POST response:", responseData);
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
      const response = await fetch("https://freechess.crabdance.com/api?index=${body.index}", {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json'},
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const responseData = await response.json();
      console.log("PUT response:", responseData);
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
      const response = await fetch("https://freechess.crabdance.com/api?index=${body.index}", {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json'},
      });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const responseData = await response.json();
      console.log("DELETE response:", responseData);
    } 
    
    catch (error) {
      console.error("DELETE failed:", error);
    }
});

  // renderItems() function


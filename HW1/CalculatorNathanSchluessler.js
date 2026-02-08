document.body.addEventListener('click', () => 
    document.getElementById('solution'). innerText = "Typing...")

// This stop propagation is needed because otherwise, the different click effect of the 
// unique key would not be resolved. It would still say typing... instead of "Duh"
document.getElementById("equals").addEventListener('click', (e) => e.stopPropagation())

document.getElementById("equals").addEventListener('click', () =>
    document.getElementById("solution"). innerText = "😂 Duh 😂")

// Same reasoning as above
document.getElementById("reset").addEventListener('click', (e) => e.stopPropagation())

document.getElementById("reset").addEventListener('click', () =>
    document.getElementById("solution"). innerText = "Please enter a value")
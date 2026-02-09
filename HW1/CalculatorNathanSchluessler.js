document.getElementById('type').addEventListener('click', () => 
    document.getElementById('solution'). innerText = "Typing...")

// This stop propagation is needed because otherwise, the different click effect of the 
// equals key would not be resolved. It would still say "typing..." instead of providing the 
// helpful solution
document.getElementById("equals").addEventListener('click', (e) => e.stopPropagation())

document.getElementById("equals").addEventListener('click', () =>
    document.getElementById("solution"). innerText = "Duh")

document.getElementById('equals').addEventListener('click', () =>
    document.getElementById('support').innerText = "😂😂😂😂😂😂😂😂😂😂😂😂😂😂😂")

// Same reasoning as above
document.getElementById("reset").addEventListener('click', (e) => e.stopPropagation())

document.getElementById("reset").addEventListener('click', () =>
    document.getElementById("solution"). innerText = "Please enter a value")

document.getElementById('reset').addEventListener('click', () =>
    document.getElementById('support').innerText = "")
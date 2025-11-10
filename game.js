document.addEventListener('DOMContentLoaded', () => {
    // --- COSTANTI E VARIABILI ---
    const GRID_SIZE = 50; // Dimensione di una cella della griglia in pixel

    // Riferimenti agli elementi dell'interfaccia
    const world = document.getElementById('world');
    const player = document.getElementById('player');
    const rollDiceBtn = document.getElementById('roll-dice-btn');
    const diceResultEl = document.getElementById('dice-result');
    const movesLeftEl = document.getElementById('moves-left');

    // Stato del gioco
    let playerPos = { x: 0, y: 0 }; // Posizione del giocatore in unità di griglia
    let movesLeft = 0; // Movimenti disponibili

    // --- FUNZIONI ---

    /**
     * Aggiorna la visuale scorrendo il "mondo" in direzione opposta al giocatore
     * per mantenere il giocatore al centro.
     */
    function updateCamera() {
        const xOffset = -playerPos.x * GRID_SIZE;
        const yOffset = -playerPos.y * GRID_SIZE;
        world.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    }

    /**
     * Gestisce il lancio del dado.
     */
    function handleRollDice() {
        if (movesLeft > 0) return; // Non lanciare se ci sono già movimenti

        const roll = Math.floor(Math.random() * 6) + 1;
        movesLeft = roll;

        // Aggiorna l'interfaccia
        diceResultEl.textContent = roll;
        movesLeftEl.textContent = movesLeft;
        rollDiceBtn.disabled = true;
    }

    /**
     * Gestisce la pressione dei tasti per il movimento.
     * @param {KeyboardEvent} e L'evento della tastiera
     */
    function handleKeyPress(e) {
        if (movesLeft <= 0) return; // Nessun movimento se non ci sono mosse

        let moved = false;
        switch (e.key) {
            case 'ArrowUp':
                playerPos.y--;
                moved = true;
                break;
            case 'ArrowDown':
                playerPos.y++;
                moved = true;
                break;
            case 'ArrowLeft':
                playerPos.x--;
                moved = true;
                break;
            case 'ArrowRight':
                playerPos.x++;
                moved = true;
                break;
        }

        if (moved) {
            movesLeft--;
            movesLeftEl.textContent = movesLeft;
            updateCamera();

            // Se i movimenti sono finiti, riattiva il pulsante
            if (movesLeft === 0) {
                rollDiceBtn.disabled = false;
                diceResultEl.textContent = '-';
            }
        }
    }

    // --- IMPOSTAZIONE INIZIALE ---

    // Aggiunge gli ascoltatori di eventi
    rollDiceBtn.addEventListener('click', handleRollDice);
    document.addEventListener('keydown', handleKeyPress);

    // Imposta la posizione iniziale della camera
    updateCamera();
});

let paused = false;

let resetCallback = null;

function setResetCallback(callback) {

    resetCallback = callback;

}

const pauseButton =
    document.getElementById("pauseButton");

const pauseMenu =
    document.getElementById("pauseMenu");

const continueButton =
    document.getElementById("continueButton");

const resetButton =
    document.getElementById("resetButton");

const settingsButton =
    document.getElementById("settingsButton");


// ============================================================
// PAUSE
// ============================================================

function pauseGame() {

    paused = true;

    pauseMenu.style.display = "flex";

}


// ============================================================
// CONTINUE
// ============================================================

function continueGame() {

    paused = false;

    pauseMenu.style.display = "none";

}


// ============================================================
// TOGGLE
// ============================================================

function togglePause() {

    if (paused) {

        continueGame();

    }
    else {

        pauseGame();

    }

}

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            !event.repeat
        ) {

            togglePause();

        }

    }
);


// ============================================================
// BUTTONS
// ============================================================

pauseButton.addEventListener(
    "click",
    togglePause
);

resetButton.addEventListener(
    "click",
    async () => {

        // Pause-Menü sofort schließen
        paused = false;
        pauseMenu.style.display = "none";

        // Reset an das Spiel weitergeben
        if (resetCallback) {

            await resetCallback();

        }

    }
);


continueButton.addEventListener(
    "click",
    continueGame
);


// ============================================================
// GET PAUSE STATE
// ============================================================

function isPaused() {

    return paused;

}


export {
    pauseGame,
    continueGame,
    togglePause,
    isPaused,
    setResetCallback
};
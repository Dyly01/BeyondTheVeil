let paused = false;

let resetCallback = null;


// ============================================================
// RESET CALLBACK
// ============================================================

function setResetCallback(callback) {

    resetCallback =
        callback;

}


// ============================================================
// ELEMENTS
// ============================================================

const pauseButton =
    document.getElementById(
        "pauseButton"
    );

const pauseMenu =
    document.getElementById(
        "pauseMenu"
    );

const continueButton =
    document.getElementById(
        "continueButton"
    );

const resetButton =
    document.getElementById(
        "resetButton"
    );


// ============================================================
// PAUSE
// ============================================================

function pauseGame() {

    paused = true;

    pauseMenu.style.display =
        "flex";

}


// ============================================================
// CONTINUE
// ============================================================

function continueGame() {

    paused = false;

    pauseMenu.style.display =
        "none";

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


// ============================================================
// ESCAPE
// ============================================================

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
// PAUSE BUTTON
// ============================================================

pauseButton.addEventListener(
    "click",
    togglePause
);


// ============================================================
// CONTINUE BUTTON
// ============================================================

continueButton.addEventListener(
    "click",
    continueGame
);


// ============================================================
// RESET BUTTON
// ============================================================

resetButton.addEventListener(
    "click",
    async () => {

        // ----------------------------------------------------
        // Close pause menu immediately
        // ----------------------------------------------------

        paused = false;

        pauseMenu.style.display =
            "none";


        // ----------------------------------------------------
        // Close settings menu
        // ----------------------------------------------------

        const settingsMenu =
            document.getElementById(
                "settingsMenu"
            );

        if (settingsMenu) {

            settingsMenu.style.display =
                "none";

        }


        // ----------------------------------------------------
        // Execute reset
        // ----------------------------------------------------

        if (resetCallback) {

            await resetCallback();

        }

    }
);


// ============================================================
// GET PAUSE STATE
// ============================================================

function isPaused() {

    return paused;

}


// ============================================================
// EXPORT
// ============================================================

export {
    pauseGame,
    continueGame,
    togglePause,
    isPaused,
    setResetCallback
};
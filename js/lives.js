import {
    player,
    spawnPlayer
} from "./player.js";

import {
    level,
    loadLevel
} from "./level.js";

const livesDisplay =
    document.getElementById("livesDisplay");


// ============================================================
// SETTINGS
// ============================================================

const MAX_LIVES = 5;

const START_LEVEL =
    "./level-1.json";


// ============================================================
// STATE
// ============================================================

let lives =
    MAX_LIVES;

let gameOver =
    false;

let resetting =
    false;


// ============================================================
// GETTERS
// ============================================================

function getLives() {

    return lives;

}


function isGameOver() {

    return gameOver;

}


// ============================================================
// RESET LIVES
// ============================================================

function resetLives() {

    lives =
        MAX_LIVES;

    gameOver =
        false;

    resetting =
        false;


    console.log(
        "Lives reset:",
        lives
    );

}


// ============================================================
// PLAYER DEATH
// ============================================================

async function loseLife() {

    if (
        gameOver ||
        resetting
    ) {

        return;

    }


    lives--;


    console.log(
        "Player died. Lives remaining:",
        lives
    );


    // ========================================================
    // GAME OVER
    // ========================================================

    if (lives <= 0) {

        lives = 0;

        gameOver = true;


        console.log(
            "GAME OVER"
        );


        return;

    }


    // ========================================================
    // RESPAWN CURRENT LEVEL
    // ========================================================

    spawnPlayer(level);

}


// ============================================================
// CHECK DEATH
// ============================================================

function updateLives() {

    if (
        gameOver ||
        !level ||
        resetting
    ) {

        return;

    }


    // Player fell below the level

    if (
        player.y >
        level.height
    ) {

        loseLife();

    }

}


// ============================================================
// ENTER KEY → RESET AFTER GAME OVER
// ============================================================

document.addEventListener(
    "keydown",
    (event) => {

        if (!gameOver) {

            return;

        }


        if (
            event.key === "Enter"
        ) {

            event.preventDefault();

            resetGame();

        }

    }
);


// ============================================================
// RESET AFTER GAME OVER
// ============================================================

async function resetGame() {

    if (resetting) {

        return;

    }


    resetting = true;


    console.log(
        "Resetting game..."
    );


    resetLives();


    await loadLevel(
        START_LEVEL
    );


    if (level) {

        spawnPlayer(level);

    }


    resetting = false;


    console.log(
        "Game reset."
    );

}


// ============================================================
// DRAW LIVES
// ============================================================

function drawLives(ctx) {

    if (gameOver) {

        livesDisplay.innerHTML = "";

        return;

    }


    livesDisplay.innerHTML = "";


    for (
        let i = 0;
        i < MAX_LIVES;
        i++
    ) {

        const heart =
            document.createElement("span");


        heart.textContent =
            i < lives
                ? "♥"
                : "♡";


        livesDisplay.appendChild(
            heart
        );

    }

}


// ============================================================
// DRAW GAME OVER
// ============================================================

function drawGameOver(
    ctx,
    canvas
) {

    if (!gameOver) {

        return;

    }


    ctx.save();


    // --------------------------------------------------------
    // Dark overlay
    // --------------------------------------------------------

    ctx.fillStyle =
        "rgba(0, 0, 0, 0.75)";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------------------------
    // Title
    // --------------------------------------------------------

    ctx.fillStyle =
        "white";


    ctx.font =
        "bold 64px Arial";


    ctx.textAlign =
        "center";


    ctx.textBaseline =
        "middle";


    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        canvas.height / 2 - 60
    );


    // --------------------------------------------------------
    // Restart text
    // --------------------------------------------------------

    ctx.font =
        "24px Arial";


    ctx.fillText(
        "Press ENTER to restart",
        canvas.width / 2,
        canvas.height / 2 + 30
    );


    ctx.restore();

}


// ============================================================
// EXPORT
// ============================================================

export {
    MAX_LIVES,
    getLives,
    isGameOver,
    updateLives,
    loseLife,
    resetGame,
    drawLives,
    drawGameOver,
    resetLives
};
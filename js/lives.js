import {
    player,
    spawnPlayer
} from "./player.js";

import {
    level
} from "./level.js";

import {
    gameState
} from "./gameState.js";


const livesDisplay =
    document.getElementById(
        "livesDisplay"
    );


const MAX_LIVES =
    5;

let lives =
    MAX_LIVES;

let gameOver =
    false;

let resetting =
    false;


function getLives() {

    return lives;

}


function isGameOver() {

    return gameOver;

}


function resetLives() {

    lives =
        MAX_LIVES;

    gameOver =
        false;

    resetting =
        false;

}


function respawnPlayer() {

    if (!level) {

        return;

    }


    if (
        gameState.currentSpawn
    ) {

        player.x =
            gameState.currentSpawn.x;

        player.y =
            gameState.currentSpawn.y;

        player.velocityX =
            0;

        player.velocityY =
            0;

        player.grounded =
            false;

        player.doubleJumpUsed =
            false;

        return;

    }


    spawnPlayer(
        level
    );

}


function loseLife() {

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


    if (
        lives <= 0
    ) {

        lives =
            0;

        gameOver =
            true;

        console.log(
            "GAME OVER"
        );

        return;

    }


    respawnPlayer();

}


function updateLives() {

    if (
        gameOver ||
        !level ||
        resetting
    ) {

        return;

    }


    if (
        player.y >
        level.height
    ) {

        loseLife();

    }

}


function drawLives() {

    if (
        !livesDisplay
    ) {

        return;

    }


    if (
        gameOver
    ) {

        livesDisplay.innerHTML =
            "";

        return;

    }


    livesDisplay.innerHTML =
        "";


    for (
        let i = 0;
        i < MAX_LIVES;
        i++
    ) {

        const heart =
            document.createElement(
                "span"
            );


        heart.textContent =
            i < lives
                ? "♥"
                : "♡";


        livesDisplay.appendChild(
            heart
        );

    }

}


function drawGameOver(
    ctx,
    canvas
) {

    if (
        !gameOver
    ) {

        return;

    }


    ctx.save();


    ctx.fillStyle =
        "rgba(0, 0, 0, 0.75)";


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


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


    ctx.font =
        "24px Arial";


    ctx.fillText(
        "Press ENTER to restart",
        canvas.width / 2,
        canvas.height / 2 + 30
    );


    ctx.restore();

}


document.addEventListener(
    "keydown",
    (event) => {

        if (
            !gameOver
        ) {

            return;

        }


        if (
            event.key === "Enter"
        ) {

            event.preventDefault();


            window.dispatchEvent(
                new Event(
                    "gameReset"
                )
            );

        }

    }
);


export {
    MAX_LIVES,
    getLives,
    isGameOver,
    updateLives,
    loseLife,
    resetLives,
    drawLives,
    drawGameOver
};
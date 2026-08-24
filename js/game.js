import {
    isPaused,
    setResetCallback
} from "./pause.js";

import {
    player,
    spawnPlayer,
    updatePlayer,
    drawPlayer
} from "./player.js";

import {
    level,
    loadLevel,
    changeLevel
} from "./level.js";

import {
    updateInput
} from "./input.js";

import {
    camera,
    updateCamera
} from "./camera.js";

import {
    isColliding
} from "./physics.js";

import {
    drawBackground,
    drawPlatform,
    drawDoor
} from "./graphics.js";

import {
    updateLives,
    isGameOver,
    drawLives,
    drawGameOver,
    resetLives
} from "./lives.js";


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


// ============================================================
// RESIZE
// ============================================================

function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;

}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


// ============================================================
// LEVEL TRANSITION
// ============================================================

let changingLevel = false;


// ============================================================
// COMPLETE GAME RESET
// ============================================================

async function resetGame() {

    if (changingLevel) {

        return;

    }

    console.log("Full game reset");

    changingLevel = true;


    // --------------------------------------------------------
    // Reset lives and game-over state
    // --------------------------------------------------------

    resetLives();


    // --------------------------------------------------------
    // Close pause menu
    // --------------------------------------------------------

    const pauseMenu =
        document.getElementById("pauseMenu");

    if (pauseMenu) {

        pauseMenu.style.display = "none";

    }


    // --------------------------------------------------------
    // Close settings menu
    // --------------------------------------------------------

    const settingsMenu =
        document.getElementById("settingsMenu");

    if (settingsMenu) {

        settingsMenu.style.display = "none";

    }


    // --------------------------------------------------------
    // Load first level
    // --------------------------------------------------------

    const success =
        await loadLevel("./level-1.json");


    if (
        !success ||
        !level
    ) {

        console.error(
            "Could not reset game: level-1 failed to load."
        );

        changingLevel = false;

        return;

    }


    // --------------------------------------------------------
    // Spawn player
    // --------------------------------------------------------

    spawnPlayer(level);


    // --------------------------------------------------------
    // Reset player movement
    // --------------------------------------------------------

    player.velocityX = 0;
    player.velocityY = 0;


    // --------------------------------------------------------
    // Reset camera
    // --------------------------------------------------------

    camera.x = 0;
    camera.y = 0;


    changingLevel = false;

    console.log("Game reset complete");

}


// ============================================================
// CONNECT RESET BUTTON
// ============================================================

setResetCallback(
    resetGame
);


// ============================================================
// CHECK DOORS
// ============================================================

async function checkDoors() {

    if (
        !level ||
        !Array.isArray(level.doors) ||
        changingLevel
    ) {

        return;

    }


    for (
        const door of level.doors
    ) {

        if (
            !door ||
            !door.level
        ) {

            continue;

        }


        if (
            isColliding(
                player,
                door
            )
        ) {

            await enterDoor(door);

            return;

        }

    }

}


// ============================================================
// ENTER DOOR
// ============================================================

async function enterDoor(door) {

    if (changingLevel) {

        return;

    }


    changingLevel = true;


    const targetLevel =
        door.level;


    console.log(
        "Entering door:",
        targetLevel
    );


    const success =
        await changeLevel(targetLevel);


    if (
        success &&
        level
    ) {

        spawnPlayer(level);


        camera.x = 0;
        camera.y = 0;


        player.velocityX = 0;
        player.velocityY = 0;

    }


    changingLevel = false;

}


// ============================================================
// UPDATE
// ============================================================

function update(deltaTime) {

    // --------------------------------------------------------
    // Game Over
    // --------------------------------------------------------

    if (isGameOver()) {

        updateInput();

        return;

    }


    // --------------------------------------------------------
    // Paused
    // --------------------------------------------------------

    if (isPaused()) {

        updateInput();

        return;

    }


    // --------------------------------------------------------
    // Level transition / missing level
    // --------------------------------------------------------

    if (
        !level ||
        changingLevel
    ) {

        return;

    }


    // --------------------------------------------------------
    // Player
    // --------------------------------------------------------

    updatePlayer(deltaTime);


    // --------------------------------------------------------
    // Lives / death
    // --------------------------------------------------------

    updateLives();


    // --------------------------------------------------------
    // Doors
    // --------------------------------------------------------

    checkDoors();


    // --------------------------------------------------------
    // Camera
    // --------------------------------------------------------

    updateCamera(
        player,
        canvas
    );


    // --------------------------------------------------------
    // Input
    // --------------------------------------------------------

    updateInput();

}


// ============================================================
// DRAW
// ============================================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (!level) {

        return;

    }


    // ========================================================
    // BACKGROUND
    // ========================================================

    drawBackground(
        ctx,
        level.background || "forest",
        level.width,
        level.height,
        camera.x,
        camera.y
    );


    // ========================================================
    // CAMERA
    // ========================================================

    ctx.save();

    ctx.translate(
        -camera.x,
        -camera.y
    );


    // ========================================================
    // PLATFORMS
    // ========================================================

    if (
        Array.isArray(level.platforms)
    ) {

        for (
            const platform of level.platforms
        ) {

            drawPlatform(
                ctx,
                platform
            );

        }

    }


    // ========================================================
    // DOORS
    // ========================================================

    if (
        Array.isArray(level.doors)
    ) {

        for (
            const door of level.doors
        ) {

            if (!door) {

                continue;

            }


            drawDoor(
                ctx,
                door
            );

        }

    }


    // ========================================================
    // PLAYER
    // ========================================================

    if (!isGameOver()) {

        drawPlayer(ctx);

    }


    // ========================================================
    // END CAMERA
    // ========================================================

    ctx.restore();


    // ========================================================
    // UI
    // ========================================================

    drawLives(ctx);

    drawGameOver(
        ctx,
        canvas
    );

}


// ============================================================
// GAME LOOP
// ============================================================

const FIXED_DT =
    1 / 60;

const MAX_FRAME_TIME =
    0.1;

let lastTime =
    performance.now();

let accumulator =
    0;


function gameLoop(currentTime) {

    const frameTime =
        Math.min(
            (
                currentTime -
                lastTime
            ) / 1000,
            MAX_FRAME_TIME
        );


    lastTime =
        currentTime;


    accumulator +=
        frameTime;


    while (
        accumulator >= FIXED_DT
    ) {

        update(FIXED_DT);

        accumulator -=
            FIXED_DT;

    }


    draw();


    requestAnimationFrame(
        gameLoop
    );

}


// ============================================================
// START GAME
// ============================================================

async function startGame() {

    const success =
        await loadLevel(
            "./level-1.json"
        );


    if (
        !success ||
        !level
    ) {

        console.error(
            "Game could not start because the level failed to load."
        );

        return;

    }


    spawnPlayer(level);


    requestAnimationFrame(
        gameLoop
    );

}


startGame();
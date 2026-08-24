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

import { updateInput } from "./input.js";

import {
    camera,
    updateCamera
} from "./camera.js";

import {
    drawBackground,
    drawPlatform,
    drawDoor
} from "./graphics.js";


const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


// ============================================================
// CANVAS
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


// Check if the player is touching the level door
function isPlayerTouchingDoor() {

    if (
        !level ||
        !level.door
    ) {

        return false;

    }


    const door =
        level.door;


    return (
        player.x < door.x + door.width &&
        player.x + player.width > door.x &&
        player.y < door.y + door.height &&
        player.y + player.height > door.y
    );

}


// Change to the level specified by the door
async function tryLevelTransition() {

    if (
        changingLevel ||
        !level ||
        !level.door
    ) {

        return;

    }


    if (
        !isPlayerTouchingDoor()
    ) {

        return;

    }


    const targetLevel =
        level.door.level ||
        level.door.target ||
        level.door.nextLevel;


    if (!targetLevel) {

        console.warn(
            "Door has no target level:",
            level.door
        );

        return;

    }


    changingLevel =
        true;


    const success =
        await changeLevel(
            targetLevel
        );


    if (success) {

        spawnPlayer(level);

        camera.x = 0;
        camera.y = 0;

        console.log(
            "Transitioned to:",
            targetLevel
        );

    }


    changingLevel =
        false;

}


// ============================================================
// UPDATE
// ============================================================

function update(deltaTime) {

    updatePlayer(deltaTime);

    updateCamera(
        player,
        canvas
    );

    tryLevelTransition();

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


    // --------------------------------------------------------
    // Background
    // --------------------------------------------------------

    drawBackground(
        ctx,
        level.background || "forest",
        level.width,
        level.height,
        camera.x,
        camera.y
    );


    // --------------------------------------------------------
    // Camera transformation
    // --------------------------------------------------------

    ctx.save();


    ctx.translate(
        -camera.x,
        -camera.y
    );


    // --------------------------------------------------------
    // Platforms
    // --------------------------------------------------------

    for (
        const platform
        of level.platforms
    ) {

        drawPlatform(
            ctx,
            platform
        );

    }


    // --------------------------------------------------------
    // Door
    // --------------------------------------------------------

    if (level.door) {

        drawDoor(
            ctx,
            level.door
        );

    }


    // --------------------------------------------------------
    // Player
    // --------------------------------------------------------

    drawPlayer(
        ctx
    );


    // --------------------------------------------------------
    // End camera transformation
    // --------------------------------------------------------

    ctx.restore();

}


// ============================================================
// FIXED TIMESTEP GAME LOOP
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
            (currentTime - lastTime) / 1000,
            MAX_FRAME_TIME
        );


    lastTime =
        currentTime;


    accumulator +=
        frameTime;


    while (
        accumulator >= FIXED_DT
    ) {

        update(
            FIXED_DT
        );


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

    await loadLevel();

    spawnPlayer(
        level
    );


    requestAnimationFrame(
        gameLoop
    );

}


startGame();
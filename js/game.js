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
    drawDoor,
    drawGem,
    drawCrown,
    drawKey
} from "./graphics.js";

import {
    updateLives,
    isGameOver,
    drawLives,
    drawGameOver
} from "./lives.js";


// ============================================================
// CANVAS
// ============================================================

const canvas =
    document.getElementById(
        "gameCanvas"
    );

const ctx =
    canvas.getContext(
        "2d"
    );


// ============================================================
// GLOBAL COLLECTIBLES
// ============================================================

const collectibles = {

    crown: false,

    gem: false,

    key: false

};


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
// COLLECTIBLES
// ============================================================

function checkCollectibles() {

    if (
        !level ||
        !level.collectibles
    ) {

        return;

    }


    const current =
        level.collectibles;


    if (
        current.crown &&
        !current.crown.collected &&
        isColliding(
            player,
            current.crown
        )
    ) {

        current.crown.collected =
            true;

        collectibles.crown =
            true;

        console.log(
            "Crown collected!"
        );

    }


    if (
        current.gem &&
        !current.gem.collected &&
        isColliding(
            player,
            current.gem
        )
    ) {

        current.gem.collected =
            true;

        collectibles.gem =
            true;

        player.canDoubleJump =
            true;

        console.log(
            "Gem collected! Double jump unlocked."
        );

    }


    if (
        current.key &&
        !current.key.collected &&
        isColliding(
            player,
            current.key
        )
    ) {

        current.key.collected =
            true;

        collectibles.key =
            true;

        console.log(
            "Key collected!"
        );

    }

}


// ============================================================
// RESET
// ============================================================

async function resetLevel() {

    if (
        !level ||
        changingLevel
    ) {

        return;

    }


    changingLevel =
        true;


    const currentLevel =
        level.name;


    console.log(
        "Resetting current level:",
        currentLevel
    );


    changingLevel =
        false;

}


async function resetGame() {

    if (
        changingLevel
    ) {

        return;

    }


    changingLevel =
        true;


    console.log(
        "Full game reset"
    );


    collectibles.crown =
        false;

    collectibles.gem =
        false;

    collectibles.key =
        false;


    player.canDoubleJump =
        false;

    player.doubleJumpUsed =
        false;


    const livesModule =
        await import("./lives.js");

    livesModule.resetLives();


    const success =
        await loadLevel(
            "./level-1.json"
        );


    if (
        !success ||
        !level
    ) {

        console.error(
            "Could not reset game."
        );

        changingLevel =
            false;

        return;

    }


    spawnPlayer(
        level
    );


    camera.x =
        0;

    camera.y =
        0;


    player.velocityX =
        0;

    player.velocityY =
        0;


    changingLevel =
        false;

}


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

            await enterDoor(
                door
            );

            return;

        }

    }

}


// ============================================================
// ENTER DOOR
// ============================================================

async function enterDoor(
    door
) {

    if (
        changingLevel
    ) {

        return;

    }


    changingLevel =
        true;


    const targetLevel =
        door.level;


    console.log(
        "Entering door:",
        targetLevel
    );


    const success =
        await changeLevel(
            targetLevel
        );


    if (
        success &&
        level
    ) {

        spawnPlayer(
            level
        );


        camera.x =
            0;

        camera.y =
            0;


        player.velocityX =
            0;

        player.velocityY =
            0;

    }


    changingLevel =
        false;

}


// ============================================================
// UPDATE
// ============================================================

function update(
    deltaTime
) {

    if (
        isGameOver()
    ) {

        updateInput();

        return;

    }


    if (
        isPaused()
    ) {

        updateInput();

        return;

    }


    if (
        !level ||
        changingLevel
    ) {

        return;

    }


    updatePlayer(
        deltaTime
    );


    checkCollectibles();


    updateLives();


    checkDoors();


    updateCamera(
        player,
        canvas
    );


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


    drawBackground(
        ctx,
        level.background || "forest",
        level.width,
        level.height,
        camera.x,
        camera.y
    );


    ctx.save();


    ctx.translate(
        -camera.x,
        -camera.y
    );


    if (
        Array.isArray(
            level.platforms
        )
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


    if (
        Array.isArray(
            level.doors
        )
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


    if (
        level.collectibles
    ) {

        if (
            level.collectibles.gem &&
            !level.collectibles.gem.collected
        ) {

            drawGem(
                ctx,
                level.collectibles.gem
            );

        }


        if (
            level.collectibles.crown &&
            !level.collectibles.crown.collected
        ) {

            drawCrown(
                ctx,
                level.collectibles.crown
            );

        }


        if (
            level.collectibles.key &&
            !level.collectibles.key.collected
        ) {

            drawKey(
                ctx,
                level.collectibles.key
            );

        }

    }


    if (
        !isGameOver()
    ) {

        drawPlayer(
            ctx
        );

    }


    ctx.restore();


    drawLives(
        ctx
    );


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


function gameLoop(
    currentTime
) {

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
        accumulator >=
        FIXED_DT
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


    spawnPlayer(
        level
    );


    requestAnimationFrame(
        gameLoop
    );

}


startGame();
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
    drawCrow,
    drawKey
} from "./graphics.js";

import {
    updateLives,
    isGameOver,
    drawLives,
    drawGameOver,
    resetLives
} from "./lives.js";


const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


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


let changingLevel = false;


const collectibles = {
    gem: false,
    crow: false,
    key: false
};


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
        current.gem &&
        !current.gem.collected &&
        isColliding(player, current.gem)
    ) {

        current.gem.collected = true;

        collectibles.gem = true;

        player.canDoubleJump = true;

        console.log(
            "Gem collected - Double Jump unlocked"
        );
    }


    if (
        current.crow &&
        !current.crow.collected &&
        isColliding(player, current.crow)
    ) {

        current.crow.collected = true;

        collectibles.crow = true;

        console.log(
            "Crow collected"
        );
    }


    if (
        current.key &&
        !current.key.collected &&
        isColliding(player, current.key)
    ) {

        current.key.collected = true;

        collectibles.key = true;

        console.log(
            "Key collected"
        );
    }

}


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


async function enterDoor(
    door
) {

    if (changingLevel) {
        return;
    }

    changingLevel = true;

    const targetLevel =
        door.level;


    if (
        door.requiresKey &&
        !collectibles.key
    ) {

        console.log(
            "This door requires a key."
        );

        changingLevel = false;

        return;
    }


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

        camera.x = 0;
        camera.y = 0;

        player.velocityX = 0;
        player.velocityY = 0;

    }


    changingLevel = false;

}


async function resetGame() {

    if (changingLevel) {
        return;
    }

    changingLevel = true;

    console.log(
        "Full game reset"
    );


    resetLives();


    collectibles.gem = false;
    collectibles.crow = false;
    collectibles.key = false;


    player.canDoubleJump = false;
    player.doubleJumpUsed = false;


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

        changingLevel = false;

        return;
    }


    spawnPlayer(
        level
    );


    camera.x = 0;
    camera.y = 0;

    player.velocityX = 0;
    player.velocityY = 0;


    changingLevel = false;


    window.dispatchEvent(
        new Event("gameResetComplete")
    );

}


setResetCallback(
    resetGame
);


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
        level.collectibles
    ) {

        const current =
            level.collectibles;


        if (
            current.gem &&
            !current.gem.collected
        ) {

            drawGem(
                ctx,
                current.gem
            );

        }


        if (
            current.crow &&
            !current.crow.collected
        ) {

            drawCrow(
                ctx,
                current.crow
            );

        }


        if (
            current.key &&
            !current.key.collected
        ) {

            drawKey(
                ctx,
                current.key
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
            "Game could not start."
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
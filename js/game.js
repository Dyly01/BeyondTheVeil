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
    changeLevel,
    getCurrentLevelFile
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
    drawGameOver,
    resetLives
} from "./lives.js";


import {
    gameState,
    resetGameState
} from "./gameState.js";


const canvas =
    document.getElementById(
        "gameCanvas"
    );


const ctx =
    canvas.getContext(
        "2d"
    );


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


let changingLevel =
    false;


// Applies the global collected state to the collectibles
// that exist in the currently loaded level.

function applyCollectibleState() {

    if (
        !level ||
        !level.collectibles
    ) {

        return;

    }


    if (
        level.collectibles.gem
    ) {

        level.collectibles.gem.collected =
            gameState.doubleJumpUnlocked;

    }


    if (
        level.collectibles.crown
    ) {

        level.collectibles.crown.collected =
            gameState.crownCollected;

    }


    if (
        level.collectibles.key
    ) {

        level.collectibles.key.collected =
            gameState.keyCollected;

    }

}


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
        isColliding(
            player,
            current.gem
        )
    ) {

        current.gem.collected =
            true;

        gameState.doubleJumpUnlocked =
            true;

        player.canDoubleJump =
            true;


        console.log(
            "Gem collected!"
        );

    }


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

        gameState.crownCollected =
            true;


        console.log(
            "Crown collected!"
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

        gameState.keyCollected =
            true;


        console.log(
            "Key collected!"
        );

    }

}


function findSpawnForSource(
    sourceLevel
) {

    if (
        !level ||
        !Array.isArray(
            level.spawns
        )
    ) {

        return null;

    }


    for (
        const spawn of level.spawns
    ) {

        if (
            spawn.from ===
            sourceLevel
        ) {

            return spawn;

        }

    }


    return null;

}


function setArrivalSpawn(
    previousLevel
) {

    const arrivalSpawn =
        findSpawnForSource(
            previousLevel
        );


    if (
        arrivalSpawn
    ) {

        gameState.currentSpawn = {

            x:
                arrivalSpawn.x,

            y:
                arrivalSpawn.y

        };


        return;

    }


    gameState.currentSpawn =
        null;

}


async function enterDoor(
    door
) {

    if (
        changingLevel
    ) {

        return;

    }


    if (
        door.requiresKey &&
        !gameState.keyCollected
    ) {

        console.log(
            "This door requires a key."
        );

        return;

    }


    const previousLevel =
        getCurrentLevelFile();


    changingLevel =
        true;


    console.log(
        "Entering:",
        door.level
    );


    const success =
        await changeLevel(
            door.level
        );


    if (
        success &&
        level
    ) {

        applyCollectibleState();


        setArrivalSpawn(
            previousLevel
        );


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

        }
        else {

            spawnPlayer(
                level
            );

        }


        if (
            gameState.doubleJumpUnlocked
        ) {

            player.canDoubleJump =
                true;

        }


        camera.x =
            0;

        camera.y =
            0;

    }


    changingLevel =
        false;

}


async function checkDoors() {

    if (
        !level ||
        !Array.isArray(
            level.doors
        ) ||
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


    if (
        !level
    ) {

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

            if (
                !door
            ) {

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


    resetGameState();


    resetLives();


    player.canDoubleJump =
        false;

    player.doubleJumpUsed =
        false;


    const success =
        await loadLevel(
            "./level-1.json"
        );


    if (
        !success ||
        !level
    ) {

        changingLevel =
            false;

        return;

    }


    applyCollectibleState();


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


window.addEventListener(
    "gameReset",
    resetGame
);


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


    applyCollectibleState();


    spawnPlayer(
        level
    );


    if (
        gameState.doubleJumpUnlocked
    ) {

        player.canDoubleJump =
            true;

    }


    requestAnimationFrame(
        gameLoop
    );

}


startGame();
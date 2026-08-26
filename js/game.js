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
    drawKey,
    drawThrone
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

let gameWon = false;
let crownMissingTimer = 0;

let gameTime = 0;


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

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            gameWon
        ) {

            event.preventDefault();

            resetGame();

        }

    }
);


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

function checkGoal() {

    if (
        !level ||
        !level.goal ||
        gameWon
    ) {

        return;

    }


    if (
        !isColliding(
            player,
            level.goal
        )
    ) {

        return;

    }


    if (
        gameState.crownCollected
    ) {

        gameWon = true;

        return;

    }


    crownMissingTimer = 2;

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
        gameWon
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
        crownMissingTimer > 0
    ) {

        crownMissingTimer -=
            deltaTime;

    }

    if (
        !level ||
        changingLevel
    ) {

        return;

    }

    if (
        gameWon
    ) {

        updateInput();

        return;

    }

    gameTime += deltaTime;


    updatePlayer(
        deltaTime
    );


    checkCollectibles();

    checkGoal();


    updateLives();


    checkDoors();


    updateCamera(
        player,
        canvas
    );


    updateInput();

}

function formatGameTime(seconds) {

    const minutes =
        Math.floor(
            seconds / 60
        );

    const remainingSeconds =
        seconds % 60;

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        remainingSeconds
            .toFixed(2)
            .padStart(5, "0")
    );

}

function drawGoalUI() {

    if (
        crownMissingTimer <= 0 &&
        !gameWon
    ) {

        return;

    }


    ctx.save();


    if (
        gameWon
    ) {

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
            "bold 72px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "YOU WIN!",
            canvas.width / 2,
            canvas.height / 2 - 70
        );


        ctx.font =
            "32px Arial";

        ctx.fillText(
            `Time: ${formatGameTime(gameTime)}`,
            canvas.width / 2,
            canvas.height / 2
        );


        ctx.font =
            "24px Arial";

        ctx.fillText(
            "Press ENTER to restart",
            canvas.width / 2,
            canvas.height / 2 + 60
        );

    }
    else {

        ctx.fillStyle =
            "rgba(0, 0, 0, 0.75)";

        const width = 300;
        const height = 90;

        const x =
            canvas.width / 2 -
            width / 2;

        const y =
            40;


        ctx.fillRect(
            x,
            y,
            width,
            height
        );


        ctx.fillStyle =
            "white";

        ctx.font =
            "bold 26px Arial";

        ctx.textAlign =
            "center";

        ctx.textBaseline =
            "middle";


        ctx.fillText(
            "Crown Missing",
            canvas.width / 2,
            y + height / 2
        );

    }


    ctx.restore();

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


            const locked =
                door.requiresKey &&
                !gameState.keyCollected;

            drawDoor(
                ctx,
                door,
                locked
            );

            if (
                Array.isArray(level.thrones)
            ) {

                for (
                    const throne of level.thrones
                ) {

                    if (!throne) {
                        continue;
                    }

                    drawThrone(
                        ctx,
                        throne
                    );

                }

            }

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

    drawGoalUI();

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

    gameWon = false;
    crownMissingTimer = 0;
    gameTime = 0;


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
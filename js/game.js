import {
    player,
    spawnPlayer,
    updatePlayer,
    drawPlayer
} from "./player.js";
import {
    level,
    loadLevel
} from "./level.js";
import { updateInput } from "./input.js";
import {
    camera,
    updateCamera
} from "./camera.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");


function resizeCanvas() {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();


function update(deltaTime) {

    updatePlayer(deltaTime);

    updateCamera(player, canvas);

    updateInput();
}


function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Start camera transformation

    ctx.save();

    ctx.translate(
        -camera.x,
        -camera.y
    );


    // Draw level

    ctx.fillStyle = "gray";

    for (const platform of level    .platforms) {

        ctx.fillRect(
            platform.x,
            platform.y,
            platform.width,
            platform.height
        );
    }


    // Draw player

    drawPlayer(ctx);


    // End camera transformation

    ctx.restore();
}



const FIXED_DT = 1 / 60;
const MAX_FRAME_TIME = 0.1;

let lastTime = performance.now();
let accumulator = 0;


function gameLoop(currentTime) {

    const frameTime = Math.min(
        (currentTime - lastTime) / 1000,
        MAX_FRAME_TIME
    );

    lastTime = currentTime;

    accumulator += frameTime;


    while (accumulator >= FIXED_DT) {

        update(FIXED_DT);

        accumulator -= FIXED_DT;
    }


    draw();

    requestAnimationFrame(gameLoop);
}


async function startGame() {

    await loadLevel();

    spawnPlayer(level);

    requestAnimationFrame(gameLoop);
}


startGame();
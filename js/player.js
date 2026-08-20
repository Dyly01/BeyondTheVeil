import {
    isKeyDown,
    isKeyPressed
} from "./input.js";
import {
    gravity,
    resolveHorizontalCollision,
    resolveVerticalCollision
} from "./physics.js";
import { level } from "./level.js";


// Player object
const player = {

    x: 0,
    y: 0,

    width: 40,
    height: 60,

    // Horizontal movement
    velocityX: 0,
    acceleration: 1200,
    maxSpeed: 400,
    friction: 0.8,

    // Vertical movement
    velocityY: 0,
    jumpStrength: 750,

    grounded: false
};

// Spawn player at the level's spawn point
function spawnPlayer(level) {

    player.x = level.spawn.x;
    player.y = level.spawn.y;

    player.velocityX = 0;
    player.velocityY = 0;
    player.grounded = false;
}

// Update player position and handle collisions
function updatePlayer(deltaTime) {

    // --------------------------------
    // Horizontal movement inputs
    // --------------------------------

    if (
    isKeyDown("a") ||
    isKeyDown("ArrowLeft")
    ) {

        player.velocityX -=
            player.acceleration * deltaTime;
    }
    else if (
        isKeyDown("d") ||
        isKeyDown("ArrowRight")
    ) {

        player.velocityX +=
            player.acceleration * deltaTime;
    }
    else {

        player.velocityX *= player.friction;
    }

    // --------------------------------
    // Limit horizontal velocity
    // --------------------------------

    player.velocityX = Math.max(
        -player.maxSpeed,
        Math.min(
            player.velocityX,
            player.maxSpeed
        )
    );


    // --------------------------------
    // Jump
    // --------------------------------

    if (
        (
            isKeyPressed(" ") ||
            isKeyPressed("w") ||
            isKeyPressed("ArrowUp")
        )
        && player.grounded
    ) {

        player.velocityY = -player.jumpStrength;
        player.grounded = false;
    }

    // --------------------------------
    // Gravity
    // --------------------------------

    player.velocityY += gravity * deltaTime;


    // --------------------------------
    // Horizontal movement
    // --------------------------------

    player.x += player.velocityX * deltaTime;


    // --------------------------------
    // Horizontal collision
    // --------------------------------

    for (const platform of level.platforms) {

        resolveHorizontalCollision(player, platform);
    }


    // --------------------------------
    // Vertical movement
    // --------------------------------

    player.y += player.velocityY * deltaTime;


    // --------------------------------
    // Vertical collision
    // --------------------------------

    player.grounded = false;

    for (const platform of level.platforms) {

        resolveVerticalCollision(player, platform);
    }
}


// Draw player on the canvas
function drawPlayer(ctx) {

    ctx.fillStyle = "white";

    ctx.fillRect(
        player.x,
        player.y,
        player.width,
        player.height
    );
}

export {
    player,
    spawnPlayer,
    updatePlayer,
    drawPlayer
};
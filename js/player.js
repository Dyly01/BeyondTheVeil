import {
    isKeyDown,
    isKeyPressed
} from "./input.js";

import {
    gravity,
    resolveHorizontalCollision,
    resolveVerticalCollision
} from "./physics.js";

import {
    level
} from "./level.js";


const player = {

    x: 0,
    y: 0,

    width: 40,
    height: 60,


    velocityX: 0,
    acceleration: 1200,
    maxSpeed: 400,
    friction: 0.8,


    velocityY: 0,
    jumpStrength: 750,


    grounded: false,


    canDoubleJump: false,
    doubleJumpUsed: false

};


function spawnPlayer(level) {

    player.x =
        level.spawn.x;

    player.y =
        level.spawn.y;

    player.velocityX =
        0;

    player.velocityY =
        0;

    player.grounded =
        false;

    player.doubleJumpUsed =
        false;

}


function updatePlayer(
    deltaTime
) {

    const left =
        isKeyDown("a") ||
        isKeyDown("ArrowLeft");

    const right =
        isKeyDown("d") ||
        isKeyDown("ArrowRight");


    if (
        left &&
        !right
    ) {

        player.velocityX -=
            player.acceleration *
            deltaTime;

    }


    if (
        right &&
        !left
    ) {

        player.velocityX +=
            player.acceleration *
            deltaTime;

    }


    if (
        (!left && !right) ||
        (left && right)
    ) {

        player.velocityX *=
            player.friction;

    }


    player.velocityX =
        Math.max(
            -player.maxSpeed,
            Math.min(
                player.velocityX,
                player.maxSpeed
            )
        );


    const jumpPressed =
        isKeyPressed(" ") ||
        isKeyPressed("w") ||
        isKeyPressed("ArrowUp");


    if (
        jumpPressed &&
        player.grounded
    ) {

        player.velocityY =
            -player.jumpStrength;

        player.grounded =
            false;

        player.doubleJumpUsed =
            false;

    }

    else if (
        jumpPressed &&
        !player.grounded &&
        player.canDoubleJump &&
        !player.doubleJumpUsed
    ) {

        player.velocityY =
            -player.jumpStrength;

        player.doubleJumpUsed =
            true;

    }


    player.velocityY +=
        gravity *
        deltaTime;


    player.x +=
        player.velocityX *
        deltaTime;


    for (
        const platform of level.platforms
    ) {

        resolveHorizontalCollision(
            player,
            platform
        );

    }


    player.y +=
        player.velocityY *
        deltaTime;


    player.grounded =
        false;


    for (
        const platform of level.platforms
    ) {

        resolveVerticalCollision(
            player,
            platform
        );

    }

}


function drawPlayer(
    ctx
) {

    ctx.fillStyle =
        "white";

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
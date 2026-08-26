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

import {
    playJumpSound
} from "./audio.js";

const sprites = {
    idle: new Image(),
    run: new Image(),
    jump: new Image()
};

sprites.idle.src = "./images/player/Idle.png";
sprites.run.src = "./images/player/Run.png";
sprites.jump.src = "./images/player/Jump.png";


const player = {

    x: 0,
    y: 0,

    width: 20,
    height: 60,


    velocityX: 0,
    acceleration: 1200,
    maxSpeed: 400,
    friction: 0.8,


    velocityY: 0,
    jumpStrength: 750,


    grounded: false,


    canDoubleJump: false,
    doubleJumpUsed: false,

    animation: "idle",
    animationFrame: 0,
    animationTimer: 0,

    animationSpeed: {
        idle: 8,
        run: 10,
        jump: 12
    },

    spriteWidth: 80,
    spriteHeight: 100,

    spriteOffsetX: -30,
    spriteOffsetY: -40,

    facingRight: true,

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

function updateAnimation(deltaTime) {

    let newAnimation;

    if (!player.grounded) {
        newAnimation = "jump";
    }
    else if (Math.abs(player.velocityX) > 10) {
        newAnimation = "run";
    }
    else {
        newAnimation = "idle";
    }

    if (newAnimation !== player.animation) {

        player.animation = newAnimation;
        player.animationFrame = 0;
        player.animationTimer = 0;

    }

    player.animationTimer += deltaTime;

    const frameDuration =
        1 / player.animationSpeed[player.animation];

    if (player.animationTimer >= frameDuration) {

        player.animationTimer -= frameDuration;

        const frameCount = {
            idle: 6,
            run: 8,
            jump: 12
        }[player.animation];

        if (
            player.animation === "jump" &&
            player.animationFrame >= frameCount - 1
        ) {
            player.animationFrame = frameCount - 1;
        }
        else {
            player.animationFrame++;

            if (player.animationFrame >= frameCount) {
                player.animationFrame = 0;
            }
        }
    }
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
        player.facingRight = false;
    }


    if (
        right &&
        !left
    ) {

        player.velocityX +=
            player.acceleration *
            deltaTime;
        player.facingRight = true;

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

        playJumpSound();

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

        player.animationFrame = 0;
        player.animationTimer = 0;

        playJumpSound();
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

    updateAnimation(deltaTime);

}

function drawPlayer(ctx) {

    const sprite =
        sprites[player.animation];

    if (!sprite.complete) {
        return;
    }

    const sourceX =
        player.animationFrame * 128;

    const drawX =
        player.x + player.spriteOffsetX;

    const drawY =
        player.y + player.spriteOffsetY;


    ctx.save();

    if (player.facingRight) {

        ctx.drawImage(
            sprite,
            sourceX,
            0,
            128,
            128,

            drawX,
            drawY,
            player.spriteWidth,
            player.spriteHeight
        );

    }
    else {

        ctx.translate(
            drawX + player.spriteWidth,
            drawY
        );

        ctx.scale(
            -1,
            1
        );

        ctx.drawImage(
            sprite,
            sourceX,
            0,
            128,
            128,

            0,
            0,
            player.spriteWidth,
            player.spriteHeight
        );

    }

    ctx.restore();
}


export {
    player,
    spawnPlayer,
    updatePlayer,
    drawPlayer
};
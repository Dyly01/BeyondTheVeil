// Gravity
const gravity = 1800;


// --------------------------------
// Collision detection
// --------------------------------

function isColliding(a, b) {

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}


// --------------------------------
// Horizontal collision resolution
// --------------------------------

function resolveHorizontalCollision(player, platform) {

    if (!isColliding(player, platform)) {
        return;
    }


    // Moving right

    if (player.velocityX > 0) {

        player.x =
            platform.x - player.width;

        player.velocityX = 0;
    }


    // Moving left

    else if (player.velocityX < 0) {

        player.x =
            platform.x + platform.width;

        player.velocityX = 0;
    }
}


// --------------------------------
// Vertical collision resolution
// --------------------------------

function resolveVerticalCollision(player, platform) {

    if (!isColliding(player, platform)) {
        return;
    }


    // Moving downward
    // → landed on top

    if (player.velocityY > 0) {

        player.y =
            platform.y - player.height;

        player.velocityY = 0;

        player.grounded = true;
    }


    // Moving upward
    // → hit the bottom

    else if (player.velocityY < 0) {

        player.y =
            platform.y + platform.height;

        player.velocityY = 0;
    }
}


export {
    gravity,
    isColliding,
    resolveHorizontalCollision,
    resolveVerticalCollision
};
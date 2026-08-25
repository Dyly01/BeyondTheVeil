import {
    player
} from "./player.js";

import {
    isColliding
} from "./physics.js";

const collectibles = [];

function loadCollectibles(level) {

    collectibles.length = 0;

    if (!Array.isArray(level.collectibles)) {
        return;
    }

    for (const data of level.collectibles) {

        collectibles.push({
            type: data.type,
            x: data.x,
            y: data.y,
            width: data.width || 40,
            height: data.height || 40,
            collected: false
        });

    }
}

function updateCollectibles() {

    for (const collectible of collectibles) {

        if (collectible.collected) {
            continue;
        }

        if (isColliding(player, collectible)) {

            collectible.collected = true;

            console.log(
                `${collectible.type} collected!`
            );
        }
    }
}

function drawCollectibles(ctx) {

    for (const collectible of collectibles) {

        if (collectible.collected) {
            continue;
        }

        if (collectible.type === "jewel") {

            ctx.fillStyle = "cyan";

            ctx.beginPath();

            ctx.moveTo(
                collectible.x + collectible.width / 2,
                collectible.y
            );

            ctx.lineTo(
                collectible.x + collectible.width,
                collectible.y + collectible.height / 2
            );

            ctx.lineTo(
                collectible.x + collectible.width / 2,
                collectible.y + collectible.height
            );

            ctx.lineTo(
                collectible.x,
                collectible.y + collectible.height / 2
            );

            ctx.closePath();

            ctx.fill();

        }

        else if (collectible.type === "crow") {

            ctx.fillStyle = "black";

            ctx.beginPath();

            ctx.arc(
                collectible.x + collectible.width / 2,
                collectible.y + collectible.height / 2,
                collectible.width / 2,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    }
}

function resetCollectibles() {

    for (const collectible of collectibles) {
        collectible.collected = false;
    }

}

export {
    collectibles,
    loadCollectibles,
    updateCollectibles,
    drawCollectibles,
    resetCollectibles
};
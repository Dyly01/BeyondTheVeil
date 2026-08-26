const BACKGROUNDS = {
    forest: "Forest",
    darkForest: "Dark Forest at Night",
    forestPond: "Forest with Pond",
    forestLake: "Lake near Forest",
    mountainForest: "Mountain through Forest",
    castle: "Castle",
};

const PLATFORM_STYLES = {
    stone: "Stone",
    moss: "Moss",
    wood: "Wood",
    crystal: "Crystal",
    neon: "Neon"
};


function drawBackground(
    ctx,
    scene = "forest",
    worldWidth,
    worldHeight,
    cameraX = 0,
    cameraY = 0
) {

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            height
        );

    const night =
        scene === "darkForest";


    gradient.addColorStop(
        0,
        night ? "#101b31" : "#8ec9d0"
    );

    gradient.addColorStop(
        0.55,
        night ? "#26384a" : "#b9d49d"
    );

    gradient.addColorStop(
        1,
        night ? "#111a20" : "#456d4d"
    );


    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    if (night) {

        ctx.fillStyle =
            "#f4e8b0";

        ctx.beginPath();

        ctx.arc(
            width * 0.82,
            height * 0.18,
            34,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }
    else {

        ctx.fillStyle =
            "#f7d98a";

        ctx.beginPath();

        ctx.arc(
            width * 0.78,
            height * 0.16,
            45,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }


    if (
        scene === "mountainForest"
    ) {

        drawMountainRange(
            ctx,
            width,
            height,
            cameraX
        );

    }


    if (
        scene === "forestPond"
    ) {

        drawWater(
            ctx,
            width * 0.62,
            height * 0.74,
            width * 0.22,
            height * 0.1,
            "#3d9bb0"
        );

    }


    if (
        scene === "forestLake"
    ) {

        drawWater(
            ctx,
            width * 0.5,
            height * 0.72,
            width * 0.55,
            height * 0.18,
            "#378ba2"
        );

    }

    if (scene === "castle") {
        drawCastleBackground(ctx, width, height, cameraX);
    } else {
        drawTreeLine(ctx, width, height, cameraX, night);
        drawGroundMist(ctx, width, height, night);
    }
}


function drawMountainRange(
    ctx,
    width,
    height,
    cameraX
) {

    ctx.fillStyle =
        "#536a70";

    ctx.beginPath();

    ctx.moveTo(
        -80 - cameraX * 0.08,
        height * 0.58
    );

    ctx.lineTo(
        width * 0.18 - cameraX * 0.08,
        height * 0.15
    );

    ctx.lineTo(
        width * 0.34 - cameraX * 0.08,
        height * 0.4
    );

    ctx.lineTo(
        width * 0.54 - cameraX * 0.08,
        height * 0.12
    );

    ctx.lineTo(
        width * 0.78 - cameraX * 0.08,
        height * 0.48
    );

    ctx.lineTo(
        width + 80,
        height * 0.24
    );

    ctx.lineTo(
        width + 80,
        height
    );

    ctx.lineTo(
        -80,
        height
    );

    ctx.closePath();

    ctx.fill();


    ctx.fillStyle =
        "rgba(225, 239, 224, 0.7)";

    ctx.beginPath();

    ctx.moveTo(
        width * 0.18 - cameraX * 0.08,
        height * 0.15
    );

    ctx.lineTo(
        width * 0.27 - cameraX * 0.08,
        height * 0.36
    );

    ctx.lineTo(
        width * 0.23 - cameraX * 0.08,
        height * 0.31
    );

    ctx.lineTo(
        width * 0.34 - cameraX * 0.08,
        height * 0.4
    );

    ctx.closePath();

    ctx.fill();
}


function drawTreeLine(
    ctx,
    width,
    height,
    cameraX,
    night
) {

    const treeColor =
        night
            ? "#0c1b24"
            : "#244b3a";

    const shadowColor =
        night
            ? "#142a32"
            : "#326248";

    const baseY =
        height * 0.78;

    const spacing =
        105;

    const offset =
        -((cameraX * 0.18) % spacing);


    for (
        let x = offset - spacing;
        x < width + spacing;
        x += spacing
    ) {

        drawTree(
            ctx,
            x,
            baseY,
            0.85,
            treeColor
        );

        drawTree(
            ctx,
            x + 48,
            baseY + 22,
            0.58,
            shadowColor
        );

    }
}


function drawTree(
    ctx,
    x,
    y,
    scale,
    color
) {

    ctx.fillStyle =
        color;

    ctx.fillRect(
        x - 7 * scale,
        y - 90 * scale,
        14 * scale,
        105 * scale
    );


    ctx.beginPath();

    ctx.moveTo(
        x,
        y - 165 * scale
    );

    ctx.lineTo(
        x - 54 * scale,
        y - 45 * scale
    );

    ctx.lineTo(
        x + 54 * scale,
        y - 45 * scale
    );

    ctx.closePath();

    ctx.fill();


    ctx.beginPath();

    ctx.moveTo(
        x,
        y - 125 * scale
    );

    ctx.lineTo(
        x - 43 * scale,
        y - 15 * scale
    );

    ctx.lineTo(
        x + 43 * scale,
        y - 15 * scale
    );

    ctx.closePath();

    ctx.fill();
}


function drawGem(
    ctx,
    gem
) {

    if (!gem) {
        return;
    }


    ctx.save();


    ctx.translate(
        gem.x + gem.width / 2,
        gem.y + gem.height / 2
    );


    ctx.fillStyle =
        "cyan";


    ctx.beginPath();

    ctx.moveTo(
        0,
        -gem.height / 2
    );

    ctx.lineTo(
        gem.width / 2,
        0
    );

    ctx.lineTo(
        0,
        gem.height / 2
    );

    ctx.lineTo(
        -gem.width / 2,
        0
    );

    ctx.closePath();

    ctx.fill();


    ctx.strokeStyle =
        "white";

    ctx.lineWidth =
        2;

    ctx.stroke();


    ctx.restore();
}


function drawCrown(
    ctx,
    crown
) {

    if (!crown) {
        return;
    }


    ctx.save();


    const x =
        crown.x;

    const y =
        crown.y;

    const width =
        crown.width;

    const height =
        crown.height;


    ctx.fillStyle =
        "#f4d35e";


    ctx.beginPath();

    ctx.moveTo(
        x,
        y + height
    );

    ctx.lineTo(
        x + width,
        y + height
    );

    ctx.lineTo(
        x + width * 0.85,
        y + height * 0.35
    );

    ctx.lineTo(
        x + width * 0.65,
        y + height * 0.65
    );

    ctx.lineTo(
        x + width * 0.5,
        y
    );

    ctx.lineTo(
        x + width * 0.35,
        y + height * 0.65
    );

    ctx.lineTo(
        x + width * 0.15,
        y + height * 0.35
    );

    ctx.closePath();

    ctx.fill();


    ctx.strokeStyle =
        "#b8860b";

    ctx.lineWidth =
        2;

    ctx.stroke();


    ctx.fillStyle =
        "#e63946";

    ctx.beginPath();

    ctx.arc(
        x + width * 0.3,
        y + height * 0.72,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#457b9d";

    ctx.beginPath();

    ctx.arc(
        x + width * 0.5,
        y + height * 0.72,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.fillStyle =
        "#e63946";

    ctx.beginPath();

    ctx.arc(
        x + width * 0.7,
        y + height * 0.72,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.restore();
}


function drawKey(
    ctx,
    key
) {

    if (!key) {
        return;
    }


    ctx.save();


    const centerX =
        key.x + key.width * 0.3;

    const centerY =
        key.y + key.height * 0.3;

    const radius =
        Math.min(
            key.width,
            key.height
        ) * 0.25;


    ctx.strokeStyle =
        "#f4d35e";

    ctx.lineWidth =
        5;


    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        radius,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    ctx.beginPath();

    ctx.moveTo(
        centerX + radius,
        centerY
    );

    ctx.lineTo(
        key.x + key.width,
        key.y + key.height * 0.7
    );

    ctx.lineTo(
        key.x + key.width * 0.75,
        key.y + key.height * 0.7
    );

    ctx.lineTo(
        key.x + key.width * 0.65,
        key.y + key.height
    );

    ctx.stroke();


    ctx.restore();
}


function drawWater(
    ctx,
    x,
    y,
    width,
    height,
    color
) {

    ctx.fillStyle =
        color;

    ctx.beginPath();

    ctx.ellipse(
        x,
        y,
        width,
        height,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();


    ctx.strokeStyle =
        "rgba(204, 242, 230, 0.55)";

    ctx.lineWidth =
        2;


    for (
        let index = -2;
        index <= 2;
        index++
    ) {

        ctx.beginPath();

        ctx.ellipse(
            x,
            y + index * height * 0.27,
            width * 0.65,
            height * 0.08,
            0,
            0,
            Math.PI * 2
        );

        ctx.stroke();

    }
}


function drawGroundMist(
    ctx,
    width,
    height,
    night
) {

    ctx.fillStyle =
        night
            ? "rgba(119, 161, 161, 0.08)"
            : "rgba(227, 239, 202, 0.16)";

    ctx.fillRect(
        0,
        height * 0.76,
        width,
        height * 0.24
    );
}


function drawDoor(ctx, door, locked = false) {

    if (!door) {
        return;
    }

    ctx.fillStyle = "#382a32";

    ctx.fillRect(
        door.x,
        door.y,
        door.width,
        door.height
    );

    ctx.strokeStyle =
        locked
            ? "#777777"
            : "#e5d994";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        door.x + 2,
        door.y + 2,
        door.width - 4,
        door.height - 2
    );

    if (locked) {

        drawLock(
            ctx,
            door
        );

    }
    else {

        ctx.fillStyle = "#e5d994";

        ctx.beginPath();

        ctx.arc(
            door.x + door.width - 12,
            door.y + door.height / 2,
            3,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }
}

function drawLock(ctx, door) {

    const centerX =
        door.x +
        door.width / 2;

    const centerY =
        door.y -
        30;

    const lockWidth = 26;
    const lockHeight = 22;

    ctx.save();

    // Schlosskörper

    ctx.fillStyle = "#777777";

    ctx.fillRect(
        centerX - lockWidth / 2,
        centerY,
        lockWidth,
        lockHeight
    );

    // Bügel

    ctx.strokeStyle = "#777777";

    ctx.lineWidth = 6;

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY,
        10,
        Math.PI,
        0
    );

    ctx.stroke();

    // kleines Schlüsselloch

    ctx.fillStyle = "#252525";

    ctx.beginPath();

    ctx.arc(
        centerX,
        centerY + 9,
        3,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillRect(
        centerX - 1.5,
        centerY + 9,
        3,
        7
    );

    ctx.restore();
}



function drawThrone(ctx, throne) {

    if (!throne) {
        return;
    }

    ctx.save();

    ctx.fillStyle = "#5a3b2e";

    ctx.fillRect(
        throne.x + throne.width * 0.2,
        throne.y + throne.height * 0.35,
        throne.width * 0.6,
        throne.height * 0.65
    );

    ctx.fillStyle = "#704936";

    ctx.fillRect(
        throne.x + throne.width * 0.1,
        throne.y,
        throne.width * 0.8,
        throne.height * 0.45
    );

    ctx.fillStyle = "#d4af37";

    ctx.fillRect(
        throne.x + throne.width * 0.1,
        throne.y,
        throne.width * 0.8,
        8
    );

    ctx.fillRect(
        throne.x + throne.width * 0.1,
        throne.y,
        8,
        throne.height * 0.45
    );

    ctx.fillRect(
        throne.x + throne.width * 0.82,
        throne.y,
        8,
        throne.height * 0.45
    );

    ctx.restore();
}

function drawPlatform(
    ctx,
    platform
) {

    const style =
        platform.style || "stone";

    const color =
        platform.color || "#737d81";

    const highlight =
        platformHighlight(
            style,
            color
        );


    ctx.fillStyle =
        color;

    ctx.fillRect(
        platform.x,
        platform.y,
        platform.width,
        platform.height
    );


    ctx.fillStyle =
        highlight;

    ctx.fillRect(
        platform.x,
        platform.y,
        platform.width,
        Math.min(
            8,
            platform.height
        )
    );


    if (
        style === "moss"
    ) {

        ctx.fillStyle =
            "#8fbd62";


        for (
            let x = platform.x + 8;
            x < platform.x + platform.width;
            x += 20
        ) {

            ctx.fillRect(
                x,
                platform.y - 4,
                10,
                4
            );

        }

    }
    else if (
        style === "wood"
    ) {

        ctx.strokeStyle =
            "rgba(75, 38, 22, 0.45)";

        ctx.lineWidth =
            2;


        for (
            let x = platform.x + 12;
            x < platform.x + platform.width;
            x += 28
        ) {

            ctx.beginPath();

            ctx.moveTo(
                x,
                platform.y + 8
            );

            ctx.lineTo(
                x + 8,
                platform.y + platform.height - 4
            );

            ctx.stroke();

        }

    }
    else if (
        style === "crystal" ||
        style === "neon"
    ) {

        ctx.strokeStyle =
            highlight;

        ctx.lineWidth =
            2;

        ctx.strokeRect(
            platform.x + 2,
            platform.y + 2,
            platform.width - 4,
            platform.height - 4
        );

    }
}


function platformHighlight(
    style,
    color
) {

    if (
        style === "moss"
    ) {

        return "#d0e79b";

    }

    if (
        style === "wood"
    ) {

        return "#d69a55";

    }

    if (
        style === "crystal"
    ) {

        return "#c5f5ff";

    }

    if (
        style === "neon"
    ) {

        return "#e9ff75";

    }

    return color === "#737d81"
        ? "#b8c4c0"
        : "#d9e5df";
}

function drawCastleBackground(ctx, width, height, cameraX) {
    const wallGradient = ctx.createLinearGradient(0, 0, 0, height);

    wallGradient.addColorStop(0, "#171923");
    wallGradient.addColorStop(0.65, "#302f3a");
    wallGradient.addColorStop(1, "#15151d");

    ctx.fillStyle = wallGradient;
    ctx.fillRect(0, 0, width, height);

    const parallax = -(cameraX * 0.12);
    const wallTop = height * 0.12;
    const wallBottom = height * 0.78;

    ctx.fillStyle = "#3b3945";
    ctx.fillRect(0, wallTop, width, wallBottom - wallTop);

    ctx.strokeStyle = "rgba(14, 14, 20, 0.42)";
    ctx.lineWidth = 3;

    for (let row = wallTop + 42; row < wallBottom; row += 42) {
        ctx.beginPath();
        ctx.moveTo(0, row);
        ctx.lineTo(width, row);
        ctx.stroke();

        const offset = ((row / 42) % 2) * 55 + parallax;

        for (let column = offset; column < width; column += 110) {
            ctx.beginPath();
            ctx.moveTo(column, row - 42);
            ctx.lineTo(column, row);
            ctx.stroke();
        }
    }

    ctx.fillStyle = "#24232d";
    ctx.fillRect(0, wallBottom, width, height - wallBottom);

    ctx.fillStyle = "#64606a";
    ctx.fillRect(0, wallBottom - 12, width, 12);

    for (let column = 90 + parallax; column < width; column += 360) {
        drawInteriorPillar(ctx, column, wallTop + 10, wallBottom - wallTop - 10);
    }

    for (let torchX = 120 + parallax; torchX < width + 180; torchX += 360) {
        drawTorch(ctx, torchX, height * 0.44);
    }
}

function drawInteriorPillar(ctx, x, y, height) {
    ctx.fillStyle = "#24242e";
    ctx.fillRect(x, y, 54, height);

    ctx.fillStyle = "#57525c";
    ctx.fillRect(x - 10, y, 74, 18);
    ctx.fillRect(x - 10, y + height - 18, 74, 18);

    ctx.fillStyle = "rgba(133, 126, 131, 0.25)";
    ctx.fillRect(x + 8, y + 18, 8, height - 36);
}

function drawTorch(ctx, x, y) {
    const light = ctx.createRadialGradient(x, y, 2, x, y, 150);

    light.addColorStop(0, "rgba(255, 220, 112, 0.42)");
    light.addColorStop(0.45, "rgba(255, 143, 48, 0.16)");
    light.addColorStop(1, "rgba(255, 113, 26, 0)");

    ctx.fillStyle = light;
    ctx.beginPath();
    ctx.arc(x, y, 150, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#8b5a35";
    ctx.fillRect(x - 5, y + 10, 10, 42);

    ctx.fillStyle = "#d5b15b";
    ctx.fillRect(x - 13, y + 7, 26, 8);

    ctx.fillStyle = "#ffb52f";
    ctx.beginPath();
    ctx.moveTo(x, y - 26);
    ctx.lineTo(x - 13, y + 7);
    ctx.lineTo(x + 13, y + 7);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fff0a1";
    ctx.beginPath();
    ctx.moveTo(x, y - 15);
    ctx.lineTo(x - 5, y + 5);
    ctx.lineTo(x + 5, y + 5);
    ctx.closePath();
    ctx.fill();
}

export {
    BACKGROUNDS,
    PLATFORM_STYLES,
    drawBackground,
    drawPlatform,
    drawDoor,
    drawGem,
    drawCrown,
    drawKey,
    drawThrone
};
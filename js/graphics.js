// NEW: shared generated scene and platform artwork renderer.
const BACKGROUNDS = {
    forest: "Forest",
    darkForest: "Dark Forest at Night",
    forestPond: "Forest with Pond",
    forestLake: "Lake near Forest",
    mountainForest: "Mountain through Forest"
};

const PLATFORM_STYLES = {
    stone: "Stone",
    moss: "Moss",
    wood: "Wood",
    crystal: "Crystal",
    neon: "Neon"
};

function drawBackground(ctx, scene = "forest", worldWidth, worldHeight, cameraX = 0, cameraY = 0) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    const night = scene === "darkForest";

    gradient.addColorStop(0, night ? "#101b31" : "#8ec9d0");
    gradient.addColorStop(0.55, night ? "#26384a" : "#b9d49d");
    gradient.addColorStop(1, night ? "#111a20" : "#456d4d");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    if (night) {
        ctx.fillStyle = "#f4e8b0";
        ctx.beginPath();
        ctx.arc(width * 0.82, height * 0.18, 34, 0, Math.PI * 2);
        ctx.fill();
    } else {
        ctx.fillStyle = "#f7d98a";
        ctx.beginPath();
        ctx.arc(width * 0.78, height * 0.16, 45, 0, Math.PI * 2);
        ctx.fill();
    }

    if (scene === "mountainForest") {
        drawMountainRange(ctx, width, height, cameraX);
    }

    if (scene === "forestPond") {
        drawWater(ctx, width * 0.62, height * 0.74, width * 0.22, height * 0.1, "#3d9bb0");
    }

    if (scene === "forestLake") {
        drawWater(ctx, width * 0.5, height * 0.72, width * 0.55, height * 0.18, "#378ba2");
    }

    drawTreeLine(ctx, width, height, cameraX, night);
    drawGroundMist(ctx, width, height, night);
}

function drawMountainRange(ctx, width, height, cameraX) {
    ctx.fillStyle = "#536a70";
    ctx.beginPath();
    ctx.moveTo(-80 - cameraX * 0.08, height * 0.58);
    ctx.lineTo(width * 0.18 - cameraX * 0.08, height * 0.15);
    ctx.lineTo(width * 0.34 - cameraX * 0.08, height * 0.4);
    ctx.lineTo(width * 0.54 - cameraX * 0.08, height * 0.12);
    ctx.lineTo(width * 0.78 - cameraX * 0.08, height * 0.48);
    ctx.lineTo(width + 80, height * 0.24);
    ctx.lineTo(width + 80, height);
    ctx.lineTo(-80, height);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "rgba(225, 239, 224, 0.7)";
    ctx.beginPath();
    ctx.moveTo(width * 0.18 - cameraX * 0.08, height * 0.15);
    ctx.lineTo(width * 0.27 - cameraX * 0.08, height * 0.36);
    ctx.lineTo(width * 0.23 - cameraX * 0.08, height * 0.31);
    ctx.lineTo(width * 0.34 - cameraX * 0.08, height * 0.4);
    ctx.closePath();
    ctx.fill();
}

function drawTreeLine(ctx, width, height, cameraX, night) {
    const treeColor = night ? "#0c1b24" : "#244b3a";
    const shadowColor = night ? "#142a32" : "#326248";
    const baseY = height * 0.78;
    const spacing = 105;
    const offset = -((cameraX * 0.18) % spacing);

    for (let x = offset - spacing; x < width + spacing; x += spacing) {
        drawTree(ctx, x, baseY, 0.85, treeColor);
        drawTree(ctx, x + 48, baseY + 22, 0.58, shadowColor);
    }
}

function drawTree(ctx, x, y, scale, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x - 7 * scale, y - 90 * scale, 14 * scale, 105 * scale);
    ctx.beginPath();
    ctx.moveTo(x, y - 165 * scale);
    ctx.lineTo(x - 54 * scale, y - 45 * scale);
    ctx.lineTo(x + 54 * scale, y - 45 * scale);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x, y - 125 * scale);
    ctx.lineTo(x - 43 * scale, y - 15 * scale);
    ctx.lineTo(x + 43 * scale, y - 15 * scale);
    ctx.closePath();
    ctx.fill();
}

function drawWater(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, width, height, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(204, 242, 230, 0.55)";
    ctx.lineWidth = 2;
    for (let index = -2; index <= 2; index++) {
        ctx.beginPath();
        ctx.ellipse(x, y + index * height * 0.27, width * 0.65, height * 0.08, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
}

function drawGroundMist(ctx, width, height, night) {
    ctx.fillStyle = night ? "rgba(119, 161, 161, 0.08)" : "rgba(227, 239, 202, 0.16)";
    ctx.fillRect(0, height * 0.76, width, height * 0.24);
}

// NEW 2026-08-24 09:02:00 CEST: Draw the doorway that advances to the next level.
function drawDoor(ctx, door) {
    if (!door) return;

    ctx.fillStyle = "#382a32";
    ctx.fillRect(door.x, door.y, door.width, door.height);
    ctx.strokeStyle = "#e5d994";
    ctx.lineWidth = 4;
    ctx.strokeRect(door.x + 2, door.y + 2, door.width - 4, door.height - 2);
    ctx.fillStyle = "#e5d994";
    ctx.beginPath();
    ctx.arc(door.x + door.width - 12, door.y + door.height / 2, 3, 0, Math.PI * 2);
    ctx.fill();
}

function drawPlatform(ctx, platform) {
    const style = platform.style || "stone";
    const color = platform.color || "#737d81";
    const highlight = platformHighlight(style, color);

    ctx.fillStyle = color;
    ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    ctx.fillStyle = highlight;
    ctx.fillRect(platform.x, platform.y, platform.width, Math.min(8, platform.height));

    if (style === "moss") {
        ctx.fillStyle = "#8fbd62";
        for (let x = platform.x + 8; x < platform.x + platform.width; x += 20) {
            ctx.fillRect(x, platform.y - 4, 10, 4);
        }
    } else if (style === "wood") {
        ctx.strokeStyle = "rgba(75, 38, 22, 0.45)";
        ctx.lineWidth = 2;
        for (let x = platform.x + 12; x < platform.x + platform.width; x += 28) {
            ctx.beginPath();
            ctx.moveTo(x, platform.y + 8);
            ctx.lineTo(x + 8, platform.y + platform.height - 4);
            ctx.stroke();
        }
    } else if (style === "crystal" || style === "neon") {
        ctx.strokeStyle = highlight;
        ctx.lineWidth = 2;
        ctx.strokeRect(platform.x + 2, platform.y + 2, platform.width - 4, platform.height - 4);
    }
}

function platformHighlight(style, color) {
    if (style === "moss") return "#d0e79b";
    if (style === "wood") return "#d69a55";
    if (style === "crystal") return "#c5f5ff";
    if (style === "neon") return "#e9ff75";
    return color === "#737d81" ? "#b8c4c0" : "#d9e5df";
}

export { BACKGROUNDS, PLATFORM_STYLES, drawBackground, drawPlatform, drawDoor };

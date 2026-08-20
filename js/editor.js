// canvas setup
const canvas =
    document.getElementById("editorCanvas");

const ctx =
    canvas.getContext("2d");


function resizeCanvas() {

    canvas.width =
        window.innerWidth;

    canvas.height =
        window.innerHeight;
}

// resize canvas when window is resized
window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();

// editor world setup
const editorWorld = {

    width: 3000,

    height: 1200

};

// camera setup
const camera = {

    x: 0,

    y: 0,

    speed: 500

};

// grid setup
const GRID_SIZE = 25;

// current tool setup
let isDragging = false;

let dragStart = null;

let dragCurrent = null;

let currentTool = "platform";

let selectedPlatform = null;

document
    .getElementById("platformTool")
    .addEventListener("click", () => {

        currentTool = "platform";

    });

// get platform at position
function getPlatformAtPosition(x, y) {

    for (let i = platforms.length - 1; i >= 0; i--) {

        const platform = platforms[i];

        if (
            x >= platform.x &&
            x <= platform.x + platform.width &&
            y >= platform.y &&
            y <= platform.y + platform.height
        ) {

            return platform;
        }
    }

    return null;
}

// convert screen coordinates to world coordinates
function screenToWorld(mouseX, mouseY) {

    return {

        x: mouseX + camera.x,

        y: mouseY + camera.y

    };
}

// Mouse Movement
canvas.addEventListener(
    "mousedown",
    (event) => {

        const worldPosition =
            screenToWorld(
                event.offsetX,
                event.offsetY
            );


        // Check if we clicked a platform

        const platform =
            getPlatformAtPosition(
                worldPosition.x,
                worldPosition.y
            );


        if (platform) {

            selectedPlatform = platform;

            dragStart = {

                x: worldPosition.x,

                y: worldPosition.y

            };

            dragCurrent = dragStart;

            isDragging = true;

            return;
        }


        // Otherwise create a new platform

        if (currentTool !== "platform") {
            return;
        }


        dragStart = {

            x: snapToGrid(worldPosition.x),

            y: snapToGrid(worldPosition.y)

        };


        dragCurrent = dragStart;

        isDragging = true;

    }
);

canvas.addEventListener(
    "mousemove",
    (event) => {

        if (!isDragging) {
            return;
        }


        const worldPosition =
            screenToWorld(
                event.offsetX,
                event.offsetY
            );


        dragCurrent = worldPosition;


        // Move existing platform

        if (selectedPlatform) {

            const deltaX =
                dragCurrent.x -
                dragStart.x;


            const deltaY =
                dragCurrent.y -
                dragStart.y;


            selectedPlatform.x =
                snapToGrid(
                    selectedPlatform.x + deltaX
                );


            selectedPlatform.y =
                snapToGrid(
                    selectedPlatform.y + deltaY
                );


            dragStart = dragCurrent;

            return;
        }


        // Otherwise update new platform preview

        dragCurrent = {

            x: snapToGrid(worldPosition.x),

            y: snapToGrid(worldPosition.y)

        };

    }
);

canvas.addEventListener(
    "mouseup",
    () => {

        if (!isDragging) {
            return;
        }


        // If we were moving a platform

        if (selectedPlatform) {

            selectedPlatform = null;

            isDragging = false;

            return;
        }


        // Otherwise create a new platform

        const x =
            Math.min(
                dragStart.x,
                dragCurrent.x
            );


        const y =
            Math.min(
                dragStart.y,
                dragCurrent.y
            );


        const width =
            Math.abs(
                dragCurrent.x -
                dragStart.x
            );


        const height =
            Math.abs(
                dragCurrent.y -
                dragStart.y
            );


        if (width > 0 && height > 0) {

            platforms.push({

                x,
                y,
                width,
                height

            });

        }


        isDragging = false;

    }
);

// snap value to grid
function snapToGrid(value) {

    return Math.round(
        value / GRID_SIZE
    ) * GRID_SIZE;
}

// draw grid
function drawGrid() {

    ctx.strokeStyle = "#444";

    ctx.lineWidth = 1;


    const startX =
        Math.floor(
            camera.x / GRID_SIZE
        ) * GRID_SIZE;

    const startY =
        Math.floor(
            camera.y / GRID_SIZE
        ) * GRID_SIZE;


    for (
        let x = startX;
        x < camera.x + canvas.width;
        x += GRID_SIZE
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x - camera.x,
            0
        );

        ctx.lineTo(
            x - camera.x,
            canvas.height
        );

        ctx.stroke();
    }


    for (
        let y = startY;
        y < camera.y + canvas.height;
        y += GRID_SIZE
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y - camera.y
        );

        ctx.lineTo(
            canvas.width,
            y - camera.y
        );

        ctx.stroke();
    }
}

// platforms setup
const platforms = [

    {
        x: 0,
        y: 600,
        width: 1000,
        height: 50
    },

    {
        x: 200,
        y: 500,
        width: 200,
        height: 30
    },

    {
        x: 550,
        y: 420,
        width: 250,
        height: 30
    },

    {
        x: 850,
        y: 330,
        width: 150,
        height: 30
    }

];

// draw platforms
function drawPlatforms() {

    ctx.fillStyle = "#888";


    for (const platform of platforms) {

        ctx.fillRect(

            platform.x - camera.x,

            platform.y - camera.y,

            platform.width,

            platform.height

        );
    }


    // Draw platform preview

    if (
        isDragging &&
        currentTool === "platform"
    ) {

        const x =
            Math.min(
                dragStart.x,
                dragCurrent.x
            );


        const y =
            Math.min(
                dragStart.y,
                dragCurrent.y
            );


        const width =
            Math.abs(
                dragCurrent.x -
                dragStart.x
            );


        const height =
            Math.abs(
                dragCurrent.y -
                dragStart.y
            );


        ctx.fillStyle =
            "rgba(255, 255, 255, 0.4)";


        ctx.fillRect(

            x - camera.x,

            y - camera.y,

            width,

            height

        );
    }

    if (selectedPlatform) {

        ctx.strokeStyle = "yellow";

        ctx.lineWidth = 3;


        ctx.strokeRect(

            selectedPlatform.x - camera.x,

            selectedPlatform.y - camera.y,

            selectedPlatform.width,

            selectedPlatform.height

        );
    }
}

const spawn = {

    x: 200,

    y: 200

};

function drawSpawn() {

    ctx.fillStyle = "lime";


    ctx.fillRect(

        spawn.x - camera.x,

        spawn.y - camera.y,

        40,

        60

    );
}

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawGrid();

    drawPlatforms();

    drawSpawn();
}


function gameLoop() {

    draw();

    requestAnimationFrame(gameLoop);
}


gameLoop();
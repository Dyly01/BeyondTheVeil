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

    zoom: 1,

    speed: 500

};

const editorKeys = {};

document.addEventListener(
    "keydown",
    (event) => {

        editorKeys[event.key] = true;

    }
);


document.addEventListener(
    "keyup",
    (event) => {

        editorKeys[event.key] = false;

    }
);

function updateCamera(deltaTime) {

    let moveX = 0;

    let moveY = 0;


    if (
        editorKeys["a"] ||
        editorKeys["ArrowLeft"]
    ) {

        moveX -= 1;

    }


    if (
        editorKeys["d"] ||
        editorKeys["ArrowRight"]
    ) {

        moveX += 1;

    }


    if (
        editorKeys["w"] ||
        editorKeys["ArrowUp"]
    ) {

        moveY -= 1;

    }


    if (
        editorKeys["s"] ||
        editorKeys["ArrowDown"]
    ) {

        moveY += 1;

    }


    camera.x +=
        moveX *
        camera.speed *
        deltaTime /
        camera.zoom;


    camera.y +=
        moveY *
        camera.speed *
        deltaTime /
        camera.zoom;


    // Keep camera inside world

    const maxX =
        editorWorld.width -
        canvas.width / camera.zoom;


    const maxY =
        editorWorld.height -
        canvas.height / camera.zoom;


    camera.x =
        Math.max(
            0,
            Math.min(camera.x, maxX)
        );


    camera.y =
        Math.max(
            0,
            Math.min(camera.y, maxY)
        );

}

// grid setup
const GRID_SIZE = 25;

// current tool setup
let isDragging = false;

let dragStart = null;

let dragCurrent = null;

let currentTool = "platform";

let selectedPlatform = null;

let resizingHandle = null;

let dragOffsetX = 0;
let dragOffsetY = 0;

let originalPlatform = null;

document
    .getElementById("platformTool")
    .addEventListener("click", () => {

        currentTool = "platform";

    });

document
    .getElementById("eraseTool")
    .addEventListener("click", () => {

        currentTool = "erase";

        selectedPlatform = null;

    });

document
    .getElementById("saveButton")
    .addEventListener(
        "click",
        saveLevel
    );

document
    .getElementById("spawnTool")
    .addEventListener("click", () => {

        currentTool = "spawn";

        selectedPlatform = null;

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

        x:
            mouseX / camera.zoom +
            camera.x,

        y:
            mouseY / camera.zoom +
            camera.y

    };

}



// Mouse Movement

function getResizeHandle(x, y, platform) {

    const handleSize = 10;

    const screenX =
        (platform.x - camera.x) *
        camera.zoom;

    const screenY =
        (platform.y - camera.y) *
        camera.zoom;

    const screenWidth =
        platform.width *
        camera.zoom;

    const screenHeight =
        platform.height *
        camera.zoom;


    const handles = {

        topLeft: {
            x: screenX,
            y: screenY
        },

        topRight: {
            x: screenX + screenWidth,
            y: screenY
        },

        bottomLeft: {
            x: screenX,
            y: screenY + screenHeight
        },

        bottomRight: {
            x: screenX + screenWidth,
            y: screenY + screenHeight
        }

    };


    for (const [name, handle] of Object.entries(handles)) {

        if (
            Math.abs(x - handle.x) <= handleSize &&
            Math.abs(y - handle.y) <= handleSize
        ) {

            return name;

        }
    }


    return null;
}

canvas.addEventListener(
    "mousedown",
    (event) => {

        const worldPosition =
            screenToWorld(
                event.offsetX,
                event.offsetY
            );
        
        if (currentTool === "spawn") {

            spawn.x =
                snapToGrid(
                    worldPosition.x
                );


            spawn.y =
                snapToGrid(
                    worldPosition.y
                );


            return;
        }



        if (currentTool === "erase") {

            const platform =
                getPlatformAtPosition(
                    worldPosition.x,
                    worldPosition.y
                );


            if (platform) {

                const index =
                    platforms.indexOf(platform);


                if (index !== -1) {

                    platforms.splice(index, 1);

                }

            }


            return;
        }

        if (selectedPlatform && currentTool === "platform") {

            const handle =
                getResizeHandle(
                    event.offsetX,
                    event.offsetY,
                    selectedPlatform
                );


            if (handle) {

                resizingHandle = handle;

                isDragging = true;

                dragStart =
                    screenToWorld(
                        event.offsetX,
                        event.offsetY
                    );

                return;
            }
        }


        // Check if we clicked a platform

        const platform =
            getPlatformAtPosition(
                worldPosition.x,
                worldPosition.y
            );


        if (platform) {

            selectedPlatform = platform;


            // Remember where inside the platform
            // we clicked.

            dragOffsetX =
                worldPosition.x -
                platform.x;

            dragOffsetY =
                worldPosition.y -
                platform.y;


            // Remember original platform position.

            originalPlatform = {

                x: platform.x,

                y: platform.y,

                width: platform.width,

                height: platform.height

            };


            isDragging = true;

            return;
        }


        // Otherwise create a new platform

        if (currentTool !== "platform") {
            return;
        }

        
        selectedPlatform = null;


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


        // --------------------------------
        // Resize platform
        // --------------------------------

        if (
            selectedPlatform &&
            resizingHandle
        ) {

            const platform =
                selectedPlatform;


            if (
                resizingHandle === "topLeft"
            ) {

                const right =
                    platform.x +
                    platform.width;

                const bottom =
                    platform.y +
                    platform.height;


                const newX =
                    snapToGrid(
                        worldPosition.x
                    );

                const newY =
                    snapToGrid(
                        worldPosition.y
                    );


                platform.x = newX;
                platform.y = newY;


                platform.width =
                    right - newX;

                platform.height =
                    bottom - newY;
            }


            else if (
                resizingHandle === "topRight"
            ) {

                const bottom =
                    platform.y +
                    platform.height;


                const newY =
                    snapToGrid(
                        worldPosition.y
                    );


                platform.y =
                    newY;


                platform.width =
                    snapToGrid(
                        worldPosition.x
                    ) -
                    platform.x;


                platform.height =
                    bottom -
                    newY;
            }


            else if (
                resizingHandle === "bottomLeft"
            ) {

                const right =
                    platform.x +
                    platform.width;


                const newX =
                    snapToGrid(
                        worldPosition.x
                    );


                platform.x =
                    newX;


                platform.width =
                    right -
                    newX;


                platform.height =
                    snapToGrid(
                        worldPosition.y
                    ) -
                    platform.y;
            }


            else if (
                resizingHandle === "bottomRight"
            ) {

                platform.width =
                    snapToGrid(
                        worldPosition.x
                    ) -
                    platform.x;


                platform.height =
                    snapToGrid(
                        worldPosition.y
                    ) -
                    platform.y;
            }


            return;
        }


        // --------------------------------
        // Move platform
        // --------------------------------

        if (selectedPlatform) {

            selectedPlatform.x =
                snapToGrid(
                    worldPosition.x -
                    dragOffsetX
                );


            selectedPlatform.y =
                snapToGrid(
                    worldPosition.y -
                    dragOffsetY
                );


            return;
        }


        // --------------------------------
        // Create platform preview
        // --------------------------------

        dragCurrent = {

            x: snapToGrid(
                worldPosition.x
            ),

            y: snapToGrid(
                worldPosition.y
            )

        };

    }
);

canvas.addEventListener(
    "wheel",
    (event) => {

        event.preventDefault();


        const oldZoom =
            camera.zoom;


        if (event.deltaY < 0) {

            camera.zoom *= 1.1;

        }
        else {

            camera.zoom /= 1.1;

        }


        camera.zoom =
            Math.max(
                0.25,
                Math.min(
                    camera.zoom,
                    3
                )
            );


        // Keep the point under
        // the mouse stationary

        const mouseX =
            event.offsetX;

        const mouseY =
            event.offsetY;


        const worldX =
            mouseX / oldZoom +
            camera.x;

        const worldY =
            mouseY / oldZoom +
            camera.y;


        camera.x =
            worldX -
            mouseX / camera.zoom;

        camera.y =
            worldY -
            mouseY / camera.zoom;

    },
    {
        passive: false
    }
);

canvas.addEventListener(
    "mouseup",
    () => {

        if (resizingHandle) {

            resizingHandle = null;

            isDragging = false;

            originalPlatform = null;

            return;
        }

        if (!isDragging) {
            return;
        }


        // If we were moving a platform

        if (selectedPlatform) {

            isDragging = false;

            originalPlatform = null;

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
        x < camera.x + canvas.width / camera.zoom;
        x += GRID_SIZE
    ) {

        const screenX =
            (x - camera.x) * camera.zoom;


        ctx.beginPath();

        ctx.moveTo(
            screenX,
            0
        );

        ctx.lineTo(
            screenX,
            canvas.height
        );

        ctx.stroke();
    }


    for (
        let y = startY;
        y < camera.y + canvas.height / camera.zoom;
        y += GRID_SIZE
    ) {

        const screenY =
            (y - camera.y) * camera.zoom;


        ctx.beginPath();

        ctx.moveTo(
            0,
            screenY
        );

        ctx.lineTo(
            canvas.width,
            screenY
        );

        ctx.stroke();
    }
}

// level loading
let level = null;

let platforms = [];

let spawn = {
    x: 0,
    y: 0
};

// Load level from JSON file
async function loadLevel() {

    const response =
        await fetch("./level.json");


    level =
        await response.json();


    platforms =
        level.platforms;


    spawn =
        level.spawn;


    editorWorld.width =
        level.width;


    editorWorld.height =
        level.height;


    console.log(
        "Editor level loaded:",
        level
    );
}

// draw platforms
function drawPlatforms() {

    ctx.fillStyle = "#888";


    for (const platform of platforms) {

        ctx.fillRect(

            (platform.x - camera.x) * camera.zoom,

            (platform.y - camera.y) * camera.zoom,

            platform.width * camera.zoom,

            platform.height * camera.zoom

        );
    }


    // Draw platform preview

    if (
        isDragging &&
        currentTool === "platform" &&
        selectedPlatform === null
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

            (x - camera.x) * camera.zoom,

            (y - camera.y) * camera.zoom,

            width * camera.zoom,

            height * camera.zoom

        );
    }

    if (selectedPlatform) {

        const x =
            (selectedPlatform.x - camera.x) *
            camera.zoom;

        const y =
            (selectedPlatform.y - camera.y) *
            camera.zoom;

        const width =
            selectedPlatform.width *
            camera.zoom;

        const height =
            selectedPlatform.height *
            camera.zoom;


        // Selection rectangle

        ctx.strokeStyle = "yellow";

        ctx.lineWidth = 2;

        ctx.strokeRect(
            x,
            y,
            width,
            height
        );


        // Resize handles

        const handleSize = 10;


        ctx.fillStyle = "yellow";


        // Top-left

        ctx.fillRect(
            x - handleSize / 2,
            y - handleSize / 2,
            handleSize,
            handleSize
        );


        // Top-right

        ctx.fillRect(
            x + width - handleSize / 2,
            y - handleSize / 2,
            handleSize,
            handleSize
        );


        // Bottom-left

        ctx.fillRect(
            x - handleSize / 2,
            y + height - handleSize / 2,
            handleSize,
            handleSize
        );


        // Bottom-right

        ctx.fillRect(
            x + width - handleSize / 2,
            y + height - handleSize / 2,
            handleSize,
            handleSize
        );
    }
}

// save level to JSON file
function createLevelData() {

    return {

        name: level.name,

        width: level.width,

        height: level.height,

        spawn: {
            x: spawn.x,
            y: spawn.y
        },

        platforms: platforms

    };
}

function createJSON() {

    const levelData =
        createLevelData();


    return JSON.stringify(
        levelData,
        null,
        4
    );
}

async function saveLevel() {

    const json =
        createJSON();

    if ("showSaveFilePicker" in window) {

        const handle =
            await window.showSaveFilePicker({

                suggestedName:
                    "level.json",

                types: [

                    {
                        description:
                            "JSON Level",

                        accept: {
                            "application/json":
                                [".json"]
                        }

                    }

                ]

            });


        const writable =
            await handle.createWritable();


        await writable.write(json);


        await writable.close();


        console.log(
            "Level saved successfully."
        );


        return;
    }

    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "level.json";


    link.click();


    URL.revokeObjectURL(url);

}

const loadButton =
    document.getElementById("loadButton");

const levelFileInput =
    document.getElementById("levelFileInput");


loadButton.addEventListener(
    "click",
    () => {

        levelFileInput.click();

    }
);

levelFileInput.addEventListener(
    "change",
    async (event) => {

        const file =
            event.target.files[0];


        if (!file) {
            return;
        }


        try {

            const text =
                await file.text();


            const loadedLevel =
                JSON.parse(text);


            loadLevelData(loadedLevel);


            console.log(
                "Level loaded:",
                loadedLevel
            );

        }
        catch (error) {

            console.error(
                "Failed to load level:",
                error
            );

            alert(
                "The selected file is not a valid level JSON."
            );

        }

    }
);

function loadLevelData(loadedLevel) {

    level = loadedLevel;


    platforms = level.platforms;


    spawn = level.spawn;


    editorWorld.width =
        level.width;


    editorWorld.height =
        level.height;


    selectedPlatform = null;

    isDragging = false;


    console.log(
        "Editor updated with new level."
    );
}

function drawSpawn() {

    const x =
        (spawn.x - camera.x) * camera.zoom;

    const y =
        (spawn.y - camera.y) * camera.zoom;


    ctx.fillStyle = "lime";

    ctx.fillRect(
        x,
        y,
        40 * camera.zoom,
        60 * camera.zoom
    );


    ctx.strokeStyle = "white";

    ctx.lineWidth = 2;

    ctx.strokeRect(
        x,
        y,
        40 * camera.zoom,
        60 * camera.zoom
    );


    ctx.fillStyle = "white";

    ctx.font = "14px Arial";

    ctx.fillText(
        "SPAWN",
        x,
        y - 8
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


let lastTime = performance.now();


function gameLoop(currentTime) {

    const deltaTime =
        Math.min(
            (currentTime - lastTime) / 1000,
            0.1
        );


    lastTime = currentTime;


    updateCamera(deltaTime);

    draw();


    requestAnimationFrame(gameLoop);
}


async function startEditor() {

    await loadLevel();

    requestAnimationFrame(gameLoop);
}


startEditor();


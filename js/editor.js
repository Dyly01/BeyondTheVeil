import {
    BACKGROUNDS,
    PLATFORM_STYLES,
    drawBackground,
    drawPlatform
} from "./graphics.js";


// ============================================================
// CANVAS SETUP
// ============================================================

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


window.addEventListener(
    "resize",
    resizeCanvas
);


resizeCanvas();


// ============================================================
// EDITOR WORLD
// ============================================================

const editorWorld = {

    width: 3000,

    height: 1200

};


// ============================================================
// CAMERA
// ============================================================

const camera = {

    x: 0,

    y: 0,

    zoom: 1,

    speed: 500

};


// ============================================================
// GRID
// ============================================================

const GRID_SIZE = 25;


// ============================================================
// LEVEL DATA
// ============================================================

let level = null;

let platforms = [];

let spawn = {

    x: 0,

    y: 0

};


// ============================================================
// VISUAL DESIGN CONTROLS
// ============================================================

const backgroundSelect =
    document.getElementById(
        "backgroundSelect"
    );


const platformStyleSelect =
    document.getElementById(
        "platformStyleSelect"
    );


const platformColorInput =
    document.getElementById(
        "platformColorInput"
    );


// Populate background selection

for (
    const [value, label]
    of Object.entries(BACKGROUNDS)
) {

    backgroundSelect.add(
        new Option(
            label,
            value
        )
    );

}


// Populate platform style selection

for (
    const [value, label]
    of Object.entries(PLATFORM_STYLES)
) {

    platformStyleSelect.add(
        new Option(
            label,
            value
        )
    );

}


// Default values

backgroundSelect.value =
    "forest";


platformStyleSelect.value =
    "stone";


platformColorInput.value =
    "#737d81";


// ============================================================
// VISUAL DESIGN FUNCTIONS
// ============================================================

function applyPlatformDesign() {

    if (
        selectedPlatforms.length === 0
    ) {

        return false;

    }


    let changed =
        false;


    const style =
        platformStyleSelect.value;


    const color =
        platformColorInput.value;


    for (
        const platform
        of selectedPlatforms
    ) {

        if (
            platform.style !== style ||
            platform.color !== color
        ) {

            platform.style =
                style;

            platform.color =
                color;

            changed =
                true;

        }

    }


    return changed;

}


function updateDesignControlsFromSelection() {

    if (
        selectedPlatforms.length !== 1
    ) {

        return;

    }


    const platform =
        selectedPlatforms[0];


    platformStyleSelect.value =
        platform.style || "stone";


    platformColorInput.value =
        platform.color || "#737d81";

}


// ============================================================
// BACKGROUND SELECTION
// ============================================================

backgroundSelect.addEventListener(
    "change",
    () => {

        if (!level) {

            return;

        }


        const oldBackground =
            level.background || "forest";


        const newBackground =
            backgroundSelect.value;


        if (
            oldBackground === newBackground
        ) {

            return;

        }


        level.background =
            newBackground;


        saveHistoryState();

    }
);


// ============================================================
// PLATFORM STYLE SELECTION
// ============================================================

platformStyleSelect.addEventListener(
    "change",
    () => {

        if (
            selectedPlatforms.length === 0
        ) {

            return;

        }


        const changed =
            applyPlatformDesign();


        if (changed) {

            saveHistoryState();

        }

    }
);


// ============================================================
// PLATFORM COLOR SELECTION
// ============================================================

platformColorInput.addEventListener(
    "change",
    () => {

        if (
            selectedPlatforms.length === 0
        ) {

            return;

        }


        const changed =
            applyPlatformDesign();


        if (changed) {

            saveHistoryState();

        }

    }
);


// ============================================================
// HISTORY
// ============================================================

const history = [];

let historyIndex = -1;


function createEditorSnapshot() {

    return JSON.parse(
        JSON.stringify({

            platforms,

            spawn,

            level

        })
    );

}


function saveHistoryState() {

    // Remove states after the current one

    history.splice(
        historyIndex + 1
    );


    history.push(
        createEditorSnapshot()
    );


    historyIndex =
        history.length - 1;

}


function restoreHistoryState(
    snapshot
) {

    platforms =
        JSON.parse(
            JSON.stringify(
                snapshot.platforms
            )
        );


    spawn =
        JSON.parse(
            JSON.stringify(
                snapshot.spawn
            )
        );


    level =
        JSON.parse(
            JSON.stringify(
                snapshot.level
            )
        );


    editorWorld.width =
        level.width;

    editorWorld.height =
        level.height;


    // Make sure older levels get
    // the new default background.

    level.background =
        level.background || "forest";


    backgroundSelect.value =
        level.background;


    clearSelection();


    resizingHandle =
        null;


    isDragging =
        false;


    originalPlatforms =
        [];


    updatePropertiesPanel();


    canvas.style.cursor =
        "default";

}


function undo() {

    if (
        historyIndex <= 0
    ) {

        return;

    }


    historyIndex--;


    restoreHistoryState(
        history[historyIndex]
    );

}


function redo() {

    if (
        historyIndex >=
        history.length - 1
    ) {

        return;

    }


    historyIndex++;


    restoreHistoryState(
        history[historyIndex]
    );

}


// ============================================================
// EDITOR KEYBOARD
// ============================================================

const editorKeys = {};


document.addEventListener(
    "keydown",
    (event) => {

        const activeElement =
            document.activeElement;


        const isTyping =
            activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA";


        if (isTyping) {

            return;

        }


        // ----------------------------------------------------
        // DELETE
        // ----------------------------------------------------

        if (
            event.key === "Delete" &&
            selectedPlatforms.length > 0
        ) {

            deleteSelectedPlatforms();

            return;

        }


        // ----------------------------------------------------
        // UNDO
        // ----------------------------------------------------

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "z" &&
            !event.shiftKey
        ) {

            undo();

            return;

        }


        // ----------------------------------------------------
        // REDO
        // ----------------------------------------------------

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "y"
        ) {

            redo();

            return;

        }


        // ----------------------------------------------------
        // SELECT ALL
        // ----------------------------------------------------

        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "a"
        ) {

            event.preventDefault();


            selectAllPlatforms();


            updatePropertiesPanel();


            updateDesignControlsFromSelection();


            return;

        }

    }
);


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


// ============================================================
// CAMERA MOVEMENT
// ============================================================

function updateCamera(
    deltaTime
) {

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


    const maxX =
        Math.max(
            0,
            editorWorld.width -
            canvas.width /
            camera.zoom
        );


    const maxY =
        Math.max(
            0,
            editorWorld.height -
            canvas.height /
            camera.zoom
        );


    camera.x =
        Math.max(
            0,
            Math.min(
                camera.x,
                maxX
            )
        );


    camera.y =
        Math.max(
            0,
            Math.min(
                camera.y,
                maxY
            )
        );

}


// ============================================================
// SELECTION
// ============================================================

let selectedPlatforms = [];


function clearSelection() {

    selectedPlatforms = [];

}


function selectPlatform(
    platform
) {

    selectedPlatforms = [
        platform
    ];

}


function togglePlatformSelection(
    platform
) {

    const index =
        selectedPlatforms.indexOf(
            platform
        );


    if (
        index === -1
    ) {

        selectedPlatforms.push(
            platform
        );

    }
    else {

        selectedPlatforms.splice(
            index,
            1
        );

    }

}


function selectAllPlatforms() {

    selectedPlatforms =
        [...platforms];

}


function isPlatformSelected(
    platform
) {

    return selectedPlatforms.includes(
        platform
    );

}


// ============================================================
// DRAG / RESIZE STATE
// ============================================================

let isDragging =
    false;


let dragStart =
    null;


let dragCurrent =
    null;


let currentTool =
    "platform";


// Resize handle

let resizingHandle =
    null;


// Original state of selected platforms
// while moving or resizing

let originalPlatforms =
    [];


// ============================================================
// TOOLS
// ============================================================

document
    .getElementById("platformTool")
    .addEventListener(
        "click",
        () => {

            currentTool =
                "platform";

        }
    );


document
    .getElementById("eraseTool")
    .addEventListener(
        "click",
        () => {

            currentTool =
                "erase";


            clearSelection();


            updatePropertiesPanel();

        }
    );


document
    .getElementById("spawnTool")
    .addEventListener(
        "click",
        () => {

            currentTool =
                "spawn";


            clearSelection();


            updatePropertiesPanel();

        }
    );


document
    .getElementById("saveButton")
    .addEventListener(
        "click",
        saveLevel
    );


// ============================================================
// PLATFORM LOOKUP
// ============================================================

function getPlatformAtPosition(
    x,
    y
) {

    for (
        let i = platforms.length - 1;
        i >= 0;
        i--
    ) {

        const platform =
            platforms[i];


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


// ============================================================
// SCREEN → WORLD
// ============================================================

function screenToWorld(
    mouseX,
    mouseY
) {

    return {

        x:
            mouseX /
            camera.zoom +
            camera.x,

        y:
            mouseY /
            camera.zoom +
            camera.y

    };

}


// ============================================================
// SNAP TO GRID
// ============================================================

function snapToGrid(
    value
) {

    return Math.round(
        value / GRID_SIZE
    ) * GRID_SIZE;

}


// ============================================================
// RESIZE HANDLES
// ============================================================

function getResizeHandle(
    x,
    y,
    platform
) {

    const handleSize =
        10;


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

            x:
                screenX +
                screenWidth,

            y:
                screenY

        },

        bottomLeft: {

            x:
                screenX,

            y:
                screenY +
                screenHeight

        },

        bottomRight: {

            x:
                screenX +
                screenWidth,

            y:
                screenY +
                screenHeight

        }

    };


    for (
        const [name, handle]
        of Object.entries(handles)
    ) {

        if (
            Math.abs(
                x - handle.x
            ) <= handleSize &&
            Math.abs(
                y - handle.y
            ) <= handleSize
        ) {

            return name;

        }

    }


    return null;

}


// ============================================================
// DELETE SELECTED PLATFORMS
// ============================================================

function deleteSelectedPlatforms() {

    if (
        selectedPlatforms.length === 0
    ) {

        return;

    }


    const deletedPlatforms =
        [...selectedPlatforms];


    platforms =
        platforms.filter(
            platform =>
                !deletedPlatforms.includes(
                    platform
                )
        );


    clearSelection();


    resizingHandle =
        null;


    originalPlatforms =
        [];


    isDragging =
        false;


    updatePropertiesPanel();


    canvas.style.cursor =
        "default";


    saveHistoryState();

}


// ============================================================
// CURSOR
// ============================================================

function updateCursor(
    mouseX,
    mouseY
) {

    if (
        selectedPlatforms.length === 0
    ) {

        canvas.style.cursor =
            "default";


        return;

    }


    // --------------------------------------------------------
    // Resize handles
    // --------------------------------------------------------

    if (
        selectedPlatforms.length === 1
    ) {

        const platform =
            selectedPlatforms[0];


        const handle =
            getResizeHandle(
                mouseX,
                mouseY,
                platform
            );


        if (
            handle === "topLeft"
        ) {

            canvas.style.cursor =
                "nwse-resize";


            return;

        }


        if (
            handle === "topRight"
        ) {

            canvas.style.cursor =
                "nesw-resize";


            return;

        }


        if (
            handle === "bottomLeft"
        ) {

            canvas.style.cursor =
                "nesw-resize";


            return;

        }


        if (
            handle === "bottomRight"
        ) {

            canvas.style.cursor =
                "nwse-resize";


            return;

        }

    }


    // --------------------------------------------------------
    // Check selected platforms
    // --------------------------------------------------------

    const worldPosition =
        screenToWorld(
            mouseX,
            mouseY
        );


    if (
        selectedPlatforms.some(
            platform =>

                worldPosition.x >=
                    platform.x &&

                worldPosition.x <=
                    platform.x +
                    platform.width &&

                worldPosition.y >=
                    platform.y &&

                worldPosition.y <=
                    platform.y +
                    platform.height
        )
    ) {

        canvas.style.cursor =
            "grab";


        return;

    }


    canvas.style.cursor =
        "default";

}


// ============================================================
// MOUSE DOWN
// ============================================================

canvas.addEventListener(
    "mousedown",
    (event) => {

        const worldPosition =
            screenToWorld(
                event.offsetX,
                event.offsetY
            );


        // ====================================================
        // SPAWN TOOL
        // ====================================================

        if (
            currentTool === "spawn"
        ) {

            spawn.x =
                snapToGrid(
                    worldPosition.x
                );


            spawn.y =
                snapToGrid(
                    worldPosition.y
                );


            saveHistoryState();


            return;

        }


        // ====================================================
        // ERASE TOOL
        // ====================================================

        if (
            currentTool === "erase"
        ) {

            const platform =
                getPlatformAtPosition(
                    worldPosition.x,
                    worldPosition.y
                );


            if (platform) {

                const index =
                    platforms.indexOf(
                        platform
                    );


                if (
                    index !== -1
                ) {

                    platforms.splice(
                        index,
                        1
                    );


                    saveHistoryState();

                }

            }


            return;

        }


        // ====================================================
        // RESIZE SELECTED PLATFORM
        // ====================================================

        if (
            selectedPlatforms.length === 1 &&
            currentTool === "platform"
        ) {

            const platform =
                selectedPlatforms[0];


            const handle =
                getResizeHandle(
                    event.offsetX,
                    event.offsetY,
                    platform
                );


            if (handle) {

                resizingHandle =
                    handle;


                isDragging =
                    true;


                originalPlatforms = [
                    {

                        platform,

                        x:
                            platform.x,

                        y:
                            platform.y,

                        width:
                            platform.width,

                        height:
                            platform.height

                    }
                ];


                return;

            }

        }


        // ====================================================
        // CHECK PLATFORM CLICK
        // ====================================================

        const platform =
            getPlatformAtPosition(
                worldPosition.x,
                worldPosition.y
            );


        if (platform) {

            // ------------------------------------------------
            // CTRL + CLICK
            // ------------------------------------------------

            if (
                event.ctrlKey
            ) {

                togglePlatformSelection(
                    platform
                );


                updatePropertiesPanel();


                updateDesignControlsFromSelection();


                return;

            }


            // ------------------------------------------------
            // NORMAL CLICK
            // ------------------------------------------------

            if (
                !isPlatformSelected(
                    platform
                )
            ) {

                selectPlatform(
                    platform
                );

            }


            updatePropertiesPanel();


            updateDesignControlsFromSelection();


            // ------------------------------------------------
            // START MOVEMENT
            // ------------------------------------------------

            if (
                selectedPlatforms.length > 0
            ) {

                dragStart =
                    {

                        x:
                            worldPosition.x,

                        y:
                            worldPosition.y

                    };


                // Store original positions
                // of ALL selected platforms.

                originalPlatforms =
                    selectedPlatforms.map(
                        selected => ({

                            platform:
                                selected,

                            x:
                                selected.x,

                            y:
                                selected.y

                        })
                    );


                isDragging =
                    true;


                canvas.style.cursor =
                    "grabbing";

            }


            return;

        }


        // ====================================================
        // CLICKED EMPTY SPACE
        // ====================================================

        if (
            currentTool !== "platform"
        ) {

            return;

        }


        clearSelection();


        updatePropertiesPanel();


        dragStart = {

            x:
                snapToGrid(
                    worldPosition.x
                ),

            y:
                snapToGrid(
                    worldPosition.y
                )

        };


        dragCurrent =
            {

                x:
                    dragStart.x,

                y:
                    dragStart.y

            };


        isDragging =
            true;

    }
);


// ============================================================
// PROPERTIES PANEL
// ============================================================

const propertiesPanel =
    document.getElementById(
        "propertiesPanel"
    );


const propertyX =
    document.getElementById(
        "propertyX"
    );


const propertyY =
    document.getElementById(
        "propertyY"
    );


const propertyWidth =
    document.getElementById(
        "propertyWidth"
    );


const propertyHeight =
    document.getElementById(
        "propertyHeight"
    );


const applyProperties =
    document.getElementById(
        "applyProperties"
    );


function updatePropertiesPanel() {

    if (
        selectedPlatforms.length !== 1
    ) {

        propertiesPanel.style.display =
            "none";


        return;

    }


    const platform =
        selectedPlatforms[0];


    propertiesPanel.style.display =
        "block";


    propertyX.value =
        platform.x;


    propertyY.value =
        platform.y;


    propertyWidth.value =
        platform.width;


    propertyHeight.value =
        platform.height;

}


// ============================================================
// APPLY MANUAL PROPERTIES
// ============================================================

function applyPropertyChanges() {

    if (
        selectedPlatforms.length !== 1
    ) {

        return;

    }


    const platform =
        selectedPlatforms[0];


    const x =
        Number(
            propertyX.value
        );


    const y =
        Number(
            propertyY.value
        );


    const width =
        Number(
            propertyWidth.value
        );


    const height =
        Number(
            propertyHeight.value
        );


    if (
        !Number.isFinite(x) ||
        !Number.isFinite(y) ||
        !Number.isFinite(width) ||
        !Number.isFinite(height)
    ) {

        return;

    }


    const oldState = {

        x:
            platform.x,

        y:
            platform.y,

        width:
            platform.width,

        height:
            platform.height

    };


    platform.x =
        snapToGrid(
            x
        );


    platform.y =
        snapToGrid(
            y
        );


    platform.width =
        Math.max(
            GRID_SIZE,
            snapToGrid(
                width
            )
        );


    platform.height =
        Math.max(
            GRID_SIZE,
            snapToGrid(
                height
            )
        );


    const changed =
        platform.x !== oldState.x ||
        platform.y !== oldState.y ||
        platform.width !== oldState.width ||
        platform.height !== oldState.height;


    if (changed) {

        saveHistoryState();

    }


    updatePropertiesPanel();

}


applyProperties.addEventListener(
    "click",
    applyPropertyChanges
);


// ============================================================
// MOUSE MOVE
// ============================================================

canvas.addEventListener(
    "mousemove",
    (event) => {

        const worldPosition =
            screenToWorld(
                event.offsetX,
                event.offsetY
            );


        // ====================================================
        // NOTHING IS BEING DRAGGED
        // ====================================================

        if (!isDragging) {

            updateCursor(
                event.offsetX,
                event.offsetY
            );


            return;

        }


        // ====================================================
        // RESIZE
        // ====================================================

        if (
            selectedPlatforms.length === 1 &&
            resizingHandle
        ) {

            const platform =
                selectedPlatforms[0];


            const mouseX =
                snapToGrid(
                    worldPosition.x
                );


            const mouseY =
                snapToGrid(
                    worldPosition.y
                );


            const right =
                originalPlatforms[0].x +
                originalPlatforms[0].width;


            const bottom =
                originalPlatforms[0].y +
                originalPlatforms[0].height;


            if (
                resizingHandle === "topLeft"
            ) {

                const newWidth =
                    right -
                    mouseX;


                const newHeight =
                    bottom -
                    mouseY;


                if (
                    newWidth >= GRID_SIZE
                ) {

                    platform.x =
                        mouseX;


                    platform.width =
                        newWidth;

                }


                if (
                    newHeight >= GRID_SIZE
                ) {

                    platform.y =
                        mouseY;


                    platform.height =
                        newHeight;

                }

            }


            else if (
                resizingHandle === "topRight"
            ) {

                const newWidth =
                    mouseX -
                    originalPlatforms[0].x;


                const newHeight =
                    bottom -
                    mouseY;


                if (
                    newWidth >= GRID_SIZE
                ) {

                    platform.width =
                        newWidth;

                }


                if (
                    newHeight >= GRID_SIZE
                ) {

                    platform.y =
                        mouseY;


                    platform.height =
                        newHeight;

                }

            }


            else if (
                resizingHandle === "bottomLeft"
            ) {

                const newWidth =
                    right -
                    mouseX;


                const newHeight =
                    mouseY -
                    originalPlatforms[0].y;


                if (
                    newWidth >= GRID_SIZE
                ) {

                    platform.x =
                        mouseX;


                    platform.width =
                        newWidth;

                }


                if (
                    newHeight >= GRID_SIZE
                ) {

                    platform.height =
                        newHeight;

                }

            }


            else if (
                resizingHandle === "bottomRight"
            ) {

                const newWidth =
                    mouseX -
                    originalPlatforms[0].x;


                const newHeight =
                    mouseY -
                    originalPlatforms[0].y;


                if (
                    newWidth >= GRID_SIZE
                ) {

                    platform.width =
                        newWidth;

                }


                if (
                    newHeight >= GRID_SIZE
                ) {

                    platform.height =
                        newHeight;

                }

            }


            updatePropertiesPanel();


            return;

        }


        // ====================================================
        // MOVE SELECTED PLATFORMS
        // ====================================================

        if (
            selectedPlatforms.length > 0 &&
            originalPlatforms.length > 0
        ) {

            const deltaX =
                snapToGrid(
                    worldPosition.x -
                    dragStart.x
                );


            const deltaY =
                snapToGrid(
                    worldPosition.y -
                    dragStart.y
                );


            for (
                const original
                of originalPlatforms
            ) {

                original.platform.x =
                    original.x +
                    deltaX;


                original.platform.y =
                    original.y +
                    deltaY;

            }


            updatePropertiesPanel();


            return;

        }


        // ====================================================
        // CREATE PLATFORM PREVIEW
        // ====================================================

        dragCurrent = {

            x:
                snapToGrid(
                    worldPosition.x
                ),

            y:
                snapToGrid(
                    worldPosition.y
                )

        };

    }
);


// ============================================================
// MOUSE UP
// ============================================================

canvas.addEventListener(
    "mouseup",
    () => {

        canvas.style.cursor =
            "default";


        if (
            !isDragging
        ) {

            return;

        }


        // ====================================================
        // RESIZE FINISHED
        // ====================================================

        if (
            resizingHandle
        ) {

            let changed =
                false;


            if (
                originalPlatforms.length > 0
            ) {

                const original =
                    originalPlatforms[0];


                const platform =
                    original.platform;


                changed =
                    platform.x !== original.x ||
                    platform.y !== original.y ||
                    platform.width !== original.width ||
                    platform.height !== original.height;

            }


            if (
                changed
            ) {

                saveHistoryState();

            }


            resizingHandle =
                null;


            originalPlatforms =
                [];


            isDragging =
                false;


            return;

        }


        // ====================================================
        // MOVEMENT FINISHED
        // ====================================================

        if (
            selectedPlatforms.length > 0 &&
            originalPlatforms.length > 0
        ) {

            let changed =
                false;


            for (
                const original
                of originalPlatforms
            ) {

                const platform =
                    original.platform;


                if (
                    platform.x !== original.x ||
                    platform.y !== original.y
                ) {

                    changed =
                        true;


                    break;

                }

            }


            if (
                changed
            ) {

                saveHistoryState();

            }


            originalPlatforms =
                [];


            isDragging =
                false;


            return;

        }


        // ====================================================
        // CREATE PLATFORM
        // ====================================================

        if (
            !dragStart ||
            !dragCurrent
        ) {

            isDragging =
                false;


            return;

        }


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


        if (
            width > 0 &&
            height > 0
        ) {

            platforms.push({

                x,

                y,

                width,

                height,

                style:
                    platformStyleSelect.value,

                color:
                    platformColorInput.value

            });


            saveHistoryState();

        }


        isDragging =
            false;


        dragStart =
            null;


        dragCurrent =
            null;

    }
);


// ============================================================
// WHEEL / ZOOM
// ============================================================

canvas.addEventListener(
    "wheel",
    (event) => {

        event.preventDefault();


        const oldZoom =
            camera.zoom;


        if (
            event.deltaY < 0
        ) {

            camera.zoom *=
                1.1;

        }
        else {

            camera.zoom /=
                1.1;

        }


        camera.zoom =
            Math.max(
                0.25,
                Math.min(
                    camera.zoom,
                    3
                )
            );


        const mouseX =
            event.offsetX;


        const mouseY =
            event.offsetY;


        const worldX =
            mouseX /
            oldZoom +
            camera.x;


        const worldY =
            mouseY /
            oldZoom +
            camera.y;


        camera.x =
            worldX -
            mouseX /
            camera.zoom;


        camera.y =
            worldY -
            mouseY /
            camera.zoom;


        // Keep camera inside world

        const maxX =
            Math.max(
                0,
                editorWorld.width -
                canvas.width /
                camera.zoom
            );


        const maxY =
            Math.max(
                0,
                editorWorld.height -
                canvas.height /
                camera.zoom
            );


        camera.x =
            Math.max(
                0,
                Math.min(
                    camera.x,
                    maxX
                )
            );


        camera.y =
            Math.max(
                0,
                Math.min(
                    camera.y,
                    maxY
                )
            );

    },
    {
        passive: false
    }
);


// ============================================================
// GRID DRAWING
// ============================================================

function drawGrid() {

    ctx.strokeStyle =
        "#444";


    ctx.lineWidth =
        1;


    const startX =
        Math.floor(
            camera.x /
            GRID_SIZE
        ) *
        GRID_SIZE;


    const startY =
        Math.floor(
            camera.y /
            GRID_SIZE
        ) *
        GRID_SIZE;


    for (
        let x = startX;
        x <
            camera.x +
            canvas.width /
            camera.zoom;
        x += GRID_SIZE
    ) {

        const screenX =
            (x - camera.x) *
            camera.zoom;


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
        y <
            camera.y +
            canvas.height /
            camera.zoom;
        y += GRID_SIZE
    ) {

        const screenY =
            (y - camera.y) *
            camera.zoom;


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


// ============================================================
// DRAW PLATFORMS
// ============================================================

function drawPlatforms() {

    // --------------------------------------------------------
    // Normal platforms
    // --------------------------------------------------------

    for (
        const platform
        of platforms
    ) {

        // Older level files might not have
        // style/color yet.

        const platformToDraw = {

            ...platform,

            style:
                platform.style || "stone",

            color:
                platform.color || "#737d81"

        };


        /*
         * drawPlatform() uses world coordinates.
         *
         * The editor uses a camera and zoom, so we temporarily
         * transform the canvas from world space to screen space.
         */

        ctx.save();


        ctx.translate(
            -camera.x *
            camera.zoom,

            -camera.y *
            camera.zoom
        );


        ctx.scale(
            camera.zoom,
            camera.zoom
        );


        drawPlatform(
            ctx,
            platformToDraw
        );


        ctx.restore();

    }


    // --------------------------------------------------------
    // CREATE PLATFORM PREVIEW
    // --------------------------------------------------------

    if (
        isDragging &&
        currentTool === "platform" &&
        selectedPlatforms.length === 0 &&
        !resizingHandle &&
        dragStart &&
        dragCurrent
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

            (x -
                camera.x) *
                camera.zoom,

            (y -
                camera.y) *
                camera.zoom,

            width *
                camera.zoom,

            height *
                camera.zoom

        );

    }


    // --------------------------------------------------------
    // SELECTION BORDERS
    // --------------------------------------------------------

    for (
        const platform
        of selectedPlatforms
    ) {

        const x =
            (platform.x -
                camera.x) *
                camera.zoom;


        const y =
            (platform.y -
                camera.y) *
                camera.zoom;


        const width =
            platform.width *
            camera.zoom;


        const height =
            platform.height *
            camera.zoom;


        ctx.strokeStyle =
            "yellow";


        ctx.lineWidth =
            3;


        ctx.strokeRect(
            x,
            y,
            width,
            height
        );

    }


    // --------------------------------------------------------
    // RESIZE HANDLES
    // --------------------------------------------------------

    if (
        selectedPlatforms.length === 1
    ) {

        const platform =
            selectedPlatforms[0];


        const x =
            (platform.x -
                camera.x) *
                camera.zoom;


        const y =
            (platform.y -
                camera.y) *
                camera.zoom;


        const width =
            platform.width *
            camera.zoom;


        const height =
            platform.height *
            camera.zoom;


        const handleSize =
            10;


        ctx.fillStyle =
            "yellow";


        // Top-left

        ctx.fillRect(

            x -
                handleSize / 2,

            y -
                handleSize / 2,

            handleSize,

            handleSize

        );


        // Top-right

        ctx.fillRect(

            x +
                width -
                handleSize / 2,

            y -
                handleSize / 2,

            handleSize,

            handleSize

        );


        // Bottom-left

        ctx.fillRect(

            x -
                handleSize / 2,

            y +
                height -
                handleSize / 2,

            handleSize,

            handleSize

        );


        // Bottom-right

        ctx.fillRect(

            x +
                width -
                handleSize / 2,

            y +
                height -
                handleSize / 2,

            handleSize,

            handleSize

        );

    }

}


// ============================================================
// SPAWN DRAWING
// ============================================================

function drawSpawn() {

    const x =
        (spawn.x -
            camera.x) *
            camera.zoom;


    const y =
        (spawn.y -
            camera.y) *
            camera.zoom;


    ctx.fillStyle =
        "lime";


    ctx.fillRect(

        x,

        y,

        40 *
            camera.zoom,

        60 *
            camera.zoom

    );


    ctx.strokeStyle =
        "white";


    ctx.lineWidth =
        2;


    ctx.strokeRect(

        x,

        y,

        40 *
            camera.zoom,

        60 *
            camera.zoom

    );


    ctx.fillStyle =
        "white";


    ctx.font =
        "14px Arial";


    ctx.fillText(
        "SPAWN",
        x,
        y - 8
    );

}


// ============================================================
// DRAW
// ============================================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // --------------------------------------------------------
    // Background
    // --------------------------------------------------------

    drawBackground(
        ctx,

        level?.background ||
            "forest",

        editorWorld.width,

        editorWorld.height,

        camera.x,

        camera.y
    );


    // --------------------------------------------------------
    // Grid
    // --------------------------------------------------------

    drawGrid();


    // --------------------------------------------------------
    // Platforms
    // --------------------------------------------------------

    drawPlatforms();


    // --------------------------------------------------------
    // Spawn
    // --------------------------------------------------------

    drawSpawn();

}


// ============================================================
// SAVE LEVEL
// ============================================================

function createLevelData() {

    return {

        name:
            level.name,

        width:
            level.width,

        height:
            level.height,

        spawn: {

            x:
                spawn.x,

            y:
                spawn.y

        },

        background:
            level.background ||
            "forest",

        platforms

    };

}


function createJSON() {

    return JSON.stringify(

        createLevelData(),

        null,

        4

    );

}


async function saveLevel() {

    const json =
        createJSON();


    if (
        "showSaveFilePicker"
        in window
    ) {

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


        await writable.write(
            json
        );


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
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "level.json";


    link.click();


    URL.revokeObjectURL(
        url
    );

}


// ============================================================
// LOAD LEVEL
// ============================================================

const loadButton =
    document.getElementById(
        "loadButton"
    );


const levelFileInput =
    document.getElementById(
        "levelFileInput"
    );


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
                JSON.parse(
                    text
                );


            loadLevelData(
                loadedLevel
            );


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


async function loadLevel() {

    const response =
        await fetch(
            "./level.json"
        );


    level =
        await response.json();


    platforms =
        level.platforms || [];


    spawn =
        level.spawn || {

            x: 0,

            y: 0

        };


    // Default for older levels

    level.background =
        level.background ||
        "forest";


    backgroundSelect.value =
        level.background;


    // Give older platforms the new
    // default visual properties.

    for (
        const platform
        of platforms
    ) {

        platform.style =
            platform.style ||
            "stone";


        platform.color =
            platform.color ||
            "#737d81";

    }


    editorWorld.width =
        level.width;


    editorWorld.height =
        level.height;


    console.log(
        "Editor level loaded:",
        level
    );

}


function loadLevelData(
    loadedLevel
) {

    level =
        loadedLevel;


    platforms =
        level.platforms || [];


    spawn =
        level.spawn || {

            x: 0,

            y: 0

        };


    level.background =
        level.background ||
        "forest";


    backgroundSelect.value =
        level.background;


    // Make old platforms compatible

    for (
        const platform
        of platforms
    ) {

        platform.style =
            platform.style ||
            "stone";


        platform.color =
            platform.color ||
            "#737d81";

    }


    editorWorld.width =
        level.width;


    editorWorld.height =
        level.height;


    clearSelection();


    resizingHandle =
        null;


    originalPlatforms =
        [];


    isDragging =
        false;


    updatePropertiesPanel();


    canvas.style.cursor =
        "default";


    console.log(
        "Editor updated with new level."
    );

}


// ============================================================
// GAME LOOP
// ============================================================

let lastTime =
    performance.now();


function gameLoop(
    currentTime
) {

    const deltaTime =
        Math.min(

            (currentTime -
                lastTime) /
                1000,

            0.1

        );


    lastTime =
        currentTime;


    updateCamera(
        deltaTime
    );


    draw();


    requestAnimationFrame(
        gameLoop
    );

}


// ============================================================
// START
// ============================================================

async function startEditor() {

    await loadLevel();


    saveHistoryState();


    requestAnimationFrame(
        gameLoop
    );

}


startEditor();

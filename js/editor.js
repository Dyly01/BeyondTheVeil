import {
    BACKGROUNDS,
    PLATFORM_STYLES,
    drawBackground,
    drawPlatform,
    drawDoor,
    drawThrone,
    drawGem,
    drawCrown,
    drawKey
} from "./graphics.js";

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


const editorWorld = {

    width: 30000,

    height: 12000

};


const camera = {

    x: 0,

    y: 0,

    zoom: 1,

    speed: 500

};


const GRID_SIZE = 25;


let level = null;

let platforms = [];

let spawn = {

    x: 0,

    y: 0

};

let spawns = [];

let doors = [];

let thrones = [];


const history = [];

let historyIndex = -1;


function createEditorSnapshot() {

    return JSON.parse(
        JSON.stringify({

            platforms,

            spawn,

            spawns,

            doors,

            thrones,

            level

        })
    );

}


function saveHistoryState() {

    history.splice(
        historyIndex + 1
    );

    history.push(
        createEditorSnapshot()
    );

    historyIndex =
        history.length - 1;

}


function restoreHistoryState(snapshot) {

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


    spawns =
        JSON.parse(
            JSON.stringify(
                snapshot.spawns || []
            )
        );


    doors =
        JSON.parse(
            JSON.stringify(
                snapshot.doors || []
            )
        );


    thrones =
        JSON.parse(
            JSON.stringify(
                snapshot.thrones || []
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


    clearSelection();


    resizingHandle =
        null;

    isDragging =
        false;

    originalPlatforms =
        [];

    originalDoor =
        null;

    originalSpawnPoint =
        null;

    originalThrone =
        null;


    updatePropertiesPanel();

    updateDoorControls();

    updateSpawnControls();


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
        historyIndex >= history.length - 1
    ) {

        return;

    }


    historyIndex++;

    restoreHistoryState(
        history[historyIndex]
    );

}


const editorKeys = {};


document.addEventListener(
    "keydown",
    (event) => {

        const activeElement =
            document.activeElement;


        const isTyping =
            activeElement &&
            (
                activeElement.tagName === "INPUT" ||
                activeElement.tagName === "TEXTAREA" ||
                activeElement.tagName === "SELECT"
            );


        if (isTyping) {

            return;

        }


        if (
            event.key === "Delete"
        ) {

            if (
                selectedPlatforms.length > 0
            ) {

                deleteSelectedPlatforms();

                return;

            }


            if (selectedDoor) {

                deleteSelectedDoor();

                return;

            }


            if (selectedSpawnPoint) {

                deleteSelectedSpawnPoint();

                return;

            }


            if (selectedThrone) {

                deleteSelectedThrone();

                return;

            }

        }


        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "z" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            undo();

            return;

        }


        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "y"
        ) {

            event.preventDefault();

            redo();

            return;

        }


        if (
            event.ctrlKey &&
            event.key.toLowerCase() === "a"
        ) {

            event.preventDefault();

            selectAllPlatforms();

            updatePropertiesPanel();

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


let selectedPlatforms = [];

let selectedDoor = null;

let selectedSpawnPoint = null;

let selectedThrone = null;


function clearSelection() {

    selectedPlatforms = [];

    selectedDoor = null;

    selectedSpawnPoint = null;

    selectedThrone = null;

}


function selectPlatform(platform) {

    selectedPlatforms = [
        platform
    ];

    selectedDoor = null;

    selectedSpawnPoint = null;

    selectedThrone = null;

    updateDoorControls();

    updateSpawnControls();

}


function togglePlatformSelection(platform) {

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


    selectedDoor = null;

    selectedSpawnPoint = null;

    selectedThrone = null;

    updateDoorControls();

    updateSpawnControls();

}


function selectAllPlatforms() {

    selectedPlatforms =
        [...platforms];

    selectedDoor = null;

    selectedSpawnPoint = null;

    selectedThrone = null;

    updateDoorControls();

    updateSpawnControls();

}


function isPlatformSelected(platform) {

    return selectedPlatforms.includes(
        platform
    );

}


function selectDoor(door) {

    if (!door) {

        return;

    }


    selectedDoor =
        door;

    selectedPlatforms = [];

    selectedSpawnPoint = null;

    selectedThrone = null;


    updateDoorControls();

    updateSpawnControls();

}


function selectSpawnPoint(spawnPoint) {

    if (!spawnPoint) {

        return;

    }


    selectedSpawnPoint =
        spawnPoint;

    selectedPlatforms = [];

    selectedDoor = null;

    selectedThrone = null;


    updateDoorControls();

    updateSpawnControls();

}


function selectThrone(throne) {

    if (!throne) {

        return;

    }


    selectedThrone =
        throne;

    selectedPlatforms = [];

    selectedDoor = null;

    selectedSpawnPoint = null;

    updateDoorControls();

    updateSpawnControls();

}


function deleteSelectedDoor() {

    if (!selectedDoor) {

        return;

    }


    const index =
        doors.indexOf(
            selectedDoor
        );


    if (
        index !== -1
    ) {

        doors.splice(
            index,
            1
        );

        saveHistoryState();

    }


    selectedDoor =
        null;

    originalDoor =
        null;

    isDragging =
        false;


    updateDoorControls();

}


function deleteSelectedSpawnPoint() {

    if (!selectedSpawnPoint) {

        return;

    }


    const index =
        spawns.indexOf(
            selectedSpawnPoint
        );


    if (
        index !== -1
    ) {

        spawns.splice(
            index,
            1
        );

        saveHistoryState();

    }


    selectedSpawnPoint =
        null;

    originalSpawnPoint =
        null;

    isDragging =
        false;


    updateSpawnControls();

}


function deleteSelectedThrone() {

    if (!selectedThrone) {

        return;

    }


    const index =
        thrones.indexOf(
            selectedThrone
        );


    if (
        index !== -1
    ) {

        thrones.splice(
            index,
            1
        );

        saveHistoryState();

    }


    selectedThrone =
        null;

    originalThrone =
        null;

    isDragging =
        false;

}


let isDragging =
    false;


let dragStart =
    null;

let dragCurrent =
    null;

let currentTool =
    "platform";

let resizingHandle =
    null;

let originalPlatforms =
    [];

let originalDoor =
    null;

let originalSpawnPoint =
    null;

let originalThrone =
    null;


document
    .getElementById("platformTool")
    .addEventListener(
        "click",
        () => {

            currentTool =
                "platform";

            clearSelection();

            canvas.style.cursor =
                "default";

            updatePropertiesPanel();

            updateDoorControls();

            updateSpawnControls();

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

            updateDoorControls();

            updateSpawnControls();

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

            canvas.style.cursor =
                "crosshair";

            updatePropertiesPanel();

            updateDoorControls();

            updateSpawnControls();

        }
    );


document
    .getElementById("saveButton")
    .addEventListener(
        "click",
        saveLevel
    );


const toolbar =
    document.getElementById(
        "toolbar"
    );


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


if (backgroundSelect) {

    for (
        const [value, label]
        of Object.entries(
            BACKGROUNDS
        )
    ) {

        backgroundSelect.add(
            new Option(
                label,
                value
            )
        );

    }

}


if (platformStyleSelect) {

    for (
        const [value, label]
        of Object.entries(
            PLATFORM_STYLES
        )
    ) {

        platformStyleSelect.add(
            new Option(
                label,
                value
            )
        );

    }

}


if (backgroundSelect) {

    backgroundSelect.addEventListener(
        "change",
        () => {

            if (level) {

                level.background =
                    backgroundSelect.value;

            }

        }
    );

}


function applyPlatformDesign() {

    if (
        selectedPlatforms.length !== 1
    ) {

        return;

    }


    const platform =
        selectedPlatforms[0];


    if (platformStyleSelect) {

        platform.style =
            platformStyleSelect.value;

    }


    if (platformColorInput) {

        platform.color =
            platformColorInput.value;

    }

}


if (platformStyleSelect) {

    platformStyleSelect.addEventListener(
        "change",
        applyPlatformDesign
    );

}


if (platformColorInput) {

    platformColorInput.addEventListener(
        "input",
        applyPlatformDesign
    );


}


// Door controls

let doorTool =
    document.getElementById(
        "doorTool"
    );


if (!doorTool) {

    doorTool =
        document.createElement(
            "button"
        );

    doorTool.id =
        "doorTool";

    doorTool.textContent =
        "Door";

    toolbar.appendChild(
        doorTool
    );

}


doorTool.addEventListener(
    "click",
    () => {

        currentTool =
            "door";

        clearSelection();

        canvas.style.cursor =
            "crosshair";

        updatePropertiesPanel();

        updateDoorControls();

        updateSpawnControls();

    }
);


let throneTool =
    document.getElementById(
        "throneTool"
    );


if (!throneTool) {

    throneTool =
        document.createElement(
            "button"
        );

    throneTool.id =
        "throneTool";

    throneTool.textContent =
        "Throne";

    toolbar.appendChild(
        throneTool
    );

}


throneTool.addEventListener(
    "click",
    () => {

        currentTool =
            "throne";

        clearSelection();

        canvas.style.cursor =
            "crosshair";

        updatePropertiesPanel();

        updateDoorControls();

        updateSpawnControls();

    }
);


// Checkpoint tool

let checkpointTool =
    document.getElementById(
        "checkpointTool"
    );


if (!checkpointTool) {

    checkpointTool =
        document.createElement(
            "button"
        );

    checkpointTool.id =
        "checkpointTool";

    checkpointTool.textContent =
        "Checkpoint";

    toolbar.appendChild(
        checkpointTool
    );

}


checkpointTool.addEventListener(
    "click",
    () => {

        currentTool =
            "checkpoint";

        clearSelection();

        canvas.style.cursor =
            "crosshair";

        updatePropertiesPanel();

        updateDoorControls();

        updateSpawnControls();

    }
);


// Door destination controls

let doorLevelContainer =
    document.getElementById(
        "doorLevelContainer"
    );


if (!doorLevelContainer) {

    doorLevelContainer =
        document.createElement(
            "label"
        );

    doorLevelContainer.id =
        "doorLevelContainer";

    doorLevelContainer.innerHTML =
        "Next Level ";

    toolbar.appendChild(
        doorLevelContainer
    );

}


let doorLevelSelect =
    document.getElementById(
        "doorLevelSelect"
    );


if (!doorLevelSelect) {

    doorLevelSelect =
        document.createElement(
            "select"
        );

    doorLevelSelect.id =
        "doorLevelSelect";

    doorLevelContainer.appendChild(
        doorLevelSelect
    );

}


let doorDestinationContainer =
    document.getElementById(
        "doorDestinationContainer"
    );


if (!doorDestinationContainer) {

    doorDestinationContainer =
        document.createElement(
            "label"
        );

    doorDestinationContainer.id =
        "doorDestinationContainer";

    doorDestinationContainer.innerHTML =
        "Inside X/Y ";

    const destinationX =
        document.createElement(
            "input"
        );

    destinationX.id =
        "doorDestinationX";

    destinationX.type =
        "number";

    destinationX.placeholder =
        "X";


    const destinationY =
        document.createElement(
            "input"
        );

    destinationY.id =
        "doorDestinationY";

    destinationY.type =
        "number";

    destinationY.placeholder =
        "Y";


    doorDestinationContainer.append(
        destinationX,
        destinationY
    );


    toolbar.appendChild(
        doorDestinationContainer
    );

}


const doorDestinationX =
    document.getElementById(
        "doorDestinationX"
    );


const doorDestinationY =
    document.getElementById(
        "doorDestinationY"
    );


// Checkpoint source controls

let spawnSourceContainer =
    document.getElementById(
        "spawnSourceContainer"
    );


if (!spawnSourceContainer) {

    spawnSourceContainer =
        document.createElement(
            "label"
        );

    spawnSourceContainer.id =
        "spawnSourceContainer";

    spawnSourceContainer.innerHTML =
        "Comes From ";

    toolbar.appendChild(
        spawnSourceContainer
    );

}


let spawnSourceSelect =
    document.getElementById(
        "spawnSourceSelect"
    );


if (!spawnSourceSelect) {

    spawnSourceSelect =
        document.createElement(
            "select"
        );

    spawnSourceSelect.id =
        "spawnSourceSelect";

    spawnSourceContainer.appendChild(
        spawnSourceSelect
    );

}


const defaultLevelFiles = [

    "./level-1.json",
    "./level-2.json",
    "./level-3.json",
    "./level-4.json",
    "./level-5.json",
    "./level-6.json",
    "./level-7.json",
    "./level-8.json",
    "./level-9.json",
    "./level-10.json"

];


function populateLevelSelector(
    select,
    currentValue
) {

    if (!select) {

        return;

    }


    select.innerHTML =
        "";


    for (
        const file
        of defaultLevelFiles
    ) {

        const option =
            new Option(
                file
                    .replace(
                        "./",
                        ""
                    ),
                file
            );


        select.appendChild(
            option
        );

    }


    if (
        currentValue &&
        defaultLevelFiles.includes(
            currentValue
        )
    ) {

        select.value =
            currentValue;

    }

}


populateLevelSelector(
    doorLevelSelect,
    "./level-2.json"
);


populateLevelSelector(
    spawnSourceSelect,
    "./level-1.json"
);


// Door target change

doorLevelSelect.addEventListener(
    "change",
    () => {

        if (
            !selectedDoor
        ) {

            return;

        }


        selectedDoor.level =
            doorLevelSelect.value;


        saveHistoryState();

    }
);


function updateDoorControls() {

    if (!doorLevelContainer) {

        return;

    }


    const visible =
        selectedDoor ||
        currentTool === "door";


    doorLevelContainer.style.display =
        visible
            ? "flex"
            : "none";


    if (
        doorDestinationContainer
    ) {

        doorDestinationContainer.style.display =
            visible
                ? "flex"
                : "none";

    }


    if (
        selectedDoor
    ) {

        doorLevelSelect.value =
            selectedDoor.level ||
            "./level-2.json";


        doorDestinationX.value =
            selectedDoor.destination?.x ??
            "";

        doorDestinationY.value =
            selectedDoor.destination?.y ??
            "";

    }

}


function updateSpawnControls() {

    if (!spawnSourceContainer) {

        return;

    }


    const visible =
        selectedSpawnPoint ||
        currentTool === "checkpoint";


    spawnSourceContainer.style.display =
        visible
            ? "flex"
            : "none";


    if (
        selectedSpawnPoint
    ) {

        spawnSourceSelect.value =
            selectedSpawnPoint.from ||
            "./level-1.json";

    }

}


function updateDoorDestination() {

    if (!selectedDoor) {

        return;

    }


    const x =
        Number(
            doorDestinationX.value
        );


    const y =
        Number(
            doorDestinationY.value
        );


    if (
        Number.isFinite(x) &&
        Number.isFinite(y)
    ) {

        selectedDoor.destination = {

            x:
                snapToGrid(
                    x
                ),

            y:
                snapToGrid(
                    y
                )

        };

    }
    else {

        delete selectedDoor.destination;

    }


    saveHistoryState();

}


doorDestinationX.addEventListener(
    "change",
    updateDoorDestination
);


doorDestinationY.addEventListener(
    "change",
    updateDoorDestination
);


spawnSourceSelect.addEventListener(
    "change",
    () => {

        if (!selectedSpawnPoint) {

            return;

        }


        selectedSpawnPoint.from =
            spawnSourceSelect.value;


        saveHistoryState();

    }
);


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
            x <=
                platform.x +
                platform.width &&
            y >= platform.y &&
            y <=
                platform.y +
                platform.height
        ) {

            return platform;

        }

    }


    return null;

}


function getDoorAtPosition(
    x,
    y
) {

    for (
        let i = doors.length - 1;
        i >= 0;
        i--
    ) {

        const door =
            doors[i];


        if (
            x >= door.x &&
            x <=
                door.x +
                door.width &&
            y >= door.y &&
            y <=
                door.y +
                door.height
        ) {

            return door;

        }

    }


    return null;

}


function getSpawnPointAtPosition(
    x,
    y
) {

    for (
        let i = spawns.length - 1;
        i >= 0;
        i--
    ) {

        const spawnPoint =
            spawns[i];


        const width =
            spawnPoint.width ||
            40;


        const height =
            spawnPoint.height ||
            60;


        if (
            x >= spawnPoint.x &&
            x <=
                spawnPoint.x +
                width &&
            y >= spawnPoint.y &&
            y <=
                spawnPoint.y +
                height
        ) {

            return spawnPoint;

        }

    }


    return null;

}


function getThroneAtPosition(
    x,
    y
) {

    for (
        let i = thrones.length - 1;
        i >= 0;
        i--
    ) {

        const throne =
            thrones[i];


        if (
            x >= throne.x &&
            x <=
                throne.x +
                throne.width &&
            y >= throne.y &&
            y <=
                throne.y +
                throne.height
        ) {

            return throne;

        }

    }


    return null;

}


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


function snapToGrid(
    value
) {

    return Math.round(
        value / GRID_SIZE
    ) * GRID_SIZE;

}


function getResizeHandle(
    x,
    y,
    platform
) {

    const handleSize =
        10;


    const screenX =
        (platform.x -
            camera.x) *
            camera.zoom;


    const screenY =
        (platform.y -
            camera.y) *
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
        of Object.entries(
            handles
        )
    ) {

        if (
            Math.abs(
                x -
                handle.x
            ) <=
                handleSize &&
            Math.abs(
                y -
                handle.y
            ) <=
                handleSize
        ) {

            return name;

        }

    }


    return null;

}


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

    updateDoorControls();

    updateSpawnControls();


    canvas.style.cursor =
        "default";


    saveHistoryState();

}


function updateCursor(
    mouseX,
    mouseY
) {

    const worldPosition =
        screenToWorld(
            mouseX,
            mouseY
        );


    if (
        selectedDoor &&
        getDoorAtPosition(
            worldPosition.x,
            worldPosition.y
        ) === selectedDoor
    ) {

        canvas.style.cursor =
            "grab";

        return;

    }


    if (
        selectedSpawnPoint &&
        getSpawnPointAtPosition(
            worldPosition.x,
            worldPosition.y
        ) === selectedSpawnPoint
    ) {

        canvas.style.cursor =
            "grab";

        return;

    }


    if (
        selectedThrone &&
        getThroneAtPosition(
            worldPosition.x,
            worldPosition.y
        ) === selectedThrone
    ) {

        canvas.style.cursor =
            "grab";

        return;

    }


    if (
        currentTool === "door"
    ) {

        const hoveredDoor =
            getDoorAtPosition(
                worldPosition.x,
                worldPosition.y
            );


        if (hoveredDoor) {

            canvas.style.cursor =
                "grab";

            return;

        }

    }


    if (
        currentTool === "checkpoint"
    ) {

        const hoveredSpawn =
            getSpawnPointAtPosition(
                worldPosition.x,
                worldPosition.y
            );


        if (hoveredSpawn) {

            canvas.style.cursor =
                "grab";

            return;

        }

    }


    if (
        currentTool === "throne"
    ) {

        const hoveredThrone =
            getThroneAtPosition(
                worldPosition.x,
                worldPosition.y
            );


        if (hoveredThrone) {

            canvas.style.cursor =
                "grab";

            return;

        }

    }


    if (
        selectedPlatforms.length === 0
    ) {

        canvas.style.cursor =
            "default";

        return;

    }


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


canvas.addEventListener(
    "mousedown",
    (event) => {

        const worldPosition =
            screenToWorld(
                event.offsetX,
                event.offsetY
            );


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


        if (
            currentTool === "checkpoint"
        ) {

            const existingSpawn =
                getSpawnPointAtPosition(
                    worldPosition.x,
                    worldPosition.y
                );


            if (existingSpawn) {

                selectSpawnPoint(
                    existingSpawn
                );


                dragStart = {

                    x:
                        worldPosition.x,

                    y:
                        worldPosition.y

                };


                originalSpawnPoint = {

                    x:
                        existingSpawn.x,

                    y:
                        existingSpawn.y

                };


                isDragging =
                    true;


                canvas.style.cursor =
                    "grabbing";


                return;

            }


            const newSpawn = {

                x:
                    snapToGrid(
                        worldPosition.x
                    ),

                y:
                    snapToGrid(
                        worldPosition.y
                    ),

                width:
                    40,

                height:
                    60,

                from:
                    spawnSourceSelect.value ||
                    "./level-1.json"

            };


            spawns.push(
                newSpawn
            );


            selectedSpawnPoint =
                newSpawn;


            updateSpawnControls();

            saveHistoryState();

            return;

        }


        if (
            currentTool === "door"
        ) {

            const existingDoor =
                getDoorAtPosition(
                    worldPosition.x,
                    worldPosition.y
                );


            if (existingDoor) {

                selectDoor(
                    existingDoor
                );


                dragStart = {

                    x:
                        worldPosition.x,

                    y:
                        worldPosition.y

                };


                originalDoor = {

                    x:
                        existingDoor.x,

                    y:
                        existingDoor.y

                };


                isDragging =
                    true;


                canvas.style.cursor =
                    "grabbing";


                return;

            }


            const newDoor = {

                x:
                    snapToGrid(
                        worldPosition.x
                    ),

                y:
                    snapToGrid(
                        worldPosition.y
                    ),

                width:
                    60,

                height:
                    100,

                level:
                    doorLevelSelect.value ||
                    "./level-2.json"

            };


            doors.push(
                newDoor
            );


            selectedDoor =
                newDoor;


            updateDoorControls();

            saveHistoryState();

            return;

        }


        if (
            currentTool === "throne"
        ) {

            const existingThrone =
                getThroneAtPosition(
                    worldPosition.x,
                    worldPosition.y
                );


            if (existingThrone) {

                selectThrone(
                    existingThrone
                );


                dragStart = {

                    x:
                        worldPosition.x,

                    y:
                        worldPosition.y

                };


                originalThrone = {

                    x:
                        existingThrone.x,

                    y:
                        existingThrone.y

                };


                isDragging =
                    true;


                canvas.style.cursor =
                    "grabbing";

                return;

            }


            const newThrone = {

                x:
                    snapToGrid(
                        worldPosition.x
                    ),

                y:
                    snapToGrid(
                        worldPosition.y
                    ),

                width:
                    180,

                height:
                    220

            };


            thrones.push(
                newThrone
            );


            selectedThrone =
                newThrone;


            saveHistoryState();

            return;

        }


        if (
            currentTool === "erase"
        ) {

            const clickedDoor =
                getDoorAtPosition(
                    worldPosition.x,
                    worldPosition.y
                );


            if (clickedDoor) {

                const index =
                    doors.indexOf(
                        clickedDoor
                    );


                if (
                    index !== -1
                ) {

                    doors.splice(
                        index,
                        1
                    );


                    if (
                        selectedDoor ===
                        clickedDoor
                    ) {

                        selectedDoor =
                            null;

                    }


                    updateDoorControls();

                    saveHistoryState();

                }


                return;

            }


            const clickedSpawn =
                getSpawnPointAtPosition(
                    worldPosition.x,
                    worldPosition.y
                );


            if (clickedSpawn) {

                const index =
                    spawns.indexOf(
                        clickedSpawn
                    );


                if (
                    index !== -1
                ) {

                    spawns.splice(
                        index,
                        1
                    );

                    if (
                        selectedSpawnPoint ===
                        clickedSpawn
                    ) {

                        selectedSpawnPoint =
                            null;

                    }


                    updateSpawnControls();

                    saveHistoryState();

                }


                return;

            }


            const clickedThrone =
                getThroneAtPosition(
                    worldPosition.x,
                    worldPosition.y
                );


            if (clickedThrone) {

                thrones.splice(
                    thrones.indexOf(
                        clickedThrone
                    ),
                    1
                );


                clearSelection();

                saveHistoryState();

                return;

            }


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


        const clickedSpawn =
            getSpawnPointAtPosition(
                worldPosition.x,
                worldPosition.y
            );


        if (clickedSpawn) {

            selectSpawnPoint(
                clickedSpawn
            );


            dragStart = {

                x:
                    worldPosition.x,

                y:
                    worldPosition.y

            };


            originalSpawnPoint = {

                x:
                    clickedSpawn.x,

                y:
                    clickedSpawn.y

            };


            isDragging =
                true;


            canvas.style.cursor =
                "grabbing";


            return;

        }


        const clickedDoor =
            getDoorAtPosition(
                worldPosition.x,
                worldPosition.y
            );


        if (clickedDoor) {

            selectDoor(
                clickedDoor
            );


            dragStart = {

                x:
                    worldPosition.x,

                y:
                    worldPosition.y

            };


            originalDoor = {

                x:
                    clickedDoor.x,

                y:
                    clickedDoor.y

            };


            isDragging =
                true;


            canvas.style.cursor =
                "grabbing";


            return;

        }


        const clickedThrone =
            getThroneAtPosition(
                worldPosition.x,
                worldPosition.y
            );


        if (clickedThrone) {

            selectThrone(
                clickedThrone
            );


            dragStart = {

                x:
                    worldPosition.x,

                y:
                    worldPosition.y

            };


            originalThrone = {

                x:
                    clickedThrone.x,

                y:
                    clickedThrone.y

            };


            isDragging =
                true;


            canvas.style.cursor =
                "grabbing";


            return;

        }


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


        const platform =
            getPlatformAtPosition(
                worldPosition.x,
                worldPosition.y
            );


        if (platform) {

            if (
                event.ctrlKey
            ) {

                togglePlatformSelection(
                    platform
                );


                updatePropertiesPanel();

                return;

            }


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


            if (
                selectedPlatforms.length > 0
            ) {

                dragStart = {

                    x:
                        worldPosition.x,

                    y:
                        worldPosition.y

                };


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


        if (
            currentTool !== "platform"
        ) {

            return;

        }


        clearSelection();

        updatePropertiesPanel();

        updateDoorControls();

        updateSpawnControls();


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


        dragCurrent = {

            x:
                dragStart.x,

            y:
                dragStart.y

        };


        isDragging =
            true;

    }
);


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


    if (platformStyleSelect) {

        platformStyleSelect.value =
            platform.style ||
            "stone";

    }


    if (platformColorInput) {

        platformColorInput.value =
            platform.color ||
            "#737d81";

    }

}


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


canvas.addEventListener(
    "mousemove",
    (event) => {

        const worldPosition =
            screenToWorld(
                event.offsetX,
                event.offsetY
            );


        if (!isDragging) {

            updateCursor(
                event.offsetX,
                event.offsetY
            );

            return;

        }


        if (
            selectedSpawnPoint &&
            originalSpawnPoint
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


            selectedSpawnPoint.x =
                originalSpawnPoint.x +
                deltaX;


            selectedSpawnPoint.y =
                originalSpawnPoint.y +
                deltaY;


            return;

        }


        if (
            selectedDoor &&
            originalDoor
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


            selectedDoor.x =
                originalDoor.x +
                deltaX;


            selectedDoor.y =
                originalDoor.y +
                deltaY;


            return;

        }


        if (
            selectedThrone &&
            originalThrone
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


            selectedThrone.x =
                originalThrone.x +
                deltaX;


            selectedThrone.y =
                originalThrone.y +
                deltaY;


            return;

        }


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


canvas.addEventListener(
    "mouseup",
    () => {

        canvas.style.cursor =
            "default";


        if (!isDragging) {

            return;

        }


        if (
            selectedSpawnPoint
        ) {

            isDragging =
                false;

            originalSpawnPoint =
                null;

            saveHistoryState();

            return;

        }


        if (
            selectedDoor
        ) {

            isDragging =
                false;

            originalDoor =
                null;

            saveHistoryState();

            return;

        }


        if (
            selectedThrone
        ) {

            isDragging =
                false;

            originalThrone =
                null;

            saveHistoryState();

            return;

        }


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


            if (changed) {

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


            if (changed) {

                saveHistoryState();

            }


            originalPlatforms =
                [];

            isDragging =
                false;

            return;

        }


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
                    platformStyleSelect
                        ? platformStyleSelect.value
                        : "stone",

                color:
                    platformColorInput
                        ? platformColorInput.value
                        : "#737d81"

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

    },
    {
        passive: false
    }
);


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


function drawPlatforms() {

    for (
        const platform
        of platforms
    ) {

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
            platform
        );


        ctx.restore();

    }


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

            (
                x -
                camera.x
            ) *
                camera.zoom,

            (
                y -
                camera.y
            ) *
                camera.zoom,

            width *
                camera.zoom,

            height *
                camera.zoom

        );

    }


    for (
        const platform
        of selectedPlatforms
    ) {

        const x =
            (
                platform.x -
                camera.x
            ) *
                camera.zoom;


        const y =
            (
                platform.y -
                camera.y
            ) *
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


    if (
        selectedPlatforms.length === 1
    ) {

        const platform =
            selectedPlatforms[0];


        const x =
            (
                platform.x -
                camera.x
            ) *
                camera.zoom;


        const y =
            (
                platform.y -
                camera.y
            ) *
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


        ctx.fillRect(
            x - handleSize / 2,
            y - handleSize / 2,
            handleSize,
            handleSize
        );


        ctx.fillRect(
            x + width -
                handleSize / 2,
            y -
                handleSize / 2,
            handleSize,
            handleSize
        );


        ctx.fillRect(
            x -
                handleSize / 2,
            y + height -
                handleSize / 2,
            handleSize,
            handleSize
        );


        ctx.fillRect(
            x + width -
                handleSize / 2,
            y + height -
                handleSize / 2,
            handleSize,
            handleSize
        );

    }

}


function drawEditorDoors() {

    for (
        const door
        of doors
    ) {

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


        drawDoor(
            ctx,
            door
        );


        ctx.restore();


        if (
            selectedDoor ===
            door
        ) {

            const x =
                (
                    door.x -
                    camera.x
                ) *
                    camera.zoom;


            const y =
                (
                    door.y -
                    camera.y
                ) *
                    camera.zoom;


            const width =
                door.width *
                camera.zoom;


            const height =
                door.height *
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


            ctx.fillStyle =
                "white";

            ctx.font =
                "14px Arial";


            ctx.fillText(
                door.level ||
                "No target",
                x,
                y - 8
            );

        }

    }

}


function drawEditorSpawnPoints() {

    for (
        const spawnPoint
        of spawns
    ) {

        const x =
            (
                spawnPoint.x -
                camera.x
            ) *
                camera.zoom;


        const y =
            (
                spawnPoint.y -
                camera.y
            ) *
                camera.zoom;


        const width =
            (
                spawnPoint.width ||
                40
            ) *
                camera.zoom;


        const height =
            (
                spawnPoint.height ||
                60
            ) *
                camera.zoom;


        ctx.fillStyle =
            "rgba(0, 180, 255, 0.45)";


        ctx.fillRect(
            x,
            y,
            width,
            height
        );


        ctx.strokeStyle =
            "cyan";

        ctx.lineWidth =
            2;


        ctx.strokeRect(
            x,
            y,
            width,
            height
        );


        ctx.fillStyle =
            "white";

        ctx.font =
            "13px Arial";


        ctx.fillText(
            spawnPoint.from ||
            "No source",
            x,
            y - 8
        );


        if (
            selectedSpawnPoint ===
            spawnPoint
        ) {

            ctx.strokeStyle =
                "yellow";

            ctx.lineWidth =
                3;


            ctx.strokeRect(
                x - 3,
                y - 3,
                width + 6,
                height + 6
            );

        }

    }

}


function drawEditorThrones() {

    for (
        const throne
        of thrones
    ) {

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


        drawThrone(
            ctx,
            throne
        );


        ctx.restore();


        if (
            selectedThrone ===
            throne
        ) {

            const x =
                (
                    throne.x -
                    camera.x
                ) *
                    camera.zoom;


            const y =
                (
                    throne.y -
                    camera.y
                ) *
                    camera.zoom;


            const width =
                throne.width *
                camera.zoom;


            const height =
                throne.height *
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


            ctx.fillStyle =
                "white";

            ctx.font =
                "14px Arial";


            ctx.fillText(
                "THRONE",
                x,
                y - 8
            );

        }

    }

}


function drawSpawn() {

    const x =
        (
            spawn.x -
            camera.x
        ) *
            camera.zoom;


    const y =
        (
            spawn.y -
            camera.y
        ) *
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
        "START",
        x,
        y - 8
    );

}

function drawEditorCollectibles() {

    if (
        !level ||
        !level.collectibles
    ) {

        return;

    }


    const collectibles =
        level.collectibles;


    if (
        collectibles.gem
    ) {

        ctx.save();

        ctx.translate(
            -camera.x * camera.zoom,
            -camera.y * camera.zoom
        );

        ctx.scale(
            camera.zoom,
            camera.zoom
        );

        drawGem(
            ctx,
            collectibles.gem
        );

        ctx.restore();

    }


    if (
        collectibles.crown
    ) {

        ctx.save();

        ctx.translate(
            -camera.x * camera.zoom,
            -camera.y * camera.zoom
        );

        ctx.scale(
            camera.zoom,
            camera.zoom
        );

        drawCrown(
            ctx,
            collectibles.crown
        );

        ctx.restore();

    }


    if (
        collectibles.key
    ) {

        ctx.save();

        ctx.translate(
            -camera.x * camera.zoom,
            -camera.y * camera.zoom
        );

        ctx.scale(
            camera.zoom,
            camera.zoom
        );

        drawKey(
            ctx,
            collectibles.key
        );

        ctx.restore();

    }

}

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    drawBackground(
        ctx,
        level?.background || "forest",
        editorWorld.width,
        editorWorld.height,
        camera.x,
        camera.y
    );


    drawGrid();

    drawPlatforms();

    drawEditorDoors();

    drawEditorSpawnPoints();

    drawEditorCollectibles();

    drawEditorThrones();

    drawSpawn();

}


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


        spawns:
            spawns.map(
                spawnPoint => ({

                    x:
                        spawnPoint.x,

                    y:
                        spawnPoint.y,

                    width:
                        spawnPoint.width ||
                        40,

                    height:
                        spawnPoint.height ||
                        60,

                    from:
                        spawnPoint.from ||
                        "./level-1.json"

                })
            ),


        background:
            level.background ||
            "forest",


        doors:
            doors.map(
                door => {

                    const result = {

                        x:
                            door.x,

                        y:
                            door.y,

                        width:
                            door.width,

                        height:
                            door.height,

                        level:
                            door.level ||
                            "./level-2.json"

                    };


                    if (
                        door.destination
                    ) {

                        result.destination = {

                            x:
                                door.destination.x,

                            y:
                                door.destination.y

                        };

                    }


                    return result;

                }
            ),


        thrones:
            thrones.map(
                throne => ({

                    x:
                        throne.x,

                    y:
                        throne.y,

                    width:
                        throne.width,

                    height:
                        throne.height

                })
            ),


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


const loadButton =
    document.getElementById(
        "loadButton"
    );


const levelFileInput =
    document.getElementById(
        "levelFileInput"
    );


if (
    loadButton &&
    levelFileInput
) {

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

}


const levelSelect =
    document.getElementById(
        "levelSelect"
    );


const editorLevelFiles = [

    "./level-1.json",
    "./level-2.json",
    "./level-3.json",
    "./level-4.json",
    "./level-5.json",
    "./level-6.json",
    "./level-7.json",
    "./level-8.json",
    "./level-9.json",
    "./level-10.json"

];


function populateMainLevelSelector() {

    if (!levelSelect) {

        return;

    }


    levelSelect.innerHTML =
        "";


    for (
        const file
        of editorLevelFiles
    ) {

        const option =
            new Option(
                file
                    .replace("./", "")
                    .replace(".json", "")
                    .replace(
                        "level-",
                        "Level "
                    ),
                file
            );


        levelSelect.appendChild(
            option
        );

    }

}


populateMainLevelSelector();


if (levelSelect) {

    levelSelect.addEventListener(
        "change",
        async () => {

            const file =
                levelSelect.value;


            if (!file) {

                return;

            }


            try {

                const response =
                    await fetch(file);


                if (!response.ok) {

                    throw new Error(
                        `Failed to load level: ${file}`
                    );

                }


                const loadedLevel =
                    await response.json();


                loadLevelData(
                    loadedLevel
                );


                console.log(
                    "Editor switched to:",
                    file
                );

            }
            catch (error) {

                console.error(
                    "Failed to switch level:",
                    error
                );


                alert(
                    `Could not load ${file}.`
                );

            }

        }
    );

}


async function loadLevel() {

    const file =
        levelSelect?.value ||
        "./level-1.json";


    const response =
        await fetch(
            file
        );


    if (!response.ok) {

        throw new Error(
            `Failed to load level: ${file}`
        );

    }


    level =
        await response.json();


    platforms =
        level.platforms || [];


    spawn =
        level.spawn || {

            x: 0,

            y: 0

        };


    spawns =
        Array.isArray(
            level.spawns
        )
            ? level.spawns
            : [];


    if (
        Array.isArray(
            level.doors
        )
    ) {

        doors =
            level.doors;

    }
    else if (
        level.door
    ) {

        doors = [
            level.door
        ];

    }
    else {

        doors = [];

    }


    thrones =
        Array.isArray(
            level.thrones
        )
            ? level.thrones
            : level.throne
                ? [level.throne]
                : [];


    level.background =
        level.background ||
        "forest";


    editorWorld.width =
        level.width;

    editorWorld.height =
        level.height;


    if (backgroundSelect) {

        backgroundSelect.value =
            level.background;

    }


    if (levelSelect) {

        levelSelect.value =
            file;

    }


    clearSelection();

    updateDoorControls();

    updateSpawnControls();


    console.log(
        "Editor level loaded:",
        file,
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


    spawns =
        Array.isArray(
            level.spawns
        )
            ? level.spawns
            : [];


    if (
        Array.isArray(
            level.doors
        )
    ) {

        doors =
            level.doors;

    }
    else if (
        level.door
    ) {

        doors = [
            level.door
        ];

    }
    else {

        doors = [];

    }


    thrones =
        Array.isArray(
            level.thrones
        )
            ? level.thrones
            : level.throne
                ? [level.throne]
                : [];


    level.background =
        level.background ||
        "forest";


    editorWorld.width =
        level.width;

    editorWorld.height =
        level.height;


    if (backgroundSelect) {

        backgroundSelect.value =
            level.background;

    }


    clearSelection();


    resizingHandle =
        null;

    originalPlatforms =
        [];

    originalDoor =
        null;

    originalSpawnPoint =
        null;

    originalThrone =
        null;

    isDragging =
        false;


    updatePropertiesPanel();

    updateDoorControls();

    updateSpawnControls();


    console.log(
        "Editor updated with new level."
    );

}


let lastTime =
    performance.now();


function gameLoop(
    currentTime
) {

    const deltaTime =
        Math.min(
            (
                currentTime -
                lastTime
            ) / 1000,
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


async function startEditor() {

    try {

        await loadLevel();

        saveHistoryState();

        requestAnimationFrame(
            gameLoop
        );

    }
    catch (error) {

        console.error(
            "Failed to start editor:",
            error
        );

    }

}


startEditor();
let level = null;

let currentLevelFile = "./level-1.json";

let isLoadingLevel = false;


// ============================================================
// NORMALIZE LEVEL
// ============================================================

function normalizeLevel(loadedLevel) {

    // --------------------------------------------------------
    // Convert old single-door format to multiple doors
    // --------------------------------------------------------

    if (loadedLevel.door) {

        if (Array.isArray(loadedLevel.door)) {

            loadedLevel.doors =
                loadedLevel.door;

        }
        else {

            loadedLevel.doors = [
                loadedLevel.door
            ];

        }

        delete loadedLevel.door;

    }


    // --------------------------------------------------------
    // Make sure doors always exists
    // --------------------------------------------------------

    if (!Array.isArray(loadedLevel.doors)) {

        loadedLevel.doors = [];

    }


    return loadedLevel;

}


// ============================================================
// LOAD LEVEL
// ============================================================

async function loadLevel(file = "./level-1.json") {

    if (isLoadingLevel) {

        return false;

    }

    isLoadingLevel = true;

    try {

        const response =
            await fetch(
                file
            );


        if (!response.ok) {

            throw new Error(
                `Failed to load level: ${file}`
            );

        }


        const loadedLevel =
            await response.json();


        level =
            normalizeLevel(
                loadedLevel
            );


        currentLevelFile =
            file;


        console.log(
            "Level loaded:",
            file,
            level
        );


        return true;

    }
    catch (error) {

        console.error(
            "Failed to load level:",
            error
        );


        return false;

    }
    finally {

        isLoadingLevel =
            false;

    }

}


// ============================================================
// LOAD ANOTHER LEVEL
// ============================================================

async function changeLevel(file) {

    if (
        !file ||
        isLoadingLevel
    ) {

        return false;

    }


    const success =
        await loadLevel(
            file
        );


    return success;

}


// ============================================================
// GET CURRENT LEVEL FILE
// ============================================================

function getCurrentLevelFile() {

    return currentLevelFile;

}


// ============================================================
// GET LEVEL
// ============================================================

function getLevel() {

    return level;

}


// ============================================================
// EXPORT
// ============================================================

export {

    level,

    loadLevel,

    changeLevel,

    getCurrentLevelFile,

    getLevel

};
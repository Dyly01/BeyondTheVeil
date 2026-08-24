let level = null;

let currentLevelFile = "./level.json";

let isLoadingLevel = false;


// ============================================================
// LOAD LEVEL
// ============================================================

async function loadLevel(file = "./level.json") {

    if (isLoadingLevel) {
        return;
    }

    isLoadingLevel = true;

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


        level =
            loadedLevel;


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
        await loadLevel(file);


    return success &&
        level !== null;

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
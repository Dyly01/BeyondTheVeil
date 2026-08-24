let level = null;

let currentLevelFile = null;

let isLoadingLevel = false;


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
            await fetch(file);

        if (!response.ok) {

            throw new Error(
                `Failed to load level: ${file}`
            );

        }


        // Read the response as text first.
        // This gives us a much better error if the
        // file contains something other than JSON.

        const text =
            await response.text();


        let loadedLevel;

        try {

            loadedLevel =
                JSON.parse(text);

        }
        catch (error) {

            throw new Error(
                `Invalid JSON in ${file}: ${error.message}`
            );

        }


        // Basic level validation

        if (
            !loadedLevel ||
            typeof loadedLevel !== "object"
        ) {

            throw new Error(
                `Level file ${file} does not contain a valid level object.`
            );

        }


        if (
            !loadedLevel.spawn ||
            !Array.isArray(
                loadedLevel.platforms
            )
        ) {

            throw new Error(
                `Level file ${file} is missing spawn or platforms.`
            );

        }


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
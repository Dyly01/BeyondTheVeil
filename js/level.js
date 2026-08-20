let level = null;


async function loadLevel() {

    const response = await fetch("./level.json");

    level = await response.json();

    console.log("Level loaded:", level);
}


export {
    level,
    loadLevel
};
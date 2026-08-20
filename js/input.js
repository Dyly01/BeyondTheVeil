const keys = {};
const previousKeys = {};


document.addEventListener("keydown", (event) => {

    keys[event.key] = true;

});


document.addEventListener("keyup", (event) => {

    keys[event.key] = false;

});


function isKeyDown(key) {

    return keys[key] === true;
}


function isKeyPressed(key) {

    return (
        keys[key] === true &&
        previousKeys[key] !== true
    );
}


function updateInput() {

    for (const key in keys) {

        previousKeys[key] = keys[key];
    }
}


export {
    keys,
    isKeyDown,
    isKeyPressed,
    updateInput
};
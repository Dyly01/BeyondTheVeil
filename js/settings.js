import {
    setMusicVolume,
    setSoundVolume,
    getMusicVolume,
    getSoundVolume
} from "./audio.js";


const settingsMenu =
    document.getElementById(
        "settingsMenu"
    );


const settingsButton =
    document.getElementById(
        "settingsButton"
    );


const backSettingsButton =
    document.getElementById(
        "backSettingsButton"
    );


const showInfoScreens =
    document.getElementById(
        "showInfoScreens"
    );


const musicVolume =
    document.getElementById(
        "musicVolume"
    );


const soundVolume =
    document.getElementById(
        "soundVolume"
    );


console.log(
    "SETTINGS.JS LOADED"
);


console.log(
    "settingsMenu:",
    settingsMenu
);


console.log(
    "settingsButton:",
    settingsButton
);


console.log(
    "backSettingsButton:",
    backSettingsButton
);


// Information screens

const savedInfoSetting =
    localStorage.getItem(
        "showInfoScreens"
    );


if (
    savedInfoSetting !== null
) {

    showInfoScreens.checked =
        savedInfoSetting === "true";

}


showInfoScreens.addEventListener(
    "change",
    () => {

        localStorage.setItem(
            "showInfoScreens",
            showInfoScreens.checked
        );

    }
);


// Audio settings

musicVolume.value =
    getMusicVolume() * 100;


soundVolume.value =
    getSoundVolume() * 100;


musicVolume.addEventListener(
    "input",
    () => {

        setMusicVolume(
            Number(
                musicVolume.value
            ) / 100
        );

    }
);


soundVolume.addEventListener(
    "input",
    () => {

        setSoundVolume(
            Number(
                soundVolume.value
            ) / 100
        );

    }
);


// Information screen state

function shouldShowInfoScreens() {

    const value =
        localStorage.getItem(
            "showInfoScreens"
        );


    return value !== "false";

}


// Open settings

function openSettings() {

    console.log(
        "OPEN SETTINGS"
    );


    settingsMenu.style.display =
        "flex";

}


// Close settings

function closeSettings() {

    console.log(
        "CLOSE SETTINGS"
    );


    settingsMenu.style.display =
        "none";

}


settingsButton.addEventListener(
    "click",
    openSettings
);


backSettingsButton.addEventListener(
    "click",
    closeSettings
);


export {
    shouldShowInfoScreens
};
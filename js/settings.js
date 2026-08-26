const settingsMenu =
    document.getElementById("settingsMenu");

const settingsButton =
    document.getElementById("settingsButton");

const backSettingsButton =
    document.getElementById("backSettingsButton");

const showInfoScreens =
    document.getElementById(
        "showInfoScreens"
    );


console.log("SETTINGS.JS LOADED");
console.log("settingsMenu:", settingsMenu);
console.log("settingsButton:", settingsButton);
console.log("backSettingsButton:", backSettingsButton);

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

function shouldShowInfoScreens() {

    const value =
        localStorage.getItem(
            "showInfoScreens"
        );

    return value !== "false";

}


function openSettings() {

    console.log("OPEN SETTINGS");

    settingsMenu.style.display = "flex";

}


function closeSettings() {

    console.log("CLOSE SETTINGS");

    settingsMenu.style.display = "none";

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
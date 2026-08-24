const settingsMenu =
    document.getElementById("settingsMenu");

const settingsButton =
    document.getElementById("settingsButton");

const backSettingsButton =
    document.getElementById("backSettingsButton");


console.log("SETTINGS.JS LOADED");
console.log("settingsMenu:", settingsMenu);
console.log("settingsButton:", settingsButton);
console.log("backSettingsButton:", backSettingsButton);


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
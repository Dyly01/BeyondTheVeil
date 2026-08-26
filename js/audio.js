const music =
    new Audio("./audio/music.mp3");

const jumpSound =
    new Audio("./audio/jump.mp3");

const collectSound =
    new Audio("./audio/collect.mp3");


music.loop = true;


const savedMusicVolume =
    localStorage.getItem(
        "musicVolume"
    );

const savedSoundVolume =
    localStorage.getItem(
        "soundVolume"
    );


let musicVolume =
    savedMusicVolume !== null
        ? Number(savedMusicVolume)
        : 0.3;


let soundVolume =
    savedSoundVolume !== null
        ? Number(savedSoundVolume)
        : 0.5;


music.volume =
    musicVolume;


jumpSound.volume =
    soundVolume;


collectSound.volume =
    soundVolume;


function startMusic() {

    music.play().catch(() => {

    });

}


function stopMusic() {

    music.pause();

    music.currentTime =
        0;

}


function setMusicVolume(
    volume
) {

    musicVolume =
        Math.max(
            0,
            Math.min(
                1,
                volume
            )
        );

    music.volume =
        musicVolume;


    localStorage.setItem(
        "musicVolume",
        musicVolume
    );

}


function setSoundVolume(
    volume
) {

    soundVolume =
        Math.max(
            0,
            Math.min(
                1,
                volume
            )
        );


    jumpSound.volume =
        soundVolume;

    collectSound.volume =
        soundVolume;


    localStorage.setItem(
        "soundVolume",
        soundVolume
    );

}


function getMusicVolume() {

    return musicVolume;

}


function getSoundVolume() {

    return soundVolume;

}


function playJumpSound() {

    jumpSound.currentTime =
        0;

    jumpSound.play().catch(() => {

    });

}


function playCollectSound() {

    collectSound.currentTime =
        0;

    collectSound.play().catch(() => {

    });

}


export {
    startMusic,
    stopMusic,
    playJumpSound,
    playCollectSound,
    setMusicVolume,
    setSoundVolume,
    getMusicVolume,
    getSoundVolume
};
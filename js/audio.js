const jumpSounds =
    Array.from(
        { length: 4 },
        () => {

            const sound =
                new Audio("./audio/jump.mp3");

            sound.preload =
                "auto";

            return sound;

        }
    );

const jumpSoundStart =
    0.51;

let nextJumpSound =
    0;

const collectSound =
    new Audio("./audio/collect.mp3");


const levelMusicPaths = {
    "./level-1.json": "./audio/music-level-1.mp3",
    "./level-2.json": "./audio/music-level-2.mp3",
    "./level-3.json": "./audio/music-level-3.mp3",
    "./level-4.json": "./audio/music-level-4.mp3",
    "./level-5.json": "./audio/music-level-5.mp3"
};

const music =
    new Audio();

const endingSound =
    new Audio("./audio/ending.mp3");

music.loop = true;
endingSound.loop = false;
endingSound.preload = "auto";


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
        : 0.25;


let soundVolume =
    savedSoundVolume !== null
        ? Number(savedSoundVolume)
        : 0.4;


music.volume =
    musicVolume;

endingSound.volume =
    musicVolume;


for (
    const sound of jumpSounds
) {

    sound.volume =
        soundVolume;

}


collectSound.volume =
    soundVolume;


function playLevelMusic(levelFile) {

    const musicPath =
        levelMusicPaths[levelFile] ||
        levelMusicPaths["./level-1.json"];

    if (
        music.src.endsWith(
            musicPath
        )
    ) {

        startMusic();

        return;

    }

    music.src =
        musicPath;

    music.currentTime =
        0;

    startMusic();

}


function playEndingTheme() {

    stopMusic();

    endingSound.pause();

    endingSound.currentTime =
        0;

    endingSound.play().catch((error) => {

        console.error(
            "Ending theme could not play:",
            error
        );

    });

}


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


    for (
        const sound of jumpSounds
    ) {

        sound.volume =
            soundVolume;

    }

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

    const sound =
        jumpSounds[nextJumpSound];

    nextJumpSound =
        (nextJumpSound + 1) % jumpSounds.length;

    sound.currentTime =
        jumpSoundStart;

    sound.play().catch(() => {

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
    playLevelMusic,
    playEndingTheme,
    setMusicVolume,
    setSoundVolume,
    getMusicVolume,
    getSoundVolume
};
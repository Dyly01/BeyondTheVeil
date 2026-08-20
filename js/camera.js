import { level } from "./level.js";

const camera = {

    x: 0,
    y: 0,

    width: 0,
    height: 0
};


function updateCamera(player, canvas) {

    camera.width = canvas.width;
    camera.height = canvas.height;


    // Center camera on player

    camera.x =
        player.x +
        player.width / 2 -
        camera.width / 2;

    camera.y =
        player.y +
        player.height / 2 -
        camera.height / 2;


    // --------------------------------
    // Camera boundaries
    // --------------------------------

    camera.x = Math.max(
        0,
        Math.min(
            camera.x,
            level.width - camera.width
        )
    );


    camera.y = Math.max(
        0,
        Math.min(
            camera.y,
            level.height - camera.height
        )
    );
}


export {
    camera,
    updateCamera
};
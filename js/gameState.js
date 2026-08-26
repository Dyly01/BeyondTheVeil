const gameState = {

    keyCollected: false,

    doubleJumpUnlocked: false,

    crownCollected: false,

    currentSpawn: null,

    doubleJumpInfoShown: false

};


function resetGameState() {

    gameState.keyCollected = false;

    gameState.doubleJumpUnlocked = false;

    gameState.crownCollected = false;

    gameState.currentSpawn = null;

    gameState.doubleJumpInfoShown = false;

}


export {
    gameState,
    resetGameState
};


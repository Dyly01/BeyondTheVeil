const gameState = {

    keyCollected: false,

    doubleJumpUnlocked: false,

    crownCollected: false,

    currentSpawn: null

};


function resetGameState() {

    gameState.keyCollected = false;

    gameState.doubleJumpUnlocked = false;

    gameState.crownCollected = false;

    gameState.currentSpawn = null;

}


export {
    gameState,
    resetGameState
};
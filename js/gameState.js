const gameState = {

    keyCollected: false,

    doubleJumpUnlocked: false,

    crowCollected: false

};


function resetGameState() {

    gameState.keyCollected = false;

    gameState.doubleJumpUnlocked = false;

    gameState.crowCollected = false;

}


export {
    gameState,
    resetGameState
};
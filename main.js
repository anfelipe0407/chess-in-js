// ########################################################################
// ########################################################################

// AUTHOR: @anfelipe0407 on GitHub
// Link to profile: https://github.com/anfelipe0407

// ########################################################################
// ########################################################################

// First project ever uploaded to Github

// ########################################################################

// All code is original, no guides were used for the algorithms
// It can have bugs

// ########################################################################

import { createBoardElement, drawBoard, createNewBoardCopy } from './board.js';

import {
   putPiecesOnInitalState,
   setIdsToPieces,
   getPieceById,
   asignClickListenersToPieces,
} from './pieces.js';

import {
   calculateTilesAttackedByEveryPiece,
   updateTilesAttacked,
} from './movement.js';

import {
   checkIfKingsChecked,
   movePieceInVirtualBoard,
   updateTilesAttackedOnVirtualBoard,
} from './rules.js';

let boardElement = createBoardElement();

// start/restart game
export function startGame() {
   boardElement = createBoardElement();
   // create and draw board
   drawBoard();

   // put pieces in a initial state and set their id's
   putPiecesOnInitalState();
   setIdsToPieces();

   // Asign listeners to pieces
   asignClickListenersToPieces();

   // check tiles attacked by every piece
   calculateTilesAttackedByEveryPiece();

   console.log(boardElement);
}

// runs in the initialitation
startGame();

// create and get kingChecked object
// this allows to other files to get this object from a central source
const kingChecked = checkIfKingsChecked(boardElement);

// set event listener to restart game button
const restartGameBtn = document.querySelector('.btn-restart-game');
restartGameBtn.addEventListener('click', () => {
   restartGameBtn.style.display = 'none';

   const winnerTextElement = document.querySelector('.winner-text');
   winnerTextElement.textContent = 'CHESS';

   document.querySelector('.board').remove();

   const cleanBoardElement = document.createElement('div');
   cleanBoardElement.classList.add('board');

   document.querySelector('.content').append(cleanBoardElement);

   startGame();
});

// ! Helpers
export function getUpdatedBoard() {
   return boardElement;
}

export function getKingCheckedObject() {
   return kingChecked;
}

export function setKingCheckedObject(whiteKing = false, blackKing = false) {
   kingChecked.white = whiteKing;
   kingChecked.black = blackKing;
}

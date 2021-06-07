import {
   getHistoricMovesObject,
   getKingCheckedObject,
   getUpdatedBoard,
} from './main.js';

import {
   addPiecesPointerEvent,
   appendLetterToTile,
   appendNumberToTile,
   createNewBoardCopy,
   getTile,
   removePiecesPointerEvent,
} from './board.js';

import { getPieceById, getTileWherePieceIsById } from './pieces.js';

import { checkIfKingsChecked, detectCheckMate } from './rules.js';

export function addRecordToHistoricMoves(
   boardElement,
   pieceTile = null,
   pieceId = null,
   tileTo = null,
   action = null
) {
   const move = {};

   move.board = createNewBoardCopy(boardElement);
   move.action = action;

   if (pieceId !== null) {
      const pieceObject = getPieceById(pieceId, boardElement);
      move.piece = { ...pieceObject };

      if (pieceTile !== null) {
         move.tileFrom = { ...pieceTile };
         move.tileFrom.divElement = pieceTile.divElement;
      }

      if (tileTo !== null) {
         move.tileTo = { ...tileTo };
         move.tileTo.divElement = tileTo.divElement;
      }

      highlightTilesLastMove(move.board, move.tileFrom, move.tileTo);
   }

   const historicMovesObject = getHistoricMovesObject();
   historicMovesObject.push(move);

   if (pieceId !== null)
      addRecordToHistoricMovesPanel(move, historicMovesObject.length - 1);
}

// this function adds the moves to the actual div where the moves are shown
function addRecordToHistoricMovesPanel(move, moveNumber) {
   const moveHistoryContainer = document.querySelector(
      '.move-history-container'
   );
   moveHistoryContainer.style.display = 'block';

   const moveHistoricItem = document.createElement('small');
   moveHistoricItem.classList.add('move-history-item');

   moveHistoricItem.textContent += String(moveNumber) + '. ';

   // moveHistoricItem.textContent +=
   //    String(move.piece.pieceName)[0].toUpperCase();

   const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

   if (move.piece.pieceName === 'pawn') {
      if (move.action === 'move') {
         moveHistoricItem.textContent += String(letters[move.tileFrom.y - 1]);
         moveHistoricItem.textContent += String(move.tileTo.x);
      }

      if (move.action === 'take') {
         moveHistoricItem.textContent += String(letters[move.tileFrom.y - 1]);
         moveHistoricItem.textContent += 'x';
         moveHistoricItem.textContent += String(letters[move.tileTo.y - 1]);
         moveHistoricItem.textContent += move.tileTo.x;
      }
   } else {
      moveHistoricItem.textContent += String(
         move.piece.pieceName
      )[0].toUpperCase();

      if (move.action === 'move') {
         moveHistoricItem.textContent += String(letters[move.tileTo.y - 1]);
         moveHistoricItem.textContent += String(move.tileTo.x);
      }

      if (move.action === 'take') {
         moveHistoricItem.textContent += 'x';
         moveHistoricItem.textContent += String(letters[move.tileTo.y - 1]);
         moveHistoricItem.textContent += move.tileTo.x;
      }
   }

   const kingChecked = getKingCheckedObject();
   const checkMate = detectCheckMate(move.piece.id);

   if ((kingChecked.white || kingChecked.black) && !checkMate) {
      moveHistoricItem.textContent += '+';
   }

   if (checkMate) {
      moveHistoricItem.textContent += '#';
   }

   // append item to the move historyDivElement
   const moveHistoryDivElement = document.querySelector('.moves-history');
   moveHistoryDivElement.append(moveHistoricItem);

   // correct scroll to the right
   moveHistoryDivElement.scrollLeft += 100;

   // remove all and add last element move history class

   if (
      moveHistoryDivElement.childNodes[getHistoricMovesObject().length - 2] ===
      moveHistoricItem
   ) {
      removeAllSelectedHistoricMoveClass();
      moveHistoricItem.classList.add('selected-move-history-item');
   }

   moveHistoricItem.addEventListener('click', () => {
      drawHistoricBoard(move.board, move.piece, move.action);

      // reset and add selected move history class
      removeAllSelectedHistoricMoveClass();
      moveHistoricItem.classList.add('selected-move-history-item');

      // detect if it is the last move played
      // if so allow movement, otherwise dont
      if (
         moveHistoryDivElement.childNodes[
            getHistoricMovesObject().length - 2
         ] !== moveHistoricItem
      ) {
         removePiecesPointerEvent('white');
         removePiecesPointerEvent('black');
      }

      if (
         moveHistoryDivElement.childNodes[
            getHistoricMovesObject().length - 2
         ] === moveHistoricItem
      ) {
         addPiecesPointerEvent('white');
         addPiecesPointerEvent('black');
      }
   });
}

function drawHistoricBoard(boardElement, pieceMoved, action) {
   const boardDiv = document.querySelector('.board');

   boardDiv.childNodes.forEach((tile) => {
      if (tile.childNodes) {
         tile.childNodes.forEach((piece) => {
            piece.remove();
         });
      }
   });

   boardElement.forEach((tile) => {
      if (tile.piece) {
         const tileFound = getTile(tile.x, tile.y, getUpdatedBoard());
         tileFound.divElement.append(tile.piece.pieceDivElement);
      }

      // append letters and numbers to tiles
      const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

      // letters
      if (tile.x === 1) {
         tile.letter = letters[tile.y - 1];
         appendLetterToTile(tile, tile.letter);
      }

      // numbers
      if (tile.y === 8) {
         tile.number = tile.x;
         appendNumberToTile(tile, tile.number);
      }
   });
}

// ! helpers
function removeAllSelectedHistoricMoveClass() {
   const movesHistoryElement = document.querySelector('.moves-history');

   if (movesHistoryElement.childNodes.length > 0) {
      movesHistoryElement.childNodes.forEach((child) => {
         child.classList.remove('selected-move-history-item');
      });
   }
}

export function highlightTilesLastMove(boardElement, tileFrom, tileTo) {
   removeAllHighlightedTiles(boardElement);

   let tileFromDivElement, tileToDivElement;

   boardElement.forEach((tile) => {
      if (tile.x === tileFrom.x && tile.y === tileFrom.y) {
         tileFromDivElement = tile.divElement;
      }

      if (tile.x === tileTo.x && tile.y === tileTo.y) {
         tileToDivElement = tile.divElement;
      }
   });

   tileFromDivElement.classList.add('last-move-origin-tile');
   tileToDivElement.classList.add('last-move-final-tile');
}

export function removeAllHighlightedTiles(boardElement) {
   boardElement.forEach((tile) => {
      tile.divElement.classList.remove('last-move-origin-tile');
      tile.divElement.classList.remove('last-move-final-tile');
   });
}

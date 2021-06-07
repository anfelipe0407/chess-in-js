import { getUpdatedBoard } from './main.js';

import {
   movePieceToTile,
   movePieceToTileTaking,
   shortCastle,
   longCastle,
   updateTilesAttacked,
} from './movement.js';

import {
   getAllPieces,
   getPieceById,
   getTileWherePieceIsById,
} from './pieces.js';

import { detectCheckMate, asignClickListenerToPromotePawn } from './rules.js';

import { addRecordToHistoricMoves } from './move-history.js';

export function createBoardElement() {
   const boardElement = [];

   for (let x = 8; x > 0; x--) {
      for (let y = 1; y <= 8; y++) {
         const divElement = document.createElement('div');
         divElement.classList.add('tile');

         const tile = {
            divElement,
            x,
            y,
            color: null,
            blackPiecesAttacking: 0,
            whitePiecesAttacking: 0,
         };

         tile.divElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            markTile(tile.divElement);
         });

         // set color for tile
         if ((x % 2 == 0 && y % 2 != 0) || (x % 2 != 0 && y % 2 == 0)) {
            tile.color = 'white';
            tile.divElement.classList.add('white-tile');
         } else {
            tile.color = 'black';
            tile.divElement.classList.add('black-tile');
         }

         boardElement.push(tile);
      }
   }

   return boardElement;
}

export function drawBoard(boardElement = getUpdatedBoard()) {
   let boardDiv = document.querySelector('.board');
   const letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

   boardElement.forEach((tile) => {
      boardDiv.append(tile.divElement);

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

export function appendLetterToTile(tile, letter) {
   const letterElement = document.createElement('span');
   letterElement.classList.add('tile-letter');
   letterElement.textContent = letter;

   if (tile.color === 'white') {
      letterElement.classList.add('black-tile-letter');
   }

   if (tile.color === 'black') {
      letterElement.classList.add('white-tile-letter');
   }

   tile.divElement.append(letterElement);
}

export function appendNumberToTile(tile, number) {
   const numberElement = document.createElement('span');
   numberElement.classList.add('tile-number');
   numberElement.textContent = number;

   if (tile.color === 'white') {
      numberElement.classList.add('black-tile-number');
   }

   if (tile.color === 'black') {
      numberElement.classList.add('white-tile-number');
   }

   tile.divElement.append(numberElement);
}

// * Movement
export function drawTilesToMovesCircles(tiles, pieceElement) {
   removeAllMovesCircles();

   tiles.forEach((tile) => {
      if (tile === null) {
         return;
      }

      const circleDivElementContainer = document.createElement('div');
      circleDivElementContainer.classList.add('circle-move-container');

      const circleDivElement = document.createElement('div');
      circleDivElement.classList.add('circle-move');

      circleDivElementContainer.append(circleDivElement);

      //Short castle
      if (tile.castle) {
         if (tile.castle === 'short') {
            asignClickListenerToShortCastle(
               circleDivElementContainer,
               pieceElement.id,
               tile
            );
         }
      }

      //Long castle
      if (tile.castle) {
         if (tile.castle === 'long') {
            asignClickListenerToLongCastle(
               circleDivElementContainer,
               pieceElement.id,
               tile
            );
         }
      }

      // white pawn promotion
      if (
         pieceElement.pieceName === 'pawn' &&
         pieceElement.color === 'white' &&
         tile.x === 8
      ) {
         asignClickListenerToPromotePawn(
            circleDivElementContainer,
            pieceElement,
            tile
         );
      }
      // black pawn promotion
      if (
         pieceElement.pieceName === 'pawn' &&
         pieceElement.color === 'black' &&
         tile.x === 1
      ) {
         asignClickListenerToPromotePawn(
            circleDivElementContainer,
            pieceElement,
            tile
         );
      }

      // ! add click listener
      asignClickListenerToCircleMove(
         circleDivElementContainer,
         pieceElement.id,
         tile
      );

      tile.moveCircleDivElementContainer = circleDivElementContainer;

      tile.divElement.append(circleDivElementContainer);
   });
}

function removeAllMovesCircles(boardElement = getUpdatedBoard()) {
   boardElement.forEach((tile) => {
      if (tile.moveCircleDivElementContainer) {
         tile.moveCircleDivElementContainer.remove();
         delete tile.moveCircleDivElementContainer;
      }
   });
}

function asignClickListenerToCircleMove(circleElement, pieceId, tileToMove) {
   circleElement.addEventListener('click', () => {
      removeAllMovesCircles();
      removeAllTakeCircles();

      removeAllMarkedTiles();

      const pieceTile = getTileWherePieceIsById(pieceId);

      movePieceToTile(pieceId, tileToMove);

      updateTilesAttacked(getUpdatedBoard());

      addRecordToHistoricMoves(
         getUpdatedBoard(),
         pieceTile,
         pieceId,
         tileToMove,
         'move'
      );

      // detectCheckMate(pieceId);
   });
}

// king castling
// short castle
export function asignClickListenerToShortCastle(
   circleElement,
   kingId,
   tileToMove
) {
   circleElement.addEventListener('click', () => {
      const kingPieceElement = getPieceById(kingId);

      if (kingPieceElement.movesDone === 0) {
         shortCastle(kingId, tileToMove);
      }
   });

   const checkMate = detectCheckMate(kingId);
}

// long castle
export function asignClickListenerToLongCastle(
   circleElement,
   kingId,
   tileToMove
) {
   circleElement.addEventListener('click', () => {
      const kingPieceElement = getPieceById(kingId);

      if (kingPieceElement.movesDone === 0) {
         longCastle(kingId, tileToMove);
      }
   });

   const checkMate = detectCheckMate(kingId);
}

// * Taking
export function drawTilesToTakeCircles(tiles, pieceElement) {
   removeAllTakeCircles();

   tiles.forEach((tile) => {
      if (tile === null) {
         return;
      }

      const takeCircleDivElementContainer = document.createElement('div');
      takeCircleDivElementContainer.classList.add('circle-take-container');

      const circleDivElement = document.createElement('div');
      circleDivElement.classList.add('circle-take');

      takeCircleDivElementContainer.append(circleDivElement);

      // ! add click listener
      asignClickListenerToCircleTake(
         takeCircleDivElementContainer,
         pieceElement.id,
         tile
      );

      // white pawn promotion
      if (
         pieceElement.pieceName === 'pawn' &&
         pieceElement.color === 'white' &&
         tile.x === 8
      ) {
         asignClickListenerToPromotePawn(
            takeCircleDivElementContainer,
            pieceElement,
            tile
         );
      }
      // black pawn promotion
      if (
         pieceElement.pieceName === 'pawn' &&
         pieceElement.color === 'black' &&
         tile.x === 1
      ) {
         asignClickListenerToPromotePawn(
            takeCircleDivElementContainer,
            pieceElement,
            tile
         );
      }

      tile.moveTakeCircleDivElementContainer = takeCircleDivElementContainer;

      tile.divElement.append(takeCircleDivElementContainer);
   });
}

function removeAllTakeCircles(boardElement = getUpdatedBoard()) {
   boardElement.forEach((tile) => {
      if (tile.moveTakeCircleDivElementContainer) {
         tile.moveTakeCircleDivElementContainer.remove();
         delete tile.moveTakeCircleDivElementContainer;
      }
   });
}

function asignClickListenerToCircleTake(circleElement, pieceId, tileToTake) {
   circleElement.addEventListener('click', () => {
      removeAllMovesCircles();
      removeAllTakeCircles();

      removeAllMarkedTiles();

      const pieceTile = getTileWherePieceIsById(pieceId);

      movePieceToTileTaking(pieceId, tileToTake);

      updateTilesAttacked(getUpdatedBoard());
      addRecordToHistoricMoves(
         getUpdatedBoard(),
         pieceTile,
         pieceId,
         tileToTake,
         'take'
      );

      // detectCheckMate(pieceId);
   });
}

// ! Helpers
export function getTile(x, y, boardElement = getUpdatedBoard()) {
   let tileFound = null;

   boardElement.forEach((tile) => {
      if (tile.x === x && tile.y === y) {
         tileFound = tile;
      }
   });

   return tileFound;
}

export function getTileToMove(x, y) {
   const updatedBoard = getUpdatedBoard();

   let tileFound = null;

   for (let i = 0; i < updatedBoard.length; i++) {
      if (updatedBoard[i].x === x && updatedBoard[i].y === y) {
         if (updatedBoard[i].piece) {
            return tileFound;
         }

         tileFound = updatedBoard[i];
         return tileFound;
      }
   }

   return tileFound;
}

export function getTileToTake(x, y) {
   const updatedBoard = getUpdatedBoard();

   let tileFound = null;

   for (let i = 0; i < updatedBoard.length; i++) {
      if (updatedBoard[i].x === x && updatedBoard[i].y === y) {
         if (!updatedBoard[i].piece) {
            return null;
         }

         tileFound = updatedBoard[i];
         return tileFound;
      }
   }

   return tileFound;
}

export function createNewBoardCopy(boardElement) {
   const newBoardElement = [];

   for (let i = 0; i < boardElement.length; i++) {
      const tile = {};

      tile.divElement = boardElement[i].divElement;
      tile.x = boardElement[i].x;
      tile.y = boardElement[i].y;
      tile.color = boardElement[i].color;
      tile.whitePiecesAttacking = boardElement[i].whitePiecesAttacking;
      tile.blackPiecesAttacking = boardElement[i].blackPiecesAttacking;

      if (boardElement[i].piece) {
         tile.piece = {};

         tile.piece.pieceDivElement = boardElement[i].piece.pieceDivElement;
         tile.piece.id = boardElement[i].piece.id;
         tile.piece.pieceName = boardElement[i].piece.pieceName;
         tile.piece.color = boardElement[i].piece.color;
         tile.piece.movesDone = boardElement[i].piece.movesDone;
      }

      newBoardElement.push(tile);
   }

   return newBoardElement;
}

export function removePiecesPointerEvent(
   piecesColor,
   boardElement = getUpdatedBoard()
) {
   boardElement.forEach((tile) => {
      if (tile.piece && tile.piece.color === piecesColor) {
         tile.piece.pieceDivElement.style.pointerEvents = 'none';
      }
   });
}

export function addPiecesPointerEvent(
   piecesColor,
   boardElement = getUpdatedBoard()
) {
   boardElement.forEach((tile) => {
      if (tile.piece && tile.piece.color === piecesColor) {
         tile.piece.pieceDivElement.style.pointerEvents = 'auto';
      }
   });
}

function markTile(tileDivElement) {
   if (tileDivElement.classList.contains('marked-tile')) {
      tileDivElement.classList.remove('marked-tile');
   } else {
      removeAllMarkedTiles();
      tileDivElement.classList.add('marked-tile');
   }
}

export function removeAllMarkedTiles() {
   const boardDiv = document.querySelector('.board');

   boardDiv.childNodes.forEach((tile) => {
      tile.classList.remove('marked-tile');
   });
}

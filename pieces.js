import { getKingCheckedObject, getUpdatedBoard } from './main.js';

import {
   calculatePieceMove,
   calculatePieceTake,
   calculateTilesAttackedByEveryPiece,
   removeTilesInRed,
   resetAttackedTileStatus,
} from './movement.js';

import {
   drawTilesToMovesCircles,
   drawTilesToTakeCircles,
   createNewBoardCopy,
} from './board.js';

import {
   checkIfKingsChecked,
   movePieceInVirtualBoard,
   updateTilesAttackedOnVirtualBoard,
   calculateTilesAttackedByEveryPieceOnVirtualBoard,
   filterTilesWherePiecesCantMove,
   detectCheckMate,
} from './rules.js';

export function createPiece(pieceName) {
   // piece element
   let divElement = document.createElement('div');
   divElement.classList.add('piece');

   // icon element
   let iconElement = document.createElement('i');

   const iconsClass = {
      pawn: 'fa-chess-pawn',
      rook: 'fa-chess-rook',
      knight: 'fa-chess-knight',
      bishop: 'fa-chess-bishop',
      queen: 'fa-chess-queen',
      king: 'fa-chess-king',
   };

   iconElement.classList.add('fas');
   iconElement.classList.add(iconsClass[pieceName]);

   divElement.append(iconElement);

   const piece = {
      pieceDivElement: divElement,
      pieceName,
      movesDone: 0,
   };

   return piece;
}

export function putPiecesOnInitalState(boardElement = getUpdatedBoard()) {
   boardElement.forEach((tile) => {
      // pawns
      if (tile.x === 7 || tile.x === 2) {
         tile.piece = createPiece('pawn');
         tile.divElement.append(tile.piece.pieceDivElement);

         tile.piece.color = tile.x === 2 ? 'white' : 'black';
         tile.piece.pieceDivElement.childNodes[0].classList.add(
            String(tile.piece.color) + '-piece'
         );
      }

      // rooks;
      if (
         (tile.x === 8 && (tile.y === 1 || tile.y === 8)) ||
         (tile.x === 1 && (tile.y === 1 || tile.y === 8))
      ) {
         tile.piece = createPiece('rook');
         tile.divElement.append(tile.piece.pieceDivElement);

         tile.piece.color = tile.x === 1 ? 'white' : 'black';
         tile.piece.pieceDivElement.childNodes[0].classList.add(
            String(tile.piece.color) + '-piece'
         );
      }

      // knights
      if (
         (tile.x === 8 && (tile.y === 2 || tile.y === 7)) ||
         (tile.x === 1 && (tile.y === 2 || tile.y === 7))
      ) {
         tile.piece = createPiece('knight');
         tile.divElement.append(tile.piece.pieceDivElement);

         tile.piece.color = tile.x === 1 ? 'white' : 'black';
         tile.piece.pieceDivElement.childNodes[0].classList.add(
            String(tile.piece.color) + '-piece'
         );
      }

      // bishops
      if (
         (tile.x === 8 && (tile.y === 3 || tile.y === 6)) ||
         (tile.x === 1 && (tile.y === 3 || tile.y === 6))
      ) {
         tile.piece = createPiece('bishop');
         tile.divElement.append(tile.piece.pieceDivElement);

         tile.piece.color = tile.x === 1 ? 'white' : 'black';
         tile.piece.pieceDivElement.childNodes[0].classList.add(
            String(tile.piece.color) + '-piece'
         );
      }

      // queens
      if ((tile.x === 8 || tile.x === 1) && tile.y === 4) {
         tile.piece = createPiece('queen');
         tile.divElement.append(tile.piece.pieceDivElement);

         tile.piece.color = tile.x === 1 ? 'white' : 'black';
         tile.piece.pieceDivElement.childNodes[0].classList.add(
            String(tile.piece.color) + '-piece'
         );
      }

      // kings
      if ((tile.x === 8 || tile.x === 1) && tile.y === 5) {
         tile.piece = createPiece('king');
         tile.divElement.append(tile.piece.pieceDivElement);

         tile.piece.color = tile.x === 1 ? 'white' : 'black';
         tile.piece.pieceDivElement.childNodes[0].classList.add(
            String(tile.piece.color) + '-piece'
         );
      }
   });
}

export function setIdsToPieces(boardElement = getUpdatedBoard()) {
   let idCounter = 1;

   boardElement.forEach((tile) => {
      if (tile.piece) {
         tile.piece.id = idCounter;
         idCounter++;
      }
   });
}

export function asignClickListenersToPieces() {
   const pieces = getAllPieces();

   pieces.forEach((piece) => {
      piece.pieceDivElement.addEventListener('click', () => {
         let tilesToMove = calculatePieceMove(getPieceById(piece.id));
         let tilesToTake = calculatePieceTake(getPieceById(piece.id));

         const kingCheckedObject = getKingCheckedObject();

         // filter out the tiles where a possible check cant be blocked
         if (
            (piece.color === 'white' && kingCheckedObject.white) ||
            (piece.color === 'black' && kingCheckedObject.black) ||
            (tilesToMove.length >= 1 && tilesToMove[0] !== null)
         ) {
            // console.time('testing-time');
            console.log(tilesToMove);
            const pieceElement = getPieceById(piece.id);
            const tilesToMoveFiltered = filterTilesWherePiecesCantMove(
               tilesToMove,
               pieceElement
            );
            // console.timeEnd('testing-time');

            tilesToMove = tilesToMoveFiltered;
         }

         // filter out the tiles where piece can't take beacuse of discovered check
         if (
            (piece.color === 'white' && kingCheckedObject.white) ||
            (piece.color === 'black' && kingCheckedObject.black) ||
            (tilesToTake.length >= 1 && tilesToTake[0] !== null)
         ) {
            // console.time('testing-time');
            const pieceElement = getPieceById(piece.id);
            const tilesToTakeFiltered = filterTilesWherePiecesCantMove(
               tilesToTake,
               pieceElement
            );
            // console.timeEnd('testing-time');

            tilesToTake = tilesToTakeFiltered;
         }

         drawTilesToMovesCircles(tilesToMove, getPieceById(piece.id));
         drawTilesToTakeCircles(tilesToTake, getPieceById(piece.id));
      });
   });
}

// ! Helpers
export function getPieceById(pieceId, boardElement = getUpdatedBoard()) {
   let pieceFound = {};

   boardElement.forEach((tile) => {
      if (tile.piece && tile.piece.id === pieceId) {
         pieceFound = tile.piece;
      }
   });

   return pieceFound;
}

export function getTileWherePieceIs(pieceId, boardElement = getUpdatedBoard()) {
   let tileFound = {};

   boardElement.forEach((tile) => {
      if (tile.piece && tile.piece.id === pieceId) {
         tileFound = tile;
      }
   });

   return tileFound;
}

export function getPieceByTileCoordinates(
   x,
   y,
   boardElement = getUpdatedBoard()
) {
   for (let i = 0; i < boardElement.length; i++) {
      if (boardElement[i].x === x && boardElement[i].y === y) {
         if (boardElement[i].piece) {
            return boardElement[i].piece;
         }
      }
   }
}

export function getAllPieces(boardElement = getUpdatedBoard()) {
   const pieces = [];

   boardElement.forEach((tile) => {
      if (tile.piece) {
         pieces.push(tile.piece);
      }
   });

   return pieces;
}

export function getTileWherePieceIsById(
   pieceId,
   boardElement = getUpdatedBoard()
) {
   for (let i = 0; i < boardElement.length; i++) {
      if (boardElement[i].piece && boardElement[i].piece.id === pieceId) {
         return boardElement[i];
      }
   }
}

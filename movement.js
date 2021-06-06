import {
   getUpdatedBoard,
   setKingCheckedObject,
   getKingCheckedObject,
} from './main.js';

import {
   getPieceById,
   getTileWherePieceIs,
   getPieceByTileCoordinates,
   getTileWherePieceIsById,
} from './pieces.js';

import { getTile, getTileToMove, getTileToTake } from './board.js';

import {
   checkIfKingsChecked,
   putInRedCheckedKingsTile,
   removeAllRedCheckedKingsTiles,
   setAttackedTileStatusOnVirtualBoard,
} from './rules.js';

export function calculatePieceMove(piece) {
   const piecesMovement = {
      pawn: {
         up: 1,
      },

      rook: {
         up: 8,
         down: 8,
         left: 8,
         right: 8,
      },

      knight: {
         upKnight: 1,
         downKnight: 1,
         leftKnight: 1,
         rightKnight: 1,
         diagonalKnight: 1,
      },

      bishop: {
         diagonal: 8,
      },

      queen: {
         up: 8,
         down: 8,
         left: 8,
         right: 8,
         diagonal: 8,
      },

      king: {
         up: 1,
         down: 1,
         left: 1,
         right: 1,
         diagonal: 1,
      },
   };

   const boardElement = getUpdatedBoard();
   const pieceTile = getTileWherePieceIs(piece.id);

   const tilesToMove = [];

   // PAWNS
   if (piece.pieceName === 'pawn') {
      piece.color === 'white'
         ? tilesToMove.push(getTileToMove(pieceTile.x + 1, pieceTile.y))
         : tilesToMove.push(getTileToMove(pieceTile.x - 1, pieceTile.y));

      if (piece.movesDone === 0) {
         const kingChecked = getKingCheckedObject();

         if (piece.color === 'white' && !kingChecked.white) {
            tilesToMove.push(getTileToMove(pieceTile.x + 2, pieceTile.y));
         } else if (piece.color === 'black' && !kingChecked.black) {
            tilesToMove.push(getTileToMove(pieceTile.x - 2, pieceTile.y));
         }
      }

      return tilesToMove;
   }

   // King Castling
   if (piece.pieceName === 'king' && piece.movesDone === 0) {
      // short castling

      const kingTile = getTileWherePieceIs(piece.id);

      if (
         (piece.color === 'white' && kingTile.blackPiecesAttacking === 0) ||
         (piece.color === 'black' && kingTile.whitePiecesAttacking === 0)
      ) {
         let tilesFreeShort = true;
         for (let i = 1; i <= 2; i++) {
            const tile = getTileToMove(pieceTile.x, pieceTile.y + i);
            if (tile === null) {
               tilesFreeShort = false;
               break;
            }

            if (piece.color === 'white') {
               if (tile.blackPiecesAttacking !== 0) {
                  tilesFreeShort = false;
                  break;
               }
            }

            if (piece.color === 'black') {
               if (tile.whitePiecesAttacking !== 0) {
                  tilesFreeShort = false;
                  break;
               }
            }
         }

         let rookElement = getPieceByTileCoordinates(
            pieceTile.x,
            pieceTile.y + 3
         );

         if (tilesFreeShort && rookElement && rookElement.movesDone === 0) {
            let tileToShortCastle = getTileToMove(pieceTile.x, pieceTile.y + 2);
            tileToShortCastle.castle = 'short';
            tilesToMove.push(tileToShortCastle);
         }

         // long castling
         let tilesFreeLong = true;
         for (let i = 1; i <= 3; i++) {
            const tile = getTileToMove(pieceTile.x, pieceTile.y - i);
            if (tile === null) {
               tilesFreeLong = false;
               break;
            }
         }

         rookElement = getPieceByTileCoordinates(pieceTile.x, pieceTile.y - 4);

         if (tilesFreeLong && rookElement && rookElement.movesDone === 0) {
            let tileToLongCastle = getTileToMove(pieceTile.x, pieceTile.y - 2);
            tileToLongCastle.castle = 'long';
            tilesToMove.push(tileToLongCastle);
         }
      }
   }

   // KNIGHTS
   if (piece.pieceName === 'knight') {
      // up
      for (let i = -1; i <= 1; i++, i++) {
         const tile = getTileToMove(pieceTile.x + 2, pieceTile.y + i);
         if (tile === null) continue;
         tilesToMove.push(tile);
      }

      // down
      for (let i = -1; i <= 1; i++, i++) {
         const tile = getTileToMove(pieceTile.x - 2, pieceTile.y + i);
         if (tile === null) continue;
         tilesToMove.push(tile);
      }

      // left
      for (let i = -1; i <= 1; i++, i++) {
         const tile = getTileToMove(pieceTile.x + i, pieceTile.y - 2);
         if (tile === null) continue;
         tilesToMove.push(tile);
      }
      // down
      for (let i = -1; i <= 1; i++, i++) {
         const tile = getTileToMove(pieceTile.x + i, pieceTile.y + 2);
         if (tile === null) continue;
         tilesToMove.push(tile);
      }
   }

   // up
   if (piecesMovement[piece.pieceName] && piecesMovement[piece.pieceName].up) {
      for (let i = 1; i <= piecesMovement[piece.pieceName].up; i++) {
         const tile = getTileToMove(pieceTile.x + i, pieceTile.y);
         if (tile === null) break;
         tilesToMove.push(tile);
      }
   }
   // down
   if (
      piecesMovement[piece.pieceName] &&
      piecesMovement[piece.pieceName].down
   ) {
      for (let i = 1; i <= piecesMovement[piece.pieceName].down; i++) {
         const tile = getTileToMove(pieceTile.x - i, pieceTile.y);
         if (tile === null) break;
         tilesToMove.push(tile);
      }
   }
   // right
   if (
      piecesMovement[piece.pieceName] &&
      piecesMovement[piece.pieceName].right
   ) {
      for (let i = 1; i <= piecesMovement[piece.pieceName].right; i++) {
         const tile = getTileToMove(pieceTile.x, pieceTile.y + i);
         if (tile === null) break;
         tilesToMove.push(tile);
      }
   }
   // left
   if (
      piecesMovement[piece.pieceName] &&
      piecesMovement[piece.pieceName].left
   ) {
      for (let i = 1; i <= piecesMovement[piece.pieceName].left; i++) {
         const tile = getTileToMove(pieceTile.x, pieceTile.y - i);
         if (tile === null) break;
         tilesToMove.push(tile);
      }
   }

   // diagonal
   if (
      piecesMovement[piece.pieceName] &&
      piecesMovement[piece.pieceName].diagonal
   ) {
      // left up
      for (let i = 1; i <= piecesMovement[piece.pieceName].diagonal; i++) {
         const tile = getTileToMove(pieceTile.x + i, pieceTile.y - i);
         if (tile === null) break;
         tilesToMove.push(tile);
      }

      // left down
      for (let i = 1; i <= piecesMovement[piece.pieceName].diagonal; i++) {
         const tile = getTileToMove(pieceTile.x - i, pieceTile.y - i);
         if (tile === null) break;
         tilesToMove.push(tile);
      }

      // right up
      for (let i = 1; i <= piecesMovement[piece.pieceName].diagonal; i++) {
         const tile = getTileToMove(pieceTile.x + i, pieceTile.y + i);
         if (tile === null) break;
         tilesToMove.push(tile);
      }

      // right down
      for (let i = 1; i <= piecesMovement[piece.pieceName].diagonal; i++) {
         const tile = getTileToMove(pieceTile.x - i, pieceTile.y + i);
         if (tile === null) break;
         tilesToMove.push(tile);
      }
   }

   // filter tiles where king can't move because they're attacked by an enemy piece
   if (piece.pieceName === 'king') {
      const tilesToMoveFilteredForKing = [];

      tilesToMove.forEach((tile) => {
         if (piece.color === 'white') {
            if (tile.blackPiecesAttacking === 0) {
               tilesToMoveFilteredForKing.push(tile);
            }
         }

         if (piece.color === 'black') {
            if (tile.whitePiecesAttacking === 0) {
               tilesToMoveFilteredForKing.push(tile);
            }
         }
      });

      return tilesToMoveFilteredForKing;
   }

   return tilesToMove;
}

export function calculatePieceTake(piece) {
   const piecesTake = {
      pawn: {
         diagonal: 1,
      },

      rook: {
         up: 8,
         down: 8,
         left: 8,
         right: 8,
      },

      knight: {
         upKnight: 1,
         downKnight: 1,
         leftKnight: 1,
         rightKnight: 1,
         diagonalKnight: 1,
      },

      bishop: {
         diagonal: 8,
      },

      queen: {
         up: 8,
         down: 8,
         left: 8,
         right: 8,
         diagonal: 8,
      },

      king: {
         up: 1,
         down: 1,
         left: 1,
         right: 1,
         diagonal: 1,
      },
   };

   const boardElement = getUpdatedBoard();
   const pieceTile = getTileWherePieceIs(piece.id);

   const tilesToTake = [];

   // PAWNS
   if (piece.pieceName === 'pawn') {
      if (piece.color === 'white') {
         tilesToTake.push(getTileToTake(pieceTile.x + 1, pieceTile.y + 1));
         tilesToTake.push(getTileToTake(pieceTile.x + 1, pieceTile.y - 1));
      } else {
         tilesToTake.push(getTileToTake(pieceTile.x - 1, pieceTile.y + 1));
         tilesToTake.push(getTileToTake(pieceTile.x - 1, pieceTile.y - 1));
      }

      const tilesToTakeFiltered = [];

      tilesToTake.forEach((tile, index) => {
         if (tile && tile.piece.color !== piece.color) {
            tilesToTakeFiltered.push(tile);
         }
      });

      return tilesToTakeFiltered;
   }

   // KNIGHTS
   if (piece.pieceName === 'knight') {
      // up
      for (let i = -1; i <= 1; i++, i++) {
         const tile = getTileToTake(pieceTile.x + 2, pieceTile.y + i);
         if (tile === null) continue;
         tilesToTake.push(tile);
      }
      // down
      for (let i = -1; i <= 1; i++, i++) {
         const tile = getTileToTake(pieceTile.x - 2, pieceTile.y + i);
         if (tile === null) continue;
         tilesToTake.push(tile);
      }
      // left
      for (let i = -1; i <= 1; i++, i++) {
         const tile = getTileToTake(pieceTile.x + i, pieceTile.y - 2);
         if (tile === null) continue;
         tilesToTake.push(tile);
      }
      // up
      for (let i = -1; i <= 1; i++, i++) {
         const tile = getTileToTake(pieceTile.x + i, pieceTile.y + 2);
         if (tile === null) continue;
         tilesToTake.push(tile);
      }
   }

   // up
   if (piecesTake[piece.pieceName] && piecesTake[piece.pieceName].up) {
      for (let i = 1; i <= piecesTake[piece.pieceName].up; i++) {
         const tile = getTileToTake(pieceTile.x + i, pieceTile.y);
         if (tile === null) continue;
         tilesToTake.push(tile);

         if (tile.piece) {
            break;
         }
      }
   }
   // down
   if (piecesTake[piece.pieceName] && piecesTake[piece.pieceName].down) {
      for (let i = 1; i <= piecesTake[piece.pieceName].down; i++) {
         const tile = getTileToTake(pieceTile.x - i, pieceTile.y);
         if (tile === null) continue;
         tilesToTake.push(tile);

         if (tile.piece) {
            break;
         }
      }
   }
   // right
   if (piecesTake[piece.pieceName] && piecesTake[piece.pieceName].right) {
      for (let i = 1; i <= piecesTake[piece.pieceName].right; i++) {
         const tile = getTileToTake(pieceTile.x, pieceTile.y + i);
         if (tile === null) continue;
         tilesToTake.push(tile);

         if (tile.piece) {
            break;
         }
      }
   }
   // left
   if (piecesTake[piece.pieceName] && piecesTake[piece.pieceName].left) {
      for (let i = 1; i <= piecesTake[piece.pieceName].left; i++) {
         const tile = getTileToTake(pieceTile.x, pieceTile.y - i);
         if (tile === null) continue;
         tilesToTake.push(tile);

         if (tile.piece) {
            break;
         }
      }
   }

   // diagonal
   if (piecesTake[piece.pieceName] && piecesTake[piece.pieceName].diagonal) {
      // left up
      for (let i = 1; i <= piecesTake[piece.pieceName].diagonal; i++) {
         const tile = getTileToTake(pieceTile.x + i, pieceTile.y - i);
         if (tile === null) continue;
         tilesToTake.push(tile);

         if (tile.piece) {
            break;
         }
      }

      // left down
      for (let i = 1; i <= piecesTake[piece.pieceName].diagonal; i++) {
         const tile = getTileToTake(pieceTile.x - i, pieceTile.y - i);
         if (tile === null) continue;
         tilesToTake.push(tile);

         if (tile.piece) {
            break;
         }
      }

      // right up
      for (let i = 1; i <= piecesTake[piece.pieceName].diagonal; i++) {
         const tile = getTileToTake(pieceTile.x + i, pieceTile.y + i);
         if (tile === null) continue;
         tilesToTake.push(tile);

         if (tile.piece) {
            break;
         }
      }

      // right down
      for (let i = 1; i <= piecesTake[piece.pieceName].diagonal; i++) {
         const tile = getTileToTake(pieceTile.x - i, pieceTile.y + i);
         if (tile === null) continue;
         tilesToTake.push(tile);

         if (tile.piece) {
            break;
         }
      }
   }

   const tilesToTakeFiltered = [];

   tilesToTake.forEach((tile, index) => {
      if (tile && tile.piece.color !== piece.color) {
         tilesToTakeFiltered.push(tile);
      }
   });

   // filter pieces tiles where king can't take because they're deffended by an enemy piece
   if (piece.pieceName === 'king') {
      const tilesToTakeFilteredForKing = [];

      tilesToTakeFiltered.forEach((tile) => {
         if (piece.color === 'white') {
            if (tile.blackPiecesAttacking === 0) {
               tilesToTakeFilteredForKing.push(tile);
            }
         }

         if (piece.color === 'black') {
            if (tile.whitePiecesAttacking === 0) {
               tilesToTakeFilteredForKing.push(tile);
            }
         }
      });

      return tilesToTakeFilteredForKing;
   }

   return tilesToTakeFiltered;
}

export function calculateTilesAttackedByEveryPiece(
   boardElement = getUpdatedBoard(),
   virtualBoard = false
) {
   boardElement.forEach((tile) => {
      if (tile.piece) {
         const piecesTake = {
            rook: {
               up: 8,
               down: 8,
               left: 8,
               right: 8,
            },

            knight: {
               upKnight: 1,
               downKnight: 1,
               leftKnight: 1,
               rightKnight: 1,
               diagonalKnight: 1,
            },

            bishop: {
               diagonal: 8,
            },

            queen: {
               up: 8,
               down: 8,
               left: 8,
               right: 8,
               diagonal: 8,
            },

            king: {
               up: 1,
               down: 1,
               left: 1,
               right: 1,
               diagonal: 1,
            },
         };

         const tilesAttacked = [];

         // PAWNS
         if (tile.piece.pieceName === 'pawn') {
            if (tile.piece.color === 'white') {
               tilesAttacked.push(
                  getTile(tile.x + 1, tile.y + 1, boardElement)
               );
               tilesAttacked.push(
                  getTile(tile.x + 1, tile.y - 1, boardElement)
               );
            } else {
               tilesAttacked.push(
                  getTile(tile.x - 1, tile.y + 1, boardElement)
               );
               tilesAttacked.push(
                  getTile(tile.x - 1, tile.y - 1, boardElement)
               );
            }
         }

         // KNIGHTS
         if (tile.piece.pieceName === 'knight') {
            // up
            for (let i = -1; i <= 1; i++, i++) {
               const tileFound = getTile(tile.x + 2, tile.y + i, boardElement);
               if (tileFound === null) continue;
               tilesAttacked.push(tileFound);
            }
            // down
            for (let i = -1; i <= 1; i++, i++) {
               const tileFound = getTile(tile.x - 2, tile.y + i, boardElement);
               if (tileFound === null) continue;
               tilesAttacked.push(tileFound);
            }
            // left
            for (let i = -1; i <= 1; i++, i++) {
               const tileFound = getTile(tile.x + i, tile.y - 2, boardElement);
               if (tileFound === null) continue;
               tilesAttacked.push(tileFound);
            }
            // up
            for (let i = -1; i <= 1; i++, i++) {
               const tileFound = getTile(tile.x + i, tile.y + 2, boardElement);
               if (tileFound === null) continue;
               tilesAttacked.push(tileFound);
            }
         }

         // up
         if (
            piecesTake[tile.piece.pieceName] &&
            piecesTake[tile.piece.pieceName].up
         ) {
            for (let i = 1; i <= piecesTake[tile.piece.pieceName].up; i++) {
               const tileFound = getTile(tile.x + i, tile.y, boardElement);
               if (tileFound === null) continue;
               tilesAttacked.push(tileFound);

               if (tileFound.piece) break;
            }
         }
         // down
         if (
            piecesTake[tile.piece.pieceName] &&
            piecesTake[tile.piece.pieceName].down
         ) {
            for (let i = 1; i <= piecesTake[tile.piece.pieceName].down; i++) {
               const tileFound = getTile(tile.x - i, tile.y, boardElement);
               if (tileFound === null) continue;
               tilesAttacked.push(tileFound);

               if (tileFound.piece) break;
            }
         }
         // right
         if (
            piecesTake[tile.piece.pieceName] &&
            piecesTake[tile.piece.pieceName].right
         ) {
            for (let i = 1; i <= piecesTake[tile.piece.pieceName].right; i++) {
               const tileFound = getTile(tile.x, tile.y + i, boardElement);
               if (tileFound === null) continue;
               tilesAttacked.push(tileFound);

               if (tileFound.piece) break;
            }
         }
         // left
         if (
            piecesTake[tile.piece.pieceName] &&
            piecesTake[tile.piece.pieceName].left
         ) {
            for (let i = 1; i <= piecesTake[tile.piece.pieceName].left; i++) {
               const tileFound = getTile(tile.x, tile.y - i, boardElement);
               if (tileFound === null) continue;
               tilesAttacked.push(tileFound);

               if (tileFound.piece) break;
            }
         }

         // diagonal
         if (
            piecesTake[tile.piece.pieceName] &&
            piecesTake[tile.piece.pieceName].diagonal
         ) {
            // left up
            for (
               let i = 1;
               i <= piecesTake[tile.piece.pieceName].diagonal;
               i++
            ) {
               const tileFound = getTile(tile.x + i, tile.y - i, boardElement);
               if (tileFound === null) continue;
               tilesAttacked.push(tileFound);

               if (tileFound.piece) break;
            }

            // left down
            for (
               let i = 1;
               i <= piecesTake[tile.piece.pieceName].diagonal;
               i++
            ) {
               const tileFound = getTile(tile.x - i, tile.y - i, boardElement);
               if (tileFound === null) continue;
               tilesAttacked.push(tileFound);

               if (tileFound.piece) break;
            }

            // right up
            for (
               let i = 1;
               i <= piecesTake[tile.piece.pieceName].diagonal;
               i++
            ) {
               const tileFound = getTile(tile.x + i, tile.y + i, boardElement);
               if (tileFound === null) continue;
               tilesAttacked.push(tileFound);

               if (tileFound.piece) break;
            }

            // right down
            for (
               let i = 1;
               i <= piecesTake[tile.piece.pieceName].diagonal;
               i++
            ) {
               const tileFound = getTile(tile.x - i, tile.y + i, boardElement);
               if (tileFound === null) continue;
               tilesAttacked.push(tileFound);

               if (tileFound.piece) break;
            }
         }

         //sets the attacked status of every tile
         setAttackedTileStatus(tilesAttacked, tile.piece.color);

         // ? testing
         // if (!virtualBoard) {
         //    putTilesInRed(tilesAttacked);
         // }
      }
   });
}

// Castling
export function shortCastle(kingId, tileToMove) {
   const castledKingTile = getTile(tileToMove.x, tileToMove.y);

   const rookPieceElement = getPieceByTileCoordinates(
      castledKingTile.x,
      castledKingTile.y + 1
   );
   const rookTile = getTileWherePieceIsById(rookPieceElement.id);

   const tileToMoveRook = getTile(rookTile.x, rookTile.y - 2);

   movePieceToTile(rookPieceElement.id, tileToMoveRook);
}

export function longCastle(kingId, tileToMove) {
   const castledKingTile = getTile(tileToMove.x, tileToMove.y);

   const rookPieceElement = getPieceByTileCoordinates(
      castledKingTile.x,
      castledKingTile.y - 2
   );
   const rookTile = getTileWherePieceIsById(rookPieceElement.id);

   const tileToMoveRook = getTile(rookTile.x, rookTile.y + 3);

   movePieceToTile(rookPieceElement.id, tileToMoveRook);
}

// asign listeners to move/take circles to check every piece attacked
// this works to know if kings are attacked (checked)
export function updateTilesAttacked(boardElement = getUpdatedBoard()) {
   // reset all attacked tiles on the board
   resetAttackedTileStatus(boardElement);
   // removeTilesInRed(boardElement);

   calculateTilesAttackedByEveryPiece(boardElement);
   // console.table(boardElement);

   // check if kings are checked
   const kingChecked = checkIfKingsChecked(boardElement);
   setKingCheckedObject(kingChecked.white, kingChecked.black);

   // resed red tiles where kings are checked

   removeAllRedCheckedKingsTiles(boardElement);
   // put in red tiles where kings are checked
   if (kingChecked.white || kingChecked.black) {
      putInRedCheckedKingsTile(boardElement, getKingCheckedObject());
   }
}

// sets the properties that counts how many black/white pieces are attacking that file
export function setAttackedTileStatus(tiles, pieceColor) {
   tiles.forEach((tile) => {
      if (tile !== null) {
         pieceColor === 'white'
            ? tile.whitePiecesAttacking++
            : tile.blackPiecesAttacking++;
      }
   });
}

export function resetAttackedTileStatus(boardElement = getUpdatedBoard()) {
   boardElement.forEach((tile) => {
      tile.whitePiecesAttacking = 0;
      tile.blackPiecesAttacking = 0;
   });
}

export function removeTilesInRed(boardElement = getUpdatedBoard()) {
   boardElement.forEach((tile) => {
      tile.divElement.classList.remove('red-tile');
   });
}

// move helpers
export function movePieceToTile(
   pieceId,
   tileToMove,
   boardElement = getUpdatedBoard()
) {
   let actualTileToMove = getTile(tileToMove.x, tileToMove.y);
   let pieceTile = getTileWherePieceIs(pieceId);

   // move the piece
   actualTileToMove.piece = pieceTile.piece;
   actualTileToMove.divElement.append(pieceTile.piece.pieceDivElement);

   // add 1 to the moves of the piece
   actualTileToMove.piece.movesDone++;

   // delete the piece from last tile
   delete pieceTile.piece;
}

export function movePieceToTileTaking(
   pieceId,
   tileToMove,
   boardElement = getUpdatedBoard()
) {
   let actualTileToMove = getTile(tileToMove.x, tileToMove.y);
   let pieceTile = getTileWherePieceIs(pieceId);

   // remove the piece taked
   actualTileToMove.piece.pieceDivElement.remove();

   // move the piece
   actualTileToMove.piece = pieceTile.piece;
   actualTileToMove.divElement.append(pieceTile.piece.pieceDivElement);

   // add 1 to the moves of the piece
   actualTileToMove.piece.movesDone++;

   // delete the piece from last tile
   delete pieceTile.piece;
}

// testing
function putTilesInRed(tiles) {
   tiles.forEach((tile) => {
      if (tile !== null && !tile.divElement.classList.contains('red-tile')) {
         tile.divElement.classList.add('red-tile');
      }
   });
}

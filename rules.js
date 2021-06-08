import { getUpdatedBoard, getKingCheckedObject } from './main.js';

import {
   calculatePieceMove,
   calculatePieceTake,
   movePieceToTile,
   movePieceToTileTaking,
   shortCastle,
   longCastle,
   resetAttackedTileStatus,
   calculateTilesAttackedByEveryPiece,
   setAttackedTileStatus,
   updateTilesAttacked,
} from './movement.js';

import {
   getPieceById,
   getTileWherePieceIs,
   getAllPieces,
   createPiece,
   asignClickListenersToPieces,
} from './pieces.js';

import {
   getTile,
   createNewBoardCopy,
   removePiecesPointerEvent,
   addPiecesPointerEvent,
} from './board.js';

export function checkIfKingsChecked(boardElement = getUpdatedBoard()) {
   const kingChecked = {
      white: false,
      black: false,
   };

   boardElement.forEach((tile) => {
      if (tile.piece && tile.piece.pieceName === 'king') {
         const kingTile = getTileWherePieceIs(tile.piece.id, boardElement);

         if (tile.piece.color === 'white') {
            if (kingTile.blackPiecesAttacking > 0) {
               kingChecked.white = true;
            }
         }

         if (tile.piece.color === 'black') {
            if (kingTile.whitePiecesAttacking > 0) {
               kingChecked.black = true;
            }
         }
      }
   });

   return kingChecked;
}

export function putInRedCheckedKingsTile(
   boardElement = getUpdatedBoard(),
   checkKingObject = getKingCheckedObject()
) {
   boardElement.forEach((tile) => {
      if (tile.piece && tile.piece.pieceName === 'king') {
         if (checkKingObject.white && tile.piece.color === 'white') {
            const kingTile = getTileWherePieceIs(tile.piece.id, boardElement);
            kingTile.divElement.classList.add('king-checked');
         }

         if (checkKingObject.black && tile.piece.color === 'black') {
            const kingTile = getTileWherePieceIs(tile.piece.id, boardElement);
            kingTile.divElement.classList.add('king-checked');
         }
      }
   });
}

export function removeAllRedCheckedKingsTiles(
   boardElement = getUpdatedBoard()
) {
   boardElement.forEach((tile) => {
      if (tile.divElement.classList.contains('king-checked')) {
         tile.divElement.classList.remove('king-checked');
      }
   });
}

// ! virtual board functions
// these are used to check (and filter) moves that can't be legally played in a chess match
// helps detecting checkmates

// moves a piece to a tile in a virtual board (this is no reflected in the actual board of the game)
export function movePieceInVirtualBoard(
   pieceId,
   tileToMove,
   virtualBoardElement
) {
   // get tiles needed
   const actualTileToMove = getTile(
      tileToMove.x,
      tileToMove.y,
      virtualBoardElement
   );
   let pieceTile = getTileWherePieceIs(pieceId, virtualBoardElement);

   // move the piece
   actualTileToMove.piece = pieceTile.piece;
   // actualTileToMove.divElement.append(pieceTile.piece.pieceDivElement);

   // add 1 to the moves of the piece
   actualTileToMove.piece.movesDone++;

   // delete the piece from last tile
   delete pieceTile.piece;
}

export function updateTilesAttackedOnVirtualBoard(virtualBoardElement) {
   // reset all attacked tiles on the board
   resetAttackedTileStatus(virtualBoardElement);
   // removeTilesInRed(virtualBoardElement);

   calculateTilesAttackedByEveryPiece(virtualBoardElement, true);

   // // check if kings are checked
   // const kingChecked = checkIfKingsChecked(virtualBoardElement);
   // setKingCheckedObject(kingChecked.white, kingChecked.black);

   // // resed red tiles where kings are checked

   // removeAllRedCheckedKingsTiles(virtualBoardElement);
   // // put in red tiles where kings are checked
   // if (kingChecked.white || kingChecked.black) {
   //    putInRedCheckedKingsTile(virtualBoardElement, getKingCheckedObject());
   // }
}

export function setAttackedTileStatusOnVirtualBoard(tilesAttacked, pieceColor) {
   // console.log(pieceColor);
   // console.log(tilesAttacked);

   tilesAttacked.forEach((tile) => {
      if (tile !== null) {
         pieceColor === 'white'
            ? tile.whitePiecesAttacking++
            : tile.blackPiecesAttacking++;
      }
   });
}

export function calculateTilesAttackedByEveryPieceOnVirtualBoard(boardElement) {
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

         // console.log(tile.piece.pieceName + ' - ' + tile.piece.color);
         // console.log(tilesAttacked);
      }
   });
}

// this filters out the tiles where a piece can't move legally
// for example when it can only block a check
export function filterTilesWherePiecesCantMove(tilesToMove, pieceElement) {
   const tilesToMoveFilteredFromChecks = [];

   tilesToMove.forEach((tileToMove) => {
      if (tileToMove) {
         const newBoardCopy = createNewBoardCopy(getUpdatedBoard());
         movePieceInVirtualBoard(
            pieceElement.id,
            { x: tileToMove.x, y: tileToMove.y },
            newBoardCopy
         );

         resetAttackedTileStatus(newBoardCopy);

         calculateTilesAttackedByEveryPieceOnVirtualBoard(newBoardCopy);
         const kingCheckedCopy = checkIfKingsChecked(newBoardCopy);

         // console.log(newBoardCopy);
         // console.log(kingCheckedCopy);

         if (pieceElement.color === 'white' && !kingCheckedCopy.white) {
            tilesToMoveFilteredFromChecks.push(tileToMove);
         }

         if (pieceElement.color === 'black' && !kingCheckedCopy.black) {
            tilesToMoveFilteredFromChecks.push(tileToMove);
         }

         // console.log(' ------- iteration ---------');
         // console.log(newBoardCopy);
         // console.log(kingCheckedCopy);
      }
   });

   return tilesToMoveFilteredFromChecks;
}

// change movement turn
export function changeMovementTurn(turnColor) {
   if (turnColor === 'white') {
      addPiecesPointerEvent('white');
      removePiecesPointerEvent('black');
   }

   if (turnColor === 'black') {
      addPiecesPointerEvent('black');
      removePiecesPointerEvent('white');
   }
}

// ! end the game
export function detectCheckMate(pieceId, allPieces = getAllPieces()) {
   // check if it is checkmate by counting the possibles tiles where all pieces can move
   const allPossiblesTilesOfMove = [];
   const pieceColorThatJustHasMoved = getPieceById(pieceId).color;

   allPieces.forEach((piece) => {
      if (piece) {
         let tilesToMove = calculatePieceMove(getPieceById(piece.id));
         let tilesToTake = calculatePieceTake(getPieceById(piece.id));

         // filter out the tiles where a possible check cant be blocked
         if (tilesToMove.length >= 1 && tilesToMove[0] !== null) {
            // console.time('testing-time');
            // console.log(tilesToMove);
            const pieceElement = getPieceById(piece.id);
            const tilesToMoveFiltered = filterTilesWherePiecesCantMove(
               tilesToMove,
               pieceElement
            );
            // console.timeEnd('testing-time');

            tilesToMove = tilesToMoveFiltered;
         }

         // filter out the tiles where piece can't take beacuse of discovered check
         if (tilesToTake.length >= 1 && tilesToTake[0] !== null) {
            // console.time('testing-time');
            const pieceElement = getPieceById(piece.id);
            const tilesToTakeFiltered = filterTilesWherePiecesCantMove(
               tilesToTake,
               pieceElement
            );
            // console.timeEnd('testing-time');

            tilesToTake = tilesToTakeFiltered;
         }

         if (pieceColorThatJustHasMoved !== piece.color) {
            allPossiblesTilesOfMove.push(tilesToMove);
            allPossiblesTilesOfMove.push(tilesToTake);
         }
      }
   });

   let checkMate = true;

   if (allPossiblesTilesOfMove.length > 0) {
      allPossiblesTilesOfMove.forEach((arrOfTiles) => {
         if (arrOfTiles.length > 0) {
            arrOfTiles.forEach((tile) => {
               if (tile !== null) {
                  checkMate = false;
               }
            });
         }
      });
   }

   if (checkMate) {
      setTimeout(() => {
         if (pieceColorThatJustHasMoved === 'white') {
            endTheGame('White');
         }

         if (pieceColorThatJustHasMoved === 'black') {
            endTheGame('Black');
         }
      }, 100);
   }

   // detect draw

   let onlyKingsOnBoard = true;

   allPieces.forEach((piece) => {
      if (piece.pieceName !== 'king') {
         onlyKingsOnBoard = false;
         console.log(piece.pieceName);
      }
   });

   if (onlyKingsOnBoard) {
      drawGame();
   }

   return checkMate;
}

export function endTheGame(winner) {
   const boardDivElement = document.querySelector('.board');
   boardDivElement.classList.add('disabled-board');

   const winnerTextElement = document.querySelector('.winner-text');
   winnerTextElement.textContent = 'Game finished: ' + winner + ' wins !!';

   const restartGameBtn = document.querySelector('.btn-restart-game');
   restartGameBtn.style.display = 'block';

   removePiecesPointerEvent('white');
   removePiecesPointerEvent('black');
}

function drawGame() {
   const boardDivElement = document.querySelector('.board');
   boardDivElement.classList.add('disabled-board');

   const winnerTextElement = document.querySelector('.winner-text');
   winnerTextElement.textContent = 'Game finished: draw.';

   const restartGameBtn = document.querySelector('.btn-restart-game');
   restartGameBtn.style.display = 'block';

   removePiecesPointerEvent('white');
   removePiecesPointerEvent('black');
}

export function asignClickListenerToPromotePawn(
   circleDivElement,
   piece,
   tileToMove
) {
   // tilesToMove = tilesToTake

   circleDivElement.addEventListener('click', () => {
      const promotionDiv = document.createElement('div');
      promotionDiv.classList.add('promotion-container');

      if (piece.color === 'white') {
         promotionDiv.classList.add('promotion-container-white');
      }

      if (piece.color === 'black') {
         promotionDiv.classList.add('promotion-container-black');
      }

      tileToMove.divElement.append(promotionDiv);

      // append piece to promote
      for (let i = 0; i < 4; i++) {
         const piecePromotionDiv = document.createElement('div');
         piecePromotionDiv.classList.add('promotion-piece');

         const pieceElement = document.createElement('i');
         pieceElement.classList.add('fas');

         if (i === 0) {
            pieceElement.classList.add('fa-chess-queen');
            pieceElement.dataset.pieceNamePromote = 'queen';
         }

         if (i === 1) {
            pieceElement.classList.add('fa-chess-rook');
            pieceElement.dataset.pieceNamePromote = 'rook';
         }

         if (i === 2) {
            pieceElement.classList.add('fa-chess-knight');
            pieceElement.dataset.pieceNamePromote = 'knight';
         }

         if (i === 3) {
            pieceElement.classList.add('fa-chess-bishop');
            pieceElement.dataset.pieceNamePromote = 'bishop';
         }

         if (piece.color === 'white') pieceElement.classList.add('white-piece');
         if (piece.color === 'black') pieceElement.classList.add('black-piece');

         piecePromotionDiv.append(pieceElement);
         promotionDiv.append(piecePromotionDiv);

         piecePromotionDiv.addEventListener('click', () => {
            promotePawnToPiece(tileToMove, piece, pieceElement);

            promotionDiv.remove();
         });
      }

      removePiecesPointerEvent('white');
      removePiecesPointerEvent('black');
   });
}

function promotePawnToPiece(tile, piece, pieceElement) {
   // const newPieceDivElement = document.createElement('div');
   // newPieceDivElement.classList.add('piece');

   // newPieceDivElement.append(pieceElement);
   // console.log(pieceElement.dataset.pieceNamePromote);
   const promotedPiece = createPiece(pieceElement.dataset.pieceNamePromote);

   if (piece.color === 'white') {
      promotedPiece.color = 'white';
      promotedPiece.pieceDivElement.classList.add('white-piece');
      promotedPiece.id = piece.id;
   } else if (piece.color === 'black') {
      promotedPiece.color = 'black';
      promotedPiece.pieceDivElement.classList.add('black-piece');
      promotedPiece.id = piece.id;
   }

   // promotedPiece.pieceDivElement = newPieceDivElement;

   if (tile.piece) {
      tile.piece.pieceDivElement.remove();
      delete tile.piece;
   }

   tile.piece = { ...promotedPiece };
   tile.divElement.append(promotedPiece.pieceDivElement);

   updateTilesAttacked();
   asignClickListenersToPieces();
   addPiecesPointerEvent('white');
   addPiecesPointerEvent('black');

   detectCheckMate(piece.id);
}

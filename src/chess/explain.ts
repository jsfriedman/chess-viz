import type { BoardArrow, Color, Square } from './board'
import { analyzeHanging, type HangingAnalysis } from './hanging'
import { colorOf, loadPosition, pieceAt, type BoardPiece } from './position'
import { capturesOf, checkingMovesFrom, type ScanMove } from './scan'

export type ScanStepId = 'checks' | 'captures' | 'hanging'

export type Explanation =
  | { kind: 'hanging'; analysis: HangingAnalysis }
  | { kind: 'moves'; target: BoardPiece; matches: boolean; verdict: string; moves: readonly ScanMove[]; note: string }

function explainChecks(fen: string, target: BoardPiece, toMove: Color): Explanation {
  if (colorOf(target.piece) !== toMove) {
    return { kind: 'moves', target, matches: false, verdict: 'Not to move', moves: [], note: 'Opponent piece.' }
  }
  const moves = checkingMovesFrom(fen, target.square)
  return {
    kind: 'moves',
    target,
    matches: moves.length > 0,
    verdict: moves.length > 0 ? 'Gives check' : 'No check',
    moves,
    note: moves.length > 0 ? '' : 'No move from here attacks the king.',
  }
}

function explainCaptures(fen: string, target: BoardPiece, toMove: Color): Explanation {
  if (colorOf(target.piece) === toMove) {
    return { kind: 'moves', target, matches: false, verdict: 'Own piece', moves: [], note: 'Side to move can’t capture it.' }
  }
  const moves = capturesOf(fen, target.square)
  return {
    kind: 'moves',
    target,
    matches: moves.length > 0,
    verdict: moves.length > 0 ? 'Capturable' : 'Safe',
    moves,
    note: moves.length > 0 ? '' : 'No legal capture.',
  }
}

export function explainSquare(step: ScanStepId, fen: string, square: Square): Explanation | undefined {
  const chess = loadPosition(fen)
  const piece = pieceAt(chess, square)
  if (!piece) return undefined
  const target = { square, piece }
  const toMove = chess.turn()

  switch (step) {
    case 'hanging':
      return { kind: 'hanging', analysis: analyzeHanging(fen, square)! }
    case 'checks':
      return explainChecks(fen, target, toMove)
    case 'captures':
      return explainCaptures(fen, target, toMove)
  }
}

export function explanationArrows(explanation: Explanation | undefined): BoardArrow[] {
  if (!explanation) return []
  if (explanation.kind === 'moves') {
    return explanation.moves.map((move) => ({ from: move.from, to: move.to, kind: 'attack' }))
  }
  const { target, attackers, defenders } = explanation.analysis
  return [
    ...attackers.map((attacker): BoardArrow => ({ from: attacker.square, to: target.square, kind: 'attack' })),
    ...defenders.map((defender): BoardArrow => ({ from: defender.square, to: target.square, kind: 'defend' })),
  ]
}

export type Color = 'w' | 'b'
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P'
export type PieceCode = `${Color}${PieceType}`
export type Orientation = 'white' | 'black'
export type Square = string
export type Placement = Readonly<Record<Square, PieceCode>>

export interface BoardArrow {
  from: Square
  to: Square
  kind: 'attack' | 'defend'
}

export const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const
export const ranks = ['1', '2', '3', '4', '5', '6', '7', '8'] as const

export function parsePlacement(fen: string): Placement {
  const [placementField = ''] = fen.trim().split(/\s+/)
  const rows = placementField.split('/')
  if (rows.length !== 8) throw new Error(`Invalid FEN placement: "${placementField}"`)

  return Object.fromEntries(
    rows.flatMap((row, rowIndex) => {
      const rank = 8 - rowIndex
      let fileIndex = 0
      return [...row].flatMap((symbol) => {
        if (/[1-8]/.test(symbol)) {
          fileIndex += Number(symbol)
          return []
        }
        const color: Color = symbol === symbol.toUpperCase() ? 'w' : 'b'
        const square = `${files[fileIndex]}${rank}`
        fileIndex += 1
        return [[square, `${color}${symbol.toUpperCase()}` as PieceCode]]
      })
    }),
  )
}

export function sideToMove(fen: string): Color {
  return fen.trim().split(/\s+/)[1] === 'b' ? 'b' : 'w'
}

export function isLightSquare(square: Square): boolean {
  const fileIndex = files.indexOf(square[0] as (typeof files)[number])
  const rank = Number(square[1])
  return (fileIndex + rank) % 2 === 0
}

export function squaresInDisplayOrder(orientation: Orientation): Square[] {
  const displayRanks = orientation === 'white' ? [...ranks].reverse() : [...ranks]
  const displayFiles = orientation === 'white' ? [...files] : [...files].reverse()
  return displayRanks.flatMap((rank) => displayFiles.map((file) => `${file}${rank}`))
}

export function displayPosition(square: Square, orientation: Orientation): { column: number; row: number } {
  const fileIndex = files.indexOf(square[0] as (typeof files)[number])
  const rankIndex = Number(square[1]) - 1
  return orientation === 'white'
    ? { column: fileIndex, row: 7 - rankIndex }
    : { column: 7 - fileIndex, row: rankIndex }
}

const pieceNames: Readonly<Record<PieceType, string>> = {
  K: 'king',
  Q: 'queen',
  R: 'rook',
  B: 'bishop',
  N: 'knight',
  P: 'pawn',
}

export function pieceName(code: PieceCode): string {
  return pieceNames[code[1] as PieceType]
}

export function describePiece(code: PieceCode): string {
  return `${code[0] === 'w' ? 'white' : 'black'} ${pieceNames[code[1] as PieceType]}`
}

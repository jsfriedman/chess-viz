import type { PieceCode } from './board'

export interface PieceSet {
  id: string
  name: string
  credit: string
}

export const pieceSets: readonly PieceSet[] = [
  { id: 'cburnett', name: 'Cburnett', credit: 'Colin M.L. Burnett, CC BY-SA 3.0' },
]

export const activePieceSetId = 'cburnett'

export function pieceImageUrl(code: PieceCode, pieceSetId: string = activePieceSetId): string {
  return `${import.meta.env.BASE_URL}pieces/${pieceSetId}/${code}.svg`
}

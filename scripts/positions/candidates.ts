import { Chess } from 'chess.js'
import { pick, type Random } from '../../src/drills/random'
import { readLines } from './lichess'

export interface Candidate {
  fen: string
  // Short source id: "p:<puzzle id>" or "g:<game id>"
  origin: string
  gameId: string
}

const maxPuzzleRating = 2000
const minPuzzlePlays = 100

// Puzzle CSV: PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags.
// The FEN is before the opponent's first move; the solver sees the position after it.
export async function puzzleCandidates(cachePath: string, limit: number): Promise<Candidate[]> {
  const candidates: Candidate[] = []
  for await (const line of readLines(cachePath)) {
    if (candidates.length >= limit) break
    const [id, fen, moves, rating, , , plays, , gameUrl] = line.split(',')
    if (!id || !fen || !moves || id === 'PuzzleId') continue
    if (Number(rating) > maxPuzzleRating || Number(plays) < minPuzzlePlays) continue
    const firstMove = moves.split(' ')[0]!
    try {
      const chess = new Chess(fen)
      chess.move({ from: firstMove.slice(0, 2), to: firstMove.slice(2, 4), promotion: firstMove[4] })
      const gameId = gameUrl?.match(/lichess\.org\/(\w{8})/)?.[1] ?? id
      candidates.push({ fen: chess.fen(), origin: `p:${id}`, gameId })
    } catch {
      continue
    }
  }
  return candidates
}

const minElo = 1000
const maxElo = 1700
const minBaseSeconds = 180
const firstPly = 12
const lastPly = 40

interface PgnGame {
  headers: Record<string, string>
  movetext: string
}

async function* pgnGames(cachePath: string): AsyncGenerator<PgnGame> {
  let headers: Record<string, string> = {}
  let movetext = ''
  for await (const line of readLines(cachePath)) {
    const header = line.match(/^\[(\w+) "(.*)"\]$/)
    if (header) {
      if (movetext) {
        yield { headers, movetext }
        headers = {}
        movetext = ''
      }
      headers[header[1]!] = header[2]!
    } else if (line.trim()) {
      movetext += ` ${line}`
    }
  }
  if (movetext) yield { headers, movetext }
}

function isBeginnerGame({ headers }: PgnGame): boolean {
  const elos = [Number(headers.WhiteElo), Number(headers.BlackElo)]
  const baseSeconds = Number(headers.TimeControl?.split('+')[0])
  return (
    headers.Variant === undefined &&
    elos.every((elo) => elo >= minElo && elo <= maxElo) &&
    baseSeconds >= minBaseSeconds
  )
}

function sanMoves(movetext: string): string[] {
  return movetext
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/\d+\.(\.\.)?/g, ' ')
    .replace(/\$\d+/g, ' ')
    .split(/\s+/)
    .filter((token) => token && !/^(1-0|0-1|1\/2-1\/2|\*)$/.test(token))
}

// One position per game, from a random ply in the middlegame
export async function gameCandidates(cachePath: string, limit: number, random: Random): Promise<Candidate[]> {
  const candidates: Candidate[] = []
  for await (const game of pgnGames(cachePath)) {
    if (candidates.length >= limit) break
    if (!isBeginnerGame(game)) continue
    const moves = sanMoves(game.movetext)
    const plies = Array.from({ length: lastPly - firstPly + 1 }, (_, index) => firstPly + index).filter(
      (ply) => ply < moves.length,
    )
    if (plies.length === 0) continue
    const ply = pick(plies, random)
    try {
      const chess = new Chess()
      moves.slice(0, ply).forEach((move) => chess.move(move))
      const gameId = game.headers.Site?.match(/lichess\.org\/(\w{8})/)?.[1]
      if (!gameId) continue
      candidates.push({ fen: chess.fen(), origin: `g:${gameId}`, gameId })
    } catch {
      continue
    }
  }
  return candidates
}

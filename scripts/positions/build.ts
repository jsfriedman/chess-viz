import { writeFile } from 'node:fs/promises'
import { difficultyScore, profilePosition, type PositionProfile } from '../../src/chess/features'
import type { ScanPosition, ScanPositionPack } from '../../src/drills/boardScan/positions'
import { difficulties } from '../../src/drills/difficulty'
import { seededRandom, shuffle } from '../../src/drills/random'
import { gameCandidates, puzzleCandidates, type Candidate } from './candidates'
import { downloadSlice } from './lichess'

// Lichess open databases, CC0: https://database.lichess.org
const puzzleUrl = 'https://database.lichess.org/lichess_db_puzzle.csv.zst'
const gamesUrl = 'https://database.lichess.org/standard/lichess_db_standard_rated_2025-01.pgn.zst'
const cacheDirectory = '.cache/lichess'
const outputPath = 'src/drills/boardScan/positions.json'

const sliceBytes = { puzzles: 12e6, games: 40e6 }
const candidatesPerSource = 6000
const positionsPerSource = 1250
const tierCount = difficulties.length
const maxAnswersPerStep = 6
const minPieces = 8
const maxEmptyShare = 0.05

interface Profiled extends Candidate {
  profile: PositionProfile
  score: number
}

const isEmpty = ({ profile }: Profiled) => profile.checks + profile.captures + profile.hanging === 0

function usable({ profile }: Profiled): boolean {
  return (
    !profile.inCheck &&
    profile.pieceCount >= minPieces &&
    Math.max(profile.checks, profile.captures, profile.hanging) <= maxAnswersPerStep
  )
}

function profileAll(candidates: readonly Candidate[]): Profiled[] {
  return candidates.flatMap((candidate) => {
    try {
      const profile = profilePosition(candidate.fen)
      return [{ ...candidate, profile, score: difficultyScore(profile) }]
    } catch (error) {
      console.warn(`Skipping ${candidate.origin}: ${(error as Error).message}`)
      return []
    }
  })
}

// Keeps empty positions rare so "nothing here" stays believable without dominating
function selectBalanced(pool: readonly Profiled[], count: number): Profiled[] {
  const emptyCount = Math.round(count * maxEmptyShare)
  const empty = pool.filter(isEmpty).slice(0, emptyCount)
  const rest = pool.filter((position) => !isEmpty(position)).slice(0, count - empty.length)
  return [...empty, ...rest]
}

function assignTiers(positions: readonly Profiled[]): ScanPosition[] {
  const ranked = [...positions].sort((first, second) => first.score - second.score)
  return ranked.map(({ fen, origin, profile }, rank) => ({
    fen,
    origin,
    difficulty: difficulties[Math.floor((rank / ranked.length) * tierCount)]!,
    checks: profile.checks,
    captures: profile.captures,
    hanging: profile.hanging,
    tags: profile.tags,
  }))
}

async function main() {
  const random = seededRandom(20261028)
  const puzzlePath = `${cacheDirectory}/puzzles.csv.zst`
  const gamesPath = `${cacheDirectory}/games.pgn.zst`
  await downloadSlice(puzzleUrl, sliceBytes.puzzles, puzzlePath)
  await downloadSlice(gamesUrl, sliceBytes.games, gamesPath)

  const puzzles = await puzzleCandidates(puzzlePath, candidatesPerSource)
  const games = await gameCandidates(gamesPath, candidatesPerSource, random)
  console.info(`Candidates: ${puzzles.length} puzzles, ${games.length} games`)

  const seenGames = new Set<string>()
  const firstPerGame = (candidate: Candidate) => !seenGames.has(candidate.gameId) && seenGames.add(candidate.gameId)
  const pools = [puzzles, games].map((source) =>
    shuffle(profileAll(source.filter(firstPerGame)).filter(usable), random),
  )
  const selected = pools.flatMap((pool) => selectBalanced(pool, positionsPerSource))
  const positions = assignTiers(shuffle(selected, random))

  const pack: ScanPositionPack = {
    source: 'Lichess open database (CC0): puzzles and rated games, sampled and analyzed by scripts/positions/build.ts',
    positions,
  }
  const lines = pack.positions.map((position) => `    ${JSON.stringify(position)}`)
  await writeFile(outputPath, `{\n  "source": ${JSON.stringify(pack.source)},\n  "positions": [\n${lines.join(',\n')}\n  ]\n}\n`)

  const tierCounts = Array.from({ length: tierCount }, (_, tier) => positions.filter((p) => p.difficulty === tier + 1).length)
  const tagCounts = Object.fromEntries(
    [...new Set(positions.flatMap((p) => p.tags))].map((tag) => [tag, positions.filter((p) => p.tags.includes(tag)).length]),
  )
  console.info(`Wrote ${positions.length} positions to ${outputPath}`)
  console.info('Per tier:', tierCounts.join(' / '))
  console.info('Tags:', tagCounts)
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})

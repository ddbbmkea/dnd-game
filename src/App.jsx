import { useEffect, useState } from 'react'
import { DEFAULT_DC, EVENTS, START_EVENT_ID } from './events'
import './App.css'

const STORAGE_KEY = 'waterdeep-adventure-save'
const INITIAL_STATS = { hp: 10, gold: 5, reputation: 0 }
const EMPTY_STATS = { hp: 0, gold: 0, reputation: 0 }

function rollD20() {
  return Math.floor(Math.random() * 20) + 1
}

function getEvent(eventId) {
  return EVENTS[eventId] ?? EVENTS[START_EVENT_ID]
}

function isValidEventId(eventId) {
  return typeof eventId === 'string' && Boolean(EVENTS[eventId])
}

function applyStats(currentStats, changes = EMPTY_STATS) {
  return {
    hp: Math.max(0, currentStats.hp + (changes.hp ?? 0)),
    gold: Math.max(0, currentStats.gold + (changes.gold ?? 0)),
    reputation: currentStats.reputation + (changes.reputation ?? 0),
  }
}

function resolveChoice(choice) {
  if (choice.requiresRoll) {
    const roll = rollD20()
    const dc = choice.dc ?? DEFAULT_DC

    const isCritFail = roll === 1
    const isCritSuccess = roll === 20
    const success = roll >= dc

    let outcome

    if (isCritSuccess) {
      outcome = choice.outcomes.criticalSuccess ?? choice.outcomes.success
    } else if (isCritFail) {
      outcome = choice.outcomes.criticalFailure ?? choice.outcomes.failure
    } else {
      outcome = success ? choice.outcomes.success : choice.outcomes.failure
    }

    const nextEventId = isValidEventId(outcome.nextEventId)
      ? outcome.nextEventId
      : START_EVENT_ID

    return {
      nextEventId,
      result: outcome.result,
      stats: outcome.stats ?? EMPTY_STATS,
      diceRoll: {
        roll,
        success,
        dc,
        isCritFail,
        isCritSuccess,
      },
    }
  }

  const nextEventId = isValidEventId(choice.nextEventId)
    ? choice.nextEventId
    : START_EVENT_ID

  return {
    nextEventId,
    result: choice.result ?? '',
    stats: choice.stats ?? EMPTY_STATS,
    diceRoll: null,
  }
}

function createInitialGameState() {
  return {
    stats: { ...INITIAL_STATS },
    eventId: START_EVENT_ID,
    lastResult: null,
    lastDiceRoll: null,
  }
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialGameState()

    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return createInitialGameState()

    const { stats } = parsed
    if (
      !stats ||
      typeof stats.hp !== 'number' ||
      typeof stats.gold !== 'number' ||
      typeof stats.reputation !== 'number'
    ) {
      return createInitialGameState()
    }

    return {
      stats: {
        hp: Math.max(0, stats.hp),
        gold: Math.max(0, stats.gold),
        reputation: stats.reputation,
      },
      eventId: isValidEventId(parsed.eventId) ? parsed.eventId : START_EVENT_ID,
      lastResult: typeof parsed.lastResult === 'string' ? parsed.lastResult : null,
      lastDiceRoll:
        parsed.lastDiceRoll &&
        typeof parsed.lastDiceRoll.roll === 'number' &&
        typeof parsed.lastDiceRoll.success === 'boolean' &&
        typeof parsed.lastDiceRoll.dc === 'number'
          ? parsed.lastDiceRoll
          : null,
    }
  } catch {
    return createInitialGameState()
  }
}

function saveGameState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage errors (e.g. private browsing quota).
  }
}

const FACTION_LABELS = {
  harper: '하퍼',
  zhentarim: '젠타림',
  neutral: '워터딥',
}

function App() {
  const [gameState, setGameState] = useState(loadSavedState)

  const [log, setLog] = useState([])

  const [actionCount, setActionCount] = useState(0)

  const day = Math.floor(actionCount / 3) + 1

  const isGameOver = gameState.stats.hp <= 0

  const [pendingChoice, setPendingChoice] = useState(null)
  const [rolling, setRolling] = useState(false)

  const { stats, eventId, lastResult, lastDiceRoll } = gameState
  const currentEvent = getEvent(eventId)

  useEffect(() => {
    saveGameState(gameState)
  }, [gameState])

  const handleChoice = (choice) => {
    setActionCount(prev => prev + 1)

    if (isGameOver) return

    if (choice.requiresRoll) {
      setPendingChoice(choice)
      return
    }
  
    const outcome = resolveChoice(choice)

    const startNewAdventure = () => {
      localStorage.removeItem(STORAGE_KEY)
    
      setGameState(createInitialGameState())
      setActionCount(0)
      setLog([])
      setPendingChoice(null)
      setRolling(false)
    }

    if (choice.id === 'start-again') {
      startNewAdventure()
      return
    }

    setLog(prev => {
      const newLog = [
        ...prev,
        {
          day,
          text: choice.label
        }
      ]
    
      return newLog.slice(0, 20)
    })
  
    setGameState((prev) => ({
      stats: applyStats(prev.stats, outcome.stats),
      eventId: outcome.nextEventId,
      lastResult: outcome.result,
      lastDiceRoll: outcome.diceRoll,
    }))
  }

  const handleRollDice = () => {
    if (!pendingChoice) return
    if (isGameOver) return
  
    setRolling(true)
  
    setTimeout(() => {
      const outcome = resolveChoice(pendingChoice)
  
      setGameState((prev) => ({
        stats: applyStats(prev.stats, outcome.stats),
        eventId: outcome.nextEventId,
        lastResult: outcome.result,
        lastDiceRoll: outcome.diceRoll,
      }))
  
      setPendingChoice(null)
      setRolling(false)
    }, 600)
  }

  const handleReset = () => {
    setGameState(createInitialGameState())
    setActionCount(0)
    setLog([])
  }

  if (isGameOver) {
    return (
      <div className="game-over">
        <h2>💀 GAME OVER</h2>
        <p>워터딥에서의 여정이 끝났습니다.</p>
        <button onClick={handleReset}>다시 시작</button>
      </div>
    )
  }


  return (
    <div className="game">
  
      {/* LEFT SIDE */}
      <div className="game-left">
  
        <header className="game-header">
          <p className="game-subtitle">Forgotten Realms · Event Chain</p>
          <h1 className="game-title">Waterdeep Adventure</h1>
        </header>
  
        <section className="stats-panel" aria-label="플레이어 스탯">
          <div className="stat">
            <span className="stat-label">HP</span>
            <span className="stat-value">{stats.hp}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Gold</span>
            <span className="stat-value">{stats.gold}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Reputation</span>
            <span className="stat-value">{stats.reputation}</span>
          </div>
        </section>
  
        <main className="game-main">
          {lastResult && (
            <article className="result-panel result-panel--compact" aria-live="polite">
              <h2 className="panel-label">Last Action</h2>

              {lastDiceRoll && (
                <div className="dice-panel">
                  <div className="dice-display">
                    <span className="dice-label">1d20</span>
                    <span className="dice-value">{lastDiceRoll.roll}</span>
                  </div>
                  <div className="dice-meta">
                    <p className="dice-threshold">
                      판정 기준: <strong>{lastDiceRoll.dc} 이상</strong>
                    </p>
                    <p
                      className={`dice-outcome ${
                        lastDiceRoll.roll === 20 || lastDiceRoll.success
                          ? 'dice-outcome--success'
                          : 'dice-outcome--failure'
                      }`}
                    >
                      {lastDiceRoll.roll === 20
                        ? '🎉 대성공!'
                        : lastDiceRoll.roll === 1
                        ? '💀 대실패...'
                        : lastDiceRoll.success
                        ? '성공!'
                        : '실패...'}
                    </p>
                  </div>
                </div>
              )}

              <p className="result-text">{lastResult}</p>
            </article>
          )}

          <article className="event-panel">
            <div className="event-header">
              <h2 className="panel-label">Event</h2>
              {currentEvent.faction && (
                <span className={`faction-tag faction-tag--${currentEvent.faction}`}>
                  {FACTION_LABELS[currentEvent.faction]}
                </span>
              )}
            </div>
            <p className="event-text">{currentEvent.text}</p>
          </article>

          <section className="choices-panel" aria-label="선택지">
            <h2 className="panel-label">Choose your action</h2>

            {pendingChoice ? (
              <div className="dice-roll-panel">
                <p>이 행동은 주사위 판정이 필요합니다.</p>

                <button onClick={handleRollDice} disabled={rolling}>
                  {rolling ? '🎲 굴리는 중...' : '🎲 주사위 굴리기'}
                </button>
              </div>
            ) : (
              <div className="choices">
                {currentEvent.choices.map((choice, index) => (
                  <button
                    key={choice.id}
                    type="button"
                    className="choice-btn"
                    onClick={() => handleChoice(choice)}
                  >
                    <span className="choice-number">{index + 1}</span>
                    {choice.label}
                  </button>
                ))}
              </div>
            )}
          </section>

          <div className="game-actions">
            <button type="button" className="reset-btn" onClick={handleReset}>
              처음부터 다시 시작
            </button>
          </div>
        </main>

        <footer className="game-footer">
          <p>워터딥 · 하퍼와 젠타림의 그림자 속에서 길을 선택하라</p>
        </footer>
      </div>
  
      {/* RIGHT SIDE */}
      <aside className="log-sidebar">

        <div className="log-day">
          Day {day}
        </div>

        <h3>모험 일지</h3>

        <div className="log-content">
          {log.map((entry, i) => (
            <div key={i} className="log-entry">
              Day {entry.day} - {entry.text}
            </div>
          ))}
        </div>
      </aside>
  
    </div>
  )
}

export default App

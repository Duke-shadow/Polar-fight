import React, { useState } from "react";
import { motion } from "framer-motion";

const MAX_HP = 150;
const DAMAGE_SCALE = MAX_HP / 100;

const TEAMS = {
  PENGUIN: "penguin",
  BEAR: "bear",
} as const;

type Team = typeof TEAMS[keyof typeof TEAMS];

type Move = {
  name: string;
  power: number;
  element: string;
  symbol: string;
};

type Unit = {
  id: string;
  team: Team;
  hp: number;
  name: string;
  moves: Move[];
};

const teamEmoji = (team: Team) => (team === TEAMS.PENGUIN ? "🐧" : "🐻‍❄️");

const CHARACTERS: Record<Team, Unit> = {
  penguin: {
    id: "P1",
    team: TEAMS.PENGUIN,
    hp: MAX_HP,
    name: "Penguin",
    moves: [
      { name: "Frost Peck", power: 6 * DAMAGE_SCALE, element: "Ice", symbol: "❄️" },
      { name: "Aqua Dash", power: 8 * DAMAGE_SCALE, element: "Water", symbol: "💧" },
      { name: "Chill Heal", power: -5 * DAMAGE_SCALE, element: "Heal", symbol: "✨" },
      { name: "Wind Flap", power: 6 * DAMAGE_SCALE, element: "Air", symbol: "💨" },
    ],
  },
  bear: {
    id: "B1",
    team: TEAMS.BEAR,
    hp: MAX_HP,
    name: "Polar Bear",
    moves: [
      { name: "Claw Swipe", power: 7 * DAMAGE_SCALE, element: "Earth", symbol: "🌍" },
      { name: "Blizzard Roar", power: 8 * DAMAGE_SCALE, element: "Ice", symbol: "❄️" },
      { name: "Hibernate", power: -6 * DAMAGE_SCALE, element: "Heal", symbol: "💤" },
      { name: "Tundra Smash", power: 9 * DAMAGE_SCALE, element: "Rock", symbol: "🪨" },
    ],
  },
};

export default function PenguinsVsPolarBears() {
  const [player1, setPlayer1] = useState<Unit | null>(null);
  const [player2, setPlayer2] = useState<Unit | null>(null);
  const [turn, setTurn] = useState<Team>(TEAMS.PENGUIN);
  const [history, setHistory] = useState<string[]>([]);
  const [battleStarted, setBattleStarted] = useState(false);

  const bothSelected = player1 && player2;

  const elementAdvantages: Record<string, string> = {
    Ice: "Water",
    Water: "Rock",
    Earth: "Air",
    Rock: "Ice",
  };

  const reactionChart: Record<string, Record<string, string>> = {
    Ice: { Water: "Freeze Reaction - Extra 1 dmg!", Air: "Frost Storm - Double hit!" },
    Water: { Rock: "Erosion - +2 dmg!" },
    Earth: { Air: "Dust Burst - +1 dmg!" },
    Rock: { Ice: "Crack Chill - Defense break!" },
  };

  function getReaction(move1: string, move2: string) {
    if (reactionChart[move1]?.[move2]) return reactionChart[move1][move2];
    if (reactionChart[move2]?.[move1]) return reactionChart[move2][move1];
    return null;
  }

  function performMove(move: Move) {
    if (!player1 || !player2) return;
    const isCrit = Math.random() < 0.2;
    let damage = isCrit ? move.power * 2 : move.power;

    const attacker = turn === TEAMS.PENGUIN ? { ...player1 } : { ...player2 };
    const defender = turn === TEAMS.PENGUIN ? { ...player2 } : { ...player1 };

    let log = `${attacker.name} ${move.symbol} used ${move.name}!`;

    if (move.power > 0) {
      const randomDefMove = defender.moves[Math.floor(Math.random() * defender.moves.length)];

      if (elementAdvantages[move.element] === randomDefMove.element) {
        damage *= 1.5;
        log += ` 🌟 Elemental Advantage!`;
      }

      defender.hp = Math.max(0, defender.hp - Math.round(damage));
      if (isCrit) log += ` 💥 Critical Hit! (${Math.round(damage)} dmg)`;
    } else {
      attacker.hp = Math.min(MAX_HP, attacker.hp - Math.round(move.power));
      log += ` 🧊 Healed ${-Math.round(move.power)} HP!`;
    }

    const reaction = getReaction(move.element, defender.moves[Math.floor(Math.random() * defender.moves.length)].element);
    if (reaction) {
      log += ` ⚗️ ${reaction}`;
      defender.hp = Math.max(0, defender.hp - Math.round(2 * DAMAGE_SCALE));
    }

    setHistory(h => [log, ...h]);
    if (turn === TEAMS.PENGUIN) {
      setPlayer1(attacker);
      setPlayer2(defender);
    } else {
      setPlayer2(attacker);
      setPlayer1(defender);
    }
    setTurn(turn === TEAMS.PENGUIN ? TEAMS.BEAR : TEAMS.PENGUIN);
  }

  // Updated winner logic: Determine based on actual remaining HP instead of fixed teams
  const winner = player1 && player2 && (player1.hp <= 0 || player2.hp <= 0)
    ? player1.hp <= 0 && player2.hp > 0
      ? player2.name
      : player2.hp <= 0 && player1.hp > 0
      ? player1.name
      : null
    : null;

  function reset() {
    setPlayer1(null);
    setPlayer2(null);
    setTurn(TEAMS.PENGUIN);
    setHistory([]);
    setBattleStarted(false);
  }

  if (!bothSelected || !battleStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-sky-100 p-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Choose Characters</h1>
        {!player1 ? (
          <div className="flex gap-6">
            {[TEAMS.PENGUIN, TEAMS.BEAR].map(team => (
              <motion.button
                key={team}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPlayer1({ ...CHARACTERS[team] })}
                className="bg-white rounded-3xl p-6 shadow hover:shadow-md text-center w-48"
              >
                <div className="text-6xl mb-2">{teamEmoji(team)}</div>
                <p className="font-semibold text-lg">{team === TEAMS.PENGUIN ? "Penguin" : "Polar Bear"}</p>
              </motion.button>
            ))}
          </div>
        ) : !player2 ? (
          <div className="flex flex-col items-center">
            <h2 className="text-xl mb-3">Player 2, choose your character</h2>
            <div className="flex gap-6">
              {[TEAMS.PENGUIN, TEAMS.BEAR].map(team => (
                <motion.button
                  key={team}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPlayer2({ ...CHARACTERS[team] })}
                  className="bg-white rounded-3xl p-6 shadow hover:shadow-md text-center w-48"
                >
                  <div className="text-6xl mb-2">{teamEmoji(team)}</div>
                  <p className="font-semibold text-lg">{team === TEAMS.PENGUIN ? "Penguin" : "Polar Bear"}</p>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setBattleStarted(true)}
            className="mt-6 px-4 py-2 bg-green-500 text-white rounded-xl shadow hover:bg-green-600"
          >
            Start Battle
          </motion.button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-50 to-sky-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl grid grid-cols-1 gap-6">
        <header className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Penguins 🐧 vs Polar Bears 🐻‍❄️</h1>
            <p className="text-sm md:text-base text-slate-600">Turn-based elemental duel ⚗️</p>
          </div>
          <button onClick={reset} className="px-3 py-2 rounded-2xl shadow bg-white hover:shadow-md">New Game</button>
        </header>

        <div className="bg-white rounded-3xl shadow-lg p-6 grid grid-rows-2 gap-6">
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-start">
              <span className="font-semibold">{player2.name} {teamEmoji(player2.team)}</span>
              <div className="w-40 h-3 bg-slate-200 rounded-full overflow-hidden">
                <motion.div className="h-full bg-red-500" animate={{ width: `${(player2.hp / MAX_HP) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-500">HP: {player2.hp}/{MAX_HP}</span>
            </div>
            <motion.div className="text-6xl">{teamEmoji(player2.team)}</motion.div>
          </div>

          <div className="flex justify-between items-center">
            <motion.div className="text-6xl">{teamEmoji(player1.team)}</motion.div>
            <div className="flex flex-col items-end">
              <span className="font-semibold">{player1.name} {teamEmoji(player1.team)}</span>
              <div className="w-40 h-3 bg-slate-200 rounded-full overflow-hidden">
                <motion.div className="h-full bg-red-500" animate={{ width: `${(player1.hp / MAX_HP) * 100}%` }} />
              </div>
              <span className="text-xs text-slate-500">HP: {player1.hp}/{MAX_HP}</span>
            </div>
          </div>
        </div>

        {!winner ? (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h3 className="font-semibold mb-2">{turn === TEAMS.PENGUIN ? "Penguin" : "Polar Bear"}'s Turn {teamEmoji(turn)}</h3>
            <div className="grid grid-cols-2 gap-2">
              {(turn === TEAMS.PENGUIN ? player1.moves : player2.moves).map(move => (
                <motion.button
                  key={move.name}
                  onClick={() => performMove(move)}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-2 rounded-xl shadow bg-blue-100 hover:bg-blue-200 text-sm font-medium flex items-center justify-between"
                >
                  <span>{move.symbol}</span>
                  <span>{move.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-200 text-yellow-900 rounded-3xl shadow-lg p-6 text-center font-bold">
            🏆 {winner} wins!
          </div>
        )}

        <div className="bg-white rounded-2xl shadow p-4">
          <h3 className="font-semibold mb-2">Battle Log</h3>
          <div className="h-48 overflow-auto space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500">No actions yet. Make the first move!</p>
            ) : (
              history.map((h, i) => (
                <div key={i} className="text-sm p-2 rounded-lg bg-slate-50 border border-slate-100">{h}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

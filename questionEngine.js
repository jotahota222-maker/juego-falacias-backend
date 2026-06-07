/**
 * QUESTION ENGINE
 * Generates randomized multiple-choice questions from the fallacy dataset.
 * Guarantees no repeated questions in the same game session.
 */

const { FALLACIES, ALL_WRONG_OPTIONS } = require("./falaciaData");

/**
 * Fisher-Yates shuffle — returns a new shuffled array.
 * @param {Array} arr
 * @returns {Array}
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Pick `n` random items from array without repetition.
 * @param {Array} arr
 * @param {number} n
 * @returns {Array}
 */
function pickN(arr, n) {
  return shuffle(arr).slice(0, n);
}

/**
 * Build a 4-option MCQ from a fallacy entry.
 * Distractors are chosen from the global pool, excluding the correct answer.
 *
 * @param {Object} fallacy - Entry from FALLACIES array
 * @returns {Object} Question object ready for the game engine
 */
function buildQuestion(fallacy) {
  const wrongPool = ALL_WRONG_OPTIONS.filter((o) => o !== fallacy.correctAnswer);
  const distractors = pickN(wrongPool, 3);

  const options = shuffle([fallacy.correctAnswer, ...distractors]);

  return {
    id: fallacy.id,
    scenario: fallacy.scenario,
    question: fallacy.question,
    options,                          // array of 4 strings, order randomized
    correctAnswer: fallacy.correctAnswer,
    category: fallacy.category,
    fallacyName: fallacy.fallacyName,
    hint: fallacy.hint,
  };
}

/**
 * Generate the full question deck for a game session.
 * Shuffles the fallacy pool, slices to `totalRounds`, and builds MCQs.
 * If totalRounds > available fallacies, cycles the pool.
 *
 * @param {number} totalRounds
 * @returns {Object[]} Array of question objects
 */
function generateQuestionDeck(totalRounds) {
  if (totalRounds < 1) throw new Error("totalRounds must be >= 1");

  let deck = [];
  const shuffled = shuffle(FALLACIES);

  // Cycle through the pool if more rounds than questions available
  while (deck.length < totalRounds) {
    deck = [...deck, ...shuffle(FALLACIES)];
  }
  deck = deck.slice(0, totalRounds);

  return deck.map(buildQuestion);
}

module.exports = { generateQuestionDeck, buildQuestion, shuffle, pickN };

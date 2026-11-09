// Minesweeper AI Solver & Hint Engine
// Analyzes the board state and finds deterministic moves (safe or mine), or the safest probabilistic guess.

export function getHint(state) {
  const { ceils, rows, columns, status } = state;
  if (status !== 'started' && status !== 'new') return null;

  if (status === 'new') {
    // Recommend a good starting point (center cell)
    const centerIndex = Math.floor(rows / 2) * columns + Math.floor(columns / 2);
    return {
      type: 'safe',
      index: centerIndex,
      reason: 'The center of the board is great for an opening cascade!',
    };
  }

  // 1. Basic Single-Number Deduction
  for (let i = 0; i < ceils.length; i++) {
    const ceil = ceils[i];
    if (ceil.state !== 'open' || ceil.minesAround <= 0) continue;

    const neighbors = getNeighbors(i, rows, columns);
    const hidden = neighbors.filter(idx => ceils[idx].state === 'cover' || ceils[idx].state === 'unknown');
    const flagged = neighbors.filter(idx => ceils[idx].state === 'flag');

    const remainingMines = ceil.minesAround - flagged.length;

    // Case A: All required mines are already flagged -> remaining hidden neighbors are 100% safe
    if (remainingMines === 0 && hidden.length > 0) {
      return {
        type: 'safe',
        index: hidden[0],
        sourceIndex: i,
        reason: `Number ${ceil.minesAround} at (${Math.floor(i / columns) + 1}, ${(i % columns) + 1}) has all its mines flagged. This cell is 100% safe!`,
      };
    }

    // Case B: Remaining hidden neighbors equal remaining mines -> all hidden neighbors are mines!
    if (remainingMines > 0 && hidden.length === remainingMines) {
      return {
        type: 'mine',
        index: hidden[0],
        sourceIndex: i,
        reason: `Number ${ceil.minesAround} at (${Math.floor(i / columns) + 1}, ${(i % columns) + 1}) needs ${remainingMines} more mine(s), and has exactly ${hidden.length} covered tile(s). This is definitely a mine!`,
      };
    }
  }

  // 2. Subset Deduction (Advanced logic for 1-2, 1-2-1, 1-1 patterns)
  const openNumbered = [];
  for (let i = 0; i < ceils.length; i++) {
    if (ceils[i].state === 'open' && ceils[i].minesAround > 0) {
      const neighbors = getNeighbors(i, rows, columns);
      const hidden = neighbors.filter(idx => ceils[idx].state === 'cover' || ceils[idx].state === 'unknown');
      const flagged = neighbors.filter(idx => ceils[idx].state === 'flag');
      const remainingMines = ceils[i].minesAround - flagged.length;
      if (hidden.length > 0 && remainingMines >= 0) {
        openNumbered.push({ index: i, hidden, remainingMines });
      }
    }
  }

  for (let a = 0; a < openNumbered.length; a++) {
    for (let b = 0; b < openNumbered.length; b++) {
      if (a === b) continue;
      const cellA = openNumbered[a];
      const cellB = openNumbered[b];

      // Check if hidden set of A is a subset of hidden set of B
      const isSubset = cellA.hidden.every(idx => cellB.hidden.includes(idx));
      if (isSubset && cellB.hidden.length > cellA.hidden.length) {
        const diff = cellB.hidden.filter(idx => !cellA.hidden.includes(idx));
        const diffMines = cellB.remainingMines - cellA.remainingMines;

        if (diffMines === 0 && diff.length > 0) {
          // All cells in diff are 100% safe!
          return {
            type: 'safe',
            index: diff[0],
            sourceIndex: cellB.index,
            reason: `Advanced deduction: All mines for this area are accounted for. This cell is guaranteed safe!`,
          };
        } else if (diffMines === diff.length && diff.length > 0) {
          // All cells in diff are guaranteed mines!
          return {
            type: 'mine',
            index: diff[0],
            sourceIndex: cellB.index,
            reason: `Advanced deduction: By constraint subtraction, this cell must be a mine!`,
          };
        }
      }
    }
  }

  // 3. Fallback: Probability Calculation (Find safest guess)
  const candidateScores = {};
  openNumbered.forEach(cell => {
    const prob = cell.remainingMines / cell.hidden.length;
    cell.hidden.forEach(idx => {
      if (candidateScores[idx] === undefined || prob < candidateScores[idx]) {
        candidateScores[idx] = prob;
      }
    });
  });

  const candidateIndexes = Object.keys(candidateScores);
  if (candidateIndexes.length > 0) {
    candidateIndexes.sort((i1, i2) => candidateScores[i1] - candidateScores[i2]);
    const bestIndex = parseInt(candidateIndexes[0], 10);
    const bestProb = Math.round((1 - candidateScores[bestIndex]) * 100);
    return {
      type: 'guess',
      index: bestIndex,
      reason: `No 100% certain move found. This cell has the lowest risk (~${bestProb}% safe).`,
    };
  }

  // 4. Any random covered tile
  const covered = [];
  ceils.forEach((c, idx) => {
    if (c.state === 'cover' || c.state === 'unknown') covered.push(idx);
  });
  if (covered.length > 0) {
    return {
      type: 'guess',
      index: covered[Math.floor(Math.random() * covered.length)],
      reason: 'Unexplored territory - try opening this cell.',
    };
  }

  return null;
}

export function getNeighbors(index, rows, columns) {
  if (index < 0 || index >= rows * columns) return [];
  const row = Math.floor(index / columns);
  const column = index % columns;
  const deltas = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];
  const neighbors = [];
  deltas.forEach(([dr, dc]) => {
    const nr = row + dr;
    const nc = column + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < columns) {
      neighbors.push(nr * columns + nc);
    }
  });
  return neighbors;
}


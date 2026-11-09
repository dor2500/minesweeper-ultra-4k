import React, { useReducer, useEffect, useState, useCallback } from 'react';
import sampleSize from 'lodash.samplesize';

import { Config } from './config';
import MinesweeperView from './MinesweeperView';
import {
  initAudio,
  playClick,
  playFlag,
  playUnflag,
  playQuestion,
  playChord,
  playExplosion,
  playWin,
  playTick,
  playHint,
  playShield,
  playDrone,
  getSoundEnabled,
  setSoundEnabled,
} from './audio';
import { getHint } from './solver';
import { recordGameResult, updateBestTime } from './scores';
import { particles } from './particles';

function getInitState(difficulty = 'Beginner', customConfig = null) {
  let config;
  if (typeof difficulty === 'object' && difficulty !== null) {
    config = difficulty;
    difficulty = 'Custom';
  } else if (difficulty === 'Custom' && customConfig) {
    config = customConfig;
  } else {
    config = Config[difficulty] || Config.Beginner;
  }

  return {
    difficulty,
    customConfig: difficulty === 'Custom' ? config : null,
    status: 'new',
    marks: true,
    sound: getSoundEnabled(),
    xray: false,
    guaranteeZero: true,
    shields: 2, // 2 free shields per game
    droneScans: 1, // 1 radar drone scan per game
    history: [],
    hintHighlight: null,
    shieldActiveAnim: false,
    ...genGameConfig(config),
  };
}

function reducer(state, action = {}) {
  switch (action.type) {
    case 'CLEAR_MAP': {
      const difficulty = action.payload || state.difficulty;
      const customConfig = (typeof difficulty === 'object') ? difficulty : state.customConfig;
      const next = getInitState(difficulty, customConfig);
      return {
        ...next,
        marks: state.marks,
        sound: state.sound,
        xray: state.xray,
        guaranteeZero: state.guaranteeZero,
      };
    }
    case 'START_GAME': {
      const exclude = action.payload;
      const currentConfig = {
        rows: state.rows,
        columns: state.columns,
        mines: state.mines,
        exclude,
        guaranteeZero: state.guaranteeZero,
      };
      return {
        ...state,
        ...insertMines(currentConfig, state.ceils),
        status: 'started',
        hintHighlight: null,
      };
    }
    case 'OPEN_CEIL': {
      const indexes = autoCeils(state, action.payload);
      const ceils = [...state.ceils];
      indexes.forEach(i => {
        const ceil = ceils[i];
        ceils[i] = { ...ceil, state: 'open' };
      });
      const historySnapshot = {
        ceils: state.ceils,
        status: state.status,
        shields: state.shields,
      };
      return {
        ...state,
        ceils,
        history: [...state.history.slice(-12), historySnapshot],
        hintHighlight: state.hintHighlight && indexes.includes(state.hintHighlight.index) ? null : state.hintHighlight,
      };
    }
    case 'SHIELD_DEFLECT': {
      const index = action.payload;
      const ceils = [...state.ceils];
      ceils[index] = { ...ceils[index], state: 'flag' };
      return {
        ...state,
        shields: Math.max(0, state.shields - 1),
        ceils,
        shieldActiveAnim: true,
      };
    }
    case 'USE_DRONE': {
      if (state.droneScans <= 0) return state;
      const safeCovered = state.ceils
        .map((c, i) => ((c.state === 'cover' || c.state === 'unknown') && c.minesAround >= 0 ? i : -1))
        .filter(i => i !== -1);
      if (safeCovered.length === 0) return state;
      const target = safeCovered[Math.floor(Math.random() * safeCovered.length)];
      const indexes = autoCeils(state, target);
      const ceils = [...state.ceils];
      indexes.forEach(i => {
        ceils[i] = { ...ceils[i], state: 'open' };
      });
      return {
        ...state,
        droneScans: state.droneScans - 1,
        ceils,
      };
    }
    case 'CHANGE_CEIL_STATE': {
      const index = action.payload;
      const ceils = [...state.ceils];
      const ceil = state.ceils[index];
      let newState;
      switch (ceil.state) {
        case 'cover':
          newState = 'flag';
          break;
        case 'flag':
          newState = state.marks ? 'unknown' : 'cover';
          break;
        case 'unknown':
          newState = 'cover';
          break;
        default:
          return state;
      }
      ceils[index] = { ...ceil, state: newState };
      return {
        ...state,
        ceils,
        hintHighlight: state.hintHighlight && state.hintHighlight.index === index ? null : state.hintHighlight,
      };
    }
    case 'GAME_OVER': {
      const ceils = state.ceils.map(ceil => {
        if (ceil.minesAround < 0 && ceil.state !== 'flag') {
          return {
            ...ceil,
            state: 'mine',
          };
        } else if (ceil.state === 'flag' && ceil.minesAround >= 0) {
          return {
            ...ceil,
            state: 'misflagged',
          };
        } else {
          return {
            ...ceil,
            opening: false,
          };
        }
      });
      if (action.payload >= 0 && action.payload < ceils.length) {
        ceils[action.payload].state = 'die';
      }
      const fatalSnapshot = {
        ceils: state.ceils,
        status: state.status,
        fatalMineIndex: action.payload,
        shields: state.shields,
      };
      return {
        ...state,
        status: 'died',
        ceils,
        history: [...state.history.slice(-12), fatalSnapshot],
      };
    }
    case 'WON': {
      const ceils = state.ceils.map(ceil => {
        if (ceil.minesAround >= 0) {
          return {
            ...ceil,
            state: 'open',
          };
        } else {
          return {
            ...ceil,
            state: 'flag',
          };
        }
      });
      return {
        ...state,
        status: 'won',
        ceils,
        hintHighlight: null,
      };
    }
    case 'UNDO': {
      if (!state.history || state.history.length === 0) return state;
      const last = state.history[state.history.length - 1];
      const newHistory = state.history.slice(0, -1);
      const ceils = last.ceils.map(c => ({ ...c, opening: false }));
      if (last.fatalMineIndex !== undefined && last.fatalMineIndex >= 0) {
        ceils[last.fatalMineIndex] = {
          ...ceils[last.fatalMineIndex],
          state: 'flag',
        };
      }
      return {
        ...state,
        ceils,
        status: 'started',
        history: newHistory,
        hintHighlight: null,
      };
    }
    case 'OPENING_CEIL': {
      const ceils = state.ceils.map((c, idx) => ({
        ...c,
        opening: idx === action.payload,
      }));
      return {
        ...state,
        ceils,
      };
    }
    case 'OPENING_CEILS': {
      const indexes = getNearIndexes(action.payload, state.rows, state.columns);
      const targetSet = new Set([...indexes, action.payload]);
      const ceils = state.ceils.map((c, idx) => ({
        ...c,
        opening: targetSet.has(idx),
      }));
      return {
        ...state,
        ceils,
      };
    }
    case 'TOGGLE_MARKS':
      return { ...state, marks: !state.marks };
    case 'TOGGLE_SOUND': {
      const nextSound = !state.sound;
      setSoundEnabled(nextSound);
      return { ...state, sound: nextSound };
    }
    case 'TOGGLE_XRAY':
      return { ...state, xray: !state.xray };
    case 'TOGGLE_GUARANTEE_ZERO':
      return { ...state, guaranteeZero: !state.guaranteeZero };
    case 'SET_HINT':
      return { ...state, hintHighlight: action.payload };
    case 'CLEAR_HINT':
      return { ...state, hintHighlight: null };
    default:
      return state;
  }
}

function MineSweeper({
  defaultDifficulty,
  onClose,
  sameTouchPos,
  lastTouch,
  platform,
  setWindowTitleWidth,
  style,
  setStyle,
  scale,
  setScale,
}) {
  const [state, dispatch] = useReducer(
    reducer,
    getInitState(defaultDifficulty),
  );

  const seconds = useTimer(state.status, state.sound);
  const [newRecordData, setNewRecordData] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Win / Loss state side-effects
  useEffect(() => {
    if (state.status === 'started' && checkRemains() === 0) {
      dispatch({ type: 'WON' });
      playWin();
      particles.confetti(); // 4K Confetti explosion!
      const { isNewBestTime } = recordGameResult(true, state.difficulty, seconds);
      if (isNewBestTime && ['Beginner', 'Intermediate', 'Expert'].includes(state.difficulty)) {
        setNewRecordData({ difficulty: state.difficulty, seconds });
      }
    }
  }, [state.ceils, state.status]);

  useEffect(() => {
    if (state.status === 'died') {
      playExplosion();
      particles.explosion(); // 4K Shockwave & Screen Shake!
      recordGameResult(false, state.difficulty, seconds);
    }
  }, [state.status]);

  function changeCeilState(index) {
    const ceil = state.ceils[index];
    if (ceil.state === 'open' || ['won', 'died'].includes(state.status)) return;
    if (ceil.state === 'cover') playFlag();
    else if (ceil.state === 'flag') playQuestion();
    else playUnflag();

    dispatch({ type: 'CHANGE_CEIL_STATE', payload: index });
  }

  function openCeil(index) {
    if (['won', 'died'].includes(state.status)) return;
    const ceil = state.ceils[index];
    if (ceil && ceil.state === 'flag') return;

    switch (state.status) {
      case 'new':
        playClick();
        dispatch({ type: 'START_GAME', payload: index });
        dispatch({ type: 'OPEN_CEIL', payload: index });
        break;
      case 'started':
        if (ceil.state === 'open') break;
        if (ceil.minesAround < 0) {
          // Check if Shield is available
          if (state.shields > 0) {
            playShield();
            particles.shieldDeflect();
            dispatch({ type: 'SHIELD_DEFLECT', payload: index });
          } else {
            dispatch({ type: 'GAME_OVER', payload: index });
          }
        } else {
          playClick();
          dispatch({ type: 'OPEN_CEIL', payload: index });
        }
        break;
      default:
        break;
    }
  }

  function openCeils(index) {
    const ceil = state.ceils[index];
    if (
      ceil.state !== 'open' ||
      ceil.minesAround <= 0 ||
      state.status !== 'started'
    )
      return;
    const indexes = getNearIndexes(index, state.rows, state.columns);
    const nearCeils = indexes.map(i => state.ceils[i]);
    const flaggedCount = nearCeils.filter(c => c.state === 'flag').length;
    if (flaggedCount !== ceil.minesAround) return;

    playChord();
    const mineIndex = indexes.find(
      i => state.ceils[i].minesAround < 0 && state.ceils[i].state !== 'flag',
    );
    if (mineIndex) {
      if (state.shields > 0) {
        playShield();
        particles.shieldDeflect();
        dispatch({ type: 'SHIELD_DEFLECT', payload: mineIndex });
      } else {
        dispatch({ type: 'GAME_OVER', payload: mineIndex });
      }
    } else {
      indexes.forEach(i => {
        if (state.ceils[i].state !== 'flag' && state.ceils[i].state !== 'open') {
          dispatch({ type: 'OPEN_CEIL', payload: i });
        }
      });
    }
  }

  function onReset(difficultyOrConfig) {
    dispatch({ type: 'CLEAR_MAP', payload: difficultyOrConfig });
  }

  function checkRemains() {
    const safeCeils = state.ceils
      .filter(ceil => ceil.state !== 'open')
      .filter(ceil => ceil.minesAround >= 0);
    return safeCeils.length;
  }

  function openingCeil(index) {
    if (['died', 'won'].includes(state.status)) return;
    dispatch({ type: 'OPENING_CEIL', payload: index });
  }

  function openingCeils(index) {
    if (['died', 'won'].includes(state.status)) return;
    dispatch({ type: 'OPENING_CEILS', payload: index });
  }

  function toggleMarks() {
    dispatch({ type: 'TOGGLE_MARKS' });
  }

  function toggleSound() {
    dispatch({ type: 'TOGGLE_SOUND' });
  }

  function toggleXRay() {
    dispatch({ type: 'TOGGLE_XRAY' });
  }

  function toggleGuaranteeZero() {
    dispatch({ type: 'TOGGLE_GUARANTEE_ZERO' });
  }

  function triggerUndo() {
    if (state.history.length > 0) {
      dispatch({ type: 'UNDO' });
      playClick();
    }
  }

  function triggerHint() {
    const hint = getHint(state);
    if (hint) {
      playHint();
      dispatch({ type: 'SET_HINT', payload: hint });
    }
  }

  function triggerDrone() {
    if (state.droneScans > 0) {
      playDrone();
      dispatch({ type: 'USE_DRONE' });
    }
  }

  function handleSaveRecord(playerName) {
    if (newRecordData) {
      updateBestTime(newRecordData.difficulty, newRecordData.seconds, playerName);
      setNewRecordData(null);
    }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }

  // Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        onReset();
      } else if (e.key === 'F11') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        triggerHint();
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        triggerDrone();
      } else if (e.key === 'x' || e.key === 'X') {
        e.preventDefault();
        toggleXRay();
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        triggerUndo();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        toggleSound();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state]);

  const totalSafe = state.rows * state.columns - state.mines;
  const safeRemaining = checkRemains();

  return (
    <MinesweeperView
      {...state}
      onClose={onClose}
      changeCeilState={changeCeilState}
      openCeil={openCeil}
      openCeils={openCeils}
      onReset={onReset}
      seconds={seconds}
      openingCeil={openingCeil}
      openingCeils={openingCeils}
      sameTouchPos={sameTouchPos}
      lastTouch={lastTouch}
      platform={platform}
      setWindowTitleWidth={setWindowTitleWidth}
      style={style}
      setStyle={setStyle}
      toggleMarks={toggleMarks}
      toggleSound={toggleSound}
      toggleXRay={toggleXRay}
      toggleGuaranteeZero={toggleGuaranteeZero}
      triggerUndo={triggerUndo}
      triggerHint={triggerHint}
      triggerDrone={triggerDrone}
      newRecordData={newRecordData}
      onSaveRecord={handleSaveRecord}
      scale={scale}
      setScale={setScale}
      totalSafe={totalSafe}
      safeRemaining={safeRemaining}
      isFullscreen={isFullscreen}
      toggleFullscreen={toggleFullscreen}
    />
  );
}

function genGameConfig(config) {
  const { rows, columns, mines } = config;
  const ceils = Array(rows * columns)
    .fill()
    .map(_ => ({
      state: 'cover',
      minesAround: 0,
      opening: false,
    }));
  return {
    rows,
    columns,
    ceils,
    mines,
  };
}

function insertMines(config, originCeils) {
  const { rows, columns, mines, exclude, guaranteeZero } = config;
  const ceils = originCeils.map(ceil => ({ ...ceil }));
  if (rows * columns !== ceils.length)
    throw new Error('rows and columns not equal to ceils');

  const indexArray = [...Array(rows * columns).keys()];
  const excludedSet = new Set([exclude]);

  if (guaranteeZero) {
    const near = getNearIndexes(exclude, rows, columns);
    if (indexArray.length - (near.length + 1) >= mines) {
      near.forEach(idx => excludedSet.add(idx));
    }
  }

  const allowed = indexArray.filter(i => !excludedSet.has(i));
  sampleSize(allowed, mines).forEach(chosen => {
    ceils[chosen].minesAround = -10;
    getNearIndexes(chosen, rows, columns).forEach(nearIndex => {
      ceils[nearIndex].minesAround += 1;
    });
  });

  return {
    rows,
    columns,
    ceils,
    mines,
  };
}

function autoCeils(state, index) {
  const { rows, columns } = state;
  const ceils = state.ceils.map(ceil => ({
    ...ceil,
    walked: false,
  }));
  return walkCeils(index);

  function walkCeils(index) {
    const ceil = ceils[index];
    if (ceil.walked || ceil.minesAround < 0 || ceil.state === 'flag') return [];
    ceil.walked = true;
    if (ceil.minesAround > 0) return [index];
    return [
      index,
      ...getNearIndexes(index, rows, columns).reduce(
        (lastIndexes, ceilIndex) => {
          return [...lastIndexes, ...walkCeils(ceilIndex)];
        },
        [],
      ),
    ];
  }
}

function getNearIndexes(index, rows, columns) {
  if (index < 0 || index >= rows * columns) return [];
  const row = Math.floor(index / columns);
  const column = index % columns;
  return [
    index - columns - 1,
    index - columns,
    index - columns + 1,
    index - 1,
    index + 1,
    index + columns - 1,
    index + columns,
    index + columns + 1,
  ].filter((_, arrayIndex) => {
    if (row === 0 && arrayIndex < 3) return false;
    if (row === rows - 1 && arrayIndex > 4) return false;
    if (column === 0 && [0, 3, 5].includes(arrayIndex)) return false;
    if (column === columns - 1 && [2, 4, 7].includes(arrayIndex)) return false;
    return true;
  });
}

function useTimer(status, sound) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let timer;
    switch (status) {
      case 'started':
        timer = setInterval(() => {
          setSeconds(sec => {
            const next = sec + 1;
            if (sound && next % 1 === 0) {
              playTick();
            }
            return next;
          });
        }, 1000);
        break;
      case 'new':
        setSeconds(0);
        break;
      default:
        break;
    }
    return () => clearInterval(timer);
  }, [status, sound]);

  return seconds;
}

export default MineSweeper;

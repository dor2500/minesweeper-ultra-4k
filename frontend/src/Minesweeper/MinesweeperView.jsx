import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import dead from '../assets/dead.png';
import smile from '../assets/smile.png';
import win from '../assets/win.png';
import ohh from '../assets/ohh.png';
import empty from '../assets/empty.png';
import open1 from '../assets/open1.png';
import open2 from '../assets/open2.png';
import open3 from '../assets/open3.png';
import open4 from '../assets/open4.png';
import open5 from '../assets/open5.png';
import open6 from '../assets/open6.png';
import open7 from '../assets/open7.png';
import open8 from '../assets/open8.png';
import flag from '../assets/flag.png';
import mine from '../assets/mine-ceil.png';
import mineDeath from '../assets/mine-death.png';
import misFlagged from '../assets/misflagged.png';
import question from '../assets/question.png';
import checked from '../assets/checked.png';
import digit0 from '../assets/digit0.png';
import digit1 from '../assets/digit1.png';
import digit2 from '../assets/digit2.png';
import digit3 from '../assets/digit3.png';
import digit4 from '../assets/digit4.png';
import digit5 from '../assets/digit5.png';
import digit6 from '../assets/digit6.png';
import digit7 from '../assets/digit7.png';
import digit8 from '../assets/digit8.png';
import digit9 from '../assets/digit9.png';
import digit_ from '../assets/digit-.png';

import { BrowserOpenURL, WindowSetSize } from '../../wailsjs/runtime';
import { BEGINNER_SIZE, EXPERT_SIZE, INTERMEDIATE_SIZE } from '../windowSizes';
import CustomGameModal from './CustomGameModal';
import BestTimesModal from './BestTimesModal';
import AboutModal from './AboutModal';
import NewRecordModal from './NewRecordModal';
import ArcadeBar from './ArcadeBar';
import { SvgFlag, SvgMine, SvgQuestion, VectorNumber } from './ModernIcons';

const digits = [
  digit0,
  digit1,
  digit2,
  digit3,
  digit4,
  digit5,
  digit6,
  digit7,
  digit8,
  digit9,
];

function renderDigits(number) {
  let numberStr;
  if (number < 0) {
    const _number = -number % 100;
    if (_number === 0) {
      numberStr = '00';
    } else if (_number < 10) {
      numberStr = '0' + _number;
    } else {
      numberStr = String(_number);
    }
    return (
      <>
        <img src={digit_} alt="-" />
        {numberStr.split('').map((n, i) => (
          <img src={digits[n]} key={i} alt={n} />
        ))}
      </>
    );
  }

  numberStr = number < 999 ? String(number) : '999';
  if (number < 10) numberStr = '00' + numberStr;
  else if (number < 100) numberStr = '0' + numberStr;
  return numberStr
    .split('')
    .map((n, i) => <img key={i} src={digits[n]} alt={n} />);
}

function MineSweeperView({
  ceils,
  className,
  changeCeilState,
  onReset,
  openCeil,
  openCeils,
  mines,
  status,
  seconds,
  onClose,
  difficulty,
  openingCeil,
  openingCeils,
  sameTouchPos,
  lastTouch,
  setWindowTitleWidth,
  style,
  setStyle,
  marks,
  toggleMarks,
  sound,
  toggleSound,
  xray,
  toggleXRay,
  guaranteeZero,
  toggleGuaranteeZero,
  triggerUndo,
  triggerHint,
  triggerDrone,
  shields,
  droneScans,
  safeRemaining,
  totalSafe,
  hintHighlight,
  history,
  rows,
  columns,
  newRecordData,
  onSaveRecord,
  scale,
  setScale,
  isFullscreen,
  toggleFullscreen,
}) {
  const face = useRef(null);
  const dropDown = useRef(null);
  const topBar = useRef(null);
  const [mouseDownContent, setMouseDownContent] = useState(false);
  const [openOption, setOpenOption] = useState(null);
  const [openBehavior, setOpenBehavior] = useState({ index: -1, behavior: '' });

  // Modals
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showBestTimesModal, setShowBestTimesModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const isModernTheme = style === 4 || style === 5;

  function remainMines() {
    return (
      mines -
      ceils.filter(ceil => ceil.state === 'flag' || ceil.state === 'misflagged')
        .length
    );
  }

  function statusFace() {
    if (mouseDownContent) return <img alt="ohh" src={ohh} />;
    switch (status) {
      case 'died':
        return <img alt="dead" src={dead} />;
      case 'won':
        return <img alt="win" src={win} />;
      default:
        return <img alt="smile" src={smile} />;
    }
  }

  function onMouseDownContent(e) {
    if (e.button !== 0) return;
    if (
      face.current.contains(e.target) ||
      status === 'won' ||
      status === 'died'
    )
      return;
    setMouseDownContent(true);
  }

  useEffect(() => {
    const { index, behavior } = openBehavior;
    switch (behavior) {
      case 'single':
        return openingCeil(index);
      case 'multi':
        return openingCeils(index);
      default:
        openingCeil(-1);
    }
  }, [openBehavior.index, openBehavior.behavior]);

  function onMouseDownCeils(e, index) {
    if (e.button === 4 || e.buttons === 3 || e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) {
      setOpenBehavior({
        index,
        behavior: 'multi',
      });
    } else if (e.button === 2) {
      changeCeilState(index);
    } else if (e.button === 0) {
      setOpenBehavior({
        index,
        behavior: 'single',
      });
    }
  }

  function onMouseOverCeils(index) {
    setOpenBehavior({
      index,
      behavior: openBehavior.behavior,
    });
  }

  function onMouseUpCeils() {
    const { behavior, index } = openBehavior;
    if (index === -1) return;
    if (behavior === 'single') {
      openCeil(index);
    } else if (behavior === 'multi') {
      openCeils(index);
    }
  }

  function hoverOption(option) {
    if (openOption) setOpenOption(option);
  }

  function onMouseUp(e) {
    setOpenBehavior({ index: -1, behavior: '' });
    setMouseDownContent(false);
    if (dropDown.current && !dropDown.current.contains(e.target)) setOpenOption('');
  }

  function onTouchEndDropdown(e) {
    if (
      dropDown.current &&
      !dropDown.current.contains(e.target) &&
      topBar.current &&
      !topBar.current.contains(e.target)
    )
      setOpenOption('');
  }

  function onTouchEndCeils(e) {
    const index = Array.prototype.indexOf.call(
      e.currentTarget.children,
      e.target.closest('.mine__ceil'),
    );
    if (index === -1 || !sameTouchPos) return;
    if (new Date() - lastTouch < 150) {
      if (ceils[index].state === 'open') {
        openCeils(index);
      } else {
        openCeil(index);
      }
    } else {
      changeCeilState(index);
    }
  }

  useEffect(() => {
    window.addEventListener('touchend', onTouchEndDropdown);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onTouchEndDropdown);
    };
  }, []);

  useEffect(() => {
    let width = 0;
    let height = 0;
    let windowTitleWidth = 0;

    const extraBottom = 40; // Space for ArcadeBar

    if (difficulty === 'Beginner') {
      width = Math.ceil(scale * (BEGINNER_SIZE.width + 10));
      height = Math.ceil(scale * (BEGINNER_SIZE.height + 110 + extraBottom));
      windowTitleWidth = BEGINNER_SIZE.width + 10;
    } else if (difficulty === 'Intermediate') {
      width = Math.ceil(scale * (INTERMEDIATE_SIZE.width + 10));
      height = Math.ceil(scale * (INTERMEDIATE_SIZE.height + extraBottom));
      windowTitleWidth = INTERMEDIATE_SIZE.width + 10;
    } else if (difficulty === 'Expert') {
      width = Math.ceil(scale * (EXPERT_SIZE.width + 10));
      height = Math.ceil(scale * (EXPERT_SIZE.height + extraBottom));
      windowTitleWidth = EXPERT_SIZE.width + 10;
    } else {
      const baseW = Math.max(185, columns * 16 + 32);
      const baseH = rows * 16 + 120 + extraBottom;
      width = Math.ceil(scale * baseW);
      height = Math.ceil(scale * baseH);
      windowTitleWidth = baseW;
    }

    if (openOption !== null) {
      if (difficulty === 'Beginner') {
        if (openOption === 'Game') {
          width = Math.max(width, Math.ceil(scale * 195));
          height = Math.max(height, Math.ceil(scale * 420));
        } else if (openOption === 'Help') {
          width = Math.max(width, Math.ceil(scale * 210));
          height = Math.max(height, Math.ceil(scale * 350));
        }
      }
    }

    WindowSetSize(width, height);
    setWindowTitleWidth(windowTitleWidth);
  }, [openOption, difficulty, scale, rows, columns]);

  useEffect(() => {
    const themeName = ['XP', '98', '3.1', 'Dark', 'Fluent', 'Cyberpunk'][style] || 'XP';
    document.getElementsByTagName('html')[0].setAttribute('data-theme', themeName);
  }, [style]);

  return (
    <div className={className} onContextMenu={e => e.preventDefault()}>
      {/* Dropdown Menus */}
      <div className="mine__drop-downs" ref={dropDown}>
        <div
          style={{ visibility: openOption === 'Game' ? 'visible' : 'hidden' }}
          className="mine__drop-down"
        >
          <div className="mine__drop-down__title">Game</div>
          <div className="mine__drop-down__menu">
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { onReset(); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check" />
              <div className="mine__drop-down__text">New</div>
              <span className="mine__drop-down__hot-key">F2</span>
              <div className="mine__drop-down__arrow" />
            </div>
            <div className="mine__drop-down__separator" />
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { onReset('Beginner'); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {difficulty === 'Beginner' && (
                  <img src={checked} alt="checked" />
                )}
              </div>
              <span>Beginner</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { onReset('Intermediate'); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {difficulty === 'Intermediate' && (
                  <img src={checked} alt="checked" />
                )}
              </div>
              <span>Intermediate</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { onReset('Expert'); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {difficulty === 'Expert' && <img src={checked} alt="checked" />}
              </div>
              <span>Expert</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setShowCustomModal(true); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {difficulty === 'Custom' && <img src={checked} alt="checked" />}
              </div>
              <span>Custom Field...</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div className="mine__drop-down__separator" />
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { triggerHint(); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check" />
              <div className="mine__drop-down__text">💡 Smart AI Hint</div>
              <span className="mine__drop-down__hot-key">H</span>
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { triggerDrone(); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check" />
              <div className="mine__drop-down__text">📡 Sonar Drone Scan</div>
              <span className="mine__drop-down__hot-key">D</span>
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { toggleXRay(); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {xray && <img src={checked} alt="checked" />}
              </div>
              <div className="mine__drop-down__text">⚡ X-Ray Radar</div>
              <span className="mine__drop-down__hot-key">X</span>
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              style={{ opacity: history && history.length > 0 ? 1 : 0.5 }}
              onMouseUp={() => { triggerUndo(); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check" />
              <div className="mine__drop-down__text">🛡️ Undo Move</div>
              <span className="mine__drop-down__hot-key">Ctrl+Z</span>
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={toggleGuaranteeZero}
            >
              <div className="mine__drop-down__check">
                {guaranteeZero && <img src={checked} alt="checked" />}
              </div>
              <span>Safe 1st Click</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div className="mine__drop-down__separator" />
            <div
              className="mine__drop-down__row"
              onMouseUp={toggleMarks}
            >
              <div className="mine__drop-down__check">
                {marks && <img src={checked} alt="checked" />}
              </div>
              <span>Marks (?)</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={toggleSound}
            >
              <div className="mine__drop-down__check">
                {sound && <img src={checked} alt="checked" />}
              </div>
              <span>Sound Effects</span>
              <span className="mine__drop-down__hot-key">S</span>
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setShowBestTimesModal(true); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check" />
              <span>Fastest Times...</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div className="mine__drop-down__separator" />
            <div className="mine__drop-down__row" onMouseUp={onClose}>
              <div className="mine__drop-down__check" />
              <span>Exit</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
          </div>
        </div>
        <div
          style={{ visibility: openOption === 'Help' ? 'visible' : 'hidden' }}
          className="mine__drop-down"
        >
          <div className="mine__drop-down__title">Help & Themes</div>
          <div className="mine__drop-down__menu">
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setStyle(4); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {style === 4 && <img src={checked} alt="checked" />}
              </div>
              <span>💎 Windows 11 Fluent 4K</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setStyle(5); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {style === 5 && <img src={checked} alt="checked" />}
              </div>
              <span>⚡ Cyberpunk Neon HUD</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setStyle(3); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {style === 3 && <img src={checked} alt="checked" />}
              </div>
              <span>🌙 XP Royale Noir (Dark)</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setStyle(0); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {style === 0 && <img src={checked} alt="checked" />}
              </div>
              <span>XP Luna Blue Classic</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setStyle(1); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {style === 1 && <img src={checked} alt="checked" />}
              </div>
              <span>Windows 98 Style</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setStyle(2); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {style === 2 && <img src={checked} alt="checked" />}
              </div>
              <span>Windows 3.1 Retro</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div className="mine__drop-down__separator" />
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setScale(1); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {scale === 1 && <img src={checked} alt="checked" />}
              </div>
              <span>100% Scale</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setScale(1.5); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {scale === 1.5 && <img src={checked} alt="checked" />}
              </div>
              <span>150% Scale</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setScale(2); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {scale === 2 && <img src={checked} alt="checked" />}
              </div>
              <span>200% Scale (2K/4K)</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setScale(2.5); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {scale === 2.5 && <img src={checked} alt="checked" />}
              </div>
              <span>250% Scale (Ultra 4K)</span>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
            <div className="mine__drop-down__separator" />
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { toggleFullscreen(); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check">
                {isFullscreen && <img src={checked} alt="checked" />}
              </div>
              <div className="mine__drop-down__text">Fullscreen Mode</div>
              <span className="mine__drop-down__hot-key">F11</span>
              <div className="mine__drop-down__arrow" />
            </div>
            <div
              className="mine__drop-down__row"
              onMouseUp={() => { setShowAboutModal(true); setOpenOption(''); }}
            >
              <div className="mine__drop-down__check" />
              <div className="mine__drop-down__text">About Ultra 4K...</div>
              <span className="mine__drop-down__hot-key" />
              <div className="mine__drop-down__arrow" />
            </div>
          </div>
        </div>
      </div>

      {/* Top Menu Bar */}
      <div className="mine__top-bar" ref={topBar}>
        <div
          onMouseDown={() => setOpenOption(openOption === 'Game' ? '' : 'Game')}
          onMouseOver={() => hoverOption('Game')}
          className="mine__top-bar__text"
        >
          Game
        </div>
        <div
          onMouseDown={() => setOpenOption(openOption === 'Help' ? '' : 'Help')}
          onMouseOver={() => hoverOption('Help')}
          className="mine__top-bar__text"
        >
          Help & Themes
        </div>
      </div>

      {/* Hint Message Bar */}
      {hintHighlight && (
        <div
          style={{
            backgroundColor:
              hintHighlight.type === 'safe'
                ? 'rgba(74, 222, 128, 0.2)'
                : hintHighlight.type === 'mine'
                ? 'rgba(248, 113, 113, 0.2)'
                : 'rgba(250, 204, 21, 0.2)',
            color:
              hintHighlight.type === 'safe'
                ? '#4ade80'
                : hintHighlight.type === 'mine'
                ? '#f87171'
                : '#facc15',
            padding: '4px 8px',
            fontSize: 10,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            textAlign: 'center',
            fontWeight: '600',
          }}
        >
          💡 {hintHighlight.reason}
        </div>
      )}

      {/* Main Play Area */}
      <section className="mine__content" onMouseDown={onMouseDownContent}>
        <div className="mine__score-bar">
          <div className="mine__digits__outer">
            {renderDigits(remainMines())}
          </div>
          <div className="mine__face__outer">
            <div ref={face} className="mine__face" onClick={() => onReset()}>
              {statusFace()}
              <img alt="smile" src={smile} />
            </div>
          </div>
          <div className="mine__digits__outer">{renderDigits(seconds)}</div>
        </div>
        <div
          className="mine__content__inner"
          style={{
            gridTemplateColumns: `repeat(${columns}, 16px)`,
            gridTemplateRows: `repeat(${rows}, 16px)`,
          }}
          onTouchEnd={onTouchEndCeils}
          onMouseUp={onMouseUpCeils}
        >
          <Ceils
            ceils={ceils}
            onMouseDown={onMouseDownCeils}
            onMouseEnter={onMouseOverCeils}
            xray={xray}
            hintHighlight={hintHighlight}
            isModernTheme={isModernTheme}
          />
        </div>

        {/* Bottom Modern Arcade Action Bar */}
        <ArcadeBar
          shields={shields}
          droneScans={droneScans}
          onUseDrone={triggerDrone}
          onHint={triggerHint}
          onUndo={triggerUndo}
          canUndo={history && history.length > 0}
          onToggleFullscreen={toggleFullscreen}
          isFullscreen={isFullscreen}
          safeRemaining={safeRemaining}
          totalSafe={totalSafe}
          scale={scale}
          onScaleChange={setScale}
        />
      </section>

      {/* Modals */}
      {showCustomModal && (
        <CustomGameModal
          initialConfig={{ rows, columns, mines }}
          onConfirm={(config) => {
            setShowCustomModal(false);
            onReset(config);
          }}
          onCancel={() => setShowCustomModal(false)}
        />
      )}

      {showBestTimesModal && (
        <BestTimesModal onClose={() => setShowBestTimesModal(false)} />
      )}

      {showAboutModal && (
        <AboutModal onClose={() => setShowAboutModal(false)} />
      )}

      {newRecordData && (
        <NewRecordModal
          difficulty={newRecordData.difficulty}
          seconds={newRecordData.seconds}
          onSave={onSaveRecord}
        />
      )}
    </div>
  );
}

function getTextImg(index) {
  return [empty, open1, open2, open3, open4, open5, open6, open7, open8][index];
}

function Ceils({ ceils, onMouseDown, onMouseEnter, xray, hintHighlight, isModernTheme }) {
  function renderContent(ceil, index) {
    const { state, minesAround, opening } = ceil;
    const isHinted = hintHighlight && hintHighlight.index === index;
    const hintClass = isHinted ? `hint-${hintHighlight.type}` : '';
    const showGhostMine = xray && minesAround < 0 && (state === 'cover' || state === 'unknown');

    if (isModernTheme) {
      // Razor-sharp 4K SVG vectors
      return (
        <div
          className={`${hintClass} ${state === 'open' ? 'modern-ceil-open' : 'modern-ceil-cover'}`}
          style={{
            width: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {state === 'open' && minesAround > 0 && <VectorNumber num={minesAround} />}
          {state === 'flag' && <SvgFlag />}
          {state === 'misflagged' && (
            <div style={{ position: 'relative' }}>
              <SvgFlag />
              <span style={{ position: 'absolute', top: -2, left: 1, color: '#ff0000', fontSize: 13, fontWeight: 'bold' }}>✕</span>
            </div>
          )}
          {state === 'mine' && <SvgMine />}
          {state === 'die' && <SvgMine isDeath={true} />}
          {state === 'unknown' && <SvgQuestion />}
          {showGhostMine && (
            <div style={{ position: 'absolute', top: 1, left: 1 }}>
              <SvgMine isGhost={true} />
            </div>
          )}
        </div>
      );
    }

    // Classic Retro Bitmap Textures
    let content;
    switch (state) {
      case 'open':
        content = <MinesAround mines={minesAround} />;
        break;
      case 'flag':
        content = <Flag />;
        break;
      case 'misflagged':
        content = <MisFlagged />;
        break;
      case 'mine':
        content = <Mine />;
        break;
      case 'die':
        content = <Die />;
        break;
      case 'unknown':
        content = opening ? <QuestionOpen /> : <Question />;
        break;
      default:
        content = opening ? <CeilBackgroundOpen /> : <CeilBackgroundCover />;
        break;
    }

    return (
      <div className={hintClass} style={{ width: '100%', height: '100%', position: 'relative' }}>
        {content}
        {showGhostMine && (
          <img alt="ghost-mine" src={mine} className="xray-mine" />
        )}
      </div>
    );
  }

  return ceils.map((ceil, index) => (
    <div
      key={index}
      onMouseEnter={() => onMouseEnter(index)}
      onMouseDown={e => onMouseDown(e, index)}
      className="mine__ceil"
      index={index}
    >
      {renderContent(ceil, index)}
    </div>
  ));
}

const Die = () => (
  <>
    <CeilBackgroundOpen />
    <img alt="death" src={mineDeath} />
  </>
);
const MisFlagged = () => (
  <>
    <CeilBackgroundOpen />
    <img alt="misFlagged" src={misFlagged} />
  </>
);
const Flag = () => (
  <>
    <CeilBackgroundCover />
    <img alt="flag" src={flag} />
  </>
);
const MinesAround = ({ mines }) => (
  <>
    <CeilBackgroundOpen />
    <img alt="mines-around" src={getTextImg(mines)} />
  </>
);
const Question = () => (
  <>
    <CeilBackgroundCover />
    <img alt="question" src={question} />
  </>
);
const QuestionOpen = () => (
  <>
    <CeilBackgroundOpen />
    <img alt="question" src={question} />
  </>
);
const Mine = () => (
  <>
    <CeilBackgroundOpen />
    <img alt="mine" src={mine} />
  </>
);

const CeilBackgroundCover = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  border-left: rgb(245, 245, 245) solid 2px;
  border-top: rgb(245, 245, 245) solid 2px;
  border-right: rgb(128, 128, 128) solid 2px;
  border-bottom: rgb(128, 128, 128) solid 2px;
`;
const CeilBackgroundOpen = styled.div`
  position: absolute;
  width: 16px;
  height: 16px;
  border-left: rgb(128, 128, 128) solid 1px;
  border-top: rgb(128, 128, 128) solid 1px;
`;

export default styled(MineSweeperView)`
  display: inline-block;
  img {
    pointer-events: none;
  }
  .mine__drop-downs {
    position: absolute;
    display: flex;
    height: 20px;
  }
  .mine__drop-down {
    position: relative;
    z-index: 20;
  }
  .mine__drop-down__title {
    padding: 0 5px;
    height: 100%;
    line-height: 20px;
    font-size: 11px;
    color: white;
    background-color: #1660e8;
  }
  .mine__drop-down__menu {
    position: absolute;
    box-sizing: border-box;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.45);
    min-width: 195px;
    background-color: #fff;
    font-size: 11px;
    line-height: 19px;
    padding: 2px 0;
    border: 1px solid #716f64;
    cursor: default;
  }
  .mine__drop-down__row {
    padding: 2px 12px 2px 4px;
    display: flex;
    align-items: center;
    &:hover {
      background-color: #1660e8;
      color: white;
    }
  }
  .mine__drop-down__separator {
    margin: 3px 1px;
    height: 1px;
    border-top: 1px solid #e2e3ea;
    border-bottom: 1px solid #ffffff;
  }
  .mine__drop-down__check {
    width: 16px;
    height: 16px;
    margin-right: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 12px;
      height: 12px;
    }
  }
  .mine__drop-down__arrow {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 3px 0 3px 4px;
    border-color: transparent transparent transparent black;
    margin-left: auto;
    visibility: hidden;
  }
  .mine__drop-down__hot-key {
    padding-left: 8px;
    margin-left: auto;
    font-size: 10px;
    opacity: 0.7;
  }
  .mine__drop-down__text {
    white-space: nowrap;
    text-decoration: none;
    color: inherit;
  }
  .mine__top-bar {
    position: relative;
    display: flex;
    height: 20px;
    background-color: rgb(236, 233, 216);
  }
  .mine__top-bar__text {
    padding: 0 6px;
    height: 100%;
    line-height: 20px;
    font-size: 11px;
    &:hover {
      color: #FFF;
      background-color: #0b61ff;
    }
  }
  .mine__content {
    border-left: rgb(245, 245, 245) solid 3px;
    border-top: rgb(245, 245, 245) solid 3px;
    background-color: rgb(192, 192, 192);
    padding: 6px;
  }
  .mine__score-bar {
    height: 34px;
    border-radius: 1px;
    border-top: rgb(128, 128, 128) solid 2px;
    border-left: rgb(128, 128, 128) solid 2px;
    border-right: rgb(245, 245, 245) solid 2px;
    border-bottom: rgb(245, 245, 245) solid 2px;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 3px 7px 3px 4px;
  }
  .mine__digits__outer {
    width: 40px;
    height: 24px;
    border-width: 0 1px 1px 0;
    border-style: solid;
    border-color: #fff;
    text-align: right;
  }
  .mine__face__outer {
    width: 24px;
    height: 24px;
    border-top: 1px solid rgb(128, 128, 128);
    border-left: 1px solid rgb(128, 128, 128);
    border-radius: 2px;
    transform: translateX(1px);
  }
  .mine__face {
    border-radius: 2px;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgb(192, 192, 192);
    border-width: 2px;
    border-style: solid;
    border-color: rgb(245, 245, 245) rgb(128, 128, 128) rgb(128, 128, 128)
      rgb(245, 245, 245);
    outline: none;
    &:active:hover {
      border-width: 1px;
      border-color: rgb(128, 128, 128);
      img {
        transform: translate(1px, 1px);
      }
      img:nth-child(1) {
        display: none;
      }
      img:nth-child(2) {
        display: block;
      }
    }
    img:nth-child(2) {
      display: none;
    }
  }
  .mine__content__inner {
    display: grid;
    border-top: rgb(128, 128, 128) solid 3px;
    border-left: rgb(128, 128, 128) solid 3px;
    border-right: rgb(245, 245, 245) solid 3px;
    border-bottom: rgb(245, 245, 245) solid 3px;
  }
  .mine__ceil {
    position: relative;
    img {
      position: absolute;
      width: 16px;
      height: 16px;
    }
  }
`;

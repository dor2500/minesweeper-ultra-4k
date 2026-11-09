export const Config = {
  Beginner: {
    rows: 9,
    columns: 9,
    ceils: 81,
    mines: 10,
  },
  Intermediate: {
    rows: 16,
    columns: 16,
    ceils: 256,
    mines: 40,
  },
  Expert: {
    rows: 16,
    columns: 30,
    ceils: 480,
    mines: 99,
  },
  Custom: {
    rows: 9,
    columns: 9,
    ceils: 81,
    mines: 10,
  },
};

export function getWindowSize(columns, rows, scale = 1) {
  // Cell size is 16px
  // Content padding: 12px left/right (6px border + 6px inner), plus window borders
  // Score bar height: ~37px + menus ~20px + title bar ~28px + borders ~20px
  const baseWidth = Math.max(160, columns * 16 + 24);
  const baseHeight = rows * 16 + 115;
  return {
    width: Math.ceil(baseWidth * scale),
    height: Math.ceil(baseHeight * scale),
    windowTitleWidth: baseWidth,
  };
}

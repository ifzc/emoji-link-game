// 游戏核心逻辑
export const createGameBoard = (size) => {
  const emojis = ['😀', '😎', '🥳', '😍', '🤔', '😴', '🤠', '😇', 
                  '🥶', '🤯', '🤩', '😋', '😜', '😅', '😭', '😱'];
  
  // 创建配对的emoji数组
  const pairs = [];
  const pairsCount = (size * size) / 2;
  
  for (let i = 0; i < pairsCount; i++) {
    const emoji = emojis[i % emojis.length];
    pairs.push(emoji, emoji);
  }
  
  // 随机打乱数组
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  
  // 创建二维数组
  const board = [];
  for (let i = 0; i < size; i++) {
    const row = [];
    for (let j = 0; j < size; j++) {
      row.push({
        emoji: pairs[i * size + j],
        isVisible: true,
        position: { row: i, col: j },
      });
    }
    board.push(row);
  }
  
  return board;
};

// 检查两点之间是否可以连接
export const canConnect = (board, start, end) => {
  if (start.emoji !== end.emoji) return { canConnect: false };
  if (start.position.row === end.position.row && 
      start.position.col === end.position.col) return { canConnect: false };

  // 检查直线连接
  if (checkStraightLine(board, start.position, end.position)) {
    return { 
      canConnect: true,
      corners: [] 
    };
  }
  
  // 检查一次折线
  const oneCornerResult = checkOneCorner(board, start.position, end.position);
  if (oneCornerResult.canConnect) {
    return {
      canConnect: true,
      corners: [oneCornerResult.corner]
    };
  }
  
  // 检查两次折线
  const twoCornerResult = checkTwoCorners(board, start.position, end.position);
  if (twoCornerResult.canConnect) {
    return {
      canConnect: true,
      corners: twoCornerResult.corners
    };
  }
  
  return { canConnect: false };
};

// 其他辅助函数...
const checkStraightLine = (board, start, end) => {
  // 同行检查
  if (start.row === end.row) {
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    
    for (let col = minCol + 1; col < maxCol; col++) {
      if (board[start.row][col].isVisible) {
        return false;
      }
    }
    return true;
  }
  
  // 同列检查
  if (start.col === end.col) {
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    
    for (let row = minRow + 1; row < maxRow; row++) {
      if (board[row][start.col].isVisible) {
        return false;
      }
    }
    return true;
  }
  
  return false;
};

const checkOneCorner = (board, start, end) => {
  // 检查两个可能的拐点
  const corner1 = { row: start.row, col: end.col };
  const corner2 = { row: end.row, col: start.col };
  
  // 检查第一个拐点
  if (!board[corner1.row][corner1.col].isVisible || 
      (corner1.row === end.row && corner1.col === end.col)) {
    if (checkStraightLine(board, start, corner1) && 
        checkStraightLine(board, corner1, end)) {
      return {
        canConnect: true,
        corner: corner1
      };
    }
  }
  
  // 检查第二个拐点
  if (!board[corner2.row][corner2.col].isVisible || 
      (corner2.row === end.row && corner2.col === end.col)) {
    if (checkStraightLine(board, start, corner2) && 
        checkStraightLine(board, corner2, end)) {
      return {
        canConnect: true,
        corner: corner2
      };
    }
  }
  
  return { canConnect: false };
};

const checkTwoCorners = (board, start, end) => {
  const size = board.length;
  
  // 检查所有可能的两次折线路径
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const corner = { row: i, col: j };
      
      // 跳过有方块的位置
      if (board[i][j].isVisible && 
          !(i === start.row && j === start.col) && 
          !(i === end.row && j === end.col)) {
        continue;
      }
      
      // 检查通过这个点的两次折线是否可行
      const oneCornerResult = checkOneCorner(board, start, corner);
      if (oneCornerResult.canConnect) {
        const twoCornerResult = checkOneCorner(board, corner, end);
        if (twoCornerResult.canConnect) {
          return {
            canConnect: true,
            corners: [oneCornerResult.corner, twoCornerResult.corner]
          };
        }
      }
    }
  }
  
  return { canConnect: false };
}; 
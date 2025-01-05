import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Alert, Dimensions } from 'react-native';
import { createGameBoard, canConnect } from '../utils/gameLogic';
import { LEVELS } from '../utils/levelConfig';
import EmojiTile from '../components/EmojiTile';
import ConnectionLine from '../components/ConnectionLine';

const windowWidth = Dimensions.get('window').width;

const GameScreen = ({ navigation }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [board, setBoard] = useState([]);
  const [selectedTile, setSelectedTile] = useState(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [connection, setConnection] = useState(null);
  const gridRef = useRef(null);

  const startNewGame = useCallback(() => {
    const level = LEVELS[currentLevel];
    const newBoard = createGameBoard(level.size, level.emojiCount);
    setBoard(newBoard);
    setScore(0);
    setSelectedTile(null);
    setTimeLeft(level.timeLimit);
  }, [currentLevel]);

  useEffect(() => {
    startNewGame();
  }, [currentLevel, startNewGame]);

  // 计时器
  useEffect(() => {
    if (timeLeft <= 0) {
      Alert.alert('时间到！', '游戏结束', [
        { text: '重试', onPress: startNewGame },
        { text: '返回', onPress: () => navigation.goBack() }
      ]);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(time => time - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigation, startNewGame]);

  const getTileCenter = (row, col) => {
    const tileSize = windowWidth / 8;
    const gridPadding = 10;
    
    return new Promise(resolve => {
      gridRef.current?.measure((x, y, width, height, pageX, pageY) => {
        resolve({
          x: pageX + gridPadding + col * (tileSize + 4) + tileSize / 2,
          y: pageY + gridPadding + row * (tileSize + 4) + tileSize / 2
        });
      });
    });
  };

  const handleTilePress = async (row, col) => {
    const tile = board[row][col];
    
    if (!tile.isVisible) return;
    
    if (!selectedTile) {
      setSelectedTile(tile);
      return;
    }
    
    if (selectedTile.position.row === row && 
        selectedTile.position.col === col) {
      setSelectedTile(null);
      return;
    }
    
    const result = canConnect(board, selectedTile, tile);
    if (result.canConnect) {
      try {
        const [startPos, endPos] = await Promise.all([
          getTileCenter(selectedTile.position.row, selectedTile.position.col),
          getTileCenter(row, col)
        ]);
        
        let cornerPositions = [];
        if (result.corners && result.corners.length > 0) {
          cornerPositions = await Promise.all(
            result.corners.map(corner => 
              getTileCenter(corner.row, corner.col)
            )
          );
        }

        setConnection({
          start: startPos,
          end: endPos,
          corners: cornerPositions
        });
        
        // 等待连线动画完成后再消除
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const newBoard = [...board];
        newBoard[selectedTile.position.row][selectedTile.position.col].isVisible = false;
        newBoard[row][col].isVisible = false;
        setBoard(newBoard);
        setScore(score + 10);
        
        if (checkGameComplete(newBoard)) {
          const level = LEVELS[currentLevel];
          if (score + 10 >= level.targetScore) {
            if (currentLevel < LEVELS.length - 1) {
              Alert.alert(
                '恭喜！',
                '关卡完成！是否进入下一关？',
                [
                  { text: '下一关', onPress: () => setCurrentLevel(currentLevel + 1) },
                  { text: '重玩本关', onPress: startNewGame }
                ]
              );
            } else {
              Alert.alert('恭喜！', '你已完成所有关卡！');
            }
          } else {
            Alert.alert('关卡未通过', '未达到目标分数，请重试！', [
              { text: '重试', onPress: startNewGame }
            ]);
          }
        }
        
        setConnection(null);
      } catch (error) {
        console.error('Error calculating positions:', error);
      }
    }
    
    setSelectedTile(null);
  };

  const checkGameComplete = (board) => {
    return board.every(row => 
      row.every(tile => !tile.isVisible)
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>第 {currentLevel + 1} 关</Text>
        <Text style={styles.timeText}>时间: {formatTime(timeLeft)}</Text>
        <Text style={styles.scoreText}>得分: {score}</Text>
      </View>
      
      <View style={styles.grid} ref={gridRef}>
        {board.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((tile, colIndex) => (
              <EmojiTile
                key={`${rowIndex}-${colIndex}`}
                emoji={tile.emoji}
                isVisible={tile.isVisible}
                isSelected={selectedTile?.position.row === rowIndex && 
                           selectedTile?.position.col === colIndex}
                onPress={() => handleTilePress(rowIndex, colIndex)}
              />
            ))}
          </View>
        ))}
        {connection && (
          <ConnectionLine
            start={connection.start}
            end={connection.end}
            corners={connection.corners}
            onAnimationComplete={() => setConnection(null)}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  grid: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 20,
  },
  levelText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 20,
    color: '#e74c3c',
  },
  scoreText: {
    fontSize: 20,
    color: '#2ecc71',
  },
});

export default GameScreen; 
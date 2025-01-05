import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ConnectionLine = ({ start, end, corners, onAnimationComplete }) => {
  const progress = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(200),
    ]).start(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    });
    
    return () => progress.setValue(0);
  }, [start, end]);

  if (!start || !end) return null;

  const getPathD = () => {
    let d = `M ${start.x} ${start.y}`;
    
    if (corners && corners.length > 0) {
      corners.forEach(corner => {
        d += ` L ${corner.x} ${corner.y}`;
      });
    }
    
    d += ` L ${end.x} ${end.y}`;
    return d;
  };

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width="100%" height="100%">
        <AnimatedPath
          d={getPathD()}
          stroke="#4CAF50"
          strokeWidth={3}
          strokeDasharray={[1, 1]}
          strokeOpacity={0.6}
          fill="none"
          strokeDashoffset={Animated.multiply(progress, -2)}
        />
      </Svg>
    </View>
  );
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

export default ConnectionLine; 
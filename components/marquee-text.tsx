import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing, StyleSheet, Dimensions } from 'react-native'

interface MarqueeProps {
  text: string;
  speed?: number;
}

export const MarqueeText: React.FC<MarqueeProps> = ({ text, speed = 0.05 }) => {
  const scrollX = useRef(new Animated.Value(0)).current;
  const textWidth = useRef(0);
  const containerWidth = Dimensions.get('window').width;

  useEffect(() => {
    const animate = () => {
      scrollX.setValue(containerWidth);
      Animated.timing(scrollX, {
        toValue: -textWidth.current,
        duration: textWidth.current / speed,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => animate());
    };

    animate();

    return () => {
      scrollX.stopAnimation();
    };
  }, [speed, scrollX]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.textContainer,
          {
            transform: [{ translateX: scrollX }],
          },
        ]}
      >
        <Text
          style={styles.text}
          numberOfLines={1}
          onLayout={(event) => {
            textWidth.current = event.nativeEvent.layout.width;
          }}
        >
          {text}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    width: '100%',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    position: 'absolute',
  },
  text: {
    color: 'black',
    fontSize: 14,
    fontWeight: '600',
    fontStyle: 'italic',
    paddingHorizontal: 16,
    flexShrink: 0,
  },
});
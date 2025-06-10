import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const ProgressBar = ({
  progress = 0,
  height = 8,
  backgroundColor = colors.progressBackground,
  fillColor = colors.progressFill,
  showPercentage = true,
  animated = true,
  duration = 500,
  style = {},
  textStyle = {},
}) => {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progress);
    }
  }, [progress, animated, duration]);

  const progressPercentage = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={[styles.container, style]}>
      {showPercentage && (
        <Text style={[styles.percentageText, textStyle]}>
          {Math.round(progressPercentage)}%
        </Text>
      )}
      
      <View style={[
        styles.progressBar,
        {
          height,
          backgroundColor,
        },
      ]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              height,
              backgroundColor: fillColor,
              width: animated 
                ? animatedWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                    extrapolate: 'clamp',
                  })
                : `${progressPercentage}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    borderRadius: spacing.borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: spacing.borderRadius.full,
  },
  percentageText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textLight,
    textAlign: 'right',
    marginBottom: spacing.xs,
  },
});

export default ProgressBar;
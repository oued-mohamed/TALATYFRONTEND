import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const Header = ({
  title,
  subtitle,
  leftIcon = 'arrow-back',
  rightIcon = null,
  onLeftPress,
  onRightPress,
  showBackButton = true,
  backgroundColor = colors.primary,
  textColor = colors.white,
  style = {},
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar backgroundColor={backgroundColor} barStyle="light-content" />
      <View style={[
        styles.container,
        { 
          backgroundColor,
          paddingTop: insets.top,
        },
        style,
      ]}>
        <View style={styles.content}>
          {/* Left section */}
          <View style={styles.leftSection}>
            {showBackButton && onLeftPress && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onLeftPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon name={leftIcon} size={24} color={textColor} />
              </TouchableOpacity>
            )}
          </View>

          {/* Center section */}
          <View style={styles.centerSection}>
            {title && (
              <Text style={[styles.title, { color: textColor }]} numberOfLines={1}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, { color: textColor }]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right section */}
          <View style={styles.rightSection}>
            {rightIcon && onRightPress && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={onRightPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {typeof rightIcon === 'string' ? (
                 <Icon name={rightIcon} size={24} color={textColor} />
                ) : (
                  rightIcon
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 56,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: spacing.xs,
    borderRadius: spacing.borderRadius.full,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.medium,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    fontFamily: typography.fontFamily.regular,
    textAlign: 'center',
    marginTop: spacing.xs / 2,
    opacity: 0.8,
  },
});

export default Header;
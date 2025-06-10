import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const { width, height } = Dimensions.get('window');

const Modal = ({
  visible,
  onClose,
  title,
  children,
  showCloseButton = true,
  closeOnBackdrop = true,
  animationType = 'slide',
  size = 'medium',
  style = {},
  contentStyle = {},
}) => {
  const handleBackdropPress = () => {
    if (closeOnBackdrop && onClose) {
      onClose();
    }
  };

  const getModalSize = () => {
    switch (size) {
      case 'small':
        return {
          width: width * 0.8,
          maxHeight: height * 0.4,
        };
      case 'large':
        return {
          width: width * 0.95,
          maxHeight: height * 0.9,
        };
      case 'fullscreen':
        return {
          width: width,
          height: height,
        };
      default: // medium
        return {
          width: width * 0.9,
          maxHeight: height * 0.7,
        };
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType={animationType}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={[
              styles.modalContainer,
              getModalSize(),
              style,
            ]}>
              {/* Header */}
              {(title || showCloseButton) && (
                <View style={styles.header}>
                  {title && (
                    <Text style={styles.title}>{title}</Text>
                  )}
                  {showCloseButton && (
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={onClose}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Icon name="close" size={24} color={colors.gray} />
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Content */}
              <View style={[styles.content, contentStyle]}>
                {children}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadius.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    fontFamily: typography.fontFamily.medium,
    color: colors.textDark,
  },
  closeButton: {
    padding: spacing.xs,
    marginLeft: spacing.md,
  },
  content: {
    padding: spacing.lg,
  },
});

export default Modal;
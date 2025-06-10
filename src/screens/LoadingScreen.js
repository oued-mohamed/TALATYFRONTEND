import React from 'react';
import { View, StyleSheet } from 'react-native';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { colors } from '../styles/colors';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <LoadingSpinner
        visible={true}
        overlay={false}
        text="Initialisation..."
        color={colors.secondary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingScreen;
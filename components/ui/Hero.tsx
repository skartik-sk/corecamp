import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import PrimaryButton from './PrimaryButton';
import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

export default function Hero({ subtitle }: { subtitle?: string }) {
  return (
    <View style={styles.container}>

      <Text style={styles.subtitle}>{subtitle || 'Turn any content into a tokenized IP asset and trade globally.'}</Text>
      {/* <View style={styles.actions}>
        <PrimaryButton title="Get Started" style={styles.primary} />
        <PrimaryButton title="Explore Marketplace" style={styles.secondary} />
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    marginBottom: 12,
  },
  subtitle: {
    color: Colors.brand['cool-1'],
    marginBottom: 18,
    fontSize: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  primary: {
    marginRight: 12,
    minWidth: 160,
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.brand['camp-orange'],
    borderRadius: 12,
    justifyContent: 'center',
  }
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { AppKitButton } from '@reown/appkit-wagmi-react-native';

export default function Header() {

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: 10}}>
        <ThemedText type="title">CoreCamp</ThemedText>
        <ThemedText type='mini'  >Create. Own. Register. Earn.</ThemedText>
      </View>
      <View style={[styles.actions, { flex: 1 }]}>
        <AppKitButton/>
       
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  link: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  linkText: {
    color: Colors.brand['cool-1'],
    fontWeight: '600',
  }
});

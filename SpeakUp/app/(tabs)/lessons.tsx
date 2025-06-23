import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

const words = [
  { id: '1', word: 'Hello', translation: 'Përshëndetje' },
  { id: '2', word: 'Thank you', translation: 'Faleminderit' },
  { id: '3', word: 'Goodbye', translation: 'Mirupafshim' },
  { id: '4', word: 'Please', translation: 'Të lutem' },
  { id: '5', word: 'Yes', translation: 'Po' },
  { id: '6', word: 'No', translation: 'Jo' },
];

export default function LessonsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={words}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.word}>{item.word}</Text>
            <Text style={styles.translation}>{item.translation}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, padding: 16},
  item: {
    backgroundColor: '#e0f7fa',
    padding: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
  word: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  translation: {
    fontSize: 16,
    color: '#00796b',
  },
});

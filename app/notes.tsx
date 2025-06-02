import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Alert, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotesScreen() {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem('notes');
      if (savedNotes) setNotes(JSON.parse(savedNotes));
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNote = async () => {
    if (!note.trim()) {
      Alert.alert('Error', 'Please enter a note.');
      return;
    }
    try {
      const updatedNotes = [...notes, note];
      await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
      setNote('');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const deleteNote = async (index: number) => {
    const updatedNotes = notes.filter((_, i) => i !== index);
    await AsyncStorage.setItem('notes', JSON.stringify(updatedNotes));
    setNotes(updatedNotes);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Notes</Text>
      <LinearGradient
        colors={['#e6e6fa', '#f5f5f5']}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Write a note..."
          placeholderTextColor="#888"
          value={note}
          onChangeText={setNote}
          multiline
        />
      </LinearGradient>
      <Pressable onPress={saveNote}>
        <LinearGradient
          colors={['#6200ea', '#8a4af3']}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Save Note</Text>
        </LinearGradient>
      </Pressable>
      <FlatList
        data={notes}
        renderItem={({ item, index }) => (
          <View style={styles.noteItem}>
            <Text style={styles.noteText}>{item}</Text>
            <Pressable onPress={() => deleteNote(index)}>
              <LinearGradient
                colors={['#b00020', '#e63946']}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </LinearGradient>
            </Pressable>
          </View>
        )}
        keyExtractor={(_, index) => index.toString()}
        style={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // Semi-transparent white background
    borderRadius: 15,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8, // For Android shadow
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1e1e1e', // Darker color for contrast
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 2, // Padding for gradient border effect
  },
  input: {
    borderWidth: 0,
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // Slightly more opaque for input
    color: '#1e1e1e',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#6200ea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  noteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.9)', // Light gray background for notes
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  noteText: {
    fontSize: 16,
    flex: 1,
    color: '#1e1e1e',
    lineHeight: 22,
  },
  deleteButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
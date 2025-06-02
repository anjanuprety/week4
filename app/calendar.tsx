import { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, Pressable, Platform, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

interface Event {
  date: string;
  description: string;
}

export default function CalendarScreen() {
  const [eventDate, setEventDate] = useState<Date>(new Date());
  const [eventDesc, setEventDesc] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const savedEvents = await AsyncStorage.getItem('events');
      if (savedEvents) setEvents(JSON.parse(savedEvents));
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const addEvent = async () => {
    if (!eventDesc.trim()) {
      Alert.alert('Error', 'Please enter an event description.');
      return;
    }
    try {
      const formattedDate = eventDate.toISOString().split('T')[0];
      const newEvent = { date: formattedDate, description: eventDesc };
      const updatedEvents = [...events, newEvent];
      await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
      setEvents(updatedEvents);
      setEventDesc('');
      setEventDate(new Date());
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const deleteEvent = async (index: number) => {
    const updatedEvents = events.filter((_, i) => i !== index);
    await AsyncStorage.setItem('events', JSON.stringify(updatedEvents));
    setEvents(updatedEvents);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || eventDate;
    setShowDatePicker(Platform.OS === 'ios');
    setEventDate(currentDate);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calendar Events</Text>
      <Pressable onPress={() => setShowDatePicker(true)}>
        <LinearGradient
          colors={['#6200ea', '#8a4af3']}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Select Date: {eventDate.toISOString().split('T')[0]}</Text>
        </LinearGradient>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={eventDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <LinearGradient
        colors={['#e6e6fa', '#f5f5f5']}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Event Description"
          placeholderTextColor="#888"
          value={eventDesc}
          onChangeText={setEventDesc}
        />
      </LinearGradient>
      <Pressable onPress={addEvent}>
        <LinearGradient
          colors={['#6200ea', '#8a4af3']}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Add Event</Text>
        </LinearGradient>
      </Pressable>
      <FlatList
        data={events}
        renderItem={({ item, index }) => (
          <View style={styles.eventItem}>
            <Text style={styles.eventText}>{`${item.date}: ${item.description}`}</Text>
            <Pressable onPress={() => deleteEvent(index)}>
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 15,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1e1e1e',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    borderRadius: 10,
    marginBottom: 15,
    padding: 2,
  },
  input: {
    borderWidth: 0,
    borderRadius: 8,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#1e1e1e',
    fontSize: 16,
    textAlignVertical: 'top',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 10,
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
  eventItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  eventText: {
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
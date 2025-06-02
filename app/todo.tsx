import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Alert, Pressable, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

interface Todo {
  task: string;
  deadline: string;
}

export default function TodoScreen() {
  const [task, setTask] = useState('');
  const [deadlineDate, setDeadlineDate] = useState<Date>(new Date());
  const [deadlineTime, setDeadlineTime] = useState<Date>(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    try {
      const savedTodos = await AsyncStorage.getItem('todos');
      if (savedTodos) setTodos(JSON.parse(savedTodos));
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  };

  const addTodo = async () => {
    if (!task.trim()) {
      Alert.alert('Error', 'Please enter a task.');
      return;
    }
    try {
      const formattedDateTime = `${deadlineDate.toISOString().split('T')[0]} ${deadlineTime.toTimeString().slice(0, 5)}`;
      const newTodo = { task, deadline: formattedDateTime };
      const updatedTodos = [...todos, newTodo];
      await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
      setTodos(updatedTodos);
      setTask('');
      setDeadlineDate(new Date());
      setDeadlineTime(new Date());
    } catch (error) {
      console.error('Error saving todo:', error);
    }
  };

  const deleteTodo = async (index: number) => {
    const updatedTodos = todos.filter((_, i) => i !== index);
    await AsyncStorage.setItem('todos', JSON.stringify(updatedTodos));
    setTodos(updatedTodos);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || deadlineDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDeadlineDate(currentDate);
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || deadlineTime;
    setShowTimePicker(Platform.OS === 'ios');
    setDeadlineTime(currentTime);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>To-Do List</Text>
      <LinearGradient
        colors={['#e6e6fa', '#f5f5f5']}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          placeholder="Add a task..."
          placeholderTextColor="#888"
          value={task}
          onChangeText={setTask}
        />
      </LinearGradient>
      <Pressable onPress={() => setShowDatePicker(true)}>
        <LinearGradient
          colors={['#6200ea', '#8a4af3']}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Select Date: {deadlineDate.toISOString().split('T')[0]}</Text>
        </LinearGradient>
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={deadlineDate}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
      <Pressable onPress={() => setShowTimePicker(true)}>
        <LinearGradient
          colors={['#6200ea', '#8a4af3']}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Select Time: {deadlineTime.toTimeString().slice(0, 5)}</Text>
        </LinearGradient>
      </Pressable>
      {showTimePicker && (
        <DateTimePicker
          value={deadlineTime}
          mode="time"
          display="default"
          onChange={onTimeChange}
        />
      )}
      <Pressable onPress={addTodo}>
        <LinearGradient
          colors={['#6200ea', '#8a4af3']}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Add Task</Text>
        </LinearGradient>
      </Pressable>
      <FlatList
        data={todos}
        renderItem={({ item, index }) => (
          <View style={styles.todoItem}>
            <Text style={styles.todoText}>{`${item.task} (Due: ${item.deadline})`}</Text>
            <Pressable onPress={() => deleteTodo(index)}>
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
  todoItem: {
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
  todoText: {
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
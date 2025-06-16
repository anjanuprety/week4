import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Alert, Pressable, ActivityIndicator } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCAPmxbbQYb__P8gQmwAzKMKpCSCn6Wg64",
  authDomain: "week6-2f2db.firebaseapp.com",
  projectId: "week6-2f2db",
  storageBucket: "week6-2f2db.appspot.com",
  messagingSenderId: "1079717584950",
  appId: "1:1079717584950:web:4aa65692fabd7fc0403897",
  measurementId: "G-FG9XYBPDEB"
};

// Initialize Firebase with error handling
let app: ReturnType<typeof initializeApp> | undefined;
let db: ReturnType<typeof getFirestore> | undefined;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

interface Todo {
  id: string;
  task: string;
  completed: boolean;
  createdAt: Date;
}

export default function TodoScreen() {
  const [task, setTask] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load todos from Firestore
  useEffect(() => {
    // Check if Firebase is properly initialized
    if (!db) {
      setError('Firebase not initialized properly');
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, 'todos'),
      (snapshot) => {
        try {
          const todoList: Todo[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            todoList.push({
              id: doc.id,
              task: data.task,
              completed: data.completed || false,
              createdAt: data.createdAt && data.createdAt.toDate ? data.createdAt.toDate() : new Date()
            });
          });
          // Sort by creation date (newest first)
          todoList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
          setTodos(todoList);
          setLoading(false);
          setError(null);
        } catch (err) {
          console.error('Error processing todos:', err);
          setError('Error loading todos');
          setLoading(false);
        }
      },
      (err) => {
        console.error('Firestore listener error:', err);
        setError('Failed to connect to database');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addTodo = async () => {
    if (!task.trim()) {
      Alert.alert('Error', 'Please enter a task');
      return;
    }

    if (!db) {
      Alert.alert('Error', 'Database not available');
      return;
    }

    try {
      await addDoc(collection(db, 'todos'), {
        task: task.trim(),
        completed: false,
        createdAt: Timestamp.now()
      });
      setTask('');
    } catch (error) {
      console.error('Error adding todo:', error);
      Alert.alert('Error', 'Failed to add todo');
    }
  };

  const deleteTodo = async (id: string) => {
    if (!db) {
      Alert.alert('Error', 'Database not available');
      return;
    }

    try {
      await deleteDoc(doc(db, 'todos', id));
    } catch (error) {
      console.error('Error deleting todo:', error);
      Alert.alert('Error', 'Failed to delete todo');
    }
  };

  const toggleComplete = async (id: string, currentStatus: boolean) => {
    if (!db) {
      Alert.alert('Error', 'Database not available');
      return;
    }

    try {
      await updateDoc(doc(db, 'todos', id), {
        completed: !currentStatus
      });
    } catch (error) {
      console.error('Error updating todo:', error);
      Alert.alert('Error', 'Failed to update todo');
    }
  };

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Todo List</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Pressable 
            style={styles.retryButton} 
            onPress={() => {
              setError(null);
              setLoading(true);
              // Trigger re-render to retry Firebase connection
            }}
          >
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo List</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={task}
          onChangeText={setTask}
          onSubmitEditing={addTodo}
        />
        <Pressable onPress={addTodo} style={styles.addButton}>
          <Text style={styles.buttonText}>Add</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ea" />
          <Text style={styles.loadingText}>Loading todos...</Text>
        </View>
      ) : (
        <FlatList
          data={todos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.todoItem, item.completed && styles.completedTodo]}>
              <Pressable 
                onPress={() => toggleComplete(item.id, item.completed)}
                style={styles.todoTextContainer}
              >
                <Text style={[styles.todoText, item.completed && styles.completedText]}>
                  {item.task}
                </Text>
                <Text style={styles.todoDate}>
                  {item.createdAt.toLocaleDateString()}
                </Text>
              </Pressable>
              <Pressable 
                onPress={() => deleteTodo(item.id)}
                style={styles.deleteButton}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </Pressable>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No todos yet. Add one above!</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    backgroundColor: '#fff',
  },
  addButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  completedTodo: {
    opacity: 0.6,
    backgroundColor: '#f0f0f0',
  },
  todoTextContainer: {
    flex: 1,
  },
  todoText: {
    fontSize: 16,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  todoDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  deleteButton: {
    backgroundColor: '#ff4444',
    padding: 8,
    borderRadius: 5,
  },
  deleteText: {
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6200ea',
    padding: 10,
    borderRadius: 5,
  },
});
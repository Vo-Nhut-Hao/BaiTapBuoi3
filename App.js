import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  TextInput,
  FlatList,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function App() {
  const [task, setTask] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(''); // State for task status
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const [isPortrait, setIsPortrait] = useState(screenHeight > screenWidth);

  useEffect(() => {
    const updateDimensions = () => {
      setIsPortrait(screenHeight > screenWidth);
    };

    updateDimensions();
  }, [screenWidth, screenHeight]);

  const addTask = () => {
    if (task.trim().length === 0 || taskTime.trim().length === 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập nội dung công việc và thời gian');
      return;
    }

    // Convert taskTime to a Date object
    const [hours, minutes] = taskTime.split(':').map(Number);
    const taskDate = new Date();
    taskDate.setHours(hours || 0, minutes || 0);

    if (editingTaskId) {
      // Update existing task
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(t =>
          t.id === editingTaskId
            ? { ...t, value: task, time: taskDate, status: selectedStatus }
            : t
        );
        updatedTasks.sort((a, b) => a.time - b.time); // Sort tasks by time
        return updatedTasks;
      });
      setEditingTaskId(null);
      setSelectedStatus(''); // Reset selected status
      Alert.alert('Thông báo', 'Công việc đã được cập nhật.');
    } else {
      // Add new task
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks, { id: Math.random().toString(), value: task, time: taskDate, status: selectedStatus }];
        updatedTasks.sort((a, b) => a.time - b.time); // Sort tasks by time
        return updatedTasks;
      });
      setSelectedStatus(''); // Reset selected status
      Alert.alert('Thông báo', 'Công việc đã được thêm.');
    }

    setTask('');
    setTaskTime('');
  };

  const clearTasks = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa tất cả công việc?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', onPress: () => {
        setTasks([]);
        Alert.alert('Thông báo', 'Tất cả công việc đã được xóa.');
      }},
    ]);
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDateTimePicker(false);
    setSelectedDate(currentDate);
    setTaskTime(currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const filteredTasks = tasks.filter(task => 
    task.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).includes(searchQuery)
  );

  const handleTaskPress = (task) => {
    Alert.alert('Tùy chọn', `Chọn một hành động cho công việc: "${task.value}"`, [
      {
        text: 'Sửa',
        onPress: () => {
          setEditingTaskId(task.id);
          setTask(task.value);
          setTaskTime(task.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          setSelectedStatus(task.status); // Set status for editing
        },
      },
      {
        text: 'Xóa',
        onPress: () => deleteTask(task.id),
      },
      {
        text: 'Trạng thái',
        onPress: () => {
          Alert.alert('Chọn trạng thái', 'Chọn trạng thái cho công việc:', [
            {
              text: 'Quan trọng',
              onPress: () => updateTaskStatus(task.id, 'important'),
              style: 'destructive',
            },
            {
              text: 'Đã hoàn thành',
              onPress: () => updateTaskStatus(task.id, 'completed'),
              style: 'default',
            },
            {
              text: 'Hủy',
              style: 'cancel',
            },
          ]);
        },
      },
      {
        text: 'Hủy',
        style: 'cancel',
      },
    ]);
  };

  const updateTaskStatus = (id, status) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(t =>
        t.id === id ? { ...t, status: status === 'important' ? 'important' : 'completed' } : t
      );
      Alert.alert('Thông báo', `Trạng thái công việc đã được cập nhật thành: ${status === 'important' ? 'Quan trọng' : 'Đã hoàn thành'}`);
      return updatedTasks;
    });
  };

  const deleteTask = (id) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.filter(task => task.id !== id);
      Alert.alert('Thông báo', 'Công việc đã được xóa.');
      return updatedTasks;
    });
  };

  const buttonStyle = {
    width: screenWidth / (isPortrait ? 1 : 2) - 20,
  };

  const imageStyle = {
    width: screenWidth * 0.8,
    height: screenWidth * 0.8 * 0.6,
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar
        backgroundColor={isPortrait ? 'blue' : 'green'}
        barStyle={isPortrait ? 'light-content' : 'dark-content'}
      />

      <View style={styles.topSection}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.imageContainer}>
            <Image
              style={imageStyle}
              source={require('./assets/lichdebankemghichu3.jpg')}
            />
            <Text style={styles.title}>Quản lý Công Việc</Text>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm công việc hoặc thời gian..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          <View style={[styles.buttonContainer, isPortrait ? styles.vertical : styles.horizontal]}>
            <View style={[styles.button, buttonStyle]}>
              <Button title={editingTaskId ? "Lưu Công Việc" : "Thêm Công Việc"} onPress={addTask} />
            </View>
            <View style={[styles.button, buttonStyle]}>
              <Button title="Xóa Tất Cả" onPress={clearTasks} />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập công việc..."
              value={task}
              onChangeText={setTask}
            />

            <TouchableOpacity onPress={() => setShowDateTimePicker(true)} style={styles.timePickerButton}>
              <Text style={styles.timePickerText}>{taskTime || 'Chọn thời gian'}</Text>
            </TouchableOpacity>

            {showDateTimePicker && (
              <DateTimePicker
                mode="time"
                value={selectedDate}
                display="spinner"
                onChange={handleDateChange}
              />
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.bottomSection}>
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleTaskPress(item)} style={[styles.taskItem, item.status === 'important' ? styles.important : item.status === 'completed' ? styles.completed : null]}>
              <Text>{`${item.value} - ${item.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={[
            styles.flatListContainer,
            { flexDirection: isPortrait ? 'column' : 'row' }
          ]}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  topSection: {
    flex: 7,
    padding: 10,
  },
  bottomSection: {
    flex: 3,
    padding: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: '100%',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  vertical: {
    flexDirection: 'column',
  },
  horizontal: {
    flexDirection: 'row',
  },
  button: {
    marginHorizontal: 10,
    marginVertical: 5,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  timePickerButton: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  timePickerText: {
    fontSize: 16,
  },
  taskItem: {
    padding: 15,
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  important: {
    backgroundColor: 'red',
  },
  completed: {
    backgroundColor: 'green',
  },
  flatListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

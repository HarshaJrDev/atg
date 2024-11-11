import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { Dialog, Portal, Button, Provider, TextInput as PaperTextInput } from 'react-native-paper';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

const PillManagementApp = () => {
  const [medications, setMedications] = useState([]);
  const [newMedicationName, setNewMedicationName] = useState('');
  const [newMedicationDosage, setNewMedicationDosage] = useState('');
  const [newMedicationFrequency, setNewMedicationFrequency] = useState('');
  const [newMedicationTime, setNewMedicationTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [editingMedicationIndex, setEditingMedicationIndex] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }, []);

  const addMedication = async () => {
    if (newMedicationName && newMedicationDosage && newMedicationFrequency) {
      const newMedication = {
        name: newMedicationName,
        dosage: newMedicationDosage,
        frequency: newMedicationFrequency,
        time: newMedicationTime.toTimeString().slice(0, 5), // Format as HH:MM
      };
      setMedications([...medications, newMedication]);
      await scheduleNotification(newMedicationName, newMedicationTime);
      clearNewMedicationForm();
    } else {
      Alert.alert("Error", "Please fill in all the fields.");
    }
  };

  const editMedication = (index) => {
    setEditingMedicationIndex(index);
    const medication = medications[index];
    setNewMedicationName(medication.name);
    setNewMedicationDosage(medication.dosage);
    setNewMedicationFrequency(medication.frequency);
    setNewMedicationTime(new Date());
    setVisible(true);
  };

  const saveMedicationEdit = () => {
    const updatedMedications = [...medications];
    updatedMedications[editingMedicationIndex] = {
      name: newMedicationName,
      dosage: newMedicationDosage,
      frequency: newMedicationFrequency,
      time: newMedicationTime.toTimeString().slice(0, 5),
    };
    setMedications(updatedMedications);
    setEditingMedicationIndex(null);
    clearNewMedicationForm();
    setVisible(false);
  };

  const deleteMedication = (index) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const scheduleNotification = async (medicationName, medicationTime) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Medication Reminder",
        body: `It's time to take your ${medicationName}.`,
      },
      trigger: { seconds: Math.max((medicationTime.getTime() - new Date().getTime()) / 1000, 1) },
    });
  };

  const clearNewMedicationForm = () => {
    setNewMedicationName('');
    setNewMedicationDosage('');
    setNewMedicationFrequency('');
    setNewMedicationTime(new Date());
  };

  const handleTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || newMedicationTime;
    setShowTimePicker(false);
    setNewMedicationTime(currentDate);
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Text style={styles.title}>Pill Management</Text>
        <PaperTextInput
          label="Medication Name"
          value={newMedicationName}
          onChangeText={setNewMedicationName}
          mode="outlined"
          style={styles.input}
        />
        <PaperTextInput
          label="Dosage"
          value={newMedicationDosage}
          onChangeText={setNewMedicationDosage}
          mode="outlined"
          style={styles.input}
        />
        <PaperTextInput
          label="Frequency"
          value={newMedicationFrequency}
          onChangeText={setNewMedicationFrequency}
          mode="outlined"
          style={styles.input}
        />
        <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timePickerButton}>
          <Text style={styles.timePickerText}>
            Set Time: {newMedicationTime.toTimeString().slice(0, 5)}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={newMedicationTime}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
          />
        )}
        <TouchableOpacity style={styles.button} onPress={addMedication}>
          <Text style={styles.buttonText}>Add Medication</Text>
        </TouchableOpacity>

        <FlatList
          data={medications}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.medicationItem}>
              <View style={styles.medicationDetails}>
                <Text style={styles.medicationName}>{item.name}</Text>
                <Text style={styles.medicationInfo}>
                  Dosage: {item.dosage} | Frequency: {item.frequency} | Time: {item.time}
                </Text>
              </View>
              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => editMedication(index)}>
                  <Feather name="edit" size={24} color="blue" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteMedication(index)}>
                  <Feather name="trash-2" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <Portal>
          <Dialog visible={visible} onDismiss={() => setVisible(false)}>
            <Dialog.Title>Edit Medication</Dialog.Title>
            <Dialog.Content>
              <PaperTextInput
                label="Medication Name"
                value={newMedicationName}
                onChangeText={setNewMedicationName}
                mode="outlined"
              />
              <PaperTextInput
                label="Dosage"
                value={newMedicationDosage}
                onChangeText={setNewMedicationDosage}
                mode="outlined"
              />
              <PaperTextInput
                label="Frequency"
                value={newMedicationFrequency}
                onChangeText={setNewMedicationFrequency}
                mode="outlined"
              />
              <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.timePickerButton}>
                <Text style={styles.timePickerText}>Set Time: {newMedicationTime.toTimeString().slice(0, 5)}</Text>
              </TouchableOpacity>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={saveMedicationEdit}>Save</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  medicationDetails: {
    flex: 1,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  medicationInfo: {
    fontSize: 14,
    color: '#666',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timePickerButton: {
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  timePickerText: {
    color: '#333',
    fontSize: 16,
  },
});

export default PillManagementApp;

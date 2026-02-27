//---------------------Imports------------------------
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Button,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal
} from 'react-native';
import { TimeFilter, getSessionsGroupedBySlot } from './useTimeFilter';

export default function Index() {

  // -------------------- State --------------------
  const [sessions, setSessions] = useState<any[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

  // Use Date objects for web time inputs
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  const [selectedCourse, setSelectedCourse] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);

  //---------------------------Define subjects---------------------------
  const subjects = [
    "Computer Science",
    "Math",
    "Biology",
    "Chemistry"
  ];

  const filteredSubjects = subjects.filter(subject =>
    subject.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  // -------------------- Fetch Logic --------------------
  const loadSessions = async () => {
    if (!selectedSubject) return;

    setLoading(true);

    const formatTime = (date: Date) =>
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const grouped = await getSessionsGroupedBySlot(
      timeFilter,
      formatTime(startTime),
      formatTime(endTime),
      selectedCourse || undefined,
      selectedSubject
    );

    const flattened = Object.values(grouped).flat();

    setGroupedSessions(grouped);
    setSessions(flattened);

    setLoading(false);
  };

  //Clear all old filters
  const clearFilters = () => {
    setSelectedSubject('');
    setSelectedCourse('');
    setStartTime(new Date());
    setEndTime(new Date());
    setSessions([]);
    setGroupedSessions({});
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // -------------------- Helper for HTML time inputs --------------------
  const handleTimeChange = (setter: React.Dispatch<React.SetStateAction<Date>>, value: string) => {
    const [hours, minutes] = value.split(':');
    const newDate = new Date();
    newDate.setHours(Number(hours));
    newDate.setMinutes(Number(minutes));
    setter(newDate);
  };

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.header}>
        Time Filter & Priority Testing
      </Text>

      {/* Time Filters */}
      <View style={styles.buttonGroup}>
        <Button title="Today" onPress={() => setTimeFilter('today')} />
        <Button title="Next 24 Hours" onPress={() => setTimeFilter('next_24_hours')} />
        <Button title="This Week" onPress={() => setTimeFilter('this_week')} />
      </View>

      {/* Time Inputs using web HTML inputs */}
      <Text style={styles.label}>Start Time</Text>
      <input
        type="time"
        value={startTime.toTimeString().slice(0, 5)}
        onChange={(e) => handleTimeChange(setStartTime, e.target.value)}
        style={styles.webTimeInput}
      />

      <Text style={styles.label}>End Time</Text>
      <input
        type="time"
        value={endTime.toTimeString().slice(0, 5)}
        onChange={(e) => handleTimeChange(setEndTime, e.target.value)}
        style={styles.webTimeInput}
      />

      {/* Subject (Required) */}
      <Text style={styles.label}>Subject</Text>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setSubjectModalVisible(true)}
      >
        <Text>{selectedSubject || "Select a subject..."}</Text>
      </TouchableOpacity>

      {!selectedSubject && <Text style={styles.errorText}>Subject is required</Text>}

      {/* Course (Optional) */}
      <Text style={styles.label}>Course (optional)</Text>
      <TextInput
        value={selectedCourse}
        onChangeText={setSelectedCourse}
        style={styles.input}
      />

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <Button
          title="Run Test"
          onPress={loadSessions}
          disabled={!selectedSubject}
        />
        <Button title="Clear" onPress={clearFilters} />
      </View>

      {/* Loading */}
      {loading && <Text style={styles.loadingText}>Searching sessions...</Text>}

      {/* Results */}
      {!loading && (
        <>
          <Text style={styles.resultsHeader}>Sessions Found: {sessions.length}</Text>

          {sessions.length === 0 && <Text style={styles.emptyText}>No matching sessions found.</Text>}

          {sessions.map((s) => (
            <View key={s.id} style={styles.card}>
              <Text style={styles.name}>{s.profiles.first_name} {s.profiles.last_name}</Text>
              <Text>📘 {s.subject}</Text>
              <Text>🕒 {s.start_time} - {s.end_time}</Text>
              <Text>📍 {s.location}</Text>
            </View>
          ))}
        </>
      )}

      {/* Grouped Output */}
      <Text style={styles.groupHeader}>Grouped By 30-Min Slot</Text>

      {Object.keys(groupedSessions).map((slot) => (
        <View key={slot} style={styles.slotContainer}>
          <Text style={styles.slotTitle}>Slot: {slot}</Text>
          {groupedSessions[slot].map((s: any) => (
            <Text key={s.id}>
              - {s.profiles.first_name} {s.profiles.last_name} ({s.subject} | {s.course})
            </Text>
          ))}
        </View>
      ))}

      {/* Subject Modal */}
      <Modal visible={subjectModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            <TextInput
              placeholder="Search subjects..."
              value={subjectSearch}
              onChangeText={setSubjectSearch}
              style={styles.input}
            />

            {filteredSubjects.map((subject, index) => (
              <TouchableOpacity
                key={index}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedSubject(subject);
                  setSubjectModalVisible(false);
                  setSubjectSearch('');
                }}
              >
                <Text>{subject}</Text>
              </TouchableOpacity>
            ))}

            {filteredSubjects.length === 0 && (
              <Text style={{ marginTop: 10, fontStyle: 'italic' }}>No subjects found</Text>
            )}

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setSubjectModalVisible(false)}
            >
              <Text style={{ color: 'red' }}>Cancel</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f9fa'
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15
  },
  label: {
    fontWeight: '600',
    marginBottom: 5
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginBottom: 15,
    backgroundColor: '#fff'
  },
  webTimeInput: {
    padding: 8,
    marginBottom: 15,
    borderRadius: 8,
    //border: '1px solid #ccc'
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fff'
  },
  buttonGroup: { marginBottom: 15 },
  errorText: { color: 'red', marginBottom: 10 },
  loadingText: { marginTop: 15, fontStyle: 'italic' },
  resultsHeader: { marginTop: 20, fontWeight: 'bold', fontSize: 16 },
  emptyText: { marginTop: 10, fontStyle: 'italic' },
  card: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginTop: 10, elevation: 2 },
  name: { fontWeight: 'bold', fontSize: 15, marginBottom: 4 },
  groupHeader: { marginTop: 30, fontWeight: 'bold', fontSize: 16 },
  slotContainer: { marginTop: 10 },
  slotTitle: { fontWeight: 'bold' },
  modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContainer: { backgroundColor: '#fff', borderRadius: 10, padding: 20 },
  modalItem: { paddingVertical: 12 },
  modalCancel: { marginTop: 15, alignItems: 'center' }
});
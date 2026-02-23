import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button, TextInput } from 'react-native';
import { TimeFilter, getSessionsGroupedBySlot } from './useTimeFilter';

export default function Index() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // -------------------- Filter Inputs --------------------
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('14:30');

  // Optional inputs for priority matching
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // -------------------- Fetch & Group Sessions --------------------
  const loadSessions = async () => {
    setLoading(true);

    // Fetch sessions grouped by 30-min slots, passing priority params
    const grouped = await getSessionsGroupedBySlot(
      timeFilter,
      startTime,
      endTime,
      selectedCourse || undefined,
      selectedSubject
    );

    // Flatten grouped sessions for raw display
    const flattened = Object.values(grouped).flat();

    setGroupedSessions(grouped);
    setSessions(flattened);

    setLoading(false);
  };

  useEffect(() => {
    loadSessions();
  }, []);

  if (loading) return <Text style={{ padding: 20 }}>Loading...</Text>;

  return (
    <ScrollView style={{ padding: 20 }}>
      
      {/* ------------------ TEST CONTROLS ------------------ */}
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>
        Time Filter & Priority Testing
      </Text>

      <Button title="Today" onPress={() => setTimeFilter('today')} />
      <Button title="Next 24 Hours" onPress={() => setTimeFilter('next_24_hours')} />
      <Button title="This Week" onPress={() => setTimeFilter('this_week')} />

      <Text style={{ marginTop: 15 }}>Start Time (HH:MM)</Text>
      <TextInput
        value={startTime}
        onChangeText={setStartTime}
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
      />

      <Text>End Time (HH:MM)</Text>
      <TextInput
        value={endTime}
        onChangeText={setEndTime}
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
      />

      {/* ------------------ Optional Priority Inputs ------------------ */}
       <Text>Subject</Text>
      <TextInput
        value={selectedSubject}
        onChangeText={setSelectedSubject}
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
      />

      <Text>Course (optional)</Text>
      <TextInput
        value={selectedCourse}
        onChangeText={setSelectedCourse}
        style={{ borderWidth: 1, padding: 5, marginBottom: 10 }}
      />


      <Button title="Run Test" onPress={loadSessions} />

      {/* ------------------ RAW SESSION OUTPUT ------------------ */}
      <Text style={{ marginTop: 20, fontWeight: 'bold' }}>
        Sessions Found: {sessions.length}
      </Text>

      {sessions.map((s) => (
        <View key={s.id} style={{ marginBottom: 10 }}>
          <Text>
            {s.profiles.first_name} {s.profiles.last_name}
          </Text>
          <Text>
            {s.subject} ({s.start_time} - {s.end_time})
          </Text>
          <Text>{s.location}</Text>
        </View>
      ))}

      {sessions.length === 0 && <Text>No sessions found</Text>}

      {/* ------------------ GROUPED SLOT OUTPUT ------------------ */}
      <Text style={{ marginTop: 30, fontWeight: 'bold' }}>
        Grouped By 30-Min Slot
      </Text>

      {Object.keys(groupedSessions).map((slot) => (
        <View key={slot} style={{ marginBottom: 15 }}>
          <Text style={{ fontWeight: 'bold' }}>Slot: {slot}</Text>
          {groupedSessions[slot].map((s: any) => (
            <Text key={s.id}>
              - {s.profiles.first_name} {s.profiles.last_name} ({s.subject} | {s.course})
            </Text>
          ))}
        </View>
      ))}

    </ScrollView>
  );
}

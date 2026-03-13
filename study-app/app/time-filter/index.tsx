//---------------------Imports------------------------
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from "@/lib/theme"

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

import { ShadowStyleIOS } from 'react-native';
import { ActivityIndicator } from 'react-native';


import TimePicker from './TimePicker';
import {
  validateThirtyMinuteRange,
  snapToThirty,           
  isOnThirtyBoundary
} from './useTimeFilter';

//Theme
const palette = {
  background: '#f7f8fa',
  surface: '#ffffff',
  text: '#101828',
  subtext: '#667085',
  border: '#E5E7EB',
  primary: '#4F46E5',  // Indigo
  primaryDark: '#4338CA',
  primarySoft: '#EEF2FF',
  success: '#16A34A',
  danger: '#DC2626',
  graySoft: '#F2F4F7',
};

//Set up shadowstyle
const shadowStyle = {
  shadowColor: '#000',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

//Segmented Control (Today / Next 24h / This Week)
function SegmentedControl({
  value,
  onChange,
}: {
  value: 'today' | 'next_24_hours' | 'this_week';
  onChange: (v: 'today' | 'next_24_hours' | 'this_week') => void;
}) {
  const items: { key: any; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'next_24_hours', label: 'Next 24 Hours' },
    { key: 'this_week', label: 'This Week' },
  ];

  return (
    <View style={{ flexDirection: 'row', backgroundColor: palette.graySoft, borderRadius: 10, padding: 4, marginBottom: 16 }}>
      {items.map((it) => {
        const selected = value === it.key;
        return (
          <TouchableOpacity
            key={it.key}
            onPress={() => onChange(it.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: 8,
              backgroundColor: selected ? palette.primary : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: selected ? '#fff' : palette.text, fontWeight: '600', fontSize: 14 }}>
              {it.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

//Modern buttons look
function PrimaryButton({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? '#A5B4FC' : palette.primary,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color: '#fff', fontWeight: '700' }}>{title}</Text>
    </TouchableOpacity>
  );
}

function SecondaryButton({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: palette.border,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
      }}
    >
      <Text style={{ color: palette.text, fontWeight: '600' }}>{title}</Text>
    </TouchableOpacity>
  );
}
``

//Pill Tag for subject and course badges
function Pill({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'brand' }) {
  const bg = tone === 'brand' ? palette.primarySoft : palette.graySoft;
  const color = tone === 'brand' ? palette.primaryDark : palette.subtext;

  return (
    <View style={{ backgroundColor: bg, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, marginRight: 8 }}>
      <Text style={{ color, fontWeight: '600', fontSize: 12 }}>{text}</Text>
    </View>
  );
}

// ----- Session Card -----
function SessionCard({ s }: { s: any }) {
  const initials = `${(s?.profiles?.first_name || '?')[0] || ''}${(s?.profiles?.last_name || '?')[0] || ''}`.toUpperCase();
  return (
    <View style={[{ backgroundColor: palette.surface, borderRadius: 12, padding: 14, marginTop: 12, borderWidth: 1, borderColor: palette.border }, shadowStyle]}>
      {/* Header with initials + name */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: palette.primarySoft, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
          <Text style={{ color: palette.primaryDark, fontWeight: '700' }}>{initials}</Text>
        </View>
        <Text style={{ fontWeight: '700', fontSize: 15, color: palette.text }}>
          {s?.profiles?.first_name} {s?.profiles?.last_name}
        </Text>
      </View>

      {/* Tags */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {!!s.subject && <Pill text={s.subject} tone="brand" />}
        {!!s.course && <Pill text={s.course} />}
      </View>

      {/* Meta */}
      <Text style={{ color: palette.subtext, marginBottom: 4 }}>🕒 {s.start_time} – {s.end_time}</Text>
      <Text style={{ color: palette.subtext }}>📍 {s.location}</Text>
    </View>
  );
}


export default function Index() {

  // -------------------- State --------------------
  const [sessions, setSessions] = useState<any[]>([]);
  const [groupedSessions, setGroupedSessions] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [timeFilter, setTimeFilter] = useState<TimeFilter>('today');

  // HH:MM for web time inputs
  const [startTime, setStartTime] = useState<string>(''); // 1:00 PM
  const [endTime, setEndTime] = useState<string>('');     // 1:30 PM


  const [selectedCourse, setSelectedCourse] = useState('');
  const [subjectSearch, setSubjectSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjectModalVisible, setSubjectModalVisible] = useState(false);


  //show validation errors under time fields
  const [timeError, setTimeError] = useState<string | null>(null);


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

    const grouped = await getSessionsGroupedBySlot(
      timeFilter,
      startTime,
      endTime,
      selectedCourse || undefined,
      selectedSubject
    );

    const flattened = Object.values(grouped ?? {}).flat();

    setGroupedSessions(grouped);
    setSessions(flattened);

    setLoading(false);
  };

  //Clear all old filters
  const clearFilters = () => {
    setSelectedSubject('');
    setSelectedCourse('');
    setStartTime('');
    setEndTime('');
    setSessions([]);
    setGroupedSessions({});
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // -------------------- Handlers --------------------

  const onStartChange = (hhmm: string) => {
    //Ensure 30-min alignment (should already be aligned by the picker)
    const snapped = isOnThirtyBoundary(hhmm) ? hhmm : snapToThirty(hhmm, 'nearest');
    setStartTime(snapped);

    // If end <= start, auto-adjust end to start + 30 to keep valid default
    const [sh, sm] = snapped.split(':').map(Number);
    const startMins = sh * 60 + sm;
    const endMins = endTime.split(':').map(Number).reduce((a, b, i) => i ? a + b : a * 60 + b); //quick parse

    if (endMins <= startMins) {
      const next = startMins + 30; //fixed 30-min session minimum
      const nextH = String(Math.floor(next / 60) % 24).padStart(2, '0');
      const nextM = String(next % 60).padStart(2, '0');
      setEndTime(`${nextH}:${nextM}`);
    }
  };

  const onEndChange = (hhmm: string) => {
    //Align end time
    const snapped = isOnThirtyBoundary(hhmm) ? hhmm : snapToThirty(hhmm, 'nearest');
    setEndTime(snapped);
  };



  return (
    <LinearGradient
      colors={theme.gradients.background}
      start={{x: 0, y:0}}
      end={{x: 1, y: 1}}
      style={{ flex: 1 }}
    >
  <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
    {/* Page Title */}
    <Text style={styles.header}>Find a Study Session</Text>

    {/* --- FILTER CARD --- */}
    <View style={[styles.cardSurface, { padding: 16, marginBottom: 20 }]}>
      {/* Section: Time Window */}
      <Text style={styles.sectionHeader}>Time Window</Text>
      <SegmentedControl value={timeFilter} onChange={setTimeFilter} />

      {/* Section: Time Pickers */}
      <View style={{ marginBottom: 12 }}>
        <Text style={styles.label}>Select Time</Text>
        {/* Two pickers side-by-side on wide screens; stacked on narrow */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <TimePicker label="Start" value={startTime} onChange={onStartChange} required />
          </View>
          <View style={{ flex: 1 }}>
            <TimePicker label="End" value={endTime} onChange={onEndChange} required />
          </View>
        </View>
        {timeError && <Text style={styles.errorText}>{timeError}</Text>}
      </View>

      {/* Section: Search Filters */}
      <Text style={styles.sectionHeader}>Search Filters</Text>

      {/* Subject picker */}
      <Text style={styles.label}>Subject</Text>
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setSubjectModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={{ color: selectedSubject ? palette.text : palette.subtext }}>
          {selectedSubject || 'Select a subject...'}
        </Text>
        {/* Right chevron indicator */}
        <Text style={{ position: 'absolute', right: 12, color: palette.subtext }}>⌄</Text>
      </TouchableOpacity>
      {!selectedSubject && <Text style={styles.errorText}>Subject is required</Text>}

      {/* Course */}
      <Text style={styles.label}>Course (optional)</Text>
      <TextInput
        value={selectedCourse}
        onChangeText={setSelectedCourse}
        style={styles.input}
        placeholder="e.g., CS101"
        placeholderTextColor={palette.subtext}
      />

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
        <View style={{ flex: 1 }}>
          <PrimaryButton title="Find Sessions" onPress={async () => {
            // Validate before searching
            const { valid, error } = validateThirtyMinuteRange(startTime, endTime);
            if (!valid) { setTimeError(error || 'Invalid time range.'); return; }
            setTimeError(null);
            await loadSessions();
          }} disabled={!selectedSubject || loading} />
        </View>
        <View style={{ flex: 1 }}>
          <SecondaryButton title="Clear" onPress={() => {
            setSelectedSubject('');
            setSelectedCourse('');
            setStartTime('');
            setEndTime('');
            setSessions([]);
            setGroupedSessions({});
            setTimeError(null);
          }} />
        </View>
      </View>
    </View>

    {/* --- RESULTS --- */}
    <Text style={styles.sectionHeader}>Results</Text>

    {/* Loading */}
    {loading && (
      <View style={[styles.cardSurface, { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }]}>
        {/* ActivityIndicator from react-native */}
        <ActivityIndicator color={palette.primary} />
        <Text style={{ color: palette.subtext }}>Searching sessions…</Text>
      </View>
    )}

    {/* Empty state */}
    {!loading && sessions.length === 0 && (
      <View style={[styles.cardSurface, { padding: 16 }]}>
        <Text style={{ color: palette.subtext }}>No matching sessions found. Try adjusting your time or filters.</Text>
      </View>
    )}

    {/* Session list */}
    {!loading && sessions.length > 0 && (
      <View>
        <Text style={styles.resultsHeader}>Sessions Found: {sessions.length}</Text>
        {sessions.map((s) => (
          <SessionCard key={s.id} s={s} />
        ))}
      </View>
    )}

    {/* (Might use later) Grouped By Slot*/}
    {/* <Text style={styles.sectionHeader}>Matched Slots</Text> ... */}

    {/* Subject Modal */}
    <Modal visible={subjectModalVisible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, shadowStyle]}>
          <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 10, color: palette.text }}>Select Subject</Text>

          <TextInput
            placeholder="Search subjects…"
            value={subjectSearch}
            onChangeText={setSubjectSearch}
            style={styles.input}
            placeholderTextColor={palette.subtext}
          />

          <View style={{ maxHeight: 260 }}>
            {filteredSubjects.map((subject, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 8,
                  borderBottomWidth: index < filteredSubjects.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: palette.border,
                  borderRadius: 8,
                }}
                onPress={() => {
                  setSelectedSubject(subject);
                  setSubjectModalVisible(false);
                  setSubjectSearch('');
                }}
                activeOpacity={0.7}
              >
                <Text style={{ color: palette.text }}>{subject}</Text>
              </TouchableOpacity>
            ))}
            {filteredSubjects.length === 0 && (
              <Text style={{ marginTop: 10, fontStyle: 'italic', color: palette.subtext }}>No subjects found</Text>
            )}
          </View>

          <TouchableOpacity
            style={{ marginTop: 16, alignItems: 'center' }}
            onPress={() => setSubjectModalVisible(false)}
          >
            <Text style={{ color: palette.danger, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  </ScrollView>
  </LinearGradient>
);
}

// -------------------- Styles --------------------
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    color: palette.text,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.subtext,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    marginTop: 6,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    color: palette.text,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: palette.text,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  errorText: {
    color: palette.danger,
    marginBottom: 10,
  },
  loadingText: {
    marginTop: 15,
    fontStyle: 'italic',
    color: palette.subtext,
  },
  resultsHeader: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '700',
    fontSize: 16,
    color: palette.text,
  },
  // The new surface card used for filters and empty/loading panels
  cardSurface: {
    backgroundColor: palette.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: palette.border,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
  },
});
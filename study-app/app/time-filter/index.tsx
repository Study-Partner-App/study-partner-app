//---------------------Imports------------------------
import React, { useEffect, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from "@/lib/theme"
import { supabase } from '@/lib/supabase'
import { FlatList } from 'react-native';


import {
  View,
  Text,
  Pressable,
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
  snapToThirty,
  isOnThirtyBoundary
} from './useTimeFilter';

import CourseDropdown from './CourseDropdown';

//-----------------------Load courses-----------------------

const COURSES_BY_SUBJECT: Record<string, string[]> = {
  "Artificial Intelligence": [
    "CS 3083", // Fundamentals of AI Systems
    "CS 4103", // Fundamentals of Machine Learning
    "CYB 4203", // Secure and Trustworthy AI
    "CS 4253", // Artificial Intelligence
    "ECE 4413" // Neural Networks and Deep Learning
  ],
  "Chemical Engineering": [
    "CHE 1011", // Intro to ChE Profession
    "CHE 2003", // Principles of ChE
    "CHE 3063", // Equilibrium Thermodynamics
    "CHE 3084", // Mass Transfer
    "CHE 4003", // CE Engineering Lab 1
    "CHE 4013", // CE Engineering Lab 2
    "CHE 4063", // Chemical Reactor Design
    "CHE 4803", // CE Plant design
    "CHE 4103",  // Process Component Design
    "CHE 4113",  // Process Control
    "CHE 4123" // Chemical Process Health and Safety
  ],
  "Computer and Electrical Engineering": [
    "ECE 1011", // Computer Tools for ECE
    "ECE 2001", // Basic Electrical Measurments Lab
    "ECE 2003", // Electric Circuit Analysis
    "ECE 2063", // Computer Systems Organization
    "ECE 2163", // Digital Systems Principles
    "ECE 2161", // Digital Systems Lab
    "ECE 2263", // Embedded Systems in C
    "ECE 3023", // Intro to Electromagnetics
    "ECE 3033", // Electric Power Systems
    "ECE 3113", // Signals and Linear Systems
    "ECE 3143", // Electronics I
    "ECE 4103", // Electrical and Computer Engineering Design Project Part 1
    "ECE 4203", // Electrical and Computer Engineering Design Project Part 2
    "ECE 4041", // Electronics Lab
    "ECE 4043", // Electronics II
    "ECE 4053", // Classical Control Theory
    "ECE 4073", // Information and Communication Systems
    "ECE 4163"  // Computer Hardware Techniques
  ],
  "Computer Science": [
    "CS 1001", // Introduction to Computer Science
    "CS 1043", // Intro to Programming
    "CS 2001", // Ethics
    "CS 2003", // Fundamentals of Algorithms
    "CS 2033", // Computer Organization and Assembly Language
    "CS 2123", // Data Structures
    "CS 3003", // Comparative Programming Languages
    "CS 3013", // Discrete Mathematics
    "CS 3053", // Operating Systems
    "CS 3513", // Software Engineering
    "CS 4013", // Compilers
    "CS 4163",  // Database Systems
    "CS 4333", // Computer networks
    "CS 4513" // Senior Project
  ],
  "Computer Simulation and Gaming": [
    "CSG 1003", // Introduction to Game Design
    "CSG 3013", // Intro to Real-Time Engines
    "CSG 3023", // Intro to Game Programming
    "CSG 3523", // Game Systems Development
    "CSG 3813", // Environmenal Storytelling
    "CSG 4003", // Senior Project I
    "CSG 4013", // Senior Project II
    "CSG 4283", // 3D Modeling and Animation
    "CSG 4373", // 3D Visualization of Dynamic Simulations
    "CSG 4603" // Portfolio Development
  ],
  "Cybersecurity": [
    "CYB 2004", // Secure Software Development I
    "CYB 2013", // Secure Software Development II
    "CYB 3023", // Cyber and Society Seminar
    "CYB 3043", // Enterprise Networks
    "CYB 3053", // Operating Systems
    "CYB 3073", // Intro to Cybersecurity
    "CYB 3353", // System Administration
    "CYB 3363", // Cryptography
    "CYB 4003", // Cybersecurity Capstone
    "CYB 4073", // Cyber defense
    "CYB 4104", // Software and network security
    "CYB 4413"  // Web application security
  ],
  "Physics": [
    "PHYS 1002", // Welcome to Physics
    "PHYS 2053", // General Physics I
    "PHYS 2051", // General Physics I Lab
    "PHYS 2063", // General Physics II
    "PHYS 2061", // General Physics II Lab
    "PHYS 2073", // General Physics III
    "PHYS 2071", // General Physics III Lab
    "PHYS 2083", // Foundational Modern Physics
    "PHYS 2081", // Foundational Modern Physics Lab
    "PHYS 3043", // Thermodynamics and Statistical Mechanics
    "PHYS 3053", // Mathematical Physics
    "PHYS 3083", // Modern Physics
    "PHYS 3112", // Physics instrumentation lab
    "PHYS 4003", // Classical Mechanics
    "PHYS 4033",  // Quantum Mechanics I
    "PHYS 4063" // Electricity and Magnetism
  ],
  "Mathematics": [
    "MATH 2014", // Calculus I
    "MATH 2024", // Calculus II
    "MATH 2073", // Calculus III
    "MATH 3033", // Intro to Advanced Mathematics
    "MATH 3013",  // Discrete Mathematics
    "MATH 3073", // Differential Equations
    "MATH 3553", // Modern Algebra
    "MATH 4003", // Advanced Calculus I
    "MATH 4123", // Linear Algebra
    "MATH 4503", // Numerical Methods
    "STAT 4813"  // Statistical Methods

  ],
  "Mechanical Engineering": [
    "ME 1123", // Design and Manufacturing
    "ME 1212", // ME Graphics
    "ME 2023", // Intro to Dynamics
    "ME 2123", // Materials and Technology
    "ME 3033", // Properties of Materials 
    "ME 3063", // Manufacturing
    "ME 3123", // Dynamic Systems
    "ME 4053", // System Dynamics
    "ME 4123", // Thermal Sciences
    "ME 4383", // ME Design
    "ME 4293", // Project
    "ME 4383" // ME Design
  ],
  "Petroleum Engineering": [
    "PE 1001", // Intro to Petroleum Engineering
    "PE 2101", // IRock and Fluid Properties Lab
    "PE 2113", // Rock Properties
    "PE 2123", // Fluid Properties
    "PE 3023", // Reservoir Engineering I
    "PE 3041", // Drilling Engineering I Lab
    "PE 3043", // Drilling Engineering I
    "PE 3063", // Data analytics
    "PE 3073", // Production
    "PE 4043", // Drilling Engineering II
    "PE 4053", // Formulation Evaluation
    "PE 4063", // Well Construction
    "PE 4071", // Production Engineering Lab
    "PE 4113", // Reservoir Engineering II
    "PE 4513", // Integrated Resovoir Modeling
    "PE 4983"  // FCapstone
  ]
};


const normalize = (s: string) =>
  s.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

const courseMatches = (course: string, query: string) => {
  const c = normalize(course);
  const q = normalize(query);

  if (!q) return true; //Show all when empty
  if (c.startsWith(q)) return true;
  if (c.includes(q)) return true;

  //Allow 1 missing char for short queries
  if (q.length >= 2) {
    // transposition check (e.g., "C1S01" vs "CS101")
    for (let i = 0; i < q.length - 1; i++) {
      const transposed = q.slice(0, i) + q[i + 1] + q[i] + q.slice(i + 2);
      if (c.includes(transposed)) return true;
    }
  }

  return false;
};

//-----------------------Theme-----------------------
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

//-----------------------Modern buttons look-----------------------
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

//-----------------------Pill Tag for subject and course badges-----------------------
function Pill({ text, tone = 'neutral' }: { text: string; tone?: 'neutral' | 'brand' }) {
  const bg = tone === 'brand' ? palette.primarySoft : palette.graySoft;
  const color = tone === 'brand' ? palette.primaryDark : palette.subtext;

  return (
    <View style={{ backgroundColor: bg, paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999, marginRight: 8 }}>
      <Text style={{ color, fontWeight: '600', fontSize: 12 }}>{text}</Text>
    </View>
  );
}

// Time-formatting helpers (for displaying the times)
const formatTimeRange = (start?: string, end?: string) => {
  if (!start || !end) return '';

  const parse = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date;
  };

  const startDate = parse(start);
  const endDate = parse(end);

  const startStr = startDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const endStr = endDate.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Remove AM and PM from start time if both are same

  const startClean = startStr.replace(/\s?(AM|PM)/, '');
  const endClean = endStr.replace(/\s?(AM|PM)/, '');
  const endPeriod = endStr.match(/(AM|PM)/)?.[0] ?? '';

  return `${startClean} – ${endClean ?? endStr} ${endPeriod}`;
};


//-----------------------Session Card-----------------------
function SessionCard({
  s,
  onPress,
}: {
  s: any;
  onPress: () => void;
}) {
  const formatSessionDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const initials =
    `${(s?.profiles?.first_name || '?')[0] || ''}${(s?.profiles?.last_name || '?')[0] || ''
      }`.toUpperCase();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: palette.surface,
          borderRadius: 12,
          padding: 14,
          marginTop: 12,
          borderWidth: 1,
          borderColor: palette.border,
          opacity: pressed ? 0.85 : 1,
        },
        shadowStyle,
      ]}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: palette.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
          }}
        >
          <Text style={{ color: palette.primaryDark, fontWeight: '700' }}>
            {initials}
          </Text>
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
      {!!s.date && (
        <Text style={{ color: palette.subtext, marginBottom: 4 }}>
          📅 {formatSessionDate(s.date)}
        </Text>
      )}

      <Text style={{ color: palette.subtext, marginBottom: 4 }}>
        🕒 {formatTimeRange(s.start_time, s.end_time)}
      </Text>

      <Text style={{ color: palette.subtext }}>
        📍 {s.location}
      </Text>
    </Pressable>
  );
}

export default function Index() {

  // -------------------- State --------------------
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
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

  // Disable commit to sessions button
  const [hasJoined, setHasJoined] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  // Track submission attempt
  const [hasSubmitted, setHasSubmitted] = useState(false);

  //---------------------------Define subjects---------------------------
  const subjects = [
    "Artificial Intelligence",
    "Chemical Engineering",
    "Computer and Electrical Engineering",
    "Computer Science",
    "Computer Simulation and Gaming",
    "Cybersecurity",
    "Physics",
    "Mathematics",
    "Mechanical Engineering",
    "Petroleum Engineering"
  ];


  const filteredSubjects = subjects.filter(subject =>
    subject.toLowerCase().includes(subjectSearch.toLowerCase())
  );

  // DON"T LOAD COURSES INITALLY
  const availableCourses = selectedSubject
    ? COURSES_BY_SUBJECT[selectedSubject] ?? []
    : [];


  // ------------------- Subject-only diagnostic fetch -------------------

  const fetchSessionsBySubjectOnly = async (subject: string) => {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('id')
      .eq('subject', subject);

    if (error) {
      console.error('Subject-only fetch error:', error);
      return [];
    }

    return data ?? [];
  };

  // ------------------- State for diagnostics -------------------

  const [subjectSessions, setSubjectSessions] = useState<any[]>([]);

  // ------------------- Helper to explain "no results" -------------------

  const getNoResultsReason = () => {
    if (!selectedSubject) {
      return null;
    }

    // Case 1: No sessions exist at all for this subject
    if (subjectSessions.length === 0) {
      return `No study sessions found for ${selectedSubject}.`;
    }

    // Case 2: Sessions exist for subject, but course filter is too narrow
    if (selectedCourse) {
      return `No sessions found for ${selectedCourse} within your selected time window.`;
    }

    // Case 3: Sessions exist, but none overlap the selected time range
    return `Sessions for ${selectedSubject} exist, but none overlap the selected time range.`;
  };

  // -------------------- Fetch Logic --------------------

  const loadSessions = async () => {
    // Reset visible state
    setSessions([]);
    setGroupedSessions({});
    setLoading(true);

    if (!selectedSubject) {
      setLoading(false);
      return;
    }

    // Step 1: Fetch subject-only sessions for diagnostics
    const subjectOnly = await fetchSessionsBySubjectOnly(selectedSubject);
    setSubjectSessions(subjectOnly);

    // Step 2: Fetch fully filtered sessions (subject + course + time)
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

  // -------------------- Clear Filters --------------------

  const clearFilters = () => {
    setSelectedSubject('');
    setSelectedCourse('');
    setStartTime('');
    setEndTime('');
    setSessions([]);
    setGroupedSessions({});
    setSubjectSessions([]); // clear diagnostics too
  };

  // -------------------- Effects --------------------

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    setSelectedCourse('');
  }, [selectedSubject]);


  // Check for duplicate sessions
  useEffect(() => {
    const checkIfJoined = async () => {
      if (!selectedSession) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setHasJoined(false);
        return;
      }

      const { data, error } = await supabase
        .from('commitments')
        .select('id')
        .eq('user_id', user.id)
        .eq('session_id', selectedSession.id)
        .maybeSingle();

      if (!error && data) {
        setHasJoined(true);
      } else {
        setHasJoined(false);
      }
    };

    checkIfJoined();
  }, [selectedSession]);

  // Check if session has reached max capacity
  useEffect(() => {
    const fetchParticipantCount = async () => {
      if (!selectedSession) return;

      const { count, error } = await supabase
        .from('commitments')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', selectedSession.id);

      if (!error && typeof count === 'number') {
        setParticipantCount(count);
      }
    };

    fetchParticipantCount();
  }, [selectedSession]);


  //-------------------- Helpers for making sure end times don't break 30-minute logic--------------------
  //Time math helpers (24h circular clock)

  const isHHMM = (v?: string | null): v is string =>
    !!v && /^\d{2}:\d{2}$/.test(v);

  const toMinutes = (hhmm?: string | null) => {
    if (!isHHMM(hhmm)) return null;
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };


  const toHHMM = (mins: number) => {
    const t = ((mins % 1440) + 1440) % 1440;
    const h = String(Math.floor(t / 60)).padStart(2, '0');
    const m = String(t % 60).padStart(2, '0');
    return `${h}:${m}`;
  };


  // Forward difference from a to b (in minutes) on a 24h clock

  const forwardDiff = (a: number, b: number) => ((b - a + 1440) % 1440);


  // -------------------- Handlers --------------------
  // Taking away restrictions for start and end time

  const onStartChange = (hhmm: string) => {
    const snapped = isOnThirtyBoundary(hhmm)
      ? hhmm
      : snapToThirty(hhmm, 'nearest');

    setStartTime(snapped);

    // Clear any old errors
    setTimeError(null);
  };


  const onEndChange = (hhmm: string) => {
    const snapped = isOnThirtyBoundary(hhmm)
      ? hhmm
      : snapToThirty(hhmm, 'nearest');

    const s = toMinutes(startTime);
    const e = toMinutes(snapped);

    if (s != null && e != null && forwardDiff(s, e) === 0) {
      setTimeError('End time must be after start time.');
      return;
    }

    setEndTime(snapped);
    setTimeError(null);
  };

  // Add 30 minute helper button
  const addThirtyMinutes = () => {
    const s = toMinutes(startTime);
    if (s == null) return;

    const newEnd = toHHMM(s + 30);
    setEndTime(newEnd);
    setTimeError(null);
  };



  // Reuse the date formatting logic from SessionCard for consistency
  const formatSessionDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(`${dateStr}T00:00:00`);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  // Handles joining sessions. Logic for commiting to sessions goes here.
  const handleJoinSession = async () => {
    if (!selectedSession || hasJoined || joinLoading) return;

    setJoinLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setJoinLoading(false);
      setTimeError('You must be logged in to join a session.');
      return;
    }

    const { error: insertError } = await supabase
      .from('commitments')
      .insert({
        user_id: user.id,
        session_id: selectedSession.id,
      });

    if (insertError) {
      // Handles unique constraint violation if DB index exists
      if (insertError.code === '23505') {
        setHasJoined(true);
      } else {
        console.error(insertError);
        setTimeError('Unable to join session. Please try again.');
      }
      setJoinLoading(false);
      return;
    }

    // Successfully joined
    setHasJoined(true);
    setJoinLoading(false);
  };

  const isSessionFull =
    selectedSession?.max_people != null &&
    participantCount >= selectedSession.max_people;

  // Used for disabling find sessions button until required fields are filled
  const isFormValid =
    Boolean(selectedSubject) &&
    Boolean(startTime) &&
    Boolean(endTime);


  return (
    <LinearGradient
      colors={[...theme.gradients.background]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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

          {/* Section: Explain meaning of asterisk (required) */}
          <Text style={{ fontSize: 12, color: palette.subtext, marginBottom: 8 }}>
            Fields marked with * are required
          </Text>
          {/* Section: Time Pickers */}
          <View style={{ gap: 14 }}>
            {/* Start Time */}
            <TimePicker
              label="Start Time"
              value={startTime}
              onChange={onStartChange}
              required
              format="12h"
              snap="onBlur"
            />

            {/* End Time */}
            <View style={{ position: 'relative' }}>
              <TimePicker
                label="End Time"
                value={endTime}
                onChange={onEndChange}
                required
                format="12h"
                snap="onBlur"
              />

              {/* 30 minute helper button */}
              <Pressable
                onPress={addThirtyMinutes}
                disabled={!startTime}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: 0,
                  paddingVertical: 4,
                  paddingHorizontal: 6,
                  opacity: startTime ? 1 : 0.4,
                }}
              >
                <Text
                  style={{
                    color: palette.primary,
                    fontWeight: '600',
                    fontSize: 12,
                  }}
                >
                  +30 min
                </Text>
              </Pressable>
            </View>
          </View>

          {timeError && (
            <Text style={{ color: palette.danger, marginTop: 4 }}>
              {timeError}
            </Text>
          )}
          {/* Section: Search Filters */}
          <Text style={styles.sectionHeader}>Search Filters</Text>

          {/* Subject picker */}
          <Text style={styles.label}>
            Subject <Text style={{ color: palette.text }}>*</Text>
          </Text>
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

          {/* Course */}
          <CourseDropdown
            label="Course"
            value={selectedCourse}
            onChange={setSelectedCourse}
            courses={availableCourses}
            courseMatches={courseMatches}
            palette={palette}
          />

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                title="Find Sessions"
                onPress={async () => {
                  setHasSubmitted(true);
                  setTimeError(null);
                  await loadSessions();
                }}
                disabled={!isFormValid || loading}
              />
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
            <Text style={{ color: palette.subtext }}>
              {getNoResultsReason() ??
                'No matching sessions found. Try adjusting your filters.'}
            </Text>
          </View>
        )}

        {/* Session list */}
        {!loading && sessions.length > 0 && (
          <View>
            <Text style={styles.resultsHeader}>
              Sessions Found: {sessions.length}
            </Text>

            <FlatList
              data={sessions}
              keyExtractor={(item) => item.id}

              scrollEnabled={false} // Should prevent warning with flatlist

              renderItem={({ item }) => (
                <SessionCard
                  s={item}
                  onPress={() => {
                    setSelectedSession(item);
                    setDetailsVisible(true);
                  }}
                />
              )}
            />
          </View>
        )}

        {/* Session Details Modal */}
        <Modal
          visible={detailsVisible}
          animationType="fade"
          transparent
          onRequestClose={() => setDetailsVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.4)',
              justifyContent: 'center',
              padding: 20,
            }}
          >
            <View
              style={{
                backgroundColor: palette.surface,
                borderRadius: 18,
                padding: 20,
                maxHeight: '85%',
                borderWidth: 1,
                borderColor: palette.border,
              }}
            >
              {!selectedSession ? (
                <ActivityIndicator />
              ) : (
                <>
                  {/* ---------- Header ---------- */}
                  <View style={{ marginBottom: 12 }}>
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: '800',
                        color: palette.text,
                      }}
                    >
                      {selectedSession.title || 'Study Session'}
                    </Text>

                    <Text
                      style={{
                        marginTop: 4,
                        color: palette.subtext,
                        fontSize: 14,
                      }}
                    >
                      with {selectedSession.profiles.first_name}{' '}
                      {selectedSession.profiles.last_name}
                    </Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
                      <Pill text={selectedSession.subject} tone="brand" />
                      {selectedSession.course && (
                        <Pill text={selectedSession.course} />
                      )}
                    </View>
                  </View>

                  {/* ---------- Details ---------- */}
                  <View style={{ gap: 8 }}>
                    <Text style={{ color: palette.subtext }}>
                      📅 {formatSessionDate(selectedSession.date)}
                    </Text>

                    <Text style={{ color: palette.subtext }}>
                      🕒 {formatTimeRange(
                        selectedSession.start_time,
                        selectedSession.end_time
                      )}
                    </Text>

                    <Text style={{ color: palette.subtext }}>
                      📍 {selectedSession.location}
                    </Text>

                    {selectedSession.max_people && (
                      <Text style={{ color: palette.subtext }}>
                        👥 {participantCount} / {selectedSession.max_people} participants
                      </Text>
                    )}
                  </View>

                  {/* ---------- Description ---------- */}
                  {!!selectedSession.description && (
                    <View style={{ marginTop: 16 }}>
                      <Text
                        style={{
                          fontWeight: '700',
                          marginBottom: 4,
                          color: palette.text,
                        }}
                      >
                        Description
                      </Text>
                      <Text style={{ color: palette.subtext }}>
                        {selectedSession.description}
                      </Text>
                    </View>
                  )}

                  {/* Divider before footer */}
                  <View style={{ height: 1, backgroundColor: palette.border, marginTop: 16 }} />

                  {/* ---------- Footer ---------- */}
                  <View
                    style={{
                      marginTop: 20,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      gap: 12,
                    }}
                  >
                    <Pressable
                      onPress={() => setDetailsVisible(false)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: palette.border,
                      }}
                    >
                      <Text style={{ fontWeight: '600', color: palette.text }}>
                        Close
                      </Text>
                    </Pressable>


                    {/* ---------- Commit to sessions button ----------*/}
                    <Pressable
                      onPress={handleJoinSession}
                      disabled={hasJoined || joinLoading || isSessionFull}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 16,
                        borderRadius: 10,
                        backgroundColor:
                          hasJoined || isSessionFull
                            ? '#A0A0A0'
                            : palette.primary,
                        opacity: joinLoading ? 0.7 : 1,
                      }}
                    >
                      <Text style={{ fontWeight: '700', color: '#fff' }}>
                        {hasJoined
                          ? 'Joined'
                          : isSessionFull
                            ? 'Session Full'
                            : joinLoading
                              ? 'Joining…'
                              : 'Join Session'}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>


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
                <ScrollView showsVerticalScrollIndicator>
                  {filteredSubjects.map((subject, index) => (
                    <TouchableOpacity
                      key={index}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                        borderBottomWidth:
                          index < filteredSubjects.length - 1
                            ? StyleSheet.hairlineWidth
                            : 0,
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
                    <Text
                      style={{
                        marginTop: 10,
                        fontStyle: 'italic',
                        color: palette.subtext,
                      }}
                    >
                      No subjects found
                    </Text>
                  )}
                </ScrollView>
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

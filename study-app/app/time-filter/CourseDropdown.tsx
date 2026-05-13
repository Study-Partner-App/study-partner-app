import React, { useMemo, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  FlatList,
} from 'react-native';


type Props = {
  label?: string;
  value: string; //Selected course code ('' if none)
  onChange: (course: string) => void;
  placeholder?: string;
  courses: string[]; //Full list to search/filter
  courseMatches: (c: string, q: string) => boolean;
  palette: { [k: string]: string }; //Reuse palette from the parent
};

export default function CourseDropdown({
  label = 'Course',
  value,
  onChange,
  placeholder = 'Type a course (e.g. CS 2003) or select below',
  courses,
  courseMatches,
  palette,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState(value);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = useMemo(() => {
    return courses.filter((c) => courseMatches(c, query)).slice(0, 50);
  }, [courses, query, courseMatches]);

  const open = () => {
    setVisible(true);
  };

  const select = (course: string) => {
    setQuery(course);
    onChange(course);
    setVisible(false);
  };

  // Normalize input
  const normalizeCourse = (s: string) =>
    s
      .toUpperCase()
      .replace(/\s+/g, ' ') // Strip weird chars
      .trim();


  // Done button helper
  const handleDone = () => {
    const formatted = normalizeCourse(query);
    onChange(formatted); // Value would stay as subject course number
    setQuery(formatted);
    setVisible(false);
  };

  // Helper for clearing course dropdown
  const handleClear = () => {
    setQuery('');
    onChange(''); // should clear the course
    setVisible(false);
  };


  return (
    <View style={{ marginBottom: 12 }}>
      {!!label && (
        <Text style={{ fontWeight: '600', marginBottom: 6, color: palette.text }}>
          {label}{' '}
          <Text style={{ color: palette.subtext }}>(optional)</Text>
        </Text>
      )}

      {/* Field-looking button to open modal */}
      <TouchableOpacity
        onPress={open}
        activeOpacity={0.8}
        style={{
          borderWidth: 1,
          borderColor: palette.border,
          borderRadius: 10,
          padding: 12,
          backgroundColor: '#fff',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: value ? palette.text : palette.subtext }}>
          {value || 'Select a course…'}
        </Text>
        <Text style={{ position: 'absolute', right: 12, color: palette.subtext }}>
          ⌄
        </Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { borderColor: palette.border }]}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 16,
                  color: palette.text,
                }}
              >
                Select Course
              </Text>

              <TouchableOpacity
                onPress={() => setVisible(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={{ color: palette.subtext, fontSize: 16 }}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              placeholder={placeholder}
              value={query}
              onChangeText={setQuery}
              style={[styles.input, { borderColor: palette.border }]}
              placeholderTextColor={palette.subtext}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Text
              style={{
                fontSize: 12,
                color: palette.subtext,
                marginBottom: 8,
              }}
            >
              You can type a course code or choose one from the list
            </Text>

            <View style={{ maxHeight: 300 }}>
              {filtered.length > 0 ? (
                <FlatList
                  data={filtered}
                  keyExtractor={(item) => item}
                  keyboardShouldPersistTaps="handled"
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      onPress={() => select(item)}
                      activeOpacity={0.7}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 8,
                        borderBottomWidth:
                          index < filtered.length - 1
                            ? StyleSheet.hairlineWidth
                            : 0,
                        borderBottomColor: palette.border,
                      }}
                    >
                      <Text style={{ color: palette.text }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <Text
                  style={{
                    marginTop: 10,
                    fontStyle: 'italic',
                    color: palette.subtext,
                  }}
                >
                  No courses found
                </Text>
              )}
            </View>

            {/* Footer actions- handle done and clear buttons */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
              }}
            >
              {value !== '' && (
                <TouchableOpacity onPress={handleClear}>
                  <Text
                    style={{ color: palette.danger, fontWeight: '600' }}
                  >
                    Clear
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={handleDone}>
                <Text
                  style={{ color: palette.primary, fontWeight: '700' }}
                >
                  Apply course
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
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
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
    color: '#101828',
  },
});

import React, { useMemo, useState } from 'react';
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
  placeholder = 'Search courses…',
  courses,
  courseMatches,
  palette,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return courses.filter((c) => courseMatches(c, query)).slice(0, 50);
  }, [courses, query, courseMatches]);

  const open = () => {
    setQuery('');
    setVisible(true);
  };

  const close = () => {
    setVisible(false);
  };

  const select = (course: string) => {
    onChange(course);
    setVisible(false);
    setQuery('');
  };

  return (
    <View style={{ marginBottom: 12 }}>
      {!!label && (
        <Text style={{ fontWeight: '600', marginBottom: 6, color: palette.text }}>
          {label} <Text style={{ color: palette.subtext }}>(optional)</Text>
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
        <Text style={{ position: 'absolute', right: 12, color: palette.subtext }}>⌄</Text>
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { borderColor: palette.border }]}>
            <Text style={{ fontWeight: '700', fontSize: 16, marginBottom: 10, color: palette.text }}>
              Select Course
            </Text>

            <TextInput
              placeholder={placeholder}
              value={query}
              onChangeText={setQuery}
              style={[styles.input, { borderColor: palette.border }]}
              placeholderTextColor={palette.subtext}
              autoCapitalize="characters"
              autoCorrect={false}
            />

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
                        borderBottomWidth: index < filtered.length - 1 ? StyleSheet.hairlineWidth : 0,
                        borderBottomColor: palette.border,
                        borderRadius: 8,
                      }}
                    >
                      <Text style={{ color: palette.text }}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              ) : (
                <Text style={{ marginTop: 10, fontStyle: 'italic', color: palette.subtext }}>
                  No courses found
                </Text>
              )}
            </View>

            <TouchableOpacity style={{ marginTop: 16, alignItems: 'center' }} onPress={close}>
              <Text style={{ color: palette.danger, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
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
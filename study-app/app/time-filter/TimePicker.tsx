import React from 'react';
import { View, TextInput, Text } from 'react-native';


/** 
 * Goal for this file is using <input type="time" step="1800"> to restrict to 30-minute steps
 * 
*/

type Props = {
  label?: string;
  value: string;
  onChange: (hhmm: string) => void;
  id?: string;
  required?: boolean;
  min?: string;
  max?: string;
  snap?: boolean;
};

export default function TimePicker({
  label,
  value,
  onChange,
  id,
  required,
  min,
  max,
  snap = true
}: Props) {
  //Snap helper
  const snapToThirty = (hhmm: string): string => {
    const [hStr, mStr] = hhmm.split(':');
    const h = Number(hStr);
    const m = Number(mStr);

    if(Number.isNaN(h) || Number.isNaN(m)) return hhmm;
    //Already aligned
    if (m === 0 || m === 30) return hhmm;

    //Snap to nearest 30
    if (m < 15) return `${hStr}:00`;
    if (m < 45) return `${hStr}:30`;
    //Snap up to next hour
    const nextHour = (h + 1) % 24;
    return `${String(nextHour).padStart(2, '0')}:00`;
  };

  const handleChange = (text: string) => {
    // Clean input to only allow numbers and colon, enforce HH:MM format
    let cleaned = text.replace(/[^0-9:]/g, "");
    //Enforce HH:MM shape while typing
    if(cleaned.length === 2 && !cleaned.includes(":")) {
      cleaned = cleaned + ":";
    }
    // Prevent input longer than HH:MM
    if(cleaned.length > 5) return;
    // Snap to nearest 30 minutes if enabled
    const next = snap ? snapToThirty(cleaned) : cleaned;
    onChange(next);
  }

  return (
    <View style={{ marginBottom: 12 }}>
      {label && (
        <Text style={{ fontWeight: "600", marginBottom: 6}}>
          {label} {required ? ' *' : ''}
        </Text>
      )}
      <TextInput
        value={value}
        placeholder="HH:MM"
        keyboardType="numeric"
        onChangeText={handleChange}
        style={{
          padding: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#ccc",
          backgroundColor: '#fff'
        }}
      />
    </View>
  );
}
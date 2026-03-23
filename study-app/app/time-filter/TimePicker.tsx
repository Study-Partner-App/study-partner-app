import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, TextInputProps } from 'react-native';

// --- Types ---
type SnapMode = boolean | 'live' | 'onBlur';
type Period = 'AM' | 'PM';

type Props = {
  label?: string;
  value: string;                     // parent uses 24h 'HH:MM' or ''
  onChange: (hhmm24: string) => void; // always emits valid 24h 'HH:MM'
  id?: string;
  required?: boolean;
  min?: string;                      // 24h 'HH:MM'
  max?: string;                      // 24h 'HH:MM'
  snap?: SnapMode;                   // true|'onBlur'|'live' (default: 'onBlur')
  format?: '24h' | '12h';            // default '24h'; '12h' shows AM/PM toggle
  inputProps?: Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType' | 'onBlur' | 'maxLength'>;
};

// --- Core helpers ---
function isValidHHMM24(v: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(v)) return false;
  const [h, m] = v.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

function toMins24(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toHHMM24(mins: number): string {
  const t = ((mins % 1440) + 1440) % 1440;
  const h = String(Math.floor(t / 60)).padStart(2, '0');
  const m = String(t % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function clampToBounds24(hhmm: string, min?: string, max?: string): string {
  if (!isValidHHMM24(hhmm)) return hhmm;
  let val = toMins24(hhmm);
  if (min && isValidHHMM24(min)) val = Math.max(val, toMins24(min));
  if (max && isValidHHMM24(max)) val = Math.min(val, toMins24(max));
  return toHHMM24(val);
}

function snapToThirty24(hhmm: string): string {
  if (!isValidHHMM24(hhmm)) return hhmm;
  const [h, m] = hhmm.split(':').map(Number);
  if (m === 0 || m === 30) return hhmm;
  if (m < 15) return `${String(h).padStart(2, '0')}:00`;
  if (m < 45) return `${String(h).padStart(2, '0')}:30`;
  const nextHour = (h + 1) % 24;
  return `${String(nextHour).padStart(2, '0')}:00`;
}

// --- 24h <-> 12h conversion ---
function from24To12(h24: number): { h12: number; period: Period } {
  const period: Period = h24 >= 12 ? 'PM' : 'AM';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { h12, period };
}

function from12To24(h12: number, period: Period): number {
  const base = h12 % 12;       // 12 -> 0
  return period === 'PM' ? base + 12 : base; // 12 AM -> 0, 12 PM -> 12
}

// --- Component ---
export default function TimePicker({
  label,
  value,
  onChange,
  id,
  required,
  min,
  max,
  snap = true,              // default: 'onBlur'
  format = '24h',
  inputProps,
}: Props) {
  const snapMode: 'live' | 'onBlur' | false = snap === true ? 'onBlur' : (snap || false);

  // Internal draft for the text field (displays as 12h or 24h), and the AM/PM period when format='12h'
  const [draft, setDraft] = useState<string>(value || '');
  const [period, setPeriod] = useState<Period>('AM');

  // Sync from parent value to internal draft/period
  useEffect(() => {
    if (!value || !isValidHHMM24(value)) {
      setDraft('');
      return;
    }
    const [h24, mm] = value.split(':').map(Number);
    if (format === '12h') {
      const { h12, period } = from24To12(h24);
      setPeriod(period);
      setDraft(`${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
    } else {
      setDraft(value);
    }
  }, [value, format]);

  // Shape user typing: digits only -> inject ':' -> cap to 4 digits (HHMM)
  const shapeDraft = (raw: string): string => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;        // '1', '12'
    const hh = digits.slice(0, 2);
    const mm = digits.slice(2);
    return `${hh}:${mm}`;                         // '12:3', '12:34'
  };

  // Check validity of the current draft in the chosen format
  function isDraftValid(d: string): boolean {
    if (!/^\d{1,2}:\d{2}$/.test(d)) return false;
    const [hhStr, mmStr] = d.split(':');
    const hh = Number(hhStr);
    const mm = Number(mmStr);
    if (Number.isNaN(hh) || Number.isNaN(mm)) return false;
    if (mm < 0 || mm > 59) return false;
    if (format === '12h') {
      return hh >= 1 && hh <= 12;
    } else {
      return hh >= 0 && hh <= 23;
    }
  }

  // Convert the draft (12h or 24h) + period to 24h string
  function draftTo24(d: string, p: Period): string | null {
    if (!isDraftValid(d)) return null;
    const [hhStr, mmStr] = d.split(':');
    const mm = Number(mmStr);
    if (format === '12h') {
      const h12 = Number(hhStr);
      const h24 = from12To24(h12, p);
      return `${String(h24).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    } else {
      const h24 = Number(hhStr);
      return `${String(h24).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
    }
  }

  // After we produce a 24h candidate, normalize (snap/clamp), emit to parent, and update draft/period for display
  function commit24(hhmm24: string) {
    if (!isValidHHMM24(hhmm24)) return;

    let next = hhmm24;
    if (snapMode === 'live') next = snapToThirty24(next);
    next = clampToBounds24(next, min, max);

    // Emit to parent if changed
    if (next !== value) onChange(next);

    // Sync draft/period to whatever actually got committed
    const [h24, mm] = next.split(':').map(Number);
    if (format === '12h') {
      const { h12, period } = from24To12(h24);
      setPeriod(period);
      setDraft(`${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
    } else {
      setDraft(next);
    }
  }

  const handleChangeText = (text: string) => {
    const shaped = shapeDraft(text);
    setDraft(shaped);

    // Only commit when a full valid time exists
    const candidate24 = draftTo24(shaped, period);
    if (candidate24) {
      commit24(candidate24);
    }
  };

  const handleBlur = () => {
    const candidate24 = draftTo24(draft, period);
    if (!candidate24) return;

    let next = candidate24;
    if (snapMode === 'onBlur') next = snapToThirty24(next);
    next = clampToBounds24(next, min, max);

    // Emit + sync if needed
    if (next !== value) onChange(next);

    const [h24, mm] = next.split(':').map(Number);
    if (format === '12h') {
      const { h12, period } = from24To12(h24);
      setPeriod(period);
      setDraft(`${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')}`);
    } else {
      setDraft(next);
    }
  };

  const togglePeriod = (next: Period) => {
    if (format !== '12h') return;
    setPeriod(next);

    // If we have a complete draft, flip period and commit
    const candidate24 = draftTo24(draft, next);
    if (candidate24) {
      // Keep snapping behavior consistent: no extra snap here unless 'live'
      commit24(candidate24);
    }
  };

  return (
    <View style={{ marginBottom: 12 }}>
      {!!label && (
        <Text style={{ fontWeight: '600', marginBottom: 6 }}>
          {label} {required ? ' *' : ''}
        </Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <TextInput
          value={draft}
          placeholder={format === '12h' ? 'hh:mm' : 'HH:MM'}
          keyboardType="number-pad"
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          maxLength={5}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            backgroundColor: '#fff',
            color: '#101828',
          }}
          {...inputProps}
        />

        {format === '12h' && (
          <View
            style={{
              flexDirection: 'row',
              backgroundColor: '#F2F4F7',
              borderRadius: 10,
              padding: 4,
              gap: 4,
            }}
          >
            <TogglePill
              label="AM"
              selected={period === 'AM'}
              onPress={() => togglePeriod('AM')}
            />
            <TogglePill
              label="PM"
              selected={period === 'PM'}
              onPress={() => togglePeriod('PM')}
            />
          </View>
        )}
      </View>
    </View>
  );
}

// --- Small pill component for AM/PM ---
function TogglePill({ label, selected, onPress }: { label: Period; selected: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: selected ? '#4F46E5' : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      activeOpacity={0.8}
    >
      <Text style={{ color: selected ? '#fff' : '#101828', fontWeight: '700', fontSize: 12 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
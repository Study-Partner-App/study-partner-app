import React from 'react';


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

    //Already aligned
    if (m === 0 || m === 30) return hhmm;

    //Snap to nearest 30
    if (m < 15) return `${hStr}:00`;
    if (m < 45) return `${hStr}:30`;
    //Snap up to next hour
    const nextHour = (h + 1) % 24;
    return `${String(nextHour).padStart(2, '0')}:00`;
  };

  return (
    <div style={{ marginBottom: 12 }}>
      {label && (
        <label htmlFor={id} style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>
          {label}
          {required ? ' *' : ''}
        </label>
      )}
      <input
        id={id}
        type="time"
        step={1800} //30 minutes in seconds
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const raw = e.target.value; //HH:MM
          const next = snap ? snapToThirty(raw) : raw;
          onChange(next);
        }}
        style={{
          padding: 8,
          borderRadius: 8,
          border: '1px solid #ccc',
          backgroundColor: '#fff'
        }}
      />
    </div>
  );
}
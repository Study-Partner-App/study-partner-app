import { supabase } from '@/lib/supabase'

/**
 * StudySession represents the shape of data returned
 * from the filter system.
 *
 */

//Courses stored as array of text. Go through array to get all classes. 
//Priority matching (best times)
//Subject itself should have more weight in priorirty list than time, even if time overlap isn't as strong
// Priority should go in this order: Course ---> Subject ---> Time overlap

/**
 *
 * 30-minute time utilities
 *
 */

/**
 * Convert HH:MM (24h) to minutes since midnight.
 * EX: 14:30 -> 870
 */
export const hhmmToMinutes = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Convert minutes since midnight back to HH:MM (24h).
 * 
 */
export const minutesToHhmm = (total: number): string => {
  const m = ((total % 1440) + 1440) % 1440; // clamp within [0, 1439]
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
};

/**
 * True if HH:MM is exactly on a 30-minute boundary.
 * Allowed minute values: 00 or 30.
 */
export const isOnThirtyBoundary = (hhmm: string): boolean => {
  const mins = hhmmToMinutes(hhmm);
  return mins % 30 === 0;
};

/**
 * Snap a given HH:MM to the 30 minute grid
 * mode = floor | ceil | nearest
 */
export const snapToThirty = (
  hhmm: string,
  mode: 'floor' | 'ceil' | 'nearest' = 'nearest'
): string => {
  const mins = hhmmToMinutes(hhmm);
  const remainder = mins % 30;

  if (remainder === 0) return hhmm; //already aligned

  if (mode === 'floor') return minutesToHhmm(mins - remainder);
  if (mode === 'ceil') return minutesToHhmm(mins + (30 - remainder));

  // nearest
  const down = mins - remainder;
  const up = mins + (30 - remainder);
  return (mins - down <= up - mins) ? minutesToHhmm(down) : minutesToHhmm(up);
};

/**
 * Format a JS Date to HH:MM (24-hour) string.
 */
export const dateToHhmm = (d: Date): string => {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * Validate the pair (start, end):
 * Both must be on 30-minute boundaries
 * end > start (same-day, no midnight crossing in this version)
 * Duration must be a multiple of 30 minutes
 *
 * should return: { valid: boolean, error?: string }
 */
export const validateThirtyMinuteRange = (
  startHhmm: string,
  endHhmm: string
): { valid: boolean; error?: string } => {
  if (!isOnThirtyBoundary(startHhmm) || !isOnThirtyBoundary(endHhmm)) {
    return { valid: false, error: 'Times must be on :00 or :30.' };
  }

  const s = hhmmToMinutes(startHhmm);
  const e = hhmmToMinutes(endHhmm);

  if (e <= s) {
    return { valid: false, error: 'End time must be after start time (same day).' };
  }

  const duration = e - s;
  if (duration % 30 !== 0) {
    return { valid: false, error: 'Duration must be in 30-minute increments.' };
  }

  return { valid: true };
};


interface StudySession {
  id: string
  //Stored separately in database
  date: string        //FORMAT: YYYY-MM-DD
  start_time: string  //FORMAT: HH:MM
  end_time: string    //FORMAT: HH:MM
  subject: string
  course?: string
  location: string
  created_at: string




  //Joined data from profiles table
  profiles: {
    email: string
    first_name: string
    last_name: string
  }
}


/**
 * These are the allowed time filters
 * that the UI can request.
 */
export type TimeFilter =
  | 'today'
  | 'next_24_hours'
  | 'this_week'


/**
 * Create function to convert time (like 2:30) into minutes
 * 
 */

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

/**
 * Need function to handle overlap logic
 * 
 */
const overlaps = (
  sessionStart: string,
  sessionEnd: string,
  selectedStart: string,
  selectedEnd: string
): boolean => {
  const sStart = timeToMinutes(sessionStart); //All times converted to minutes
  const sEnd = timeToMinutes(sessionEnd);
  const uStart = timeToMinutes(selectedStart);
  const uEnd = timeToMinutes(selectedEnd);

  return sStart < uEnd && sEnd > uStart //Return the filtered sessions
}

/**
 * Score a session based on priority:
 * Course > Subject > Time overlap
 */
const scoreSession = (
  session: StudySession,
  selectedCourse?: string,
  selectedSubject?: string,
  selectedStart?: string,
  selectedEnd?: string
): number => {
  let score = 0

  //Course match gets the highest weight
  if (selectedCourse && session.course == selectedCourse) score += 3

  //Subject match gets medium weight
  if (session.subject === selectedSubject) score += 2;

  //Time overlap gets the least weight
  if (
    selectedStart &&
    selectedEnd &&
    overlaps(session.start_time, session.end_time, selectedStart, selectedEnd)
  ) {
    score += 1
  }
  return score
}

/**
 * Generate all 30-minute slots for a day.
 * Example slot: "14:00-14:30"
 */
const generate30MinSlots = (): { start: string; end: string }[] => {
  const slots: { start: string; end: string }[] = []

  for (let hour = 0; hour < 24; hour++) {
    const hourStr = hour.toString().padStart(2, '0')
    const nextHourStr = (hour + 1).toString().padStart(2, '0')

    //First half of the hour
    slots.push({
      start: `${hourStr}:00`,
      end: `${hourStr}:30`
    })
    // Second half of the hour
    slots.push({
      start: `${hourStr}:30`,
      end: `${nextHourStr}:00`
    })
  }
  return slots
}

/**
* Groups sessions into 30-minute slots, 
* applying priority scoring within each slot.
*
* @param filter - Time filter (today / next_24_hours / this_week)
* @param selectedStart - Start of the user’s selected time window
* @param selectedEnd - End of the user’s selected time window
* @param selectedCourse - Optional: course to prioritize
* @param selectedSubject - Optional: subject to prioritize
*/
export async function getSessionsGroupedBySlot(
  filter: TimeFilter,
  selectedStart: string,
  selectedEnd: string,
  selectedCourse?: string,
  selectedSubject?: string
): Promise<Record<string, StudySession[]>> {

  //Step 1: Fetch all sessions already filtered by time
  const sessions = await fetchAndFilterByTime(
    filter,
    selectedStart,
    selectedEnd,
    selectedCourse,
    selectedSubject
  );

  //Step 2: Create slots object
  const slots: Record<string, StudySession[]> = {};

  sessions.forEach((session) => {
    //Round the session start time to nearest 30-min slot
    const startMin = timeToMinutes(session.start_time);
    const slotStartMin = Math.floor(startMin / 30) * 30;
    const slotEndMin = slotStartMin + 30;

    //Convert back to HH:MM
    const pad = (num: number) => String(num).padStart(2, '0');
    const slotLabel = `${pad(Math.floor(slotStartMin / 60))}:${pad(slotStartMin % 60)}-${pad(Math.floor(slotEndMin / 60))}:${pad(slotEndMin % 60)}`;

    //Initialize array (if needed)
    if (!slots[slotLabel]) slots[slotLabel] = [];

    //Push session into slot
    slots[slotLabel].push(session);
  });

  //Step 3: Sort sessions in each slot by priority
  Object.keys(slots).forEach((slot) => {
    slots[slot].sort((a, b) =>
      scoreSession(b, selectedCourse, selectedSubject, selectedStart, selectedEnd) -
      scoreSession(a, selectedCourse, selectedSubject, selectedStart, selectedEnd)
    );
  });

  return slots;
}
/**
 * fetchAndFilterByTime
 *
 * 1. Fetches study sessions from Supabase
 * 2. Joins profile information (email + name)
 * 3. Filters sessions based on the selected time range. Also looks at priority.
 * 4. Returns only matching sessions
 */
export async function fetchAndFilterByTime(
  filter: TimeFilter,
  selectedStart: string,
  selectedEnd: string,
  selectedCourse?: string,
  selectedSubject?: string
): Promise<StudySession[]> {


  /* Helper for date
   * Format a Date as "YYYY-MM-DD"
   */ //This needs to match supabase data.
  const toYMD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  /**
   * Get a date string offset by N days from today.
   * EX: offsetYMD(1) -> tomorrow; offsetYMD(3) -> 3 days from now
   */
  const offsetYMD = (days: number) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0); // normalize to midnight for clarity
    d.setDate(d.getDate() + days);
    return toYMD(d);
  };


  /**
   * Step 1: Fetch data from the database.
   *
   * We use study_sessions as the base table
   * and join profile information.
   */
  // Step 1: Fetch data from Supabase
  const now = new Date()
  const today = toYMD(now);

  let fromDate = today;
  let toDate = today;

  if (filter == 'next_24_hours') {
    fromDate = today;
    toDate = offsetYMD(1); // This is for today and tomorrow
  }

  if (filter == 'this_week') {
    fromDate = today;
    toDate = offsetYMD(7); // This is for sessions this week
  }

  //Supabase logic

  let query = supabase
    .from('study_sessions')
    .select(`
  id,
  created_at,
  date,
  start_time,
  end_time,
  subject,
  course,
  location,
  is_announced,
  max_people,
  creator_id,
  title,
  description,
  profiles (
    first_name,
    last_name,
    email
  )
`)
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });



  // Subject filter (required)
  if (selectedSubject) {
    query.eq('subject', selectedSubject);
    // Subjects array (I'm not 100% sure how subjects are stored- will delete if not needed)
    //query = query.contains('subjects', [selectedSubject]);
  }

  // Course filter (optional)
  if (selectedCourse) {
    query = query.eq('course', selectedCourse);
  }

  const { data, error } = await query;

  // Error check
  if (error) {
  console.error('Supabase fetch error');
  console.error('Message:', error.message);
  console.error('Details:', error.details);
  console.error('Hint:', error.hint);
  console.error('Code:', error.code);
  return [];
}

  const sessions = (data ?? []) as unknown as StudySession[];

 

  // Time filtering
  const next24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  let filtered = sessions; // Database will do date filtering. Doing it again in filter system might mess it up.

  // Time of day overlap filter

  if (selectedStart && selectedEnd) {
    filtered = filtered.filter((s) =>
      overlaps(s.start_time, s.end_time, selectedStart, selectedEnd)
    );
  }

  // Priority scoring
  return filtered
    .map((session) => ({
      ...session,
      score: scoreSession(
        session,
        selectedCourse,
        selectedSubject,
        selectedStart,
        selectedEnd
      ),
    }))
    .sort((a, b) => b.score - a.score);
}
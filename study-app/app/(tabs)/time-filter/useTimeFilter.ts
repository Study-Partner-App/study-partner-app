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
    overlaps (session.start_time, session.end_time, selectedStart, selectedEnd)
  ) {
    score += 1
  }
  return score
}

/**
 * Generate all 30-minute slots for a day.
 * Example slot: "14:00-14:30"
 */
const generate30MinSlots = (): { start: string; end: string}[] => {
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

  /**
   * Step 1: Fetch data from the database.
   *
   * We use study_sessions as the base table
   * and join profile information.
   */
  // Step 1: Fetch data from Supabase
  let { data, error } = await supabase
    .from('study_sessions')
    .select(`
      id,
      date,
      start_time,
      end_time,
      subject,
      course,
      location,
      created_at,
      profiles (
        email,
        first_name,
        last_name
      )
    `)
  /**
 * If there was a database error or no data returned,
 * we log it and just return an empty array.
 */
  // Step 1b: If database is empty or error occurs, use temporary hardcoded data
 let sessions: StudySession[] = []

if (error || !data || data.length === 0) {
  console.warn('Supabase returned empty or error. Using temporary test data.')
  sessions = [
    {
      id: '1',
      date: new Date().toISOString().split('T')[0], // today
      start_time: '14:00',
      end_time: '15:00',
      subject: 'Computer Science',
      course: 'CS101',
      location: 'Library',
      created_at: new Date().toISOString(),
      profiles: { email: 'alice@school.edu', first_name: 'Alice', last_name: 'Smith' }
    },
    {
      id: '2',
      date: new Date().toISOString().split('T')[0],
      start_time: '15:00',
      end_time: '16:00',
      subject: 'Math',
      location: 'Rayzor Hall',
      created_at: new Date().toISOString(),
      profiles: { email: 'bob@school.edu', first_name: 'Bob', last_name: 'Jones' }
    }
  ]
} else {
  sessions = data as unknown as StudySession[]
}

  /**
   * Current date and time used for comparison
   */
  const now = new Date()

  /**
   * Step 2: Filter sessions in the memory.
   *
   * Convert each session's date + start_time
   * into a real JavaScript Date object
   * so we can compare it against the data object "now".
   */

  const timeFiltered = sessions.filter((session) => {
    //Convert date + start_time into a JS Date

    //Break apart YYYY-MM-DD
    const [year, month, day] = session.date.split('-').map(Number)

    //Break apart HH:MM
    const [hour, minute] = session.start_time.split(':').map(Number)

    //Combine data and time into one object. Need (month - 1) due to JS indexes
    const start = new Date(year, month - 1, day, hour, minute)

    /**
     * Step 3: Apply selected time filter
     */
    switch (filter) {
      //Filter the sessions happening today
      case 'today': {
        const startOfDay = new Date(now)
        startOfDay.setHours(0, 0, 0, 0)

        const endOfDay = new Date(startOfDay)
        endOfDay.setDate(startOfDay.getDate() + 1)

        return start >= startOfDay && start < endOfDay
      }
      //Filter sessions happening in the next 24 hours
      case 'next_24_hours': {
        const next24 = new Date(now)
        next24.setHours(now.getHours() + 24)

        return start >= now && start <= next24
      }
      //Filter sessions happening within the next 7 days
      case 'this_week': {
        const endOfWeek = new Date(now)
        endOfWeek.setDate(now.getDate() + 7)

        return start >= now && start <= endOfWeek
      }

      default:
        return true
    }
  })

  //Apply priority scoring and sort
 //Filter course if provided
let filtered = timeFiltered;

if (selectedCourse) {
  filtered = filtered.filter(
    (s) => s.course?.toLowerCase() === selectedCourse.toLowerCase()
  );
}

//Filter subject (required)
if (selectedSubject) {
  filtered = filtered.filter(
  (s) => s.subject?.toLowerCase() === selectedSubject.toLowerCase()
);
}

//Now apply scoring only for sorting
const scoredSessions = filtered
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

  return scoredSessions
}
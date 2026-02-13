import { supabase } from '@/lib/supabase'

/**
 * StudySession represents the shape of data returned
 * from the filter system.
 *
 */
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
 * fetchAndFilterByTime
 *
 * 1. Fetches study sessions from Supabase
 * 2. Joins profile information (email + name)
 * 3. Filters sessions based on the selected time range
 * 4. Returns only matching sessions
 */
export async function fetchAndFilterByTime(
  filter: TimeFilter
): Promise<StudySession[]> {

  /**
   * Step 1: Fetch data from the database.
   *
   * We use study_sessions as the base table
   * and join profile information.
   */
  const { data, error } = await supabase
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
  if (error || !data) {
    console.error('Supabase error:', error)
    return []
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

  return (data as StudySession[]).filter((session: StudySession) => {
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
}

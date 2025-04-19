// CalendarBackend.ts - Backend implementation for Google Calendar functionality
// This file replaces the Flask backend calendar functionality with in-memory storage

import { format } from 'date-fns';

// In-memory storage for events
interface Event {
  id: string;
  summary: string;
  start: { dateTime: string; timeZone: string };
  end: { dateTime: string; timeZone: string };
  recurrence?: string[];
  attendees?: { email: string }[];
  eventType: 'habit' | 'task';
  createdAt: string;
}

// Store events in memory since we're not using a database
const events: Event[] = [];

/**
 * Generate an RRULE string for recurring events
 * Based on the generate_rrule function from the Flask backend
 */
export function generateRRule(weekdays: string[], repeatUntil?: Date): string {
  const dayMap: { [key: string]: string } = {
    "Monday": "MO",
    "Tuesday": "TU",
    "Wednesday": "WE",
    "Thursday": "TH",
    "Friday": "FR",
    "Saturday": "SA",
    "Sunday": "SU"
  };

  const byday = weekdays
    .filter(day => day in dayMap)
    .map(day => dayMap[day]);

  let rule: string;
  
  if (byday.length === 7 || byday.length === 0) {
    rule = "RRULE:FREQ=DAILY";
  } else {
    rule = `RRULE:FREQ=WEEKLY;BYDAY=${byday.join(',')}`;
  }

  if (repeatUntil) {
    // Format the date in the required format: YYYYMMDDTHHMMSSZ
    const dateStr = format(repeatUntil, "yyyyMMdd'T'HHmmss'Z'");
    rule += `;UNTIL=${dateStr}`;
  }

  return rule;
}

/**
 * Schedule a daily habit
 * Based on the schedule_daily_habit function from the Flask backend
 */
export function scheduleDailyHabit(
  summary: string, 
  startTime: Date, 
  endTime: Date, 
  days: string[] = [], 
  repeatUntil?: Date,
  attendeesEmails: string[] = []
): string {
  try {
    const recurrenceRule = generateRRule(days, repeatUntil);
    
    const event: Event = {
      id: Date.now().toString(),
      summary,
      start: { 
        dateTime: startTime.toISOString(), 
        timeZone: 'UTC' 
      },
      end: { 
        dateTime: endTime.toISOString(), 
        timeZone: 'UTC' 
      },
      recurrence: [recurrenceRule],
      attendees: attendeesEmails.map(email => ({ email })),
      eventType: 'habit',
      createdAt: new Date().toISOString()
    };

    events.push(event);
    
    return `Habit "${summary}" scheduled successfully`;
  } catch (error) {
    console.error('Error scheduling habit:', error);
    return 'Failed to schedule habit';
  }
}

/**
 * Create a one-time event/task
 * Based on the create_google_event function from the Flask backend
 */
export function createGoogleEvent(
  summary: string,
  startTime: Date,
  endTime: Date
): string {
  try {
    const event: Event = {
      id: Date.now().toString(),
      summary,
      start: { 
        dateTime: startTime.toISOString(), 
        timeZone: 'UTC' 
      },
      end: { 
        dateTime: endTime.toISOString(), 
        timeZone: 'UTC' 
      },
      eventType: 'task',
      createdAt: new Date().toISOString()
    };

    events.push(event);
    
    return `Event "${summary}" created successfully`;
  } catch (error) {
    console.error('Error creating event:', error);
    return 'Failed to create event';
  }
}

/**
 * Reschedule an existing event
 * Based on the reschedule_event function from the Flask backend
 */
export function rescheduleEvent(
  eventName: string,
  newStartTime: Date,
  newEndTime: Date
): string {
  try {
    // Find the event by name
    const eventIndex = events.findIndex(event => event.summary === eventName);
    
    if (eventIndex === -1) {
      return `No events found with name: ${eventName}`;
    }
    
    // Update the start and end time
    events[eventIndex].start.dateTime = newStartTime.toISOString();
    events[eventIndex].end.dateTime = newEndTime.toISOString();
    
    return `Event "${eventName}" rescheduled successfully`;
  } catch (error) {
    console.error('Error rescheduling event:', error);
    return 'Failed to reschedule event';
  }
}

/**
 * List events for the current day
 * Based on the list_events_for_day function from the Flask backend
 */
export function listEventsForDay(): any[] {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Filter events for today
    const todayEvents = events.filter(event => {
      const eventDate = new Date(event.start.dateTime);
      
      // Check if this is a one-time event occurring today
      if (!event.recurrence) {
        return eventDate >= today && eventDate < tomorrow;
      }
      
      // For recurring events, check if today matches the recurrence pattern
      if (event.recurrence && event.recurrence.length > 0) {
        const rule = event.recurrence[0];
        
        // Check for daily recurrence
        if (rule.includes('FREQ=DAILY')) {
          return true;
        }
        
        // Check for weekly recurrence on specific days
        if (rule.includes('FREQ=WEEKLY') && rule.includes('BYDAY=')) {
          const dayOfWeek = today.toLocaleString('en-US', { weekday: 'short' }).toUpperCase().substring(0, 2);
          return rule.includes(dayOfWeek);
        }
      }
      
      return false;
    });
    
    // Format the events for display
    return todayEvents.map(event => ({
      summary: event.summary,
      start: event.start.dateTime,
      end: event.end.dateTime,
      event_type: event.eventType === 'habit' ? 'habit' : 'task'
    }));
  } catch (error) {
    console.error('Error listing events:', error);
    return [];
  }
}

// Export all events for debugging/testing
export function getAllEvents(): Event[] {
  return [...events];
}

// Clear all events (for testing/reset)
export function clearAllEvents(): void {
  events.length = 0;
}
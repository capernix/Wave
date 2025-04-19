// GoogleCalendarService.ts - Service for integrating with Google Calendar via the Flask backend

// Use the local Flask server when running in development mode
export const CALENDAR_API_BASE_URL = __DEV__
  ? 'http://localhost:5000'
  : 'https://your-flask-api.com';  // Replace with your production API URL when deploying

import * as CalendarBackend from './CalendarBackend';

/**
 * Schedule a daily habit in Google Calendar
 * 
 * @param summary The habit title/summary
 * @param startTime Start time of the habit (ISO string)
 * @param endTime End time of the habit (ISO string)
 * @param days Array of days to repeat (e.g., ["Monday", "Wednesday", "Friday"])
 * @param repeatUntil Optional date until which to repeat (ISO string)
 * @returns Promise with calendar event link or status
 */
export const scheduleHabit = async (
  summary: string,
  startTime: string,
  endTime: string,
  days: string[] = [],
  repeatUntil?: string,
  attendeesEmails: string[] = []
): Promise<string> => {
  try {
    // For actual API integration
    if (!CALENDAR_API_BASE_URL.includes('your-flask-api.com')) {
      const response = await fetch(`${CALENDAR_API_BASE_URL}/schedule_habit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary,
          start_time: startTime,
          end_time: endTime,
          days,
          repeat_until: repeatUntil,
          attendees_emails: attendeesEmails,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.link;
    }

    // Mock implementation using our CalendarBackend module
    console.log('Scheduling habit using CalendarBackend:', summary);
    
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    const repeatUntilDate = repeatUntil ? new Date(repeatUntil) : undefined;
    
    const result = CalendarBackend.scheduleDailyHabit(
      summary,
      startDate,
      endDate,
      days,
      repeatUntilDate,
      attendeesEmails
    );
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return result;
  } catch (error) {
    console.error('Error scheduling habit:', error);
    return 'Failed to schedule habit in calendar';
  }
};

/**
 * Create a one-time task in Google Calendar
 * 
 * @param summary Task title/summary
 * @param startTime Start time (ISO string)
 * @param endTime End time (ISO string)
 * @returns Promise with calendar event link or status
 */
export const createTask = async (
  summary: string,
  startTime: string,
  endTime: string
): Promise<string> => {
  try {
    // For actual API integration
    if (!CALENDAR_API_BASE_URL.includes('your-flask-api.com')) {
      const response = await fetch(`${CALENDAR_API_BASE_URL}/create_task`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary,
          start_time: startTime,
          end_time: endTime,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.link;
    }

    // Mock implementation using our CalendarBackend module
    console.log('Creating task using CalendarBackend:', summary);
    
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    const result = CalendarBackend.createGoogleEvent(
      summary,
      startDate,
      endDate
    );
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    return result;
  } catch (error) {
    console.error('Error creating task:', error);
    return 'Failed to create task in calendar';
  }
};

/**
 * Reschedule an existing event in Google Calendar
 * 
 * @param eventName Name of the event to reschedule
 * @param newStartTime New start time (ISO string)
 * @param newEndTime New end time (ISO string)
 * @returns Promise with status message
 */
export const rescheduleEvent = async (
  eventName: string,
  newStartTime: string,
  newEndTime: string
): Promise<string> => {
  try {
    // For actual API integration
    if (!CALENDAR_API_BASE_URL.includes('your-flask-api.com')) {
      const response = await fetch(`${CALENDAR_API_BASE_URL}/reschedule_habit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: eventName,
          new_start_time: newStartTime,
          new_end_time: newEndTime,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.link;
    }

    // Mock implementation using our CalendarBackend module
    console.log('Rescheduling event using CalendarBackend:', eventName);
    
    const startDate = new Date(newStartTime);
    const endDate = new Date(newEndTime);
    
    const result = CalendarBackend.rescheduleEvent(
      eventName,
      startDate,
      endDate
    );
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return result;
  } catch (error) {
    console.error('Error rescheduling event:', error);
    return 'Failed to reschedule event in calendar';
  }
};

/**
 * List all events for the current day
 * 
 * @returns Promise with array of events
 */
export const listEventsForToday = async (): Promise<any[]> => {
  try {
    // For actual API integration
    if (!CALENDAR_API_BASE_URL.includes('your-flask-api.com')) {
      const response = await fetch(`${CALENDAR_API_BASE_URL}/list_events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    }

    // Mock implementation using our CalendarBackend module
    console.log('Listing events for today using CalendarBackend');
    
    const events = CalendarBackend.listEventsForDay();
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return events;
  } catch (error) {
    console.error('Error listing events:', error);
    return [];
  }
};

// Helper function to get all events (for testing/debugging)
export const getAllEvents = (): any[] => {
  return CalendarBackend.getAllEvents();
};

// Helper function to clear all events (for testing/reset)
export const clearAllEvents = (): void => {
  CalendarBackend.clearAllEvents();
};
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import json
import sqlite3
import os

# Add LangChain imports for remark generation
try:
    from langchain.prompts import ChatPromptTemplate
    from langchain_groq import ChatGroq
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv()
    
    # Initialize LangChain with Groq if API key exists
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    if GROQ_API_KEY:
        os.environ["GROQ_API_KEY"] = GROQ_API_KEY
        llm = ChatGroq(model="deepseek-r1-distill-llama-70b", temperature=0)
        
        # Set up prompt template for remarks
        prompt_Remarker = ChatPromptTemplate.from_messages([
            ("system", """You are an AI assistant that helps generate a single, polished remark for a habit by combining older feedback with new observations. Your goal is to merge both remarks into a clear, meaningful sentence or paragraph. Avoid repeating information and make the result sound natural and coherent.
             Just directly give the remark without any additional explanation or context. The remark should be concise and to the point, in 20 words or less."""),
            ("user", "Previous remarks: {Remarks}"),
            ("user", "New Remark: {text}"),
        ])
        chain_remarker = prompt_Remarker | llm
        
        HAS_LANGCHAIN = True
    else:
        HAS_LANGCHAIN = False
except ImportError:
    HAS_LANGCHAIN = False
    print("LangChain not available. Using simplified remark generation.")

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes

# In-memory storage instead of real Google Calendar API (for non-SQLite data)
events = []

# SQLite database setup
DB_PATH = os.path.join(os.path.dirname(__file__), 'wave.db')

# Create database and tables if they don't exist
def init_database():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create habits table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS Habits (
            ID INTEGER PRIMARY KEY AUTOINCREMENT,
            Desc TEXT NOT NULL,
            Priority INTEGER NOT NULL,
            Prefernces INTEGER NOT NULL,
            Type TEXT NOT NULL CHECK (Type IN ('Health', 'Learning', 'Creativity', 'Productivity')),
            Time TEXT NOT NULL,
            Remarks TEXT
        )
    """)
    
    # Create HabitDays table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS HabitDays (
            HabitID INTEGER,
            Day TEXT CHECK (Day IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
            FOREIGN KEY (HabitID) REFERENCES Habits(ID) ON DELETE CASCADE
        )
    """)
    
    # Create HabitTimes table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS HabitTimes (
            HabitID INTEGER,
            Time TEXT CHECK (Time IN ('Morning', 'Afternoon', 'Evening')),
            No_of_days_Completed INTEGER DEFAULT 0,
            Total_no_of_days INTEGER DEFAULT 0,
            FOREIGN KEY (HabitID) REFERENCES Habits(ID) ON DELETE CASCADE
        )
    """)
    
    # Create completions table for tracking user behavior
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS completions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            habit_id INTEGER,
            completed_at INTEGER NOT NULL,
            notes TEXT,
            FOREIGN KEY (habit_id) REFERENCES Habits(ID) ON DELETE CASCADE
        )
    """)
    
    conn.commit()
    conn.close()

# Initialize database on startup
init_database()

# ---------------------------------------     SQLite Working Functions  -------------------------------------

def insert_habit(desc, priority, preferences, habit_type, time, remarks=None):
    """Insert a new habit with optional remarks"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO Habits (Desc, Priority, Prefernces, Type, Time, Remarks)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (desc, priority, preferences, habit_type, time, remarks or ''))
    
    habit_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return habit_id

def insert_habit_days(habit_id, days_list):
    """Insert days for a habit"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    day_tuples = [(habit_id, day) for day in days_list]
    cursor.executemany("INSERT INTO HabitDays (HabitID, Day) VALUES (?, ?)", day_tuples)
    
    conn.commit()
    conn.close()

def insert_habit_times(habit_id, times_list):
    """Insert time periods for a habit"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    for time_of_day in times_list:
        cursor.execute("""
            INSERT INTO HabitTimes (HabitID, Time, No_of_days_Completed, Total_no_of_days)
            VALUES (?, ?, ?, ?)
        """, (habit_id, time_of_day, 0, 0))
    
    conn.commit()
    conn.close()

def update_habit(habit_id, desc=None, priority=None, preferences=None, habit_type=None, time=None, remarks=None):
    """Update habit details"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    fields = []
    values = []
    
    if desc is not None:
        fields.append("Desc = ?")
        values.append(desc)
    if priority is not None:
        fields.append("Priority = ?")
        values.append(priority)
    if preferences is not None:
        fields.append("Prefernces = ?")
        values.append(preferences)
    if habit_type is not None:
        fields.append("Type = ?")
        values.append(habit_type)
    if time is not None:
        fields.append("Time = ?")
        values.append(time)
    if remarks is not None:
        fields.append("Remarks = ?")
        values.append(remarks)
    
    values.append(habit_id)
    
    if fields:
        query = f"UPDATE Habits SET {', '.join(fields)} WHERE ID = ?"
        cursor.execute(query, values)
    
    conn.commit()
    conn.close()
    
    return habit_id

def update_habit_days(habit_id, new_days):
    """Update the days for a habit"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Delete existing days
    cursor.execute("DELETE FROM HabitDays WHERE HabitID = ?", (habit_id,))
    
    # Insert new days
    insert_habit_days(habit_id, new_days)
    
    conn.commit()
    conn.close()

def update_habit_times(habit_id, new_times):
    """Update the times for a habit"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Delete existing times
    cursor.execute("DELETE FROM HabitTimes WHERE HabitID = ?", (habit_id,))
    
    # Insert new times
    insert_habit_times(habit_id, new_times)
    
    conn.commit()
    conn.close()

def update_habit_progress(habit_id, completed_days=None, total_days=None):
    """Update habit progress tracking"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    fields = []
    values = []
    
    if completed_days is not None:
        fields.append("No_of_days_Completed = ?")
        values.append(completed_days)
    if total_days is not None:
        fields.append("Total_no_of_days = ?")
        values.append(total_days)
    
    values.append(habit_id)
    
    if fields:
        query = f"UPDATE HabitTimes SET {', '.join(fields)} WHERE HabitID = ?"
        cursor.execute(query, values)
    
    conn.commit()
    conn.close()

def delete_habit(habit_id):
    """Delete a habit and all related data"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM Habits WHERE ID = ?", (habit_id,))
    
    # Due to foreign key constraints, this will cascade to delete related records
    
    conn.commit()
    conn.close()
    
    return True

def get_habit_by_id(habit_id):
    """Get a habit by ID"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Use Row objects instead of tuples
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM Habits WHERE ID = ?", (habit_id,))
    habit_row = cursor.fetchone()
    
    if not habit_row:
        conn.close()
        return None
        
    # Convert DB row to dictionary
    habit_dict = dict(habit_row)
    
    # Get days for this habit
    cursor.execute("SELECT Day FROM HabitDays WHERE HabitID = ?", (habit_id,))
    days = [row[0] for row in cursor.fetchall()]
    
    # Get times for this habit
    cursor.execute("SELECT Time FROM HabitTimes WHERE HabitID = ?", (habit_id,))
    times = [{"time": row[0]} for row in cursor.fetchall()]
    
    habit_dict["days"] = days
    habit_dict["times"] = times
    
    conn.close()
    return habit_dict

def get_habits(habit_type=None):
    """Get all habits with optional type filter, sorted by priority and time"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    query = """
        SELECT * FROM Habits 
        {}
        ORDER BY Priority DESC, Time ASC
    """
    
    if habit_type:
        where_clause = "WHERE Type = ?"
        cursor.execute(query.format(where_clause), (habit_type,))
    else:
        cursor.execute(query.format(""))
        
    habits = []
    habit_ids = [] # Keep track of IDs to fetch days/times efficiently
    habit_map = {} # Map ID to habit dict

    for habit_row in cursor.fetchall():
        habit_dict = dict(habit_row)
        habit_id = habit_dict["ID"]
        habit_ids.append(habit_id)
        habit_map[habit_id] = habit_dict
        # Initialize days and times as empty lists
        habit_dict["days"] = []
        habit_dict["times"] = []
        habits.append(habit_dict)

    if not habit_ids:
        conn.close()
        return []

    # Fetch all days for the retrieved habits in one go
    placeholders_days = ',' .join('?' * len(habit_ids))
    cursor.execute(f"SELECT HabitID, Day FROM HabitDays WHERE HabitID IN ({placeholders_days})", habit_ids)
    for row in cursor.fetchall():
        habit_id, day = row
        if habit_id in habit_map:
            habit_map[habit_id]["days"].append(day)

    # Fetch all times for the retrieved habits in one go
    placeholders_times = ',' .join('?' * len(habit_ids))
    cursor.execute(f"SELECT HabitID, Time FROM HabitTimes WHERE HabitID IN ({placeholders_times})", habit_ids)
    for row in cursor.fetchall():
        habit_id, time_period = row
        if habit_id in habit_map:
            # Ensure times is an array of objects
            habit_map[habit_id]["times"].append({"time": time_period})
    
    conn.close()
    # The 'habits' list now contains dicts with populated 'days' and 'times'
    return habits

def get_habit_completions(habit_id):
    """Get completion records for a habit"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT * FROM completions 
        WHERE habit_id = ? 
        ORDER BY completed_at DESC
    """, (habit_id,))
    
    completions = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return completions

def update_habit_remark(habit_id, text):
    """Update the remark for a habit using LangChain if available"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get existing remark
    cursor.execute("SELECT Remarks FROM Habits WHERE ID = ?", (habit_id,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        return None
        
    current_remark = row[0] or ""
    
    # Generate new remark
    if HAS_LANGCHAIN:
        try:
            # Use LangChain for smart remark generation
            result = chain_remarker.invoke({"text": text, "Remarks": current_remark})
            
            # Process the result
            remark_content = result.content
            
            # Clean up the result if needed
            if "</think>" in remark_content:
                new_remark = remark_content.split("</think>", 1)[1].strip()
            else:
                new_remark = remark_content.strip()
        except Exception as e:
            print(f"Error with LangChain remark generation: {e}")
            # Fallback to simple remark combining
            new_remark = f"{current_remark}. {text}".strip()
            if current_remark and text in current_remark:
                new_remark = current_remark
    else:
        # Simple remark combining logic
        new_remark = f"{current_remark}. {text}".strip()
        if current_remark and text in current_remark:
            new_remark = current_remark
    
    # Truncate to ~20 words max
    words = new_remark.split()
    if len(words) > 20:
        new_remark = ' '.join(words[:20])
    
    # Update the habit
    cursor.execute("UPDATE Habits SET Remarks = ? WHERE ID = ?", (new_remark, habit_id))
    
    conn.commit()
    conn.close()
    
    return new_remark

def add_completion(habit_id, completed_at, notes=None):
    """Add a completion record for habit tracking"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        "INSERT INTO completions (habit_id, completed_at, notes) VALUES (?, ?, ?)",
        (habit_id, completed_at, notes)
    )
    completion_id = cursor.lastrowid
    
    # Update habit progress statistics
    # Find times associated with this habit
    cursor.execute("SELECT Time FROM HabitTimes WHERE HabitID = ?", (habit_id,))
    times = cursor.fetchall()
    
    # Update the stats for each time
    for time_row in times:
        time_period = time_row[0]
        cursor.execute("""
            UPDATE HabitTimes 
            SET No_of_days_Completed = No_of_days_Completed + 1,
                Total_no_of_days = Total_no_of_days + 1
            WHERE HabitID = ? AND Time = ?
        """, (habit_id, time_period))
    
    conn.commit()
    conn.close()
    return completion_id

def get_habit_stats(habit_id):
    """Get completion statistics for a habit"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Get the raw completion data
    cursor.execute("SELECT completed_at FROM completions WHERE habit_id = ? ORDER BY completed_at DESC", (habit_id,))
    completions = cursor.fetchall()
    
    # Calculate statistics
    total = len(completions)
    streak_days = 0
    
    if total > 0:
        # Start with day 0 as completed
        streak_days = 1
        
        # Convert timestamps to dates for streak calculation
        dates_completed = set()
        for completion in completions:
            date_str = datetime.fromtimestamp(completion[0]).strftime('%Y-%m-%d')
            dates_completed.add(date_str)
        
        # Sort dates for streak calculation
        sorted_dates = sorted(dates_completed, reverse=True)
        
        # Count consecutive days
        if sorted_dates:
            current_date = datetime.strptime(sorted_dates[0], '%Y-%m-%d')
            
            for i in range(1, len(sorted_dates)):
                next_date = datetime.strptime(sorted_dates[i], '%Y-%m-%d')
                expected_date = current_date - timedelta(days=1)
                
                if next_date.date() == expected_date.date():
                    streak_days += 1
                    current_date = next_date
                else:
                    break
    
    conn.close()
    return {
        "total": total,
        "streakDays": streak_days
    }

def get_habits_for_day_and_time(day, time_of_day=None):
    """Get habits scheduled for a specific day and optional time period, sorted by priority and time"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    if time_of_day:
        # Get habits for specific day and time
        cursor.execute("""
            SELECT DISTINCT h.*
            FROM Habits h
            JOIN HabitDays hd ON h.ID = hd.HabitID
            JOIN HabitTimes ht ON h.ID = ht.HabitID
            WHERE hd.Day = ? AND ht.Time = ?
            ORDER BY h.Priority DESC, h.Time ASC
        """, (day, time_of_day))
    else:
        # Get habits for specific day
        cursor.execute("""
            SELECT DISTINCT h.*
            FROM Habits h
            JOIN HabitDays hd ON h.ID = hd.HabitID
            WHERE hd.Day = ?
            ORDER BY h.Priority DESC, h.Time ASC
        """, (day,))
    
    habits = []
    for habit_row in cursor.fetchall():
        habit_dict = dict(habit_row)
        habit_id = habit_dict["ID"]
        
        # Get days for this habit
        cursor.execute("SELECT Day FROM HabitDays WHERE HabitID = ?", (habit_id,))
        days = [row[0] for row in cursor.fetchall()]
        
        # Get times for this habit
        cursor.execute("SELECT Time FROM HabitTimes WHERE HabitID = ?", (habit_id,))
        times = [row[0] for row in cursor.fetchall()]
        
        habit_dict["days"] = days
        habit_dict["times"] = times
        
        habits.append(habit_dict)
    
    conn.close()
    return habits

# ---------------------------------------     Calendar Functions  -------------------------------------

def generate_rrule(weekdays, repeat_until=None):
    day_map = {
        "Monday": "MO",
        "Tuesday": "TU",
        "Wednesday": "WE",
        "Thursday": "TH",
        "Friday": "FR",
        "Saturday": "SA",
        "Sunday": "SU"
    }
    byday = [day_map[day] for day in weekdays if day in day_map]

    if len(byday) == 7 or len(byday) == 0:
        rule = "RRULE:FREQ=DAILY"
    else:
        rule = f"RRULE:FREQ=WEEKLY;BYDAY={','.join(byday)}"

    if repeat_until:
        rule += f";UNTIL={repeat_until.strftime('%Y%m%dT%H%M%SZ')}"

    return rule

def schedule_daily_habit(summary, start_time, end_time, attendees_emails=[], repeat_until=None, days=[]):
    # Create an ID for the event
    event_id = f"event_{len(events) + 1}"
    
    # Generate recurrence rule
    recurrence_rule = generate_rrule(days, repeat_until)
    
    # Create event object
    event = {
        'id': event_id,
        'summary': summary,
        'start': {'dateTime': start_time.isoformat(), 'timeZone': 'UTC'},
        'end': {'dateTime': end_time.isoformat(), 'timeZone': 'UTC'},
        'attendees': [{'email': email} for email in attendees_emails],
        'recurrence': [recurrence_rule],
        'eventType': 'habit'
    }
    
    # Store in memory
    events.append(event)
    
    return f"http://localhost:5000/view_event/{event_id}"

def create_google_event(summary, start_time, end_time):
    # Create an ID for the event
    event_id = f"event_{len(events) + 1}"
    
    # Create event object
    event = {
        'id': event_id,
        'summary': summary,
        'start': {'dateTime': start_time.isoformat(), 'timeZone': 'UTC'},
        'end': {'dateTime': end_time.isoformat(), 'timeZone': 'UTC'},
        'eventType': 'task'
    }
    
    # Store in memory
    events.append(event)
    
    return f"http://localhost:5000/view_event/{event_id}"

def reschedule_event(event_name, new_start_time, new_end_time):
    # Find event by name
    for event in events:
        if event['summary'] == event_name:
            # Update times
            event['start']['dateTime'] = new_start_time.isoformat()
            event['end']['dateTime'] = new_end_time.isoformat()
            return f"http://localhost:5000/view_event/{event['id']}"
    
    return f"No events found with name: {event_name}"

def list_events_for_day():
    target_date = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    today_str = target_date.strftime('%Y-%m-%d')
    
    day_events = []
    for event in events:
        event_date = event['start']['dateTime'].split('T')[0]
        if event_date == today_str:
            day_events.append({
                'summary': event['summary'],
                'start': event['start']['dateTime'],
                'end': event['end']['dateTime'],
                'event_type': event['eventType']
            })
    
    return day_events

# ---------------------------------------     AI Profile Generation  -------------------------------------

def generate_profile(user_data):
    """Generate a user profile based on questionnaire responses"""
    # Use LangChain if available
    if HAS_LANGCHAIN:
        try:
            # Create prompt template for profile generation
            profile_prompt = ChatPromptTemplate.from_messages([
                (
                    "system",
                    """You are a Profile generator AI.
                    You are provided with a question answer session of a user and you need to generate a profile for the user based on the session.
                    The profile should include the following information: Likes, Dislikes, Hobbies, Interests, and any other relevant information.""",
                ),
                ("user", json.dumps(user_data)),
            ])
            
            profile_chain = profile_prompt | llm
            response = profile_chain.invoke({})
            profile = response.content
            
            # Clean up the result if needed
            if "</think>" in profile:
                return profile.split("</think>", 1)[1].strip()
            return profile
        except Exception as e:
            print(f"Error with LangChain profile generation: {e}")
    
    # Fallback to simple profile generation
    profile = "Based on your answers, "
    
    # Extract key preferences (simplified version)
    free_time = user_data.get("How do you usually prefer to spend your free time?", [])
    if isinstance(free_time, list):
        if "Engaging in creative activities" in free_time:
            profile += "you're interested in creative pursuits. "
        if "Socializing with friends/family" in free_time:
            profile += "you value social connections. "
        if "Learning something new" in free_time:
            profile += "you have a thirst for knowledge. "
    
    # Work style
    work_style = user_data.get("What's your ideal work style?", "")
    if "structured environment" in work_style.lower():
        profile += "You thrive with structure and organization. "
    
    # Task approach
    task_approach = user_data.get("Which of the following statements best describes your approach to tasks?", "")
    if "small, manageable tasks" in task_approach.lower():
        profile += "You prefer breaking down tasks into smaller parts. "
    
    # Motivation
    motivation = user_data.get("What motivates you the most to stick to a goal or habit?", "")
    if "Internal satisfaction" in motivation:
        profile += "You're intrinsically motivated and driven by personal growth."
    
    return profile

# ---------------------------------------     API Endpoints  -------------------------------------

@app.route('/schedule_habit', methods=['POST'])
def schedule_habit():
    data = request.json
    summary = data['summary']
    start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
    end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
    attendees_emails = data.get('attendees_emails', [])
    repeat_until = data.get('repeat_until')
    days = data.get('days', [])

    if repeat_until:
        repeat_until = datetime.fromisoformat(repeat_until.replace('Z', '+00:00'))

    link = schedule_daily_habit(summary, start_time, end_time, attendees_emails, repeat_until, days)
    
    return jsonify({'link': link})

@app.route('/create_task', methods=['POST'])
def create_task():
    data = request.json
    summary = data['summary']
    start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
    end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))

    link = create_google_event(summary, start_time, end_time)
    
    return jsonify({'link': link})

@app.route('/reschedule_habit', methods=['POST'])
def reschedule_habit():
    data = request.json
    event_name = data['event_name']
    new_start_time = datetime.fromisoformat(data['new_start_time'].replace('Z', '+00:00'))
    new_end_time = datetime.fromisoformat(data['new_end_time'].replace('Z', '+00:00'))

    link = reschedule_event(event_name, new_start_time, new_end_time)
    
    return jsonify({'link': link})

@app.route('/list_events', methods=['GET'])
def list_events():
    events_list = list_events_for_day()
    return jsonify(events_list)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/view_event/<event_id>', methods=['GET'])
def view_event(event_id):
    for event in events:
        if event['id'] == event_id:
            return jsonify(event)
    
    return jsonify({'error': 'Event not found'}), 404

# ---------------------------------------     SQLite-based API Endpoints  -------------------------------------

@app.route('/api/create_habit', methods=['POST'])
def api_create_habit():
    """Create a new habit with simplified structure"""
    data = request.json
    print(f"Received data for /api/create_habit: {data}") # Add logging

    # Extract basic habit info
    desc = data.get('desc', '')  # This is the main title/name of the habit
    priority = data.get('priority', 1)
    preferences = data.get('preferences', 0) # Correctly maps to Prefernces column
    habit_type = data.get('type', 'Health')
    time = data.get('time', '') # Specific time like '08:00'
    remarks = data.get('remarks', '')
    
    # Extract days and times
    days = data.get('days', [])
    times = data.get('times', []) # Time periods like ['Morning', 'Evening']

    # --- Start Validation ---
    if not desc:
         print("Error: Missing 'desc' field in request.")
         return jsonify({"error": "Missing 'desc' (description) field"}), 400
    if not days:
         print("Error: Missing 'days' field or empty list.")
         return jsonify({"error": "Missing 'days' field"}), 400
    if not times:
         print("Error: Missing 'times' field or empty list.")
         return jsonify({"error": "Missing 'times' field"}), 400
    # --- End Validation ---
    
    # Insert the habit
    habit_id = insert_habit(desc, priority, preferences, habit_type, time, remarks)
    print(f"Inserted habit with ID: {habit_id}") # Add logging
    
    # Insert the days 
    if habit_id and days:
         insert_habit_days(habit_id, days)
         print(f"Inserted days for habit {habit_id}: {days}") # Add logging
    
    # Insert times (one entry per time period)
    if habit_id and times:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        try:
            for time_of_day in times:
                cursor.execute("""
                    INSERT INTO HabitTimes (HabitID, Time, No_of_days_Completed, Total_no_of_days)
                    VALUES (?, ?, ?, ?)
                """, (habit_id, time_of_day, 0, 0))
            conn.commit()
            print(f"Inserted times for habit {habit_id}: {times}") # Add logging
        except Exception as e_time:
             print(f"Error inserting times for habit {habit_id}: {e_time}")
             conn.rollback() # Rollback on error
             raise e_time # Re-raise the exception to be caught below
        finally:
             conn.close()
    
    # Return the created habit with all its data
    habit = get_habit_by_id(habit_id)
    if habit:
         print(f"Returning created habit data: {habit}") # Add logging
         return jsonify(habit)
    else:
         print(f"Error: Could not retrieve habit {habit_id} after creation.")
         return jsonify({"error": "Failed to retrieve habit after creation"}), 500

@app.route('/api/update_habit', methods=['POST'])
def api_update_habit():
    """Update an existing habit"""
    data = request.json
    
    try:
        habit_id = data['habit_id']
        
        # Update habit details
        update_habit(
            habit_id,
            desc=data.get('desc'),
            priority=data.get('priority'),
            preferences=data.get('preferences'),
            habit_type=data.get('type'),
            time=data.get('time'),
            remarks=data.get('remarks')
        )
        
        # Update days and times if provided
        if 'days' in data:
            update_habit_days(habit_id, data['days'])
        
        if 'times' in data:
            update_habit_times(habit_id, data['times'])
        
        return jsonify({'id': habit_id, 'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete_habit', methods=['POST'])
def api_delete_habit():
    """Delete a habit"""
    data = request.json
    
    try:
        habit_id = data['habit_id']
        delete_habit(int(habit_id))
        return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_habit', methods=['GET'])
def api_get_habit():
    """Get a habit by ID"""
    habit_id = request.args.get('id')
    if not habit_id:
        return jsonify({'error': 'Missing habit ID'}), 400
    
    habit = get_habit_by_id(int(habit_id))
    if habit:
        return jsonify(habit)
    else:
        return jsonify({'error': 'Habit not found'}), 404

@app.route('/api/get_habits', methods=['GET', 'POST'])
def api_get_habits():
    """Get all habits or filter by type"""
    if request.method == 'POST':
        data = request.json
        habit_type = data.get('type')
    else:
        habit_type = request.args.get('type')
    
    habits = get_habits(habit_type)
    return jsonify(habits)

@app.route('/api/get_habits_by_day', methods=['GET'])
def api_get_habits_by_day():
    """Get habits for a specific day and time"""
    day = request.args.get('day')
    time = request.args.get('time')
    
    if not day:
        return jsonify({'error': 'Missing day parameter'}), 400
    
    habits = get_habits_for_day_and_time(day, time)
    return jsonify(habits)

@app.route('/api/get_completions', methods=['GET', 'POST'])
def api_get_completions():
    """Get completion records for a habit"""
    if request.method == 'POST':
        data = request.json
        habit_id = data.get('habit_id')
    else:
        habit_id = request.args.get('habit_id')
    
    if not habit_id:
        return jsonify({'error': 'Missing habit ID'}), 400
    
    completions = get_habit_completions(int(habit_id))
    return jsonify(completions)

@app.route('/api/remarker', methods=['POST'])
def remarker():
    """Update remarks for a habit"""
    data = request.json
    habit_id = data.get('habit_id')
    text = data.get('text')
    
    if not habit_id or not text:
        return jsonify({'error': 'Missing habit_id or text'}), 400
    
    updated_remark = update_habit_remark(int(habit_id), text)
    if updated_remark is not None:
        return jsonify({'remark': updated_remark})
    else:
        return jsonify({'error': 'Habit not found'}), 404

@app.route('/api/add_completion', methods=['POST'])
def api_add_completion():
    """Add a completion record for a habit"""
    data = request.json
    habit_id = data.get('habit_id')
    completed_at = data.get('completed_at', int(datetime.now().timestamp()))
    notes = data.get('notes')
    
    if not habit_id:
        return jsonify({'error': 'Missing habit_id'}), 400
    
    completion_id = add_completion(int(habit_id), completed_at, notes)
    return jsonify({'id': completion_id})

@app.route('/api/get_stats', methods=['GET'])
def api_get_stats():
    """Get stats for a habit"""
    habit_id = request.args.get('id')
    if not habit_id:
        return jsonify({'error': 'Missing habit ID'}), 400
    
    stats = get_habit_stats(int(habit_id))
    return jsonify(stats)

@app.route('/api/profiler', methods=['POST'])
def profiler():
    """Generate a user profile based on questionnaire responses"""
    data = request.json
    user_data = data.get('user_data')
    
    if not user_data:
        return jsonify({'error': 'Missing user_data'}), 400
    
    profile = generate_profile(user_data)
    
    return jsonify({'profile': profile})

@app.route('/api/get_habit_by_id', methods=['POST'])
def api_get_habit_by_id():
    """Get a habit by ID (POST method version)"""
    data = request.json
    habit_id = data.get('habit_id')
    
    if not habit_id:
        return jsonify({'error': 'Missing habit_id'}), 400
    
    habit = get_habit_by_id(int(habit_id))
    if habit:
        return jsonify(habit)
    else:
        return jsonify({'error': 'Habit not found'}), 404

@app.route('/api/habit_no_of_days', methods=['POST'])
def api_habit_no_of_days():
    """Get completion statistics for a habit (compatibility method)"""
    data = request.json
    habit_id = data.get('habit_id')
    
    if not habit_id:
        return jsonify({'error': 'Missing habit_id'}), 400
    
    # Get habit stats
    stats = get_habit_stats(int(habit_id))
    
    # Return in the format expected by the frontend
    return jsonify([stats['total'], max(stats['total'], 7)])

# ---------------------------------------     Helper Endpoints  -------------------------------------

@app.route('/clear_events', methods=['POST'])
def clear_events():
    global events
    events = []
    return jsonify({'status': 'cleared'})

@app.route('/reset_database', methods=['POST'])
def reset_database():
    """Reset the SQLite database (for testing)"""
    try:
        # Delete database file if it exists
        if os.path.exists(DB_PATH):
            os.remove(DB_PATH)
        
        # Recreate the database
        init_database()
        return jsonify({'status': 'Database reset successful'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ---------------------------------------     Flask App API Routes  -------------------------------------

@app.route('/api/create_habit', methods=['POST'])
def create_habit_route():
    """Create a new habit with simplified structure"""
    try:
        data = request.json
        print(f"Received data for /api/create_habit: {data}") # Add logging

        # Extract basic habit info
        desc = data.get('desc', '')  # This is the main title/name of the habit
        priority = data.get('priority', 1)
        preferences = data.get('preferences', 0) # Correctly maps to Prefernces column
        habit_type = data.get('type', 'Health')
        time = data.get('time', '') # Specific time like '08:00'
        remarks = data.get('remarks', '')
        
        # Extract days and times
        days = data.get('days', [])
        times = data.get('times', []) # Time periods like ['Morning', 'Evening']

        # --- Start Validation ---
        if not desc:
             print("Error: Missing 'desc' field in request.")
             return jsonify({"error": "Missing 'desc' (description) field"}), 400
        if not days:
             print("Error: Missing 'days' field or empty list.")
             return jsonify({"error": "Missing 'days' field"}), 400
        if not times:
             print("Error: Missing 'times' field or empty list.")
             return jsonify({"error": "Missing 'times' field"}), 400
        # --- End Validation ---
        
        # Insert the habit
        habit_id = insert_habit(desc, priority, preferences, habit_type, time, remarks)
        print(f"Inserted habit with ID: {habit_id}") # Add logging
        
        # Insert the days 
        if habit_id and days:
             insert_habit_days(habit_id, days)
             print(f"Inserted days for habit {habit_id}: {days}") # Add logging
        
        # Insert times (one entry per time period)
        if habit_id and times:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            try:
                for time_of_day in times:
                    cursor.execute("""
                        INSERT INTO HabitTimes (HabitID, Time, No_of_days_Completed, Total_no_of_days)
                        VALUES (?, ?, ?, ?)
                    """, (habit_id, time_of_day, 0, 0))
                conn.commit()
                print(f"Inserted times for habit {habit_id}: {times}") # Add logging
            except Exception as e_time:
                 print(f"Error inserting times for habit {habit_id}: {e_time}")
                 conn.rollback() # Rollback on error
                 raise e_time # Re-raise the exception to be caught below
            finally:
                 conn.close()
        
        # Return the created habit with all its data
        habit = get_habit_by_id(habit_id)
        if habit:
             print(f"Returning created habit data: {habit}") # Add logging
             return jsonify(habit)
        else:
             print(f"Error: Could not retrieve habit {habit_id} after creation.")
             return jsonify({"error": "Failed to retrieve habit after creation"}), 500

    except Exception as e:
        print(f"Error in /api/create_habit: {e}") # Log the exception
        import traceback
        traceback.print_exc() # Print full traceback
        return jsonify({"error": str(e)}), 500

@app.route('/api/get_habits', methods=['POST'])
def get_habits_route():
    """Get all habits with optional type filter"""
    try:
        data = request.json if request.is_json else {}
        habit_type = data.get('type')
        print(f"Fetching habits for type: {habit_type}") # Add logging
        
        habits_list = get_habits(habit_type)
        print(f"Returning {len(habits_list)} habits.") # Add logging
        return jsonify(habits_list)
    except Exception as e:
        print(f"Error in /api/get_habits: {e}") # Log the exception
        import traceback
        traceback.print_exc() # Print full traceback
        return jsonify({"error": str(e)}), 500

@app.route('/api/get_habit_by_id', methods=['POST'])
def get_habit_by_id_route():
    """Get a habit by ID"""
    try:
        data = request.json
        habit_id = data.get('habit_id')
        
        if not habit_id:
            return jsonify({"error": "Missing habit_id parameter"}), 400
            
        habit = get_habit_by_id(habit_id)
        
        if not habit:
            return jsonify({"error": "Habit not found"}), 404
            
        return jsonify(habit)
    except Exception as e:
        print(f"Error getting habit: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/add_completion', methods=['POST'])
def add_completion_route():
    """Mark a habit as completed"""
    try:
        data = request.json
        habit_id = data.get('habit_id')
        completed_at = data.get('completed_at', int(datetime.now().timestamp()))
        notes = data.get('notes', '')
        
        if isinstance(completed_at, str):
            # Parse ISO string to timestamp
            completed_at = int(datetime.fromisoformat(completed_at.replace('Z', '+00:00')).timestamp())
        
        completion_id = add_completion(habit_id, completed_at, notes)
        return jsonify({"id": completion_id})
    except Exception as e:
        print(f"Error adding completion: {e}")
        return jsonify({"error": str(e)}), 500

# Add a route to update the Flask server is alive 
@app.route('/api/ping', methods=['GET'])
def ping():
    """Simple health check endpoint"""
    return jsonify({"status": "ok", "message": "Server is running"}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
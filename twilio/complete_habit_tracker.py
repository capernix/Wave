import os
import requests
from flask import Flask, request
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Gather
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration
app = Flask(__name__)
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

# Twilio credentials
TWILIO_ACCOUNT_SID = os.environ.get("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.environ.get("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.environ.get("TWILIO_PHONE_NUMBER")

# Initialize Twilio client
client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)

# System prompt for Llama3-70b to act as a habit tracking expert
SYSTEM_PROMPT = """
You are a friendly, supportive habit tracking expert. Your tone is casual and encouraging, like talking to a friend.
You use phrases like "bro", "dude", and other friendly language.
Your goal is to help users build and maintain positive habits by:
1. Providing practical advice for habit formation and maintenance
2. Offering encouragement when users face challenges
3. Celebrating their successes, no matter how small
4. Suggesting specific strategies when they're struggling
5. Keeping responses concise and conversational (under 3 sentences when possible)

Avoid being judgmental or overly formal. Be the supportive friend who knows a lot about habit building.
"""

# Function to call Llama3-70b
def call_llama3_70b(user_message):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.7,
        "max_tokens": 200
    }
    
    try:
        response = requests.post(GROQ_API_URL, json=data, headers=headers)
        response.raise_for_status()
        response_data = response.json()
        return response_data["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error calling Llama3-70b: {e}")
        return "Sorry bro, I hit a technical glitch. Let's try again later."

# Route for initiating a call
@app.route("/make-call", methods=["POST"])
def make_call():
    # Get the phone number from the request
    to_number = request.json.get("phone", "+918263098315")
    
    # Create TwiML for the call
    response = VoiceResponse()
    response.redirect("/voice")
    
    # Make the call
    try:
        call = client.calls.create(
            twiml=str(response),
            to=to_number,
            from_=TWILIO_PHONE_NUMBER,
            url=request.url_root + "voice"
        )
        return {"success": True, "sid": call.sid}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Route for handling the initial voice interaction
@app.route("/voice", methods=["GET", "POST"])
def voice():
    response = VoiceResponse()
    
    # Friendly greeting
    response.say("Hey bro! How've you been? This is your habit tracking buddy checking in on your progress.", voice="man")
    
    # Gather speech input
    gather = Gather(
        input="speech",
        action="/process-speech",
        method="POST",
        timeout=5,
        speechTimeout="auto"
    )
    
    gather.say("Tell me how your habits are going today, or if you're facing any challenges, dude. I'm here to help.", voice="man")
    response.append(gather)
    
    # If no input received
    response.say("I didn't catch that. Let's try again later, bro.", voice="man")
    
    return str(response)

# Route for processing speech and responding with Llama3-70b
@app.route("/process-speech", methods=["POST"])
def process_speech():
    # Get the user's speech from Twilio
    user_speech = request.values.get("SpeechResult", "")
    print(f"User said: {user_speech}")
    
    response = VoiceResponse()
    
    if user_speech and user_speech.strip():
        # Get response from Llama3-70b
        llm_response = call_llama3_70b(user_speech)
        print(f"LLM responded: {llm_response}")
        
        # Speak the AI response
        response.say(llm_response, voice="man")
        
        # Ask if they want to continue
        gather = Gather(
            input="speech",
            action="/process-speech",
            method="POST",
            timeout=5,
            speechTimeout="auto"
        )
        
        gather.say("Anything else you want to chat about, bro?", voice="man")
        response.append(gather)
        
        # If no further input, end call
        response.say("Thanks for chatting, dude! Talk to you later.", voice="man")
    else:
        # No speech detected
        response.say("I didn't catch that, buddy! Mind saying it again?", voice="man")
        
        # Try again
        gather = Gather(
            input="speech",
            action="/process-speech",
            method="POST",
            timeout=5,
            speechTimeout="auto"
        )
        
        gather.say("What's up with your habits today?", voice="man")
        response.append(gather)
    
    return str(response)

# Run the Flask app
if __name__ == "__main__":
    print("Starting Habit Tracker Voice App...")
    print("Make sure ngrok is running to expose this server to Twilio")
    print("Example: ngrok http 3000")
    app.run(debug=True, port=3000)

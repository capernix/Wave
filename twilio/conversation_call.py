import os
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Gather
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Twilio credentials
account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
twilio_phone = os.environ.get('TWILIO_PHONE_NUMBER')

# Your phone number
my_phone = "+918263098315"  # Update with your actual number if different

# Create a TwiML response that includes a <Gather> verb to collect speech
# and a webhook URL to process the speech
response = VoiceResponse()

# Friendly greeting
response.say("Hey bro! How've you been? This is your habit tracking buddy checking in on your progress.", voice="man")

# Create a Gather verb that will collect speech input
gather = Gather(
    input="speech",
    action="https://2881-2409-40c0-104b-b3db-884a-fad6-39e4-724f.ngrok-free.app/process-speech",  # This should point to your ngrok URL
    method="POST",
    timeout=5,
    speechTimeout="auto"
)

# Add a prompt to the Gather verb
gather.say("Tell me how your habits are going today, or if you're facing any challenges, dude. I'm here to help.", voice="man")

# Add the Gather verb to the response
response.append(gather)

# If the user doesn't say anything, this message will play
response.say("I didn't hear anything, bro. Let's catch up later.", voice="man")

# Create Twilio client
client = Client(account_sid, auth_token)

# Make the call
print(f"Placing call to {my_phone} from {twilio_phone}")
try:
    call = client.calls.create(
        twiml=str(response),  # Use the TwiML directly
        to=my_phone,
        from_=twilio_phone
    )
    print(f"Call successfully placed! SID: {call.sid}")
    print("Your phone should ring shortly.")
    print("\nIMPORTANT: For this call to properly handle your responses, make sure:")
    print("1. Your Flask app (complete_habit_tracker.py) is running")
    print("2. Ngrok is running and forwarding to port 3000")
    print("3. The ngrok URL in this script matches your actual ngrok URL")
except Exception as e:
    print(f"Error placing call: {e}")

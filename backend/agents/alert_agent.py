import os
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Tuple
from airtable import Airtable
from twilio.rest import Client
from haversine import haversine

class AlertAgent:
    def __init__(self):
        self.airtable = Airtable(
            os.getenv('AIRTABLE_BASE_ID'),
            'My_Sightings',
            api_key=os.getenv('AIRTABLE_API_KEY')
        )
        self.twilio_client = Client(
            os.getenv('TWILIO_SID'),
            os.getenv('TWILIO_TOKEN')
        )
        self.twilio_from = os.getenv('TWILIO_FROM')
        self.twilio_to = '+19034363353'
        self.last_notification = None
        self.notification_cooldown = timedelta(minutes=5)

    def get_latest_iss_position(self) -> Dict[str, Any]:
        """Get the latest ISS position from Airtable."""
        try:
            records = self.airtable.get_all(
                maxRecords=1,
                sort=[{'field': 'Timestamp', 'direction': 'desc'}]
            )
            return records[0]['fields'] if records else None
        except Exception as e:
            print(f"Error fetching latest ISS position: {e}")
            return None

    def calculate_distance(self, iss_pos: Tuple[float, float], user_pos: Tuple[float, float]) -> float:
        """Calculate distance between ISS and user location using Haversine formula."""
        return haversine(iss_pos, user_pos, unit='km')

    def should_send_notification(self, distance: float, iss_footprint: float, user_radius: float) -> bool:
        """Determine if a notification should be sent based on distance and cooldown."""
        if distance > (user_radius + iss_footprint):
            return False

        if self.last_notification and (datetime.now() - self.last_notification) < self.notification_cooldown:
            return False

        return True

    def send_notification(self, distance: float) -> bool:
        """Send SMS notification via Twilio."""
        try:
            message = self.twilio_client.messages.create(
                body=f"ISS is nearby! Current distance: {distance:.1f} km",
                from_=self.twilio_from,
                to=self.twilio_to
            )
            self.last_notification = datetime.now()
            return True
        except Exception as e:
            print(f"Error sending notification: {e}")
            return False

    def record_sighting(self, iss_pos: Dict[str, Any], user_pos: Tuple[float, float], distance: float) -> bool:
        """Record the sighting in Airtable."""
        try:
            self.airtable.insert({
                'Timestamp': datetime.now().isoformat(),
                'ISS_Latitude': iss_pos['Latitude'],
                'ISS_Longitude': iss_pos['Longitude'],
                'User_Latitude': user_pos[0],
                'User_Longitude': user_pos[1],
                'Distance': distance
            })
            return True
        except Exception as e:
            print(f"Error recording sighting: {e}")
            return False

    def run(self, user_settings: Dict[str, Any]):
        """Main loop for the alert agent."""
        while True:
            iss_pos = self.get_latest_iss_position()
            if not iss_pos:
                time.sleep(5)
                continue

            user_pos = (user_settings['latitude'], user_settings['longitude'])
            distance = self.calculate_distance(
                (iss_pos['Latitude'], iss_pos['Longitude']),
                user_pos
            )

            if self.should_send_notification(
                distance,
                iss_pos['Footprint_Radius'],
                user_settings['radius']
            ):
                if self.send_notification(distance):
                    self.record_sighting(iss_pos, user_pos, distance)

            time.sleep(5)

if __name__ == '__main__':
    # Example user settings
    user_settings = {
        'latitude': 33.7490,
        'longitude': -84.3880,
        'radius': 50
    }
    agent = AlertAgent()
    agent.run(user_settings) 
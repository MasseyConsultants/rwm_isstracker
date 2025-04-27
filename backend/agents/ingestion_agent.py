import os
import time
import requests
from datetime import datetime
from airtable import Airtable
from typing import Dict, Any
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class IngestionAgent:
    def __init__(self):
        # Verify environment variables are loaded
        airtable_base_id = os.getenv('AIRTABLE_BASE_ID')
        airtable_api_key = os.getenv('AIRTABLE_API_KEY')
        
        if not airtable_base_id or not airtable_api_key:
            raise ValueError("Missing required environment variables: AIRTABLE_BASE_ID or AIRTABLE_API_KEY")
        
        self.airtable = Airtable(
            airtable_base_id,
            'ISS_Locations',
            api_key=airtable_api_key
        )
        self.primary_api = 'https://api.wheretheiss.at/v1/satellites/25544'
        self.fallback_api = 'http://api.open-notify.org/iss-now.json'
        self.retry_count = 3
        self.retry_delay = 1

    def fetch_iss_data(self) -> Dict[str, Any]:
        """Fetch ISS data from primary API with retry logic."""
        for attempt in range(self.retry_count):
            try:
                response = requests.get(self.primary_api)
                response.raise_for_status()
                data = response.json()
                return {
                    'Timestamp': datetime.fromtimestamp(data['timestamp']).isoformat(),
                    'Latitude': data['latitude'],
                    'Longitude': data['longitude'],
                    'Altitude': data['altitude'],
                    'Footprint_Radius': data['footprint'] / 2
                }
            except Exception as e:
                if attempt == self.retry_count - 1:
                    print(f"Primary API failed after {self.retry_count} attempts: {e}")
                    return self.fetch_fallback_data()
                time.sleep(self.retry_delay * (2 ** attempt))

    def fetch_fallback_data(self) -> Dict[str, Any]:
        """Fetch ISS data from fallback API."""
        try:
            response = requests.get(self.fallback_api)
            response.raise_for_status()
            data = response.json()
            # Calculate footprint radius based on typical ISS altitude
            altitude = 408  # Typical ISS altitude in km
            footprint_radius = altitude * 0.577  # tan(30°) ≈ 0.577
            return {
                'Timestamp': datetime.fromtimestamp(data['timestamp']).isoformat(),
                'Latitude': float(data['iss_position']['latitude']),
                'Longitude': float(data['iss_position']['longitude']),
                'Altitude': altitude,
                'Footprint_Radius': footprint_radius
            }
        except Exception as e:
            print(f"Fallback API failed: {e}")
            return None

    def write_to_airtable(self, data: Dict[str, Any]) -> bool:
        """Write ISS data to Airtable."""
        try:
            self.airtable.insert(data)
            return True
        except Exception as e:
            print(f"Error writing to Airtable: {e}")
            return False

    def run(self):
        """Main loop for the ingestion agent."""
        print("Starting ISS data ingestion...")
        while True:
            data = self.fetch_iss_data()
            if data:
                if self.write_to_airtable(data):
                    print(f"Successfully wrote ISS data to Airtable: {data['Timestamp']}")
                else:
                    print("Failed to write ISS data to Airtable")
            time.sleep(5)  # Wait 5 seconds before next fetch

if __name__ == '__main__':
    try:
        agent = IngestionAgent()
        agent.run()
    except Exception as e:
        print(f"Error initializing ingestion agent: {e}") 
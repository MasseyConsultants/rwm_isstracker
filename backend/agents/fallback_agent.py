import os
import time
import requests
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from airtable import Airtable

class FallbackAgent:
    def __init__(self):
        self.airtable = Airtable(
            os.getenv('AIRTABLE_BASE_ID'),
            'ISS_Locations',
            api_key=os.getenv('AIRTABLE_API_KEY')
        )
        self.primary_api = 'https://api.wheretheiss.at/v1/satellites/25544'
        self.fallback_api = 'http://api.open-notify.org/iss-now.json'
        self.health_check_interval = 60  # seconds
        self.last_health_check = None
        self.primary_api_healthy = True
        self.cache_duration = timedelta(minutes=5)

    def check_primary_api_health(self) -> bool:
        """Check if the primary API is healthy."""
        try:
            response = requests.get(self.primary_api)
            response.raise_for_status()
            return True
        except Exception as e:
            print(f"Primary API health check failed: {e}")
            return False

    def get_cached_data(self) -> Optional[Dict[str, Any]]:
        """Get the most recent data from Airtable cache."""
        try:
            records = self.airtable.get_all(
                maxRecords=1,
                sort=[{'field': 'Timestamp', 'direction': 'desc'}]
            )
            if not records:
                return None

            record = records[0]['fields']
            timestamp = datetime.fromisoformat(record['Timestamp'])
            if datetime.now() - timestamp > self.cache_duration:
                return None

            return record
        except Exception as e:
            print(f"Error fetching cached data: {e}")
            return None

    def fetch_fallback_data(self) -> Optional[Dict[str, Any]]:
        """Fetch data from the fallback API."""
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

    def run(self):
        """Main loop for the fallback agent."""
        while True:
            current_time = datetime.now()

            # Check primary API health periodically
            if (not self.last_health_check or
                (current_time - self.last_health_check).total_seconds() >= self.health_check_interval):
                self.primary_api_healthy = self.check_primary_api_health()
                self.last_health_check = current_time

            if not self.primary_api_healthy:
                # Try to get data from cache first
                cached_data = self.get_cached_data()
                if cached_data:
                    print("Using cached data from Airtable")
                    time.sleep(5)
                    continue

                # If no cache, try fallback API
                fallback_data = self.fetch_fallback_data()
                if fallback_data:
                    print("Using data from fallback API")
                    self.airtable.insert(fallback_data)
                else:
                    print("All data sources failed")

            time.sleep(5)

if __name__ == '__main__':
    agent = FallbackAgent()
    agent.run() 
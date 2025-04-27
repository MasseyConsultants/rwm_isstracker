import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Map from './components/Map';
import Sidebar from './components/Sidebar';
import SettingsForm from './components/SettingsForm';
import { ISSPosition, AirtableISSLocation, UserSettings } from './types/iss.types';

// Environment variables with fallbacks
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || '';
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || '';

const App: React.FC = () => {
    const [currentPosition, setCurrentPosition] = useState<ISSPosition | null>(null);
    const [recentPositions, setRecentPositions] = useState<AirtableISSLocation[]>([]);
    const [userSettings, setUserSettings] = useState<UserSettings>({
        latitude: 0,
        longitude: 0,
        radius: 50
    });

    useEffect(() => {
        const fetchISSData = async () => {
            try {
                const response = await axios.get('https://api.wheretheiss.at/v1/satellites/25544');
                const data = response.data;
                const position: ISSPosition = {
                    Timestamp: new Date(data.timestamp * 1000).toISOString(),
                    Latitude: data.latitude,
                    Longitude: data.longitude,
                    Altitude: data.altitude,
                    Footprint_Radius: data.footprint / 2
                };
                setCurrentPosition(position);
            } catch (error) {
                console.error('Error fetching ISS data:', error);
            }
        };

        const fetchRecentPositions = async () => {
            if (!AIRTABLE_BASE_ID || !AIRTABLE_API_KEY) {
                console.warn('Airtable credentials not configured');
                return;
            }

            try {
                const response = await axios.get(
                    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/ISS_Locations`,
                    {
                        params: {
                            maxRecords: 10,
                            sort: [{ field: 'Timestamp', direction: 'desc' }]
                        },
                        headers: {
                            Authorization: `Bearer ${AIRTABLE_API_KEY}`
                        }
                    }
                );
                setRecentPositions(response.data.records);
            } catch (error) {
                console.error('Error fetching recent positions:', error);
            }
        };

        fetchISSData();
        fetchRecentPositions();

        const interval = setInterval(() => {
            fetchISSData();
            fetchRecentPositions();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleSettingsSave = (settings: UserSettings) => {
        setUserSettings(settings);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">RWM ISS Tracker</h1>
                </div>
            </header>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    <div className="lg:col-span-3">
                        {currentPosition && <Map position={currentPosition} />}
                    </div>
                    <div className="space-y-4">
                        <SettingsForm onSave={handleSettingsSave} initialSettings={userSettings} />
                        <Sidebar positions={recentPositions} />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App; 
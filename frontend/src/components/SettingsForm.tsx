import React, { useState } from 'react';
import { UserSettings } from '../types/iss.types';

interface SettingsFormProps {
    onSave: (settings: UserSettings) => void;
    initialSettings?: UserSettings;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ onSave, initialSettings }) => {
    const [settings, setSettings] = useState<UserSettings>(
        initialSettings || {
            latitude: 0,
            longitude: 0,
            radius: 50
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(settings);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white p-4 shadow-lg rounded">
            <h2 className="text-xl font-bold mb-4">Location Settings</h2>
            <div className="space-y-4">
                <div>
                    <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                        Latitude
                    </label>
                    <input
                        type="number"
                        id="latitude"
                        name="latitude"
                        value={settings.latitude}
                        onChange={handleChange}
                        step="0.000001"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                        Longitude
                    </label>
                    <input
                        type="number"
                        id="longitude"
                        name="longitude"
                        value={settings.longitude}
                        onChange={handleChange}
                        step="0.000001"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label htmlFor="radius" className="block text-sm font-medium text-gray-700">
                        Notification Radius (km)
                    </label>
                    <input
                        type="number"
                        id="radius"
                        name="radius"
                        value={settings.radius}
                        onChange={handleChange}
                        min="1"
                        max="1000"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    Save Settings
                </button>
            </div>
        </form>
    );
};

export default SettingsForm; 
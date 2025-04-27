import React from 'react';
import { AirtableISSLocation } from '../types/iss.types';

interface SidebarProps {
    positions: AirtableISSLocation[];
}

const Sidebar: React.FC<SidebarProps> = ({ positions }) => {
    return (
        <div className="bg-white p-4 shadow-lg h-full overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Recent ISS Positions</h2>
            <div className="space-y-2">
                {positions.map((position) => (
                    <div key={position.id} className="p-2 border rounded hover:bg-gray-50">
                        <p className="text-sm text-gray-600">
                            {new Date(position.fields.Timestamp).toLocaleString()}
                        </p>
                        <p className="text-sm">
                            Lat: {position.fields.Latitude.toFixed(4)}°
                        </p>
                        <p className="text-sm">
                            Lon: {position.fields.Longitude.toFixed(4)}°
                        </p>
                        <p className="text-sm">
                            Alt: {position.fields.Altitude.toFixed(2)} km
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar; 
export interface ISSPosition {
    Timestamp: string;
    Latitude: number;
    Longitude: number;
    Altitude: number;
    Footprint_Radius: number;
}

export interface ISSResponse {
    latitude: number;
    longitude: number;
    altitude: number;
    footprint: number;
    timestamp: number;
}

export interface AirtableISSLocation {
    id: string;
    fields: ISSPosition;
}

export interface AirtableSighting {
    id: string;
    fields: {
        Timestamp: string;
        ISS_Latitude: number;
        ISS_Longitude: number;
        User_Latitude: number;
        User_Longitude: number;
        Distance: number;
    };
}

export interface UserSettings {
    latitude: number;
    longitude: number;
    radius: number;
} 
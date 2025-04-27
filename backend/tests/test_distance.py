import pytest
from haversine import haversine

def test_haversine_distance():
    # Test case 1: Same point
    point1 = (33.7490, -84.3880)  # Atlanta, GA
    point2 = (33.7490, -84.3880)
    assert haversine(point1, point2, unit='km') == 0.0

    # Test case 2: Known distance
    point1 = (33.7490, -84.3880)  # Atlanta, GA
    point2 = (34.0522, -84.0733)  # Nearby point
    distance = haversine(point1, point2, unit='km')
    assert abs(distance - 37.5) < 0.1  # Allow small floating-point differences

    # Test case 3: International distance
    point1 = (40.7128, -74.0060)  # New York City
    point2 = (51.5074, -0.1278)   # London
    distance = haversine(point1, point2, unit='km')
    assert abs(distance - 5570) < 10  # Allow small floating-point differences

def test_haversine_units():
    point1 = (33.7490, -84.3880)
    point2 = (34.0522, -84.0733)
    
    # Test kilometers
    km_distance = haversine(point1, point2, unit='km')
    assert km_distance > 0
    
    # Test miles
    mi_distance = haversine(point1, point2, unit='mi')
    assert mi_distance > 0
    
    # Test meters
    m_distance = haversine(point1, point2, unit='m')
    assert m_distance > 0
    
    # Verify unit conversions
    assert abs(km_distance * 0.621371 - mi_distance) < 0.1
    assert abs(km_distance * 1000 - m_distance) < 0.1

def test_haversine_edge_cases():
    # Test poles
    north_pole = (90.0, 0.0)
    south_pole = (-90.0, 0.0)
    pole_distance = haversine(north_pole, south_pole, unit='km')
    assert abs(pole_distance - 20015) < 10  # Earth's diameter is approximately 20015 km
    
    # Test equator
    point1 = (0.0, 0.0)
    point2 = (0.0, 180.0)
    equator_distance = haversine(point1, point2, unit='km')
    assert abs(equator_distance - 20037) < 10  # Earth's circumference is approximately 20037 km
    
    # Test invalid coordinates
    with pytest.raises(ValueError):
        haversine((91.0, 0.0), (0.0, 0.0))  # Latitude > 90
    
    with pytest.raises(ValueError):
        haversine((0.0, 181.0), (0.0, 0.0))  # Longitude > 180 
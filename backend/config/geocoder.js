const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap',
  httpAdapter: 'https',
  apiKey: null, // OpenStreetMap is free
  formatter: null
};

const geocoder = NodeGeocoder(options);

// Get address details from coordinates
const getAddressFromCoords = async (lat, lon) => {
  try {
    const res = await geocoder.reverse({ lat, lon });
    
    if (res && res.length > 0) {
      const address = res[0];
      
      // Extract relevant information
      const result = {
        fullAddress: address.formattedAddress || '',
        state: extractState(address.adminLevels, address.state),
        district: extractDistrict(address.adminLevels, address.city, address.county),
        area: address.city || address.town || address.village || address.suburb || '',
        ward: address.suburb || address.neighborhood || '',
        pincode: address.zipcode || '',
        country: address.country || 'India'
      };
      
      return result;
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return null;
  }
};

// Extract state from admin levels
const extractState = (adminLevels, fallback) => {
  if (adminLevels && adminLevels.length > 0) {
    // Find the highest level admin (usually state)
    const stateLevel = adminLevels.find(level => level.level === 1 || level.level === 2);
    if (stateLevel) return stateLevel.name;
  }
  return fallback || '';
};

// Extract district from admin levels
const extractDistrict = (adminLevels, city, county) => {
  if (adminLevels && adminLevels.length > 0) {
    // Find district level (usually level 3-4)
    const districtLevel = adminLevels.find(level => level.level === 3 || level.level === 4);
    if (districtLevel) return districtLevel.name;
  }
  return city || county || '';
};

// Validate Indian state
const validateIndianState = (stateName) => {
  const indianStates = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
  ];
  
  return indianStates.some(state => 
    state.toLowerCase().includes(stateName.toLowerCase()) ||
    stateName.toLowerCase().includes(state.toLowerCase())
  );
};

module.exports = {
  getAddressFromCoords,
  validateIndianState
};

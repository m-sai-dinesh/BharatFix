const { getAddressFromCoords, validateIndianState } = require('../config/geocoder');

const validateLocation = async (req, res, next) => {
  try {
    let location;
    
    // Handle FormData (multipart/form-data) and JSON
    if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
      location = req.body.location;
    } else {
      location = req.body.location;
    }
    
    if (!location) {
      return res.status(400).json({ 
        success: false, 
        message: 'GPS location is required' 
      });
    }
    
    const locationData = typeof location === 'string' ? JSON.parse(location) : location;
    
    if (!locationData.lat || !locationData.lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'GPS coordinates (lat, lng) are required' 
      });
    }
    
    if (isNaN(locationData.lat) || isNaN(locationData.lng) || 
        locationData.lat < -90 || locationData.lat > 90 || 
        locationData.lng < -180 || locationData.lng > 180) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid GPS coordinates' 
      });
    }
    
    const address = await getAddressFromCoords(locationData.lat, locationData.lng);
    
    if (!address) {
      return res.status(400).json({ 
        success: false, 
        message: 'Unable to fetch address from GPS coordinates' 
      });
    }
    
    if (!validateIndianState(address.state)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Location must be within India' 
      });
    }
    
    req.geocodedAddress = address;
    req.locationData = locationData;
    
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { validateLocation };

const express = require('express');
const router = express.Router();
const { getAddressFromCoords, validateIndianState } = require('../config/geocoder');

// @desc  Get current location address
// @route POST /api/location/address
router.post('/address', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'GPS coordinates are required' 
      });
    }
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid GPS coordinates' 
      });
    }
    
    const address = await getAddressFromCoords(lat, lng);
    
    if (!address) {
      return res.status(404).json({ 
        success: false, 
        message: 'Unable to fetch address for given location' 
      });
    }
    
    if (!validateIndianState(address.state)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Location must be within India' 
      });
    }
    
    res.json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc  Validate GPS coordinates
// @route POST /api/location/validate
router.post('/validate', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'GPS coordinates are required' 
      });
    }
    
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.json({ 
        success: false, 
        valid: false,
        message: 'Invalid GPS coordinates' 
      });
    }
    
    const address = await getAddressFromCoords(lat, lng);
    
    if (!address) {
      return res.json({ 
        success: false, 
        valid: false,
        message: 'Unable to determine location' 
      });
    }
    
    const isValidLocation = validateIndianState(address.state);
    
    res.json({ 
      success: true, 
      valid: isValidLocation,
      location: isValidLocation ? address : null,
      message: isValidLocation ? 'Valid location in India' : 'Location must be within India'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

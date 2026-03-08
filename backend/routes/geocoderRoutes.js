const express = require('express');
const router = express.Router();
const { getAddressFromCoords, validateIndianState } = require('../config/geocoder');

// @desc  Get address from coordinates
// @route POST /api/geocoder/reverse
router.post('/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'Latitude and longitude are required' 
      });
    }
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid coordinates' 
      });
    }
    
    const address = await getAddressFromCoords(lat, lng);
    
    if (!address) {
      return res.status(404).json({ 
        success: false, 
        message: 'Unable to find address for given coordinates' 
      });
    }
    
    // Validate that location is in India
    if (!validateIndianState(address.state)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Location must be within India. Please check your GPS coordinates.' 
      });
    }
    
    res.json({ success: true, data: address });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc  Validate Indian state
// @route POST /api/geocoder/validate-state
router.post('/validate-state', async (req, res) => {
  try {
    const { state } = req.body;
    
    if (!state) {
      return res.status(400).json({ 
        success: false, 
        message: 'State name is required' 
      });
    }
    
    const isValid = validateIndianState(state);
    
    res.json({ success: true, isValid });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

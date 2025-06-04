const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Holiday = require('../models/Holiday');

// @route   GET /api/holidays
// @desc    Get all holidays for a year
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { year } = req.query;
    
    // If no year is provided, use current year
    const yearNum = year ? parseInt(year) : new Date().getFullYear();
    
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ message: 'Invalid year parameter' });
    }

    const startDate = new Date(yearNum, 0, 1);
    const endDate = new Date(yearNum, 11, 31);

    console.log('Fetching holidays for year:', yearNum); // Debug log
    console.log('Date range:', { startDate, endDate }); // Debug log

    const holidays = await Holiday.find({
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    console.log('Found holidays:', holidays.length); // Debug log
    res.json(holidays);
  } catch (err) {
    console.error('Error fetching holidays:', err);
    res.status(500).json({ message: 'Server error while fetching holidays' });
  }
});

// @route   POST /api/holidays
// @desc    Create a new holiday
// @access  Private (Admin only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can create holidays' });
    }

    const { name, date, type, description } = req.body;

    const holiday = new Holiday({
      name,
      date,
      type,
      description,
      createdBy: req.user._id,
    });

    await holiday.save();
    res.json(holiday);
  } catch (err) {
    console.error('Error creating holiday:', err);
    res.status(500).json({ message: 'Server error while creating holiday', error: err.message });
  }
});

// @route   PATCH /api/holidays/:id
// @desc    Update a holiday
// @access  Private (Admin only)
router.patch('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can update holidays' });
    }

    const { name, date, type, description } = req.body;
    const holiday = await Holiday.findById(req.params.id);

    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    holiday.name = name || holiday.name;
    holiday.date = date || holiday.date;
    holiday.type = type || holiday.type;
    holiday.description = description || holiday.description;
    holiday.createdBy = req.user._id;

    await holiday.save();
    res.json(holiday);
  } catch (err) {
    console.error('Error updating holiday:', err);
    res.status(500).json({ message: 'Server error while updating holiday', error: err.message });
  }
});

// @route   DELETE /api/holidays/:id
// @desc    Delete a holiday
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can delete holidays' });
    }

    const holiday = await Holiday.findById(req.params.id);

    if (!holiday) {
      return res.status(404).json({ message: 'Holiday not found' });
    }

    await holiday.deleteOne();
    res.json({ message: 'Holiday removed successfully' });
  } catch (err) {
    console.error('Error deleting holiday:', err);
    res.status(500).json({ message: 'Server error while deleting holiday' });
  }
});

// @route   POST /api/holidays/init
// @desc    Initialize sample holidays (for testing)
// @access  Private (Admin only)
router.post('/init', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only administrators can initialize holidays' });
    }

    const sampleHolidays = [
      {
        name: 'New Year\'s Day',
        date: new Date('2025-01-01'),
        type: 'public',
        description: 'First day of the year'
      },
      {
        name: 'Republic Day',
        date: new Date('2025-01-26'),
        type: 'public',
        description: 'Indian Republic Day'
      },
      {
        name: 'Holi',
        date: new Date('2025-03-14'),
        type: 'public',
        description: 'Festival of Colors'
      },
      {
        name: 'Good Friday',
        date: new Date('2025-04-18'),
        type: 'public',
        description: 'Christian holiday'
      },
      {
        name: 'Easter Sunday',
        date: new Date('2025-04-20'),
        type: 'public',
        description: 'Christian holiday'
      },
      {
        name: 'Independence Day',
        date: new Date('2025-08-15'),
        type: 'public',
        description: 'Indian Independence Day'
      },
      {
        name: 'Gandhi Jayanti',
        date: new Date('2025-10-02'),
        type: 'public',
        description: 'Birthday of Mahatma Gandhi'
      },
      {
        name: 'Christmas Day',
        date: new Date('2025-12-25'),
        type: 'public',
        description: 'Christian holiday'
      },
      {
        name: 'Company Foundation Day',
        date: new Date('2025-06-15'),
        type: 'company',
        description: 'Company\'s anniversary'
      }
    ];

    // Clear existing holidays for 2025
    await Holiday.deleteMany({
      date: {
        $gte: new Date('2025-01-01'),
        $lte: new Date('2025-12-31')
      }
    });

    // Insert new holidays
    const holidays = await Holiday.insertMany(sampleHolidays);
    res.json(holidays);
  } catch (err) {
    console.error('Error initializing holidays:', err);
    res.status(500).json({ message: 'Server error while initializing holidays' });
  }
});

module.exports = router; 
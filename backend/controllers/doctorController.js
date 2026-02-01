/**
 * Doctor Controller
 * Handles API endpoints for doctor profiles and availability
 */

const Doctor = require('../models/Doctor');
const Booking = require('../models/Booking');

// Get all doctors
exports.getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find().sort({ rating: -1 });
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching doctors:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific doctor by ID
exports.getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (err) {
    console.error('Error fetching doctor:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new doctor profile
exports.createDoctor = async (req, res) => {
  try {
    const doctorData = req.body;
    const newDoctor = new Doctor(doctorData);
    await newDoctor.save();
    
    res.status(201).json(newDoctor);
  } catch (err) {
    console.error('Error creating doctor profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a doctor profile
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (err) {
    console.error('Error updating doctor profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a doctor profile
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByIdAndDelete(id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Also delete all bookings associated with this doctor
    await Booking.deleteMany({ doctorId: id });
    
    res.json({ message: 'Doctor profile deleted successfully' });
  } catch (err) {
    console.error('Error deleting doctor profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get doctor availability for a specific date
exports.getDoctorAvailability = async (req, res) => {
  try {
    const { id, date } = req.params;
    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Parse the date to get the day of the week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find the doctor's schedule for this day
    const daySchedule = doctor.availabilitySchedule.find(
      schedule => schedule.day === dayOfWeek
    );
    
    if (!daySchedule) {
      return res.json({ available: false, timeSlots: [] });
    }
    
    // Get all bookings for this doctor on this date
    const bookingDate = new Date(date);
    const nextDay = new Date(bookingDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    const bookings = await Booking.find({
      doctorId: id,
      bookingDate: {
        $gte: bookingDate,
        $lt: nextDay
      },
      status: { $ne: 'cancelled' }
    });
    
    // Generate available time slots (30-minute intervals)
    const timeSlots = [];
    const [startHour, startMinute] = daySchedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = daySchedule.endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMinute = startMinute;
    
    while (
      currentHour < endHour || 
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      // Check if this time slot is already booked
      const isBooked = bookings.some(booking => booking.startTime === timeSlot);
      
      if (!isBooked) {
        timeSlots.push(timeSlot);
      }
      
      // Move to next 30-minute slot
      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    
    res.json({
      available: timeSlots.length > 0,
      timeSlots
    });
  } catch (err) {
    console.error('Error getting doctor availability:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update doctor online status
exports.updateOnlineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOnline } = req.body;
    
    const doctor = await Doctor.findByIdAndUpdate(
      id,
      { $set: { isOnline } },
      { new: true }
    );
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor);
  } catch (err) {
    console.error('Error updating doctor online status:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get online doctors
exports.getOnlineDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isOnline: true }).sort({ rating: -1 });
    res.json(doctors);
  } catch (err) {
    console.error('Error fetching online doctors:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

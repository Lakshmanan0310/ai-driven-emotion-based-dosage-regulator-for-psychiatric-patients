/**
 * Booking Controller
 * Handles API endpoints for doctor bookings
 */

const Booking = require('../models/Booking');
const Doctor = require('../models/Doctor');
const { v4: uuidv4 } = require('uuid');

// Get all bookings for a patient
exports.getPatientBookings = async (req, res) => {
  try {
    const { patientId } = req.params;
    const bookings = await Booking.find({ patientId })
      .populate('doctorId', 'fullName specialization profilePhoto')
      .sort({ bookingDate: -1 });
    
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching patient bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bookings for a doctor
exports.getDoctorBookings = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const bookings = await Booking.find({ doctorId })
      .sort({ bookingDate: -1 });
    
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching doctor bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const bookingData = req.body;
    
    // Validate that the doctor exists
    const doctor = await Doctor.findById(bookingData.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Check if the time slot is available
    const bookingDate = new Date(bookingData.bookingDate);
    const existingBooking = await Booking.findOne({
      doctorId: bookingData.doctorId,
      bookingDate: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999))
      },
      startTime: bookingData.startTime,
      status: { $ne: 'cancelled' }
    });
    
    if (existingBooking) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }
    
    // Generate a meeting link (in a real app, this would integrate with Zoom/Google Meet API)
    const meetingId = uuidv4().substring(0, 8);
    const meetingLink = `https://meet.example.com/${meetingId}`;
    
    // Create the booking
    const newBooking = new Booking({
      ...bookingData,
      meetingLink,
      fee: doctor.consultationFee
    });
    
    await newBooking.save();
    
    res.status(201).json(newBooking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a booking
exports.updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (err) {
    console.error('Error updating booking:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Cancel a booking
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { $set: { status: 'cancelled' } },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (err) {
    console.error('Error cancelling booking:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Complete a booking
exports.completeBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { doctorNotes } = req.body;
    
    const booking = await Booking.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status: 'completed',
          doctorNotes: doctorNotes || ''
        } 
      },
      { new: true }
    );
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (err) {
    console.error('Error completing booking:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get upcoming bookings for a patient
exports.getUpcomingPatientBookings = async (req, res) => {
  try {
    const { patientId } = req.params;
    const now = new Date();
    
    const bookings = await Booking.find({
      patientId,
      bookingDate: { $gte: now },
      status: 'scheduled'
    })
    .populate('doctorId', 'fullName specialization profilePhoto')
    .sort({ bookingDate: 1 });
    
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching upcoming patient bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get past bookings for a patient
exports.getPastPatientBookings = async (req, res) => {
  try {
    const { patientId } = req.params;
    const now = new Date();
    
    const bookings = await Booking.find({
      patientId,
      $or: [
        { bookingDate: { $lt: now } },
        { status: { $in: ['completed', 'cancelled', 'no-show'] } }
      ]
    })
    .populate('doctorId', 'fullName specialization profilePhoto')
    .sort({ bookingDate: -1 });
    
    res.json(bookings);
  } catch (err) {
    console.error('Error fetching past patient bookings:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

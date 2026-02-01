import React, { useState } from 'react';
import { FaTimes, FaEnvelope, FaPhone, FaComment } from 'react-icons/fa';
import { useTheme } from '../ThemeContext';

const ContactPatientModal = ({ patient, onClose, onSend }) => {
  const { currentTheme, themes } = useTheme();
  const theme = themes[currentTheme];
  
  const [contactMethod, setContactMethod] = useState('email');
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  
  const handleSend = async () => {
    if (!message) return;
    
    setIsSending(true);
    
    try {
      // In a real application, this would be an API call
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Format the contact data
      const contactData = {
        patientId: patient.patientId,
        patientName: patient.name,
        method: contactMethod,
        subject: subject,
        message: message,
        timestamp: new Date().toISOString(),
        doctorName: 'Dr. Smith' // In a real app, this would come from auth context
      };
      
      // Call the onSend callback with the contact data
      if (onSend) {
        onSend(contactData);
      }
      
      setSendSuccess(true);
      
      // Close the modal after showing success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${theme.cardBg} rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${theme.border} flex justify-between items-center`}>
          <h2 className={`text-xl font-semibold ${theme.text}`}>Contact Patient</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {sendSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className={`text-lg font-medium ${theme.text} mb-2`}>Message Sent!</h3>
              <p className={`${theme.subtext}`}>Your message has been sent to {patient.name}.</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className={`flex items-center mb-4 ${theme.text}`}>
                  <div className={`w-12 h-12 rounded-full ${theme.accentBg} flex items-center justify-center mr-4`}>
                    {patient.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-medium text-lg">{patient.name}</h3>
                    <p className={`text-sm ${theme.subtext}`}>Patient ID: {patient.patientId}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                    Contact Method
                  </label>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setContactMethod('email')}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        contactMethod === 'email' 
                          ? `${theme.accent} ${theme.accentBg} text-white` 
                          : `${theme.border} ${theme.text} hover:bg-gray-100`
                      }`}
                    >
                      <FaEnvelope className="mr-2" />
                      Email
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactMethod('sms')}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        contactMethod === 'sms' 
                          ? `${theme.accent} ${theme.accentBg} text-white` 
                          : `${theme.border} ${theme.text} hover:bg-gray-100`
                      }`}
                    >
                      <FaComment className="mr-2" />
                      SMS
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactMethod('call')}
                      className={`flex items-center px-3 py-2 rounded-md ${
                        contactMethod === 'call' 
                          ? `${theme.accent} ${theme.accentBg} text-white` 
                          : `${theme.border} ${theme.text} hover:bg-gray-100`
                      }`}
                    >
                      <FaPhone className="mr-2" />
                      Call
                    </button>
                  </div>
                </div>
                
                {contactMethod !== 'call' && (
                  <>
                    <div className="mb-4">
                      <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                        Subject
                      </label>
                      <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input}`}
                        placeholder="Enter subject"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                        Message
                      </label>
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input} min-h-[120px]`}
                        placeholder="Type your message here..."
                      />
                    </div>
                  </>
                )}
                
                {contactMethod === 'call' && (
                  <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${theme.text}`}>
                      Call Notes (Optional)
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className={`w-full px-3 py-2 border ${theme.border} rounded-md ${theme.input} min-h-[80px]`}
                      placeholder="Add notes about the call (reason, topics to discuss, etc.)"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      This will initiate a call request. The patient will receive a notification to schedule the call.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 border ${theme.border} rounded-md ${theme.text} hover:bg-gray-100`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending || !message}
                  className={`px-4 py-2 ${theme.accent} ${theme.accentBg} text-white rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : contactMethod === 'call' ? 'Request Call' : 'Send Message'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactPatientModal;

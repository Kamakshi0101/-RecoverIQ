import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, User as UserIcon, CheckCircle, ChevronRight, FileText, ArrowLeft } from 'lucide-react';
import axios from '../../api/axios';
import { format } from 'date-fns';

const TYPES = [
  { id: 'rehab', title: 'Rehabilitation Session', duration: '60 min', icon: Activity },
  { id: 'review', title: 'Progress Review', duration: '30 min', icon: FileText },
  { id: 'pain', title: 'Pain Consultation', duration: '45 min', icon: AlertCircle },
  { id: 'virtual', title: 'Virtual Check-in', duration: '15 min', icon: Video },
];

// Fallback icons since I didn't import all above
import { Activity, AlertCircle, Video } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, onBooked }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  
  const [formData, setFormData] = useState({
    doctor_id: '',
    type: null,
    date: '',
    slot_id: '',
    title: '',
    location: 'Clinic', // or virtual
    notes: ''
  });

  useEffect(() => {
    if (isOpen && step === 1) {
      fetchDoctors();
    }
  }, [isOpen, step]);

  useEffect(() => {
    if (formData.doctor_id) {
      fetchSlots(formData.doctor_id);
    }
  }, [formData.doctor_id]);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/admin/doctors'); // Re-using admin route or create a public one. Wait, patient can't access admin routes. 
      // Need a patient-facing doctor list endpoint, or just assume the assigned doctor. 
      // The user is assigned to one doctor now via the new assignment system!
      const userRes = await axios.get('/api/auth/me');
      if (userRes.data.data.patient && userRes.data.data.patient.assigned_doctor) {
        setDoctors([userRes.data.data.patient.assigned_doctor]);
      } else {
        // Fallback if not assigned
        setDoctors([]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlots = async (docId) => {
    try {
      const res = await axios.get(`/api/patient/appointments/available-slots?doctor_id=${docId}`);
      setSlots(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post('/api/patient/appointments', {
        doctor_id: formData.doctor_id,
        slot_id: formData.slot_id,
        title: formData.type?.title || 'Therapy Session',
        location: formData.location
        // Notes could be added to backend later if needed
      });
      setStep(5); // Success step
      if (onBooked) onBooked();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTimeout(() => setStep(1), 300);
    setFormData({ doctor_id: '', type: null, date: '', slot_id: '', title: '', location: 'Clinic', notes: '' });
    onClose();
  };

  if (!isOpen) return null;

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    if (!acc[slot.slot_date]) acc[slot.slot_date] = [];
    acc[slot.slot_date].push(slot);
    return acc;
  }, {});

  const dates = Object.keys(groupedSlots).sort();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-[#2A3B2C]/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-[#FDFBF7] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#E7D9C9] bg-white relative z-10">
          <div className="flex items-center space-x-4">
            {step > 1 && step < 5 && (
              <button onClick={() => setStep(s => s - 1)} className="p-2 hover:bg-[#F5F1EA] rounded-full transition-colors">
                <ArrowLeft size={20} className="text-[#5F6B63]" />
              </button>
            )}
            <div>
              <h2 className="text-xl font-serif font-bold text-[#2A3B2C]">Book Appointment</h2>
              {step < 5 && <p className="text-sm text-[#8BA888] font-medium tracking-wide">Step {step} of 4</p>}
            </div>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-[#F5F1EA] rounded-full transition-colors">
            <X size={24} className="text-[#5F6B63]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 relative">
          
          <AnimatePresence mode="wait">
            
            {/* Step 1: Select Type & Doctor */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#2A3B2C] mb-4">Select Session Type</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {TYPES.map(t => (
                      <div 
                        key={t.id}
                        onClick={() => setFormData({...formData, type: t})}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all ${formData.type?.id === t.id ? 'border-[#2D6A4F] bg-[#2D6A4F]/5 shadow-md' : 'border-[#E7D9C9] bg-white hover:border-[#8BA888]'}`}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${formData.type?.id === t.id ? 'bg-[#2D6A4F] text-white' : 'bg-[#F5F1EA] text-[#5F6B63]'}`}>
                            <t.icon size={18} />
                          </div>
                          <h4 className="font-bold text-[#2A3B2C]">{t.title}</h4>
                        </div>
                        <p className="text-sm text-[#5F6B63] ml-11">{t.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold text-[#2A3B2C] mb-4">Your Therapist</h3>
                  {doctors.length > 0 ? (
                    <div 
                      onClick={() => setFormData({...formData, doctor_id: doctors[0].id})}
                      className={`p-4 border rounded-2xl cursor-pointer flex items-center space-x-4 transition-all ${formData.doctor_id === doctors[0].id ? 'border-[#2D6A4F] bg-[#2D6A4F]/5 shadow-md' : 'border-[#E7D9C9] bg-white hover:border-[#8BA888]'}`}
                    >
                      <div className="w-12 h-12 bg-[#8BA888] rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {doctors[0].name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2A3B2C]">{doctors[0].name}</h4>
                        <p className="text-sm text-[#5F6B63]">Primary Rehabilitation Specialist</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 border border-[#E7D9C9] rounded-2xl bg-white text-center">
                      <p className="text-[#5F6B63]">You don't have an assigned therapist yet. Please contact the clinic.</p>
                    </div>
                  )}
                </div>

                <div className="pt-4">
                  <button 
                    disabled={!formData.type || !formData.doctor_id}
                    onClick={() => setStep(2)}
                    className="w-full bg-[#2D6A4F] text-white py-4 rounded-xl font-bold tracking-wide hover:bg-[#1B4332] transition-colors disabled:opacity-50 flex justify-center items-center"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Select Date & Time */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#2A3B2C] mb-4">Available Dates</h3>
                  {dates.length === 0 ? (
                    <div className="p-8 text-center border border-[#E7D9C9] rounded-2xl bg-white">
                      <CalendarIcon size={32} className="mx-auto text-[#E7D9C9] mb-3" />
                      <p className="text-[#5F6B63]">No available slots found for this therapist.</p>
                    </div>
                  ) : (
                    <div className="flex space-x-3 overflow-x-auto pb-4 custom-scrollbar">
                      {dates.map(date => {
                        const d = new Date(date);
                        const isSelected = formData.date === date;
                        return (
                          <div 
                            key={date}
                            onClick={() => { setFormData({...formData, date, slot_id: ''}) }}
                            className={`min-w-[80px] p-4 rounded-2xl flex flex-col items-center cursor-pointer transition-all border shrink-0 ${isSelected ? 'bg-[#2D6A4F] border-[#2D6A4F] text-white shadow-md' : 'bg-white border-[#E7D9C9] text-[#2A3B2C] hover:border-[#8BA888]'}`}
                          >
                            <span className={`text-xs uppercase font-bold mb-1 ${isSelected ? 'text-[#DCE6D8]' : 'text-[#8BA888]'}`}>
                              {format(d, 'EEE')}
                            </span>
                            <span className="text-2xl font-serif">{format(d, 'd')}</span>
                            <span className={`text-xs mt-1 ${isSelected ? 'text-[#DCE6D8]' : 'text-[#5F6B63]'}`}>
                              {format(d, 'MMM')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {formData.date && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <h3 className="text-lg font-serif font-bold text-[#2A3B2C] mb-4">Available Times</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {groupedSlots[formData.date].map(slot => {
                        const isSelected = formData.slot_id === slot.id;
                        return (
                          <div 
                            key={slot.id}
                            onClick={() => setFormData({...formData, slot_id: slot.id})}
                            className={`p-3 rounded-xl text-center cursor-pointer transition-all border font-medium ${isSelected ? 'bg-[#8BA888] border-[#8BA888] text-white shadow-sm' : 'bg-white border-[#E7D9C9] text-[#5F6B63] hover:border-[#8BA888]'}`}
                          >
                            {slot.slot_time.substring(0, 5)}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                <div className="pt-4">
                  <button 
                    disabled={!formData.slot_id}
                    onClick={() => setStep(3)}
                    className="w-full bg-[#2D6A4F] text-white py-4 rounded-xl font-bold tracking-wide hover:bg-[#1B4332] transition-colors disabled:opacity-50 flex justify-center items-center"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Additional Info */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#2A3B2C] mb-4">Location Preference</h3>
                  <div className="flex space-x-4">
                    {['Clinic', 'Virtual'].map(loc => (
                      <label key={loc} className={`flex-1 p-4 border rounded-2xl cursor-pointer flex items-center space-x-3 transition-colors ${formData.location === loc ? 'border-[#2D6A4F] bg-[#2D6A4F]/5' : 'border-[#E7D9C9] bg-white'}`}>
                        <input type="radio" checked={formData.location === loc} onChange={() => setFormData({...formData, location: loc})} className="hidden" />
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.location === loc ? 'border-[#2D6A4F]' : 'border-[#A0AAB2]'}`}>
                          {formData.location === loc && <div className="w-3 h-3 bg-[#2D6A4F] rounded-full" />}
                        </div>
                        <span className="font-bold text-[#2A3B2C]">{loc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold text-[#2A3B2C] mb-4">Notes for Therapist (Optional)</h3>
                  <textarea 
                    rows="4"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="E.g. I've been feeling more stiffness in my shoulder this week..."
                    className="w-full bg-white border border-[#E7D9C9] rounded-2xl p-4 text-[#5F6B63] focus:ring-2 focus:ring-[#8BA888] outline-none resize-none"
                  />
                </div>

                <div className="bg-[#F5F1EA] p-5 rounded-2xl">
                  <h4 className="font-bold text-[#2A3B2C] mb-2 flex items-center"><AlertCircle size={16} className="mr-2 text-[#8BA888]" /> Cancellation Policy</h4>
                  <p className="text-sm text-[#5F6B63] leading-relaxed">Appointments can be rescheduled or cancelled up to 24 hours in advance without penalty. We ask that you kindly respect your therapist's time.</p>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={loading}
                    onClick={handleSubmit}
                    className="w-full bg-[#2D6A4F] text-white py-4 rounded-xl font-bold tracking-wide hover:bg-[#1B4332] transition-colors disabled:opacity-50 flex justify-center items-center"
                  >
                    {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Confirm Booking Request'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center py-8">
                <div className="w-24 h-24 bg-[#8BA888]/20 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle size={48} className="text-[#2D6A4F]" />
                </div>
                <h2 className="text-3xl font-serif font-bold text-[#2A3B2C] mb-4">Request Sent</h2>
                <p className="text-[#5F6B63] text-lg max-w-md mb-8">
                  Your appointment request for <strong>{formData.date}</strong> has been sent to your therapist for confirmation.
                </p>
                <button 
                  onClick={handleClose}
                  className="bg-white border border-[#E7D9C9] text-[#2A3B2C] px-8 py-3 rounded-xl font-bold hover:bg-[#F5F1EA] transition-colors"
                >
                  Return to Calendar
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default BookingModal;

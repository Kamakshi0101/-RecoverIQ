import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, AlertTriangle } from 'lucide-react';
import UpcomingSessionWidget from '../../components/patient/UpcomingSessionWidget';
import SessionHistoryTimeline from '../../components/patient/SessionHistoryTimeline';
import BookingModal from '../../components/patient/BookingModal';

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

const Calendar = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/patient/appointments');
      setAppointments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const nextAppointment = appointments
    .filter(a => new Date(a.scheduled_at) > new Date() && a.status !== 'cancelled')
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];

  const events = appointments.map(apt => ({
    id: apt.id,
    title: apt.title,
    start: new Date(apt.scheduled_at),
    end: new Date(new Date(apt.scheduled_at).getTime() + apt.duration_minutes * 60000),
    status: apt.status,
    resource: apt
  }));

  const eventStyleGetter = (event) => {
    let backgroundColor = '#8BA888';
    if (event.status === 'confirmed') backgroundColor = '#2D6A4F';
    if (event.status === 'pending') backgroundColor = '#E3B062';
    if (event.status === 'cancelled' || event.status === 'late_cancel') backgroundColor = '#C97A7E';

    return {
      style: {
        backgroundColor,
        borderRadius: '8px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
        padding: '4px 8px',
        fontSize: '12px',
        fontWeight: 'bold',
        fontFamily: 'sans-serif'
      }
    };
  };

  const handleCancel = async (id) => {
    if(!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      await axios.patch(`/api/patient/appointments/${id}/cancel`, { cancel_reason: 'Patient requested cancellation' });
      fetchAppointments();
      setSelectedEvent(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#2A3B2C] pb-24 font-sans selection:bg-[#8BA888] selection:text-white">
      
      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        onBooked={fetchAppointments} 
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold font-serif mb-2 text-[#2A3B2C]">Your Schedule</h1>
            <p className="text-[#5F6B63] text-lg max-w-lg">Manage your therapy sessions, view upcoming appointments, and review clinical notes.</p>
          </div>
          <button 
            onClick={() => setIsBookingOpen(true)}
            className="bg-[#2D6A4F] text-white px-8 py-3.5 rounded-xl font-bold flex items-center shadow-md hover:bg-[#1B4332] transition-colors"
          >
            <Plus size={20} className="mr-2" /> Book Session
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column - Main Calendar */}
          <div className="lg:col-span-8 space-y-10">
            <div className="bg-white p-6 rounded-3xl border border-[#E7D9C9] shadow-sm premium-calendar-wrapper">
              {loading ? (
                <div className="h-[600px] flex items-center justify-center">
                  <div className="w-10 h-10 border-4 border-[#E7D9C9] border-t-[#8BA888] rounded-full animate-spin"></div>
                </div>
              ) : (
                <BigCalendar
                  localizer={localizer}
                  events={events}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: 600 }}
                  views={['month', 'week']}
                  defaultView="month"
                  eventPropGetter={eventStyleGetter}
                  onSelectEvent={(e) => setSelectedEvent(e)}
                  popup
                />
              )}
            </div>

            {/* Clinical Notes Timeline */}
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#2A3B2C] mb-6">Clinical Session Notes</h2>
              <SessionHistoryTimeline appointments={appointments} />
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-4 space-y-8">
            <UpcomingSessionWidget appointment={nextAppointment} />

            {/* Selected Event Details Modal/Card */}
            <AnimatePresence>
              {selectedEvent && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-6 rounded-3xl border border-[#E7D9C9] shadow-[0_20px_40px_rgba(45,106,79,0.06)] relative"
                >
                  <button onClick={() => setSelectedEvent(null)} className="absolute top-4 right-4 text-[#A0AAB2] hover:text-[#5F6B63]">
                    <X size={20} />
                  </button>
                  
                  <div className="mb-6">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                      selectedEvent.status === 'confirmed' ? 'bg-[#2D6A4F]/10 text-[#2D6A4F]' :
                      selectedEvent.status === 'pending' ? 'bg-[#E3B062]/10 text-[#D08C3F]' :
                      'bg-[#C97A7E]/10 text-[#C97A7E]'
                    }`}>
                      {selectedEvent.status.replace('_', ' ')}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-[#2A3B2C] mt-3">{selectedEvent.title}</h3>
                    <p className="text-[#5F6B63] text-sm mt-1">{format(selectedEvent.start, 'EEEE, MMMM do, yyyy')}</p>
                    <p className="text-[#5F6B63] text-sm">{format(selectedEvent.start, 'h:mm a')} - {format(selectedEvent.end, 'h:mm a')}</p>
                  </div>

                  <div className="bg-[#F5F1EA] rounded-xl p-4 mb-6">
                    <p className="text-sm text-[#2A3B2C]"><strong>Therapist:</strong> Dr. {selectedEvent.resource.doctor_name}</p>
                    <p className="text-sm text-[#2A3B2C] mt-1"><strong>Location:</strong> {selectedEvent.resource.location || 'Clinic'}</p>
                  </div>

                  {new Date() < selectedEvent.start && selectedEvent.status !== 'cancelled' && (
                    <button 
                      onClick={() => handleCancel(selectedEvent.id)}
                      className="w-full py-3 border border-[#C97A7E]/30 text-[#C97A7E] rounded-xl font-bold hover:bg-[#C97A7E]/5 transition-colors flex justify-center items-center"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Reminder Settings Teaser */}
            <div className="bg-white p-6 rounded-3xl border border-[#E7D9C9] shadow-sm">
              <h3 className="font-serif font-bold text-[#2A3B2C] mb-2">Notification Preferences</h3>
              <p className="text-[#5F6B63] text-sm mb-4 leading-relaxed">Customize how you receive reminders for your upcoming therapy sessions.</p>
              
              <div className="space-y-3">
                {['24 hours before', '2 hours before'].map((opt, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border border-[#E7D9C9] rounded-xl">
                    <span className="text-sm font-medium text-[#2A3B2C]">{opt}</span>
                    <div className="w-10 h-6 bg-[#2D6A4F] rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* Custom CSS overrides for react-big-calendar to match aesthetic */}
      <style dangerouslySetInnerHTML={{__html: `
        .premium-calendar-wrapper .rbc-calendar {
          font-family: inherit;
        }
        .premium-calendar-wrapper .rbc-toolbar button {
          color: #5F6B63;
          border-radius: 8px;
          padding: 6px 12px;
          border: 1px solid #E7D9C9;
          background: #FDFBF7;
          transition: all 0.2s;
        }
        .premium-calendar-wrapper .rbc-toolbar button:hover {
          background: #F5F1EA;
        }
        .premium-calendar-wrapper .rbc-toolbar button.rbc-active {
          background: #8BA888;
          color: white;
          border-color: #8BA888;
          box-shadow: none;
        }
        .premium-calendar-wrapper .rbc-header {
          border-bottom: none;
          padding: 10px 0;
          font-weight: 700;
          color: #8BA888;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.05em;
        }
        .premium-calendar-wrapper .rbc-month-view,
        .premium-calendar-wrapper .rbc-time-view {
          border: 1px solid #E7D9C9;
          border-radius: 12px;
          overflow: hidden;
        }
        .premium-calendar-wrapper .rbc-day-bg {
          border-left: 1px solid #E7D9C9;
        }
        .premium-calendar-wrapper .rbc-month-row {
          border-top: 1px solid #E7D9C9;
        }
        .premium-calendar-wrapper .rbc-today {
          background-color: #8BA88810;
        }
        .premium-calendar-wrapper .rbc-event {
          background-color: transparent;
        }
      `}} />
    </div>
  );
};

export default Calendar;

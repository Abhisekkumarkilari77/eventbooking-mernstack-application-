import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventAPI, bookingAPI, scheduleAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SeatMap from '../components/SeatMap';
import toast from 'react-hot-toast';
import { IoCalendar, IoLocationSharp, IoMusicalNotes, IoTime, IoPeople, IoTicket, IoWallet, IoMap, IoCall } from 'react-icons/io5';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [activeTab, setActiveTab] = useState('seats');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await eventAPI.getOne(id);
        setEvent(data.event);
        setSchedules(data.schedules || []);
        setSections(data.sections || []);
      } catch (err) {
        toast.error('Failed to load event');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please login to book tickets');
      navigate('/login');
      return;
    }

    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    setBooking(true);
    try {
      // Step 1: Reserve seats
      const { data: reserveData } = await bookingAPI.reserve({
        eventId: event._id,
        seatIds: selectedSeats.map(s => s._id)
      });

      toast.success(`${selectedSeats.length} seat(s) reserved! Completing payment...`);

      // Step 2: Simulate payment and confirm
      const { data: confirmData } = await bookingAPI.confirm({
        bookingId: reserveData.booking._id,
        paymentMethod: 'simulated'
      });

      toast.success('🎉 Booking confirmed! Tickets generated.');
      navigate(`/my-bookings`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="loading-container" style={{ minHeight: '60vh' }}>
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const venue = event.venueId;
  const dateStr = new Date(event.startDate).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const timeStr = new Date(event.startDate).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
  const endTimeStr = new Date(event.endDate).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });
  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  const categoryImages = {
    'Concert': 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=500&fit=crop',
    'Pop Singing': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=500&fit=crop',
    'DJ Night': 'https://images.unsplash.com/photo-1571266028243-d220c6d5e8a8?w=1200&h=500&fit=crop',
    'Comedy Night': 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=1200&h=500&fit=crop',
    'Live Band': 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=1200&h=500&fit=crop',
    'Acoustic Session': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&h=500&fit=crop',
    'Music Festival': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=1200&h=500&fit=crop',
    'College Fest': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&h=500&fit=crop'
  };

  return (
    <div className="page-content">
      {/* Event Banner */}
      <div style={{
        position: 'relative', height: 400, overflow: 'hidden',
        borderRadius: '0 0 24px 24px', marginTop: -32
      }}>
        <img
          src={event.bannerImages?.[0] || categoryImages[event.category] || categoryImages['Concert']}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(11,17,32,1) 0%, rgba(11,17,32,0.5) 50%, transparent 100%)'
        }}></div>
        <div style={{
          position: 'absolute', bottom: 40, left: 0, right: 0,
          padding: '0 24px', maxWidth: 'var(--container-max)', margin: '0 auto'
        }}>
          <span className="badge badge-primary" style={{ marginBottom: 12 }}>{event.category}</span>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800, marginBottom: 12 }}>
            {event.title}
          </h1>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IoCalendar color="var(--primary-light)" /> {dateStr}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <IoTime color="var(--secondary)" /> {timeStr} - {endTimeStr}
            </span>
            {venue && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <IoLocationSharp color="var(--accent)" /> {venue.name}, {venue.city}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          {/* Left Content */}
          <div>
            {/* Description */}
            <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700, marginBottom: 12 }}>
                About This Event
              </h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{event.description}</p>
              
              {event.tags?.length > 0 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  {event.tags.map(tag => (
                    <span key={tag} style={{
                      padding: '4px 12px', background: 'var(--surface)',
                      borderRadius: 'var(--radius-full)', fontSize: '0.8rem', color: 'var(--text-muted)'
                    }}>#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button className={`tab ${activeTab === 'seats' ? 'active' : ''}`} onClick={() => setActiveTab('seats')}>
                🪑 Seat Map
              </button>
              <button className={`tab ${activeTab === 'performers' ? 'active' : ''}`} onClick={() => setActiveTab('performers')}>
                🎤 Performers
              </button>
              <button className={`tab ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
                📅 Schedule
              </button>
              <button className={`tab ${activeTab === 'venue' ? 'active' : ''}`} onClick={() => setActiveTab('venue')}>
                📍 Venue
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'seats' && (
              <div className="glass-card" style={{ padding: 24 }}>
                <SeatMap eventId={event._id} onSelectionChange={setSelectedSeats} />
              </div>
            )}

            {activeTab === 'performers' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {event.performers?.map((p, i) => {
                  const artist = p.artistId;
                  if (!artist) return null;
                  return (
                    <div key={i} className="artist-card" style={{ animation: `slideInLeft 0.4s ease ${i * 0.1}s both` }}>
                      <div className="artist-avatar">{artist.name?.charAt(0)}</div>
                      <div className="artist-info">
                        <div className="artist-name">{artist.name}</div>
                        <div className="artist-genre">{artist.genre}</div>
                        {artist.bio && <div className="artist-bio">{artist.bio}</div>}
                      </div>
                    </div>
                  );
                })}
                {(!event.performers || event.performers.length === 0) && (
                  <div className="empty-state">
                    <div className="empty-state-icon">🎤</div>
                    <p className="empty-state-text">Performer lineup coming soon!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'schedule' && (
              <div className="schedule-timeline">
                {schedules.length > 0 ? schedules.map((sch, i) => (
                  <div key={i} className="schedule-item" style={{ animation: `fadeInUp 0.4s ease ${i * 0.1}s both` }}>
                    <div className="schedule-time">
                      {new Date(sch.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(sch.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="schedule-artist">{sch.artistId?.name || 'TBA'}</div>
                    <div className="schedule-stage">
                      🎸 {sch.stageName} • {sch.performanceType}
                    </div>
                  </div>
                )) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">📅</div>
                    <p className="empty-state-text">Schedule will be announced soon!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'venue' && venue && (
              <div>
                <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: 16 }}>{venue.name}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{venue.description}</p>
                  
                  <div className="venue-info-grid">
                    <div className="venue-info-item">
                      <div className="venue-info-icon"><IoLocationSharp /></div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Address</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {venue.address}, {venue.city}, {venue.state}
                        </div>
                      </div>
                    </div>
                    <div className="venue-info-item">
                      <div className="venue-info-icon"><IoPeople /></div>
                      <div>
                        <div style={{ fontWeight: 600 }}>Capacity</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {venue.capacity?.toLocaleString()} people
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map Placeholder */}
                <div className="venue-map-placeholder">
                  <IoMap style={{ fontSize: '3rem', color: 'var(--primary-light)' }} />
                  <p>📍 {venue.city}, {venue.state}</p>
                  <p style={{ fontSize: '0.8rem' }}>
                    Coordinates: {venue.coordinates?.latitude?.toFixed(4)}, {venue.coordinates?.longitude?.toFixed(4)}
                  </p>
                  <a
                    href={`https://www.google.com/maps?q=${venue.coordinates?.latitude},${venue.coordinates?.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: 8 }}
                  >
                    Open in Google Maps
                  </a>
                </div>

                {/* Amenities */}
                {venue.amenities && (
                  <div className="glass-card" style={{ padding: 24, marginTop: 16 }}>
                    <h4 style={{ fontWeight: 600, marginBottom: 12 }}>Amenities</h4>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {venue.amenities.parking && <span className="badge badge-info">🅿️ Parking</span>}
                      {venue.amenities.food && <span className="badge badge-info">🍔 Food Court</span>}
                      {venue.amenities.wheelchairAccess && <span className="badge badge-info">♿ Wheelchair Access</span>}
                      {venue.amenities.wifi && <span className="badge badge-info">📶 WiFi</span>}
                      {venue.amenities.restrooms && <span className="badge badge-info">🚻 Restrooms</span>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - Booking Summary */}
          <div style={{ position: 'sticky', top: 'calc(var(--nav-height) + 24px)' }}>
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: 20 }}>
                <IoTicket style={{ color: 'var(--primary-light)' }} /> Booking Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Price Range</span>
                  <span style={{ fontWeight: 600 }}>₹{event.ticketPriceRange?.min} - ₹{event.ticketPriceRange?.max}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Available Seats</span>
                  <span style={{ fontWeight: 600, color: 'var(--success)' }}>{event.availableSeats} / {event.totalSeats}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Selected Seats</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary-light)' }}>{selectedSeats.length}</span>
                </div>

                {selectedSeats.length > 0 && (
                  <>
                    <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: 12 }}>
                      {selectedSeats.map(s => (
                        <div key={s._id} style={{
                          display: 'flex', justifyContent: 'space-between',
                          fontSize: '0.8rem', padding: '4px 0', color: 'var(--text-secondary)'
                        }}>
                          <span>🪑 {s.seatLabel}</span>
                          <span>₹{s.price}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      borderTop: '1px solid var(--glass-border)', paddingTop: 12,
                      fontSize: '1.1rem', fontWeight: 700
                    }}>
                      <span>Total</span>
                      <span style={{ color: 'var(--accent)' }}>₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </>
                )}
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleBooking}
                disabled={selectedSeats.length === 0 || booking}
                style={{ marginBottom: 12 }}
              >
                {booking ? (
                  <>
                    <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <IoWallet /> {selectedSeats.length > 0 ? `Pay ₹${totalPrice.toLocaleString('en-IN')}` : 'Select Seats'}
                  </>
                )}
              </button>

              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                ⏱️ Seats reserved for 5 minutes after selection<br />
                ✅ Free cancellation up to 24 hours before event
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;

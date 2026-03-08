import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import toast from 'react-hot-toast';
import { IoCalendar, IoLocationSharp, IoTicket, IoClose } from 'react-icons/io5';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingAPI.getMyBookings()
      .then(({ data }) => setBookings(data.bookings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this booking? Refund will be processed.')) return;
    try {
      await bookingAPI.cancel(id, { reason: 'User cancellation' });
      toast.success('Cancelled & refund initiated');
      setBookings(p => p.map(b => b._id === id ? { ...b, bookingStatus: 'cancelled' } : b));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="page-content"><div className="loading-container"><div className="loading-spinner"></div></div></div>;

  return (
    <div className="page-content">
      <div className="container">
        <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: 32 }}>🎫 My Bookings</h1>
        {bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎫</div>
            <h3 className="empty-state-title">No Bookings Yet</h3>
            <Link to="/events" className="btn btn-primary">Browse Events</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {bookings.map((b, i) => {
              const ev = b.eventId;
              const colors = { pending: 'badge-warning', confirmed: 'badge-success', cancelled: 'badge-danger', expired: 'badge-danger' };
              return (
                <div key={b._id} className="glass-card" style={{ padding: 24, animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <span className={`badge ${colors[b.bookingStatus]}`}>{b.bookingStatus.toUpperCase()}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: 8 }}>#{b.bookingNumber}</span>
                      <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', margin: '8px 0' }}>{ev?.title}</h3>
                      <div style={{ display: 'flex', gap: 16, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <span><IoCalendar /> {ev?.startDate && new Date(ev.startDate).toLocaleDateString('en-IN')}</span>
                        <span><IoLocationSharp /> {ev?.venueId?.name}, {ev?.venueId?.city}</span>
                        <span><IoTicket /> {b.seatIds?.length} ticket(s)</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.5rem', color: 'var(--accent)' }}>₹{b.totalAmount?.toLocaleString('en-IN')}</div>
                      {b.bookingStatus === 'confirmed' && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <Link to="/my-tickets" className="btn btn-primary btn-sm">Tickets</Link>
                          <button className="btn btn-danger btn-sm" onClick={() => handleCancel(b._id)}><IoClose /> Cancel</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;

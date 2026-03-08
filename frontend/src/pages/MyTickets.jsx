import { useState, useEffect } from 'react';
import { ticketAPI } from '../services/api';
import { IoCalendar, IoLocationSharp, IoCheckmarkCircle } from 'react-icons/io5';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketAPI.getMyTickets()
      .then(({ data }) => setTickets(data.tickets))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-content"><div className="loading-container"><div className="loading-spinner"></div></div></div>;

  const statusColors = { valid: 'badge-success', used: 'badge-info', cancelled: 'badge-danger', expired: 'badge-warning' };

  return (
    <div className="page-content">
      <div className="container">
        <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: 32 }}>🎟️ My Tickets</h1>
        {tickets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎟️</div>
            <h3 className="empty-state-title">No Tickets Yet</h3>
            <p className="empty-state-text">Book an event to get your digital tickets with QR codes!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 24 }}>
            {tickets.map((ticket, i) => (
              <div key={ticket._id} className="ticket-card" style={{ animation: `fadeInUp 0.4s ease ${i * 0.1}s both` }}>
                <div className="ticket-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontFamily: 'Outfit', fontWeight: 700 }}>{ticket.eventId?.title}</h3>
                      <p style={{ opacity: 0.8, fontSize: '0.85rem' }}>{ticket.ticketNumber}</p>
                    </div>
                    <span className={`badge ${statusColors[ticket.ticketStatus]}`}>{ticket.ticketStatus}</span>
                  </div>
                </div>
                <div className="ticket-body">
                  <div className="ticket-details">
                    <div className="ticket-detail-row">
                      <span className="ticket-detail-label">Date</span>
                      <span className="ticket-detail-value">
                        {ticket.eventId?.startDate && new Date(ticket.eventId.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="ticket-detail-row">
                      <span className="ticket-detail-label">Venue</span>
                      <span className="ticket-detail-value">{ticket.eventId?.venueId?.name}</span>
                    </div>
                    <div className="ticket-detail-row">
                      <span className="ticket-detail-label">Seat</span>
                      <span className="ticket-detail-value">{ticket.seatId?.seatLabel || 'N/A'}</span>
                    </div>
                    <div className="ticket-detail-row">
                      <span className="ticket-detail-label">Price</span>
                      <span className="ticket-detail-value">₹{ticket.seatId?.price}</span>
                    </div>
                    {ticket.ticketStatus === 'used' && (
                      <div className="ticket-detail-row">
                        <span className="ticket-detail-label">Checked In</span>
                        <span className="ticket-detail-value" style={{ color: 'var(--success)' }}>
                          <IoCheckmarkCircle /> {new Date(ticket.checkedInAt).toLocaleString('en-IN')}
                        </span>
                      </div>
                    )}
                  </div>
                  {ticket.qrCode && (
                    <div className="ticket-qr">
                      <img src={ticket.qrCode} alt="QR Code" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTickets;

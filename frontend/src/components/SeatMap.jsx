import { useState, useEffect, useCallback } from 'react';
import { seatAPI } from '../services/api';
import { io } from 'socket.io-client';

const SeatMap = ({ eventId, onSelectionChange, readOnly = false }) => {
  const [seatsData, setSeatsData] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSeats = useCallback(async () => {
    try {
      const { data } = await seatAPI.getEventSeats(eventId);
      setSeatsData(data.seatsData);
    } catch (err) {
      console.error('Failed to fetch seats:', err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchSeats();

    // Real-time seat updates
    const API_URL = 'http://localhost:5000';
    const socket = io(API_URL, { withCredentials: true });
    socket.emit('join:event', eventId);

    socket.on('seat:update', (updatedSeats) => {
      setSeatsData(prev => {
        return prev.map(sectionData => ({
          ...sectionData,
          seats: sectionData.seats.map(seat => {
            const updated = updatedSeats.find(u => u._id === seat._id);
            return updated ? { ...seat, ...updated } : seat;
          })
        }));
      });

      // Remove selected seats that are no longer available
      setSelectedSeats(prev => {
        const unavailable = updatedSeats.filter(u => u.status !== 'available').map(u => u._id);
        return prev.filter(id => !unavailable.includes(id));
      });
    });

    return () => {
      socket.emit('leave:event', eventId);
      socket.disconnect();
    };
  }, [eventId, fetchSeats]);

  useEffect(() => {
    if (onSelectionChange) {
      const selected = seatsData.flatMap(s => s.seats).filter(s => selectedSeats.includes(s._id));
      onSelectionChange(selected);
    }
  }, [selectedSeats, seatsData, onSelectionChange]);

  const toggleSeat = (seatId, status) => {
    if (readOnly || status !== 'available') return;

    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      }
      if (prev.length >= 10) return prev; // Max 10 seats
      return [...prev, seatId];
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading seat map...</p>
      </div>
    );
  }

  return (
    <div className="seat-map-container">
      <div className="stage">🎤 STAGE</div>

      {seatsData.map(({ section, seats }) => {
        // Group seats by row
        const rows = {};
        seats.forEach(seat => {
          if (!rows[seat.row]) rows[seat.row] = [];
          rows[seat.row].push(seat);
        });

        return (
          <div key={section._id} className="section-group">
            <div className="section-label">
              <span style={{
                width: 12, height: 12, borderRadius: 3,
                background: section.colorCode, display: 'inline-block'
              }}></span>
              {section.name}
              <span className="section-price">₹{section.price}</span>
            </div>

            {Object.entries(rows).sort().map(([row, rowSeats]) => (
              <div key={row} className="seat-row">
                <span className="row-label">{row}</span>
                {rowSeats.sort((a, b) => a.seatNumber - b.seatNumber).map(seat => {
                  const isSelected = selectedSeats.includes(seat._id);
                  const seatClass = isSelected ? 'selected' : seat.status;

                  return (
                    <div
                      key={seat._id}
                      className={`seat ${seatClass}`}
                      onClick={() => toggleSeat(seat._id, seat.status)}
                      title={`${seat.seatLabel} - ₹${seat.price} (${seat.status})`}
                    >
                      {seat.seatNumber}
                    </div>
                  );
                })}
                <span className="row-label">{row}</span>
              </div>
            ))}
          </div>
        );
      })}

      <div className="seat-legend" style={{ marginTop: 40, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24 }}>
        <div className="legend-item">
          <div className="seat available" style={{ width: 20, height: 20, fontSize: 0, border: 'none' }}></div>
          Available
        </div>
        <div className="legend-item">
          <div className="seat selected" style={{ width: 20, height: 20, fontSize: 0, border: 'none', transform: 'none' }}></div>
          Selected
        </div>
        <div className="legend-item">
          <div className="seat reserved" style={{ width: 20, height: 20, fontSize: 0, border: 'none' }}></div>
          Reserved
        </div>
        <div className="legend-item">
          <div className="seat booked" style={{ width: 20, height: 20, fontSize: 0, border: 'none' }}></div>
          Booked
        </div>
        <div className="legend-item">
          <div className="seat blocked" style={{ width: 20, height: 20, fontSize: 0, border: 'none' }}></div>
          Blocked
        </div>
      </div>

      {selectedSeats.length > 0 && !readOnly && (
        <div style={{
          marginTop: 24, padding: 16,
          background: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          borderRadius: 12, textAlign: 'center'
        }}>
          <strong>{selectedSeats.length}</strong> seat(s) selected •
          Total: <strong>₹{seatsData.flatMap(s => s.seats).filter(s => selectedSeats.includes(s._id)).reduce((sum, s) => sum + s.price, 0).toLocaleString('en-IN')}</strong>
        </div>
      )}
    </div>
  );
};

export default SeatMap;

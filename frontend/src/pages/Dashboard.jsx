import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI, ticketAPI, authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { IoTrendingUp, IoTicket, IoCash, IoPeople, IoCheckmarkCircle, IoCloseCircle, IoQrCode } from 'react-icons/io5';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checkinNumber, setCheckinNumber] = useState('');
  const [checkinResult, setCheckinResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, meRes] = await Promise.all([
          analyticsAPI.getDashboard(),
          authAPI.getMe()
        ]);
        setStats(dashRes.data);
        setWallet(meRes.data.user.walletBalance || 0);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCheckin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await ticketAPI.checkin({ ticketNumber: checkinNumber });
      setCheckinResult(data);
      toast.success('Check-in successful! ✅');
      setCheckinNumber('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check-in failed');
      setCheckinResult({ success: false, message: err.response?.data?.message });
    }
  };

  if (loading) return <div className="page-content"><div className="loading-container"><div className="loading-spinner"></div></div></div>;

  const s = stats?.stats || {};

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: 8 }}>📊 Organizer Dashboard</h1>
            <p className="section-subtitle">Welcome back, {user?.name}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>Account Balance</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-light)' }}>₹{wallet.toLocaleString('en-IN')}</div>
            <Link to="/create-event" className="btn btn-primary" style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              ✨ Create New Event
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          {[
            { icon: <IoTrendingUp />, label: 'Total Events', value: stats?.totalEvents || 0, color: '#7C3AED' },
            { icon: <IoTicket />, label: 'Tickets Sold', value: s.totalTicketsSold || 0, color: '#06B6D4' },
            { icon: <IoCash />, label: 'Total Revenue', value: `₹${(s.totalRevenue || 0).toLocaleString('en-IN')}`, color: '#10B981' },
            { icon: <IoCheckmarkCircle />, label: 'Check-ins', value: s.totalCheckIns || 0, color: '#F59E0B' },
            { icon: <IoCloseCircle />, label: 'Cancellations', value: s.totalCancellations || 0, color: '#EF4444' },
            { icon: <IoPeople />, label: 'Top Events', value: stats?.topEvents?.length || 0, color: '#F472B6' },
          ].map((stat, i) => (
            <div key={i} className="stat-card" style={{ animation: `fadeInUp 0.4s ease ${i * 0.05}s both` }}>
              <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Check-in System */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: 20 }}>
              <IoQrCode style={{ color: 'var(--primary-light)' }} /> Ticket Check-in
            </h3>
            <form onSubmit={handleCheckin} style={{ display: 'flex', gap: 8 }}>
              <input
                type="text" className="input-field" placeholder="Enter ticket number (TK-...)"
                value={checkinNumber} onChange={(e) => setCheckinNumber(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn btn-primary">Check In</button>
            </form>
            {checkinResult && (
              <div style={{
                marginTop: 16, padding: 16, borderRadius: 12,
                background: checkinResult.success ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${checkinResult.success ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
              }}>
                {checkinResult.success ? (
                  <div>
                    <p style={{ color: 'var(--success)', fontWeight: 600 }}>✅ {checkinResult.message}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                      {checkinResult.ticket?.userId?.name} — Seat: {checkinResult.ticket?.seatId?.seatLabel}
                    </p>
                  </div>
                ) : (
                  <p style={{ color: 'var(--danger)' }}>❌ {checkinResult.message}</p>
                )}
              </div>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="glass-card" style={{ padding: 28 }}>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: 20 }}>Recent Bookings</h3>
            {stats?.recentBookings?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {stats.recentBookings.slice(0, 5).map(b => (
                  <div key={b._id} style={{
                    display: 'flex', justifyContent: 'space-between', padding: '8px 12px',
                    background: 'var(--surface)', borderRadius: 8, fontSize: '0.85rem'
                  }}>
                    <span>{b.userId?.name} — {b.eventId?.title?.substring(0, 25)}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>₹{b.totalAmount}</span>
                  </div>
                ))}
              </div>
            ) : <p style={{ color: 'var(--text-muted)' }}>No recent bookings</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

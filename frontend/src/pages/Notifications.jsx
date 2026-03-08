import { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { IoCheckmarkDone } from 'react-icons/io5';

const typeIcons = {
  bookingConfirmation: '🎫', eventReminder: '⏰',
  refundProcessed: '💰', cancellation: '❌',
  eventUpdate: '📢', welcome: '🎉'
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    notificationAPI.getAll()
      .then(({ data }) => setNotifications(data.notifications))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationAPI.markAllAsRead();
    setNotifications(n => n.map(x => ({ ...x, readStatus: true })));
  };

  if (loading) return <div className="page-content"><div className="loading-container"><div className="loading-spinner"></div></div></div>;

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 700 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <h1 className="section-title" style={{ fontSize: '2rem' }}>🔔 Notifications</h1>
          <button className="btn btn-secondary btn-sm" onClick={markAllRead}><IoCheckmarkDone /> Mark all read</button>
        </div>
        {notifications.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">🔔</div><h3 className="empty-state-title">No Notifications</h3></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.map((n, i) => (
              <div key={n._id} className="glass-card" style={{
                padding: 20, opacity: n.readStatus ? 0.7 : 1,
                borderLeft: n.readStatus ? 'none' : '3px solid var(--primary)',
                animation: `fadeInUp 0.3s ease ${i * 0.03}s both`
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>{typeIcons[n.type] || '📌'}</span>
                  <div>
                    <h4 style={{ fontWeight: 600, marginBottom: 4 }}>{n.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{n.message}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                      {new Date(n.createdAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

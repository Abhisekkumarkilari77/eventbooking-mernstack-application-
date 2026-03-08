import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventAPI } from '../services/api';
import EventCard from '../components/EventCard';
import { IoSearch, IoSparkles, IoMusicalNotes, IoTicket, IoShieldCheckmark, IoFlash } from 'react-icons/io5';

const Home = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await eventAPI.getFeatured();
        if (data.events.length === 0) {
          // Fallback to all published events
          const allData = await eventAPI.getAll({ limit: 6 });
          setFeaturedEvents(allData.data.events);
        } else {
          setFeaturedEvents(data.events);
        }
      } catch (err) {
        console.error('Failed to load featured events:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const features = [
    { icon: <IoMusicalNotes />, title: 'Live Concerts', desc: 'Experience electrifying performances from top artists', color: '#7C3AED' },
    { icon: <IoTicket />, title: 'Instant Booking', desc: 'Select seats, pay online, get QR tickets instantly', color: '#06B6D4' },
    { icon: <IoFlash />, title: 'Real-Time Seats', desc: 'Live seat availability updates via WebSocket', color: '#F472B6' },
    { icon: <IoShieldCheckmark />, title: 'Secure Payments', desc: 'Safe transactions with automatic refund policies', color: '#10B981' }
  ];

  return (
    <div className="page-content">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <IoSparkles /> Live Events • Concerts • Festivals
          </div>
          <h1 className="hero-title">
            Discover & Book<br />
            <span className="gradient-text">Amazing Live Events</span>
          </h1>
          <p className="hero-subtitle">
            From electrifying concerts to intimate acoustic sessions — find and book the best live music events happening near you. Real-time seat selection with instant QR tickets.
          </p>
          <div className="hero-actions">
            <Link to="/events" className="btn btn-primary btn-lg">
              <IoSearch /> Explore Events
            </Link>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Become an Organizer
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">1000+</div>
              <div className="hero-stat-label">Live Events</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">50K+</div>
              <div className="hero-stat-label">Tickets Sold</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">100+</div>
              <div className="hero-stat-label">Artists</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">25+</div>
              <div className="hero-stat-label">Cities</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">🔥 Featured Events</h2>
              <p className="section-subtitle">Don't miss out on these hot events</p>
            </div>
            <Link to="/events" className="btn btn-secondary">
              View All Events →
            </Link>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading events...</p>
            </div>
          ) : (
            <div className="events-grid">
              {featuredEvents.map((event, i) => (
                <div key={event._id} style={{ animationDelay: `${i * 0.1}s` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="section-title">Why EventHub?</h2>
            <p className="section-subtitle">The ultimate platform for live event discovery & booking</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 20
          }}>
            {features.map((feat, i) => (
              <div key={i} className="glass-card" style={{
                padding: 28,
                animation: `fadeInUp 0.5s ease ${i * 0.1}s both`
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: `${feat.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', color: feat.color, marginBottom: 16
                }}>
                  {feat.icon}
                </div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.15rem', marginBottom: 8 }}>
                  {feat.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="glass-card" style={{
            padding: '60px 40px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(6, 182, 212, 0.1) 50%, rgba(244, 114, 182, 0.1) 100%)',
            border: '1px solid rgba(124, 58, 237, 0.2)'
          }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>
              Ready to Experience Live Music?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
              Join thousands of music lovers. Discover events, book seats, and create unforgettable memories.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/events" className="btn btn-primary btn-lg">Browse Events</Link>
              <Link to="/register" className="btn btn-accent btn-lg">Sign Up Free</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--glass-border)',
        padding: '40px 0',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>🎫</span>
            <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EventHub
            </span>
          </div>
          <p>© 2026 EventHub. Your gateway to live entertainment.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

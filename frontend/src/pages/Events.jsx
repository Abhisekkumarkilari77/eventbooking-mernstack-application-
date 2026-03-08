import { useState, useEffect } from 'react';
import { eventAPI } from '../services/api';
import EventCard from '../components/EventCard';
import { IoSearch, IoFilter } from 'react-icons/io5';

const categories = ['All', 'Pop Singing', 'DJ Night', 'Live Band', 'Acoustic Session', 'College Fest', 'Comedy Night', 'Music Festival', 'Concert'];

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: 'All', city: '' });
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  const fetchEvents = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filters.search) params.search = filters.search;
      if (filters.category !== 'All') params.category = filters.category;
      if (filters.city) params.city = filters.city;

      const { data } = await eventAPI.getAll(params);
      setEvents(data.events);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [filters.category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  return (
    <div className="page-content">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 className="section-title" style={{ fontSize: '2rem', marginBottom: 8 }}>
            🎵 Discover Events
          </h1>
          <p className="section-subtitle">Find the best live events happening near you</p>
        </div>

        {/* Filters */}
        <form onSubmit={handleSearch} className="filter-bar">
          <div className="input-group" style={{ flex: 2 }}>
            <div style={{ position: 'relative' }}>
              <IoSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search events, artists..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                style={{ paddingLeft: 36, width: '100%' }}
              />
            </div>
          </div>
          <input
            type="text"
            className="input-field"
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
            style={{ flex: 1, minWidth: 150 }}
          />
          <button type="submit" className="btn btn-primary">
            <IoFilter /> Search
          </button>
        </form>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`tab ${filters.category === cat ? 'active' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
              style={{ background: filters.category === cat ? 'var(--primary)' : 'var(--surface)' }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Discovering events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎭</div>
            <h3 className="empty-state-title">No Events Found</h3>
            <p className="empty-state-text">Try adjusting your filters or check back later for new events!</p>
          </div>
        ) : (
          <>
            <div className="events-grid">
              {events.map((event, i) => (
                <div key={event._id} style={{ animationDelay: `${i * 0.05}s` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                {Array.from({ length: pagination.pages }, (_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm ${pagination.page === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => fetchEvents(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;

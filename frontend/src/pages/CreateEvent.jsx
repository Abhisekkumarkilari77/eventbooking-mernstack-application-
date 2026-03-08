import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventAPI, venueAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const CreateEvent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState([
    { name: 'VIP', price: 2000, rowCount: 2, seatsPerRow: 10, colorCode: '#1DB954' },
    { name: 'General', price: 500, rowCount: 8, seatsPerRow: 10, colorCode: '#06B6D4' }
  ]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Pop Singing',
    venueId: '',
    startDate: '',
    endDate: '',
    status: 'published'
  });

  useEffect(() => {
    if (user?.role !== 'organizer' && user?.role !== 'admin') {
      toast.error('Unauthorized access');
      navigate('/');
    }

    venueAPI.getAll().then(({ data }) => {
      setVenues(data.venues || []);
      if (data.venues?.length > 0) {
        setForm(prev => ({ ...prev, venueId: data.venues[0]._id }));
      }
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSectionChange = (index, field, value) => {
    const newSections = [...sections];
    newSections[index][field] = field === 'name' || field === 'colorCode' ? value : Number(value);
    setSections(newSections);
  };

  const addSection = () => {
    setSections([...sections, { name: 'New Section', price: 1000, rowCount: 5, seatsPerRow: 10, colorCode: '#7C3AED' }]);
  };

  const removeSection = (index) => {
    if (sections.length === 1) return;
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const totalSeats = sections.reduce((sum, s) => sum + (s.rowCount * s.seatsPerRow), 0);
      const minPrice = Math.min(...sections.map(s => s.price));
      const maxPrice = Math.max(...sections.map(s => s.price));

      const payload = {
        ...form,
        totalSeats,
        ticketPriceRange: { min: minPrice, max: maxPrice },
        sections
      };

      await eventAPI.create(payload);
      toast.success('Event Created Successfully! 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="container" style={{ maxWidth: 800 }}>
        <h1 className="section-title">✨ Create New Event</h1>
        
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24, alignItems: 'start' }}>
            <div className="glass-card" style={{ padding: 28 }}>
              <h3 style={{ marginBottom: 20, fontFamily: 'Outfit' }}>Basic Info</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label>Event Title</label>
                  <input type="text" name="title" className="input-field" value={form.title} onChange={handleChange} required />
                </div>

                <div className="input-group">
                  <label>Description</label>
                  <textarea name="description" className="input-field" value={form.description} onChange={handleChange} required rows={3}></textarea>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="input-group">
                    <label>Category</label>
                    <select name="category" className="input-field" value={form.category} onChange={handleChange}>
                      <option>Pop Singing</option>
                      <option>DJ Night</option>
                      <option>Live Band</option>
                      <option>Comedy Night</option>
                      <option>Concert</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Venue</label>
                    <select name="venueId" className="input-field" value={form.venueId} onChange={handleChange} required>
                      {venues.map(v => <option key={v._id} value={v._id}>{v.name} ({v.city})</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="input-group">
                    <label>Start Date</label>
                    <input type="datetime-local" name="startDate" className="input-field" value={form.startDate} onChange={handleChange} required />
                  </div>
                  <div className="input-group">
                    <label>End Date</label>
                    <input type="datetime-local" name="endDate" className="input-field" value={form.endDate} onChange={handleChange} required />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'Outfit' }}>Set Sections</h3>
                <button type="button" onClick={addSection} className="btn btn-secondary btn-sm">+ Add</button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sections.map((s, i) => (
                  <div key={i} style={{ 
                    padding: 16, background: 'rgba(255,255,255,0.03)', 
                    borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)',
                    position: 'relative'
                  }}>
                    {sections.length > 1 && (
                      <button type="button" onClick={() => removeSection(i)} 
                        style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer' }}>
                        ✕
                      </button>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8, marginBottom: 8 }}>
                      <input type="text" placeholder="Name" className="input-field btn-sm" value={s.name} onChange={(e) => handleSectionChange(i, 'name', e.target.value)} />
                      <input type="number" placeholder="Price" className="input-field btn-sm" value={s.price} onChange={(e) => handleSectionChange(i, 'price', e.target.value)} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                      <input type="number" placeholder="Rows" className="input-field btn-sm" value={s.rowCount} onChange={(e) => handleSectionChange(i, 'rowCount', e.target.value)} />
                      <input type="number" placeholder="Cols" className="input-field btn-sm" value={s.seatsPerRow} onChange={(e) => handleSectionChange(i, 'seatsPerRow', e.target.value)} />
                      <input type="color" className="input-field btn-sm" style={{ padding: 2, height: 32 }} value={s.colorCode} onChange={(e) => handleSectionChange(i, 'colorCode', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} style={{ marginTop: 24 }}>
                {loading ? 'Creating...' : '🚀 Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;

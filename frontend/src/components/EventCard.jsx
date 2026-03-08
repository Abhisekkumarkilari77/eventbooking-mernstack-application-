import { Link } from 'react-router-dom';
import { IoLocationSharp, IoCalendar, IoMusicalNotes } from 'react-icons/io5';

const categoryImages = {
  'Concert': 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop',
  'Pop Singing': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
  'DJ Night': 'https://images.unsplash.com/photo-1571266028243-d220c6d5e8a8?w=600&h=400&fit=crop',
  'Comedy Night': 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&h=400&fit=crop',
  'Live Band': 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=600&h=400&fit=crop',
  'Acoustic Session': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&h=400&fit=crop',
  'Music Festival': 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=600&h=400&fit=crop',
  'College Fest': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
  'Other': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop'
};

const EventCard = ({ event }) => {
  const dateStr = new Date(event.startDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
  const timeStr = new Date(event.startDate).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  });

  const venue = event.venueId;
  const minPrice = event.ticketPriceRange?.min || 0;
  const imgUrl = event.bannerImages?.[0] || categoryImages[event.category] || categoryImages['Other'];

  return (
    <Link to={`/events/${event._id}`} className="event-card" style={{ animation: 'fadeInUp 0.5s ease' }}>
      <div className="event-card-image">
        <img src={imgUrl} alt={event.title} loading="lazy" />
        <span className="event-category">{event.category}</span>
        <span className="event-price">₹{minPrice}+</span>
      </div>
      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-card-meta">
          <div className="event-card-meta-item">
            <IoCalendar />
            <span>{dateStr} • {timeStr}</span>
          </div>
          {venue && (
            <div className="event-card-meta-item">
              <IoLocationSharp />
              <span>{venue.name}, {venue.city}</span>
            </div>
          )}
        </div>
        {event.performers?.length > 0 && (
          <div className="event-card-performers">
            {event.performers.slice(0, 3).map((p, i) => (
              <span key={i} className="performer-tag">
                <IoMusicalNotes style={{ fontSize: '0.65rem' }} /> {p.artistId?.name || 'Artist'}
              </span>
            ))}
          </div>
        )}
        <div className="event-card-footer">
          <div className="seats-info">
            <span className="seats-count">{event.availableSeats}</span> seats left
          </div>
          <button className="btn btn-primary btn-sm">Book Now</button>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;

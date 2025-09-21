-- Performance indexes
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_availability_date ON availability(date);
CREATE INDEX idx_availability_slot ON availability(time_slot);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_active ON services(active);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_featured ON reviews(is_featured);
CREATE INDEX idx_inquiries_status ON inquiries(status);

-- Composite indexes for common queries
CREATE INDEX idx_availability_lookup ON availability(date, time_slot, is_available);
CREATE INDEX idx_bookings_date_status ON bookings(booking_date, status);
CREATE INDEX idx_services_active_popular ON services(active, popular, display_order);

-- Full text search for Croatian content
CREATE INDEX idx_services_search ON services USING gin(
    to_tsvector('simple', name || ' ' || COALESCE(description, ''))
);

CREATE INDEX idx_customers_search ON customers USING gin(
    to_tsvector('simple', first_name || ' ' || last_name || ' ' || COALESCE(email, '') || ' ' || COALESCE(city, ''))
);
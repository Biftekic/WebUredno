-- Enable RLS on all tables
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

-- Services policies (public read for active services)
CREATE POLICY "Active services are viewable by everyone"
    ON services FOR SELECT
    USING (active = true);

CREATE POLICY "All services viewable by authenticated users"
    ON services FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Services manageable by service role"
    ON services FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Customers policies
CREATE POLICY "Customers can view own profile"
    ON customers FOR SELECT
    USING (auth.uid()::text = id::text OR auth.jwt()->>'email' = email);

CREATE POLICY "Anyone can create customer profile"
    ON customers FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Customers can update own profile"
    ON customers FOR UPDATE
    USING (auth.uid()::text = id::text OR auth.jwt()->>'email' = email);

-- Bookings policies
CREATE POLICY "Anyone can create bookings"
    ON bookings FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Customers can view own bookings"
    ON bookings FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM customers c
            WHERE c.id = bookings.customer_id
            AND (auth.uid()::text = c.id::text OR auth.jwt()->>'email' = c.email)
        )
    );

CREATE POLICY "Customers can update own pending bookings"
    ON bookings FOR UPDATE
    USING (
        status = 'pending' AND
        EXISTS (
            SELECT 1 FROM customers c
            WHERE c.id = bookings.customer_id
            AND (auth.uid()::text = c.id::text OR auth.jwt()->>'email' = c.email)
        )
    );

-- Availability policies (public read)
CREATE POLICY "Availability is viewable by everyone"
    ON availability FOR SELECT
    USING (true);

CREATE POLICY "Availability manageable by service role"
    ON availability FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Pricing rules policies (public read for active rules)
CREATE POLICY "Active pricing rules viewable by everyone"
    ON pricing_rules FOR SELECT
    USING (active = true);

CREATE POLICY "Pricing rules manageable by service role"
    ON pricing_rules FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- Reviews policies
CREATE POLICY "Published reviews viewable by everyone"
    ON reviews FOR SELECT
    USING (true);

CREATE POLICY "Customers can create reviews for own bookings"
    ON reviews FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM bookings b
            JOIN customers c ON c.id = b.customer_id
            WHERE b.id = reviews.booking_id
            AND b.status = 'completed'
            AND (auth.uid()::text = c.id::text OR auth.jwt()->>'email' = c.email)
        )
    );

CREATE POLICY "Customers can update own reviews"
    ON reviews FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM customers c
            WHERE c.id = reviews.customer_id
            AND (auth.uid()::text = c.id::text OR auth.jwt()->>'email' = c.email)
        )
    );

-- Inquiries policies
CREATE POLICY "Anyone can create inquiries"
    ON inquiries FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Inquirers can view own inquiries"
    ON inquiries FOR SELECT
    USING (auth.jwt()->>'email' = email);

CREATE POLICY "Inquiries manageable by service role"
    ON inquiries FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');
-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_availability_updated_at BEFORE UPDATE ON availability
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON pricing_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Generate booking number function
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TEXT AS $$
DECLARE
    booking_num TEXT;
    counter INTEGER;
BEGIN
    -- Format: WU + YYMMDD + 4-digit counter
    SELECT COUNT(*) + 1 INTO counter
    FROM bookings
    WHERE DATE(created_at) = CURRENT_DATE;

    booking_num := 'WU' || TO_CHAR(NOW(), 'YYMMDD') ||
                   LPAD(counter::TEXT, 4, '0');
    RETURN booking_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate booking number
CREATE OR REPLACE FUNCTION set_booking_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_number IS NULL THEN
        NEW.booking_number := generate_booking_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_booking_number_trigger
    BEFORE INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_booking_number();

-- Check availability function
CREATE OR REPLACE FUNCTION check_availability(
    p_date DATE,
    p_time_slot VARCHAR
) RETURNS TABLE(
    team_number INTEGER,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.team_number, a.is_available
    FROM availability a
    WHERE a.date = p_date
    AND a.time_slot = p_time_slot
    ORDER BY a.team_number;
END;
$$ LANGUAGE plpgsql;

-- Get available time slots for a specific date
CREATE OR REPLACE FUNCTION get_available_slots(
    p_date DATE
) RETURNS TABLE(
    time_slot VARCHAR,
    available_teams INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.time_slot,
        COUNT(*)::INTEGER as available_teams
    FROM availability a
    WHERE a.date = p_date
    AND a.is_available = true
    GROUP BY a.time_slot
    ORDER BY a.time_slot;
END;
$$ LANGUAGE plpgsql;

-- Calculate price based on service and property details
CREATE OR REPLACE FUNCTION calculate_price(
    p_service_id UUID,
    p_property_size INTEGER,
    p_extras JSONB
) RETURNS TABLE(
    base_price DECIMAL,
    extras_cost DECIMAL,
    total_price DECIMAL
) AS $$
DECLARE
    v_base_price DECIMAL;
    v_price_per_sqm DECIMAL;
    v_min_price DECIMAL;
    v_extras_cost DECIMAL := 0;
    v_total DECIMAL;
BEGIN
    -- Get service pricing details
    SELECT
        s.base_price,
        s.price_per_sqm,
        s.min_price
    INTO v_base_price, v_price_per_sqm, v_min_price
    FROM services s
    WHERE s.id = p_service_id;

    -- Calculate base price based on property size if applicable
    IF v_price_per_sqm IS NOT NULL AND p_property_size IS NOT NULL THEN
        v_base_price := v_base_price + (v_price_per_sqm * p_property_size);
    END IF;

    -- Ensure minimum price
    IF v_min_price IS NOT NULL AND v_base_price < v_min_price THEN
        v_base_price := v_min_price;
    END IF;

    -- Calculate extras cost
    IF p_extras IS NOT NULL THEN
        SELECT COALESCE(SUM((value->>'price')::DECIMAL), 0)
        INTO v_extras_cost
        FROM jsonb_array_elements(p_extras) AS value;
    END IF;

    v_total := v_base_price + v_extras_cost;

    RETURN QUERY
    SELECT v_base_price, v_extras_cost, v_total;
END;
$$ LANGUAGE plpgsql;

-- Update availability when booking is confirmed
CREATE OR REPLACE FUNCTION update_availability_on_booking()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE availability
        SET is_available = false,
            booking_id = NEW.id
        WHERE date = NEW.booking_date
        AND time_slot = NEW.time_slot
        AND team_number = NEW.team_number;

        NEW.confirmed_at = NOW();
    END IF;

    -- Free up availability if booking is cancelled
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        UPDATE availability
        SET is_available = true,
            booking_id = NULL
        WHERE booking_id = NEW.id;

        NEW.cancelled_at = NOW();
    END IF;

    -- Mark as completed
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_availability_trigger
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_availability_on_booking();

-- Function to get next available slot
CREATE OR REPLACE FUNCTION get_next_available_slot(
    p_service_id UUID DEFAULT NULL
) RETURNS TABLE(
    date DATE,
    time_slot VARCHAR,
    team_number INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.date,
        a.time_slot,
        a.team_number
    FROM availability a
    WHERE a.is_available = true
    AND a.date >= CURRENT_DATE
    ORDER BY a.date, a.time_slot, a.team_number
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;
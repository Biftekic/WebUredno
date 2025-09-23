-- Insert Croatian services with proper pricing
INSERT INTO services (
    name,
    slug,
    category,
    base_price,
    price_per_sqm,
    min_price,
    duration_hours,
    description,
    features,
    popular,
    display_order
) VALUES
    -- Regular cleaning services
    (
        'Osnovno čišćenje',
        'osnovno-ciscenje',
        'regular',
        35.00,
        0.50,
        35.00,
        2,
        'Redovito održavanje čistoće vašeg doma ili poslovnog prostora. Uključuje usisavanje, brisanje prašine, čišćenje sanitarija i kuhinje.',
        '["Usisavanje svih prostorija", "Brisanje prašine", "Čišćenje sanitarija", "Čišćenje kuhinje", "Iznošenje smeća", "Mijenjanje posteljine (po želji)"]'::jsonb,
        true,
        1
    ),
    (
        'Dubinsko čišćenje',
        'dubinsko-ciscenje',
        'deep',
        50.00,
        0.75,
        50.00,
        3,
        'Temeljito čišćenje svih površina i teško dostupnih mjesta. Idealno za sezonsko čišćenje ili pripremu za posebne prilike.',
        '["Sve usluge osnovnog čišćenja", "Čišćenje iza i ispod namještaja", "Dubinsko čišćenje kuhinjskih uređaja", "Pranje prozora iznutra", "Čišćenje vrata i dovratnika", "Dezinfekcija površina"]'::jsonb,
        true,
        2
    ),

    -- Specialized cleaning services
    (
        'Čišćenje nakon građevinskih radova',
        'ciscenje-gradjevinski',
        'construction',
        80.00,
        1.00,
        80.00,
        4,
        'Specijalizirano čišćenje nakon renovacije ili građevinskih radova. Uklanjanje građevinske prašine i ostataka.',
        '["Uklanjanje građevinske prašine", "Čišćenje boje i ljepila", "Dubinsko usisavanje", "Čišćenje svih površina", "Pranje prozora", "Dezinfekcija prostora"]'::jsonb,
        false,
        3
    ),
    (
        'Selidba - čišćenje',
        'selidba-ciscenje',
        'moving',
        60.00,
        0.60,
        60.00,
        3,
        'Kompletno čišćenje prostora prije useljenja ili nakon iseljenja. Osigurajte besprijekoran prostor.',
        '["Čišćenje praznog prostora", "Dezinfekcija svih površina", "Čišćenje ormara iznutra", "Dubinsko čišćenje kuhinje", "Čišćenje sanitarija", "Pranje prozora"]'::jsonb,
        false,
        4
    ),

    -- Additional services
    (
        'Pranje prozora',
        'pranje-prozora',
        'windows',
        25.00,
        NULL,
        25.00,
        2,
        'Profesionalno pranje prozora, stakala i staklenih površina. Kristalno čisti prozori bez mrlja.',
        '["Pranje stakla s obje strane", "Čišćenje okvira", "Čišćenje prozorskih dasaka", "Uklanjanje tvrdokornih mrlja", "Poliranje stakla"]'::jsonb,
        false,
        5
    ),
    (
        'Čišćenje ureda',
        'ciscenje-ureda',
        'office',
        45.00,
        0.40,
        45.00,
        2,
        'Održavanje poslovnih prostora. Redovito ili jednokratno čišćenje ureda.',
        '["Čišćenje radnih površina", "Usisavanje i brisanje podova", "Čišćenje sanitarija", "Pražnjenje koševa", "Čišćenje kuhinje/čajne kuhinje", "Brisanje prašine s opreme"]'::jsonb,
        false,
        6
    ),
    (
        'Generalno čišćenje',
        'generalno-ciscenje',
        'general',
        70.00,
        0.80,
        70.00,
        4,
        'Sveobuhvatno čišćenje koje kombinira elemente osnovnog i dubinskog čišćenja.',
        '["Sve usluge dubinskog čišćenja", "Čišćenje tepiha", "Poliranje namještaja", "Čišćenje lustera", "Organizacija prostora"]'::jsonb,
        false,
        7
    ),
    (
        'Dezinfekcija prostora',
        'dezinfekcija',
        'disinfection',
        40.00,
        0.30,
        40.00,
        1,
        'Profesionalna dezinfekcija prostora certificiranim sredstvima. Sigurnost za vas i vašu obitelj.',
        '["Dezinfekcija svih površina", "Tretiranje kvaka i prekidača", "Dezinfekcija sanitarija", "Tretman prostorija", "Izdavanje potvrde"]'::jsonb,
        false,
        8
    );

-- Insert pricing rules for distance-based fees
INSERT INTO pricing_rules (
    rule_type,
    service_id,
    conditions,
    adjustment_type,
    adjustment_value,
    priority,
    active
) VALUES
    -- Distance fee for locations > 10km from Zagreb center
    (
        'distance',
        NULL, -- applies to all services
        '{"distance_km": {"min": 10, "max": 20}}'::jsonb,
        'fixed',
        5.00,
        1,
        true
    ),
    (
        'distance',
        NULL,
        '{"distance_km": {"min": 20, "max": 30}}'::jsonb,
        'fixed',
        10.00,
        2,
        true
    ),
    (
        'distance',
        NULL,
        '{"distance_km": {"min": 30}}'::jsonb,
        'fixed',
        15.00,
        3,
        true
    ),

    -- Frequency discounts
    (
        'frequency',
        NULL,
        '{"frequency": "weekly"}'::jsonb,
        'percentage',
        -15.00, -- 15% discount
        4,
        true
    ),
    (
        'frequency',
        NULL,
        '{"frequency": "biweekly"}'::jsonb,
        'percentage',
        -10.00, -- 10% discount
        5,
        true
    ),
    (
        'frequency',
        NULL,
        '{"frequency": "monthly"}'::jsonb,
        'percentage',
        -5.00, -- 5% discount
        6,
        true
    );

-- Generate availability slots for the next 60 days
DO $$
DECLARE
    v_date DATE;
    v_slot TEXT;
    v_team INTEGER;
    v_time_slots TEXT[] := ARRAY['07:00-09:00', '09:00-11:00', '11:00-13:00', '13:00-15:00', '15:00-17:00', '17:00-19:00'];
BEGIN
    -- Loop through next 60 days
    FOR v_date IN SELECT generate_series(
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '60 days',
        '1 day'::interval
    )::date
    LOOP
        -- Skip Sundays (0) and public holidays would go here
        IF EXTRACT(DOW FROM v_date) != 0 THEN
            -- For each time slot
            FOREACH v_slot IN ARRAY v_time_slots
            LOOP
                -- For each team (1-3)
                FOR v_team IN 1..3
                LOOP
                    INSERT INTO availability (
                        date,
                        time_slot,
                        team_number,
                        is_available
                    ) VALUES (
                        v_date,
                        v_slot,
                        v_team,
                        true
                    ) ON CONFLICT (date, time_slot, team_number) DO NOTHING;
                END LOOP;
            END LOOP;
        END IF;
    END LOOP;
END $$;

-- Insert sample reviews (optional - for demonstration)
INSERT INTO reviews (
    booking_id,
    customer_id,
    rating,
    comment,
    is_featured
) VALUES
    (
        uuid_generate_v4(),
        uuid_generate_v4(),
        5,
        'Izvrsna usluga! Tim je bio profesionalan, točan i temeljit. Stan je blistao nakon njihovog posjeta. Toplo preporučujem!',
        true
    ),
    (
        uuid_generate_v4(),
        uuid_generate_v4(),
        5,
        'Već godinama koristim usluge Uredno.eu. Uvijek su pouzdani i kvalitetni. Njihovo dubinsko čišćenje je fantastično!',
        true
    ),
    (
        uuid_generate_v4(),
        uuid_generate_v4(),
        4,
        'Vrlo dobra usluga čišćenja ureda. Tim je efikasan i diskretan. Jedina zamjerka je što su malo kasnili, ali su se ispričali.',
        false
    ),
    (
        uuid_generate_v4(),
        uuid_generate_v4(),
        5,
        'Nakon renovacije stana, Uredno.eu tim je napravio čudo! Sve je bilo prekriveno građevinskom prašinom, a oni su sve očistili do savršenstva.',
        true
    );
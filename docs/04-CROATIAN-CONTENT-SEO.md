# Croatian Content & SEO Strategy

## Croatian Content Translation

### Homepage Content

#### Hero Section
```
Title: "Mi čistimo, vi se opustite"
Subtitle: "Profesionalne usluge čišćenja u Zagrebu i Zagrebačkoj županiji"
CTA: "Rezerviraj čišćenje"
Secondary CTA: "Pogledaj cijene"
```

#### Trust Indicators
```
"Preko 1000+ zadovoljnih klijenata"
"Provjereni i osigurani djelatnici"
"Garancija zadovoljstva"
"Dostupno 7 dana u tjednu"
```

### Service Names & Descriptions

#### Residential Services (Stambeno čišćenje)

**1. Standardno redovito čišćenje**
- Opis: "Održavajte svoj dom besprijekorno čistim s našom redovitom uslugom"
- Cijena: "od 30€ po posjetu"
- Trajanje: "2-3 sata"

**2. Dubinsko čišćenje**
- Opis: "Temeljito čišćenje svakog kutka vašeg doma"
- Cijena: "od 80€"
- Trajanje: "4-5 sati"

**3. Dubinsko s rastavljanjem i poliranjem**
- Opis: "Premium čišćenje s detaljnim poliranjem i rastavljanjem elemenata"
- Cijena: "od 120€"
- Trajanje: "5-6 sati"

**4. Čišćenje za useljenje/iseljenje**
- Opis: "Pripremite prostor za nove stanare ili predaju"
- Cijena: "od 100€"
- Trajanje: "4-5 sati"

**5. Airbnb čišćenje**
- Opis: "Brza priprema između gostiju s mijenjanjem posteljine"
- Cijena: "od 40€"
- Trajanje: "1-2 sata"

#### Commercial Services (Poslovno čišćenje)
```
"Uredi" - Offices
"Trgovine" - Retail
"Medicinske ustanove" - Medical facilities
"Obrazovne ustanove" - Educational institutions
"Ugostiteljski objekti" - Hospitality venues
```

### Call-to-Actions (CTAs)
```
"Rezerviraj odmah" - Book now
"Dobij ponudu" - Get quote
"Nazovi nas" - Call us
"Pošalji upit" - Send inquiry
"Provjeri dostupnost" - Check availability
"Saznaj više" - Learn more
```

### Value Propositions
```
"Zašto WebUredno?"
✓ Provjereni i osigurani djelatnici
✓ Ekološki prihvatljiva sredstva za čišćenje
✓ Fleksibilno terminiranje
✓ Transparentne cijene bez skrivenih troškova
✓ Garancija zadovoljstva ili povrat novca
✓ Dostupnost 7 dana u tjednu
```

## SEO Strategy

### Target Keywords

#### Primary Keywords
- "čišćenje Zagreb"
- "usluge čišćenja Zagreb"
- "profesionalno čišćenje"
- "čišćenje stanova Zagreb"
- "čišćenje kuća Zagrebačka županija"

#### Long-tail Keywords
- "dubinsko čišćenje stana Zagreb"
- "čišćenje nakon selidbe Zagreb"
- "redovito čišćenje ureda Zagreb"
- "airbnb čišćenje Zagreb"
- "ekološko čišćenje Zagreb"
- "hitno čišćenje Zagreb vikend"

#### Local SEO Keywords
- "čišćenje [neighborhood]" for each Zagreb district:
  - Čišćenje Trešnjevka
  - Čišćenje Maksimir
  - Čišćenje Novi Zagreb
  - Čišćenje Dubrava
  - Čišćenje Medvednica
  - Čišćenje Črnomerec

### Meta Tags Structure

#### Homepage
```html
<title>Profesionalne Usluge Čišćenja Zagreb | WebUredno</title>
<meta name="description" content="Vrhunske usluge čišćenja u Zagrebu i Zagrebačkoj županiji. Provjereni djelatnici, ekološka sredstva, fleksibilno terminiranje. Rezervirajte odmah!">
```

#### Service Pages
```html
<title>[Service Name] Zagreb | WebUredno Čišćenje</title>
<meta name="description" content="[Service description] u Zagrebu. Transparentne cijene od [price]€. Rezervirajte online ili nazovite.">
```

### Structured Data (JSON-LD)

#### LocalBusiness Schema
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "WebUredno",
  "description": "Profesionalne usluge čišćenja",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Zagreb",
    "addressRegion": "Zagrebačka županija",
    "addressCountry": "HR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 45.8150,
    "longitude": 15.9819
  },
  "areaServed": [
    "Zagreb",
    "Zagrebačka županija"
  ],
  "priceRange": "€€"
}
```

### URL Structure
```
/ - Homepage
/usluge/ - Services
  /usluge/standardno-ciscenje/
  /usluge/dubinsko-ciscenje/
  /usluge/airbnb-ciscenje/
  /usluge/poslovno-ciscenje/
/cjenik/ - Pricing
/rezervacija/ - Booking
/o-nama/ - About
/kontakt/ - Contact
/blog/ - SEO Blog
```

### Content Strategy

#### Blog Topics
1. "Kako održavati čist dom između profesionalnih čišćenja"
2. "Vodič za pripremu stana za Airbnb goste"
3. "Ekološka sredstva za čišćenje - zašto su važna"
4. "Koliko često trebate dubinsko čišćenje?"
5. "Savjeti za čišćenje nakon renovacije"

#### Landing Pages
- /ciscenje-zagreb/ - Main city page
- /ciscenje-novi-zagreb/ - District pages
- /dubinsko-ciscenje-zagreb/ - Service + location
- /hitno-ciscenje-vikend/ - Urgency keywords

### Technical SEO
- XML sitemap generation
- Robots.txt optimization
- Canonical URLs
- Hreflang tags (hr-HR, en)
- Mobile-first indexing ready
- Core Web Vitals optimization
- Image alt text in Croatian
- Internal linking strategy
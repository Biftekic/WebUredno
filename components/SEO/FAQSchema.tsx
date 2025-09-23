import Script from 'next/script';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSchemaProps {
  faqs: FAQItem[];
}

export default function FAQSchema({ faqs }: FAQSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Default FAQs for WebUredno
export const defaultFAQs: FAQItem[] = [
  {
    question: 'Koje usluge čišćenja nudite u Zagrebu?',
    answer: 'Nudimo dubinsko čišćenje, redovito održavanje, čišćenje ureda, čišćenje nakon gradnje, čišćenje prozora i dodatne specijalizirane usluge prilagođene vašim potrebama.'
  },
  {
    question: 'Koliko košta čišćenje stana u Zagrebu?',
    answer: 'Cijene ovise o veličini prostora i vrsti usluge. Redovito čišćenje kreće od 15€/sat, dok dubinsko čišćenje kreće od 20€/sat. Nudimo besplatnu procjenu za veće projekte.'
  },
  {
    question: 'Koje proizvode koristite za čišćenje?',
    answer: 'Koristimo ekološki prihvatljive i certificirane proizvode za čišćenje koji su sigurni za vašu obitelj, kućne ljubimce i okoliš.'
  },
  {
    question: 'Koliko unaprijed trebam rezervirati termin?',
    answer: 'Preporučujemo rezervaciju 24-48 sati unaprijed. Za hitne slučajeve, pokušat ćemo organizirati termin isti dan uz dodatnu naknadu.'
  },
  {
    question: 'Pokrivate li cijeli Zagreb?',
    answer: 'Da, pokrivamo sve gradske četvrti Zagreba uključujući Črnomerec, Maksimir, Novi Zagreb, Trešnjevku, Dubravu, Stenjevec, Peščenicu i okolna mjesta do 20km.'
  },
  {
    question: 'Trebam li osigurati sredstva za čišćenje?',
    answer: 'Ne, naš tim dolazi s profesionalnom opremom i svim potrebnim sredstvima za čišćenje. Ako imate posebne zahtjeve ili preferirate određene proizvode, možete ih osigurati.'
  },
  {
    question: 'Mogu li otkazati ili promijeniti termin?',
    answer: 'Da, termin možete otkazati ili promijeniti do 24 sata prije dogovorenog vremena bez naknade. Za otkazivanja u kraćem roku može se naplatiti naknada.'
  },
  {
    question: 'Jeste li osigurani?',
    answer: 'Da, WebUredno je u potpunosti osiguran za sve vrste štete koja bi se mogla dogoditi tijekom pružanja usluga.'
  }
];
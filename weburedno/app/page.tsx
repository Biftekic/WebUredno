export default function HomePage() {
  return (
    <main className="flex-1">
      <section className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">
          Dobrodošli u WebUredno
        </h1>
        <p className="text-lg text-center text-gray-600 mb-12">
          Profesionalne usluge čišćenja za vaš dom ili ured
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Pouzdano</h2>
            <p className="text-gray-600">
              Naš tim stručnjaka osigurava vrhunsku kvalitetu usluge
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Efikasno</h2>
            <p className="text-gray-600">
              Brzo i temeljito čišćenje prilagođeno vašem rasporedu
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Pristupačno</h2>
            <p className="text-gray-600">
              Konkurentne cijene bez kompromisa na kvaliteti
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
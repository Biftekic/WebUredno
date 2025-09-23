import { notFound } from 'next/navigation';
import ServiceDetail from '@/components/services/ServiceDetail';
import { supabase } from '@/lib/supabase';
import { mockServices } from '@/lib/mock-services';

interface ServicePageProps {
  params: {
    slug: string;
  };
}

// Generate metadata
export async function generateMetadata({ params }: ServicePageProps) {
  // Use mock data if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    const service = mockServices.find(s => s.slug === params.slug);

    if (!service) {
      return {
        title: 'Usluga nije pronađena | Uredno.eu',
      };
    }

    return {
      title: `${service.name} | Uredno.eu`,
      description: service.description,
    };
  }

  const { data: service } = await supabase
    .from('services')
    .select('name, description')
    .eq('slug', params.slug)
    .eq('active', true)
    .single();

  if (!service) {
    return {
      title: 'Usluga nije pronađena | Uredno.eu',
    };
  }

  return {
    title: `${service.name} | Uredno.eu`,
    description: service.description,
  };
}

// Generate static params for all services
export async function generateStaticParams() {
  // Use mock data if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    return mockServices.map((service) => ({
      slug: service.slug,
    }));
  }

  const { data: services } = await supabase
    .from('services')
    .select('slug')
    .eq('active', true);

  return (services || []).map((service) => ({
    slug: service.slug,
  }));
}

export default async function ServicePage({ params }: ServicePageProps) {
  // Use mock data if Supabase is not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'https://placeholder.supabase.co') {
    const service = mockServices.find(s => s.slug === params.slug);

    if (!service) {
      notFound();
    }

    return <ServiceDetail service={service} />;
  }

  const { data: service } = await supabase
    .from('services')
    .select('*')
    .eq('slug', params.slug)
    .eq('active', true)
    .single();

  if (!service) {
    notFound();
  }

  // Parse features from JSON if needed
  const serviceWithFeatures = {
    ...service,
    features: service.features || [],
  };

  return <ServiceDetail service={serviceWithFeatures} />;
}
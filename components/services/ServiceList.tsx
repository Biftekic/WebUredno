'use client';

import { motion } from 'framer-motion';
import ServiceListItem from './ServiceListItem';
import type { Service } from './ServiceCatalog';

interface ServiceListProps {
  services: Service[];
  view?: 'grid' | 'list';
}

export default function ServiceList({ services, view = 'list' }: ServiceListProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 100
      }
    }
  };

  if (view === 'list') {
    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-3 md:space-y-4"
      >
        {services.map((service) => (
          <motion.div key={service.id} variants={item}>
            <ServiceListItem service={service} />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  // Grid view (default to ServiceGrid component behavior)
  return null;
}
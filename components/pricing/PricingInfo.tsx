'use client';

import { LucideIcon, Shield, Clock, Award, CreditCard, MapPin, Phone, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export interface PricingFeature {
  icon: LucideIcon;
  title: string;
  description: string;
  highlight?: boolean;
}

export interface PricingTier {
  name: string;
  description: string;
  minPrice: number;
  maxPrice?: number;
  features: string[];
  popular?: boolean;
}

export interface PricingInfoProps {
  title?: string;
  subtitle?: string;
  features?: PricingFeature[];
  tiers?: PricingTier[];
  paymentMethods?: string[];
  serviceAreas?: string[];
  guarantees?: string[];
  notes?: string[];
  variant?: 'default' | 'detailed' | 'compact';
  showFeatures?: boolean;
  showTiers?: boolean;
  showPayment?: boolean;
  showServiceAreas?: boolean;
  showGuarantees?: boolean;
  showNotes?: boolean;
  className?: string;
}

const defaultFeatures: PricingFeature[] = [
  {
    icon: Shield,
    title: 'Osigurani radnici',
    description: 'Svi naši radnici su osigurani i edukovani',
    highlight: true,
  },
  {
    icon: Clock,
    title: 'Fleksibilno vreme',
    description: 'Prilagođavamo se vašem rasporedu',
  },
  {
    icon: Award,
    title: 'Garancija kvaliteta',
    description: '100% garancija zadovoljstva ili ponavljanje usluge',
    highlight: true,
  },
  {
    icon: CreditCard,
    title: 'Više načina plaćanja',
    description: 'Gotovina, kartica ili bankovni transfer',
  },
];

const defaultPaymentMethods = [
  'Gotovina po završetku',
  'Platne kartice (Visa, Mastercard)',
  'Bankovni transfer',
  'PayPal'
];

const defaultGuarantees = [
  'Garancija zadovoljstva do 24h',
  'Osiguranje od štete do 500.000€',
  'Ponavljanje usluge ako niste zadovoljni',
  'Bez skrivenih troškova'
];

export default function PricingInfo({
  title = 'Naše cene i uslovi',
  subtitle = 'Transparentne cene bez skrivenih troškova',
  features = defaultFeatures,
  tiers,
  paymentMethods = defaultPaymentMethods,
  serviceAreas,
  guarantees = defaultGuarantees,
  notes,
  variant = 'default',
  showFeatures = true,
  showTiers = false,
  showPayment = true,
  showServiceAreas = false,
  showGuarantees = true,
  showNotes = false,
  className = '',
}: PricingInfoProps) {
  const isCompact = variant === 'compact';
  const isDetailed = variant === 'detailed';

  const containerClass = `
    space-y-${isCompact ? '4' : '6'}
    ${className}
  `;

  return (
    <div className={containerClass}>
      {/* Header */}
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && (
            <h2 className={`font-bold text-gray-900 mb-2 ${isCompact ? 'text-xl' : 'text-2xl'}`}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p className={`text-gray-600 ${isCompact ? 'text-sm' : 'text-base'}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Features Grid */}
      {showFeatures && features.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`grid gap-${isCompact ? '3' : '4'} ${isCompact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card
                    variant={feature.highlight ? 'gradient' : 'bordered'}
                    padding={isCompact ? 'sm' : 'md'}
                    hoverable
                    className="h-full"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`
                        flex-shrink-0 w-${isCompact ? '8' : '10'} h-${isCompact ? '8' : '10'}
                        rounded-lg bg-green-100 flex items-center justify-center
                      `}>
                        <Icon className={`w-${isCompact ? '4' : '5'} h-${isCompact ? '4' : '5'} text-green-600`} />
                      </div>
                      <div>
                        <h3 className={`font-semibold text-gray-900 mb-1 ${isCompact ? 'text-sm' : 'text-base'}`}>
                          {feature.title}
                        </h3>
                        <p className={`text-gray-600 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Pricing Tiers */}
      {showTiers && tiers && tiers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cenovni rangovi</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tiers.map((tier, index) => (
              <Card key={index} variant="bordered" padding="md" className="relative">
                {tier.popular && (
                  <div className="absolute -top-2 right-4">
                    <Badge variant="success" size="sm">Najpopularnije</Badge>
                  </div>
                )}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">{tier.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-green-600">{tier.minPrice}€</span>
                    {tier.maxPrice && (
                      <>
                        <span className="text-gray-500">-</span>
                        <span className="text-2xl font-bold text-green-600">{tier.maxPrice}€</span>
                      </>
                    )}
                  </div>
                </div>
                <ul className="space-y-2">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Payment Methods and Guarantees Grid */}
      {(showPayment || showGuarantees) && (
        <div className={`grid gap-${isCompact ? '4' : '6'} ${isDetailed ? 'md:grid-cols-2' : ''}`}>
          {/* Payment Methods */}
          {showPayment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card variant="bordered" padding={isCompact ? 'sm' : 'md'}>
                <div className="flex items-center gap-3 mb-4">
                  <CreditCard className="w-6 h-6 text-green-600" />
                  <h3 className={`font-semibold text-gray-900 ${isCompact ? 'text-base' : 'text-lg'}`}>
                    Načini plaćanja
                  </h3>
                </div>
                <ul className="space-y-2">
                  {paymentMethods.map((method, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className={`text-gray-700 ${isCompact ? 'text-sm' : 'text-base'}`}>
                        {method}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}

          {/* Guarantees */}
          {showGuarantees && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card variant="bordered" padding={isCompact ? 'sm' : 'md'}>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-green-600" />
                  <h3 className={`font-semibold text-gray-900 ${isCompact ? 'text-base' : 'text-lg'}`}>
                    Garancije i osiguranje
                  </h3>
                </div>
                <ul className="space-y-2">
                  {guarantees.map((guarantee, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className={`text-gray-700 ${isCompact ? 'text-sm' : 'text-base'}`}>
                        {guarantee}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          )}
        </div>
      )}

      {/* Service Areas */}
      {showServiceAreas && serviceAreas && serviceAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card variant="bordered" padding={isCompact ? 'sm' : 'md'}>
            <div className="flex items-center gap-3 mb-4">
              <MapPin className="w-6 h-6 text-green-600" />
              <h3 className={`font-semibold text-gray-900 ${isCompact ? 'text-base' : 'text-lg'}`}>
                Područja usluge
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {serviceAreas.map((area, index) => (
                <Badge key={index} variant="secondary" size={isCompact ? 'sm' : 'md'}>
                  {area}
                </Badge>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Notes */}
      {showNotes && notes && notes.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card variant="default" padding={isCompact ? 'sm' : 'md'} className="bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className={`font-semibold text-yellow-800 mb-2 ${isCompact ? 'text-sm' : 'text-base'}`}>
                  Važne napomene
                </h3>
                <ul className="space-y-1">
                  {notes.map((note, index) => (
                    <li key={index} className={`text-yellow-700 ${isCompact ? 'text-xs' : 'text-sm'}`}>
                      • {note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Contact CTA */}
      {isDetailed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card variant="gradient" padding="md" className="text-center">
            <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Potrebna personalizovana ponuda?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Kontaktirajte nas za detaljnu kalkulaciju prilagođenu vašim potrebama
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="tel:+38763123456"
                className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Phone className="w-4 h-4 mr-2" />
                Pozovite odmah
              </a>
              <a
                href="/kontakt"
                className="inline-flex items-center justify-center px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
              >
                Pošaljite poruku
              </a>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
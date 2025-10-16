'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

export function CTASection() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={staggerContainer}
      className="py-16 bg-gradient-to-br from-secondary-500 via-secondary-600 to-secondary-700 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full filter blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.h2
          variants={staggerItem}
          className="text-4xl md:text-5xl font-display font-bold mb-6 text-white"
        >
          Rejoignez le HBC Aix-en-Savoie
        </motion.h2>
        <motion.p
          variants={staggerItem}
          className="text-xl mb-8 max-w-2xl mx-auto text-white/90"
        >
          Découvrez nos équipes, nos valeurs et notre passion pour le handball
        </motion.p>
        <motion.div
          variants={staggerItem}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link
            href="/equipes"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-secondary-600 rounded-lg font-bold font-mont hover:bg-neutral-100 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 duration-300"
          >
            Nos Équipes
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 border-2 border-white text-white rounded-lg font-bold font-mont hover:bg-white/10 transition-all shadow-lg duration-300"
          >
            Nous Contacter
          </Link>
        </motion.div>
      </div>
    </motion.section>
  )
}

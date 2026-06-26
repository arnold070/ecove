import type { Metadata } from 'next'
import AboutClient from './AboutClient'

export const metadata: Metadata = {
  title: "About Ecove — Redefining Nigeria's Marketplace",
  description:
    "Learn about Ecove's story, mission and values. We're Nigeria's fastest-growing multi-vendor marketplace connecting verified vendors with millions of consumers nationwide.",
}

export default function AboutPage() {
  return <AboutClient />
}

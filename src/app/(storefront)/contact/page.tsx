import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact Us — Ecove Marketplace',
  description:
    "Get in touch with the Ecove team. We're here to help with your orders, returns, vendor inquiries, and anything else. Reach us via email, phone, or WhatsApp.",
}

export default function ContactPage() {
  return <ContactClient />
}

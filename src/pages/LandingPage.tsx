import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import WhoUses from '../components/landing/WhoUses'
import Features from '../components/landing/Features'
import Pricing from '../components/landing/Pricing'
import FAQ from '../components/landing/FAQ'
import Footer from '../components/landing/Footer'
import Contact from '../components/landing/Contact'
import IndustryDetailsModal from '../components/landing/IndustryDetailsModal'
import { useState } from 'react'

export default function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleSelectCategory = (cat: any) => {
    setSelectedCategory(cat)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white overflow-x-hidden">
      <Navbar />

      <main className="space-y-0 py-2">
        <Hero />
        <WhoUses onSelectCategory={handleSelectCategory} />
        <Features />
        <Pricing />
        <FAQ />
        <Contact />
      </main>

      <Footer />

      {/* Global Industry Details Modal */}
      <IndustryDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategory}
      />
    </div>
  )
}
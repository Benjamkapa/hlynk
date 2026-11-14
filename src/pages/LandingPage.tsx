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
    <div className="relative min-h-screen bg-[#0E1315] text-slate-100 selection:bg-emerald-500 selection:text-white overflow-x-clip">
      {/* ── Fixed Atmospheric Background (Parallax feel: static as user scrolls) ── */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center bg-no-repeat opacity-[0.22] filter saturate-[1.1] contrast-[1.05]"
        style={{ 
          backgroundImage: "url('/img1.png')",
          backgroundAttachment: 'fixed'
        }}
      />

      {/* Layered deep ambient tints for depth and readable glassmorphism */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-gradient-to-b from-[#0E1315]/80 via-[#0E1315]/75 to-[#0E1315]/90" />
      <div className="fixed -top-40 right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-1/2 left-[-15%] w-[500px] h-[500px] rounded-full bg-teal-500/8 blur-[160px] pointer-events-none z-0" />

      {/* Content Layer */}
      <div className="relative z-10">
        <Navbar />

        <main className="space-y-0 py-0.5">
          <Hero />
          <WhoUses onSelectCategory={handleSelectCategory} />
          {/* <Features /> */}
          <Pricing />
          <FAQ />
          <Contact />
        </main>

        <Footer />
      </div>

      {/* Global Industry Details Modal */}
      <IndustryDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategory}
      />
    </div>
  ) 
}
import Navbar from '../components/landing/Navbar'
import Hero from '../components/landing/Hero'
import About from '../components/landing/About'
import WhoUses from '../components/landing/WhoUses'
import Features from '../components/landing/Features'
import HowItWorks from '../components/landing/HowItWorks'
import Pricing from '../components/landing/Pricing'
import FAQ from '../components/landing/FAQ'
import Contact from '../components/landing/Contact'
import GetTheApp from '../components/landing/GetTheApp'
import Footer from '../components/landing/Footer'
import IndustryDetailsModal from '../components/landing/IndustryDetailsModal'
import { FadeUp, ScaleIn, SlideIn } from '../components/landing/Animations'
import { useState } from 'react'

export default function LandingPage() {
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const handleSelectCategory = (cat: any) => {
    setSelectedCategory(cat)
    setModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-transparent selection:bg-emerald-100 selection:text-emerald-900 overflow-x-hidden">
      <Navbar />

      <main>
        <Hero />

        <div className="relative z-10 -mt-10 md:-mt-20">
          <WhoUses onSelectCategory={handleSelectCategory} />
        </div>

        <ScaleIn>
          <About />
        </ScaleIn>

        <FadeUp>
          <Features />
        </FadeUp>

        <SlideIn direction="right">
          <HowItWorks />
        </SlideIn>

        <ScaleIn>
          <Pricing />
        </ScaleIn>

        <FadeUp>
          <FAQ />
        </FadeUp>

        <FadeUp>
          <Contact />
        </FadeUp>

        <FadeUp>
          <GetTheApp />
        </FadeUp>
      </main>

      <Footer />

      {/* Global Modal - High Z-Index */}
      <IndustryDetailsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        category={selectedCategory}
      />
    </div>
  )
}
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import PartnerProgram from '../components/landing/PartnerProgram'
import Footer from '../components/landing/Footer'

export default function Partners() {
  return (
    <div className="min-h-screen bg-[#FAFBFB] flex flex-col justify-between">
      <div>
        {/* Standalone Header */}
        <header className="py-6 border-b border-light bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src="/hlynk.png" alt="hlynk" className="h-8 w-auto" />
              <span className="text-[#0D4A3E] text-xl font-bold">lynk</span>
            </Link>
            
            <Link 
              to="/" 
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm uppercase tracking-wider"
            >
              <ChevronLeft className="w-4 h-4 text-slate-500" /> Back to Home
            </Link>
          </div>
        </header>

        {/* Dynamic Calculator & Program Description */}
        <PartnerProgram />
      </div>

      {/* Styled Footer Wrapper */}
      <div className="bg-slate-950 text-white">
        <Footer />
      </div>
    </div>
  )
}

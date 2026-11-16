
import {
  BedDouble,
  CarFront,
  Droplets,
  ShoppingCart,
  Scissors,
  Wrench,
} from 'lucide-react'

import { ScrollFade } from '../../components/shared/ScrollFade'

const categories = [
  {
    label: 'BnBs & Apartments',
    heading: 'Make every stay easier to manage.',
    description:
      'Keep track of rooms, guest bookings and payments in one place. Know what is available without chasing information.',
    image: '/assets/business/bnbs.jpg',
    icon: BedDouble,
    features: [
      'Room Calendar',
      'Guest Payments & Balances',
      'Airbnb & Direct Bookings',
      'Room Cleaning Status',
    ],
    onboarding: [
      'Sign in with Google',
      'Add your rooms or units',
      'Record your first guest booking',
    ],
    integration:
      'Hlynk immediately updates room availability and calculates guest balances.',
  },
  {
    label: 'Car Rentals & Fleet',
    heading: 'Know where every vehicle stands.',
    description:
      'Keep your fleet organised, track rental periods and monitor payments. See which vehicles are available and which are due back.',
    image: '/assets/business/car-rentals.jpg',
    icon: CarFront,
    features: [
      'Car Availability Tracker',
      'Daily Rent Calculator',
      'Maintenance Expense Logs',
      'Simple Deposit Records',
    ],
    onboarding: [
      'Sign in with Google',
      'Add your vehicle fleet',
      'Record a rental trip',
    ],
    integration:
      'Rentals are automatically linked to your profit reports, including repair costs.',
  },
  {
    label: 'Car Wash & Detailing',
    heading: 'Keep every wash and payment accounted for.',
    description:
      'Record completed jobs, manage wash packages and follow staff performance. Know what your business earns every day.',
    image: '/assets/business/car-wash.jpg',
    icon: Droplets,
    features: [
      'Wash Style Packages',
      'Employee Job Assignment',
      'Water & Soap Stock Count',
      'Fast Customer Receipts',
    ],
    onboarding: [
      'Sign in with Google',
      'Enter your wash package prices',
      'Record your first car wash',
    ],
    integration:
      'Calculates employee commissions and updates wash sales in real-time.',
  },
  {
    label: 'Retail & Mini Marts',
    heading: 'Stay on top of your sales and stock.',
    description:
      'Record sales, monitor inventory and keep an eye on expenses. Know what is selling and how much your shop is making.',
    image: '/assets/business/retail.jpg',
    icon: ShoppingCart,
    features: [
      'Fast POS Checkout',
      'Low Stock Text Alerts',
      'Supplier Payments',
      'Instant Profit Summary',
    ],
    onboarding: [
      'Sign in with Google',
      'Enter your items and prices',
      'Record your first sale',
    ],
    integration:
      'Deducts stock automatically from inventory with every cash or M-Pesa sale.',
  },
  {
    label: 'Salons & Barbers',
    heading: 'Manage your services and staff with ease.',
    description:
      'Keep service records, track product sales and manage staff commissions. Spend less time working out the numbers.',
    image: '/assets/business/salons.jpg',
    icon: Scissors,
    features: [
      'Staff Commission Tracker',
      'Daily Service Logs',
      'Hair Product Inventory',
      'Client Visit History',
    ],
    onboarding: [
      'Sign in with Google',
      'Enter your service packages',
      'Record daily client visits',
    ],
    integration:
      'Makes daily payouts to barbers and beauticians transparent and fast.',
  },
  {
    label: 'Garages & Mechanics',
    heading: 'Keep every job and repair on record.',
    description:
      'Organise job cards, monitor spare parts and keep vehicle service histories. Know what each job costs and earns.',
    image: '/assets/business/garages.jpg',
    icon: Wrench,
    features: [
      'Digital Job Cards',
      'Spare Parts Count',
      'Vehicle Service History',
      "Mechanics' Commission Logs",
    ],
    onboarding: [
      'Sign in with Google',
      'Enter your garage details',
      'Create your first job card',
    ],
    integration:
      'Never forget previous repair history for any vehicle serviced in your garage.',
  },
]

/* Six distinct image shapes */
const imageShapes = [
  // 1. Full circle
  'rounded-full',

  // 2. Architectural arch
  'rounded-t-[50%] rounded-b-[12px]',

  // 3. Opposing asymmetric corners
  'rounded-tl-[12px] rounded-tr-[64px] rounded-br-[12px] rounded-bl-[64px]',

  // 4. Simple rounded rectangle
  'rounded-[18px]',

  // 5. Organic oval
  'rounded-[45%_12%_45%_12%]',

  // 6. Geometric clipped silhouette
  '[clip-path:polygon(0_0,88%_0,100%_14%,100%_100%,12%_100%,0_86%)]',
]

export default function WhoUses({
  onSelectCategory,
}: {
  onSelectCategory: (cat: any) => void
}) {
  return (
    <section
      id="who"
      className="bg-[#EDF3EF] py-20 text-[#172D27] md:py-28"
    >
      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-12">

        {/* Section introduction */}
        <ScrollFade className="mb-20 max-w-2xl md:mb-24">
          <span className="mb-4 block text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
            Made for the way you work
          </span>

          <h2 className="font-ubuntu text-3xl font-bold leading-tight tracking-tight text-[#17372C] sm:text-4xl md:text-5xl">
            One place to manage{' '}
            <span className="text-emerald-700">
              your business.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Whatever you run, Hlynk helps you keep track of the important
            things and stay in control of your day-to-day operations.
          </p>
        </ScrollFade>

        {/* Business categories */}
        <div className="space-y-24 md:space-y-32">
          {categories.map((category, index) => {
            const Icon = category.icon
            const reversed = index % 2 !== 0

            return (
              <article
                key={category.label}
                className="grid items-center gap-9 md:grid-cols-2 md:gap-14 lg:gap-20"
              >
                {/* Image */}
                <ScrollFade
                  className={`w-full ${
                    reversed ? 'md:order-2' : 'md:order-1'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectCategory(category)}
                    aria-label={`Explore ${category.label}`}
                    className="group block w-full cursor-pointer text-left"
                  >
                    <div
                      className={`relative mx-auto aspect-[1.12/1] w-full max-w-[500px] overflow-hidden bg-[#DDEBE4] ${imageShapes[index]}`}
                    >
                      <img
                        src={category.image}
                        alt={category.label}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
                      />
                    </div>
                  </button>
                </ScrollFade>

                {/* Text */}
                <ScrollFade
                  className={`mx-auto w-full max-w-[500px] ${
                    reversed ? 'md:order-1' : 'md:order-2'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectCategory(category)}
                    aria-label={`Explore ${category.label}`}
                    className="group block w-full text-left"
                  >
                    <div className="mb-5 flex items-center gap-3">
                      <Icon
                        size={21}
                        strokeWidth={1.8}
                        className="shrink-0 text-emerald-700"
                      />

                      <span className="text-sm font-semibold text-emerald-800">
                        {category.label}
                      </span>
                    </div>

                    <h3 className="font-ubuntu text-2xl font-bold leading-tight tracking-tight text-[#17372C] transition-colors duration-200 group-hover:text-emerald-700 sm:text-3xl lg:text-[38px]">
                      {category.heading}
                    </h3>

                    <p className="mt-5 max-w-md text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                      {category.description}
                    </p>

                  </button>
                </ScrollFade>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

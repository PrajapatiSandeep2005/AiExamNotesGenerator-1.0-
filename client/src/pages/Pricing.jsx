import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { serverURL } from '../App';
import axios from 'axios';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';

function Pricing() {
  const navigate = useNavigate();

  const [selectedPrice, setSelectedPrice] = useState(null);
  const [paying, setPaying] = useState(false);
  const [payingAmount, setPayingAmount] = useState(null);

  const handlePaying = async (amount) => {
    try {
      setPayingAmount(amount);
      setPaying(true);

      const result = await axios.post(
        serverURL + '/api/credit/order',
        { amount },
        { withCredentials: true }
      );

      if (result.data.url) {
        window.location.href = result.data.url;
      }

      setPaying(false);
    } catch (error) {
      console.error('Error occurred while processing payment:', error);
      setPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] px-4 sm:px-6 py-12 relative overflow-hidden text-white">

      {/* ================= BACKGROUND DECORATIONS ================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Top Left Glow */}
        <div
          className="
            absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#f5a13b]/10 blur-3xl"
        />

        {/* Right Side Glow */}
        <div
          className="
            absolute top-1/3 -right-32
            w-96 h-96
            rounded-full
            bg-[#a56627]/10
            blur-3xl
          "
        />

        {/* Bottom Glow */}
        <div
          className="
            absolute -bottom-40 left-1/3
            w-96 h-96
            rounded-full
            bg-[#f5a13b]/5
            blur-3xl
          "
        />

      </div>

      {/* ================= BACK BUTTON ================= */}
      <button
        onClick={() => navigate('/')}
        className="
          group
          absolute top-4 left-4
          md:top-8 md:left-8
          z-20
          flex items-center gap-2
          px-4 py-2.5
          rounded-xl
          bg-[#171819]
          backdrop-blur-md
          border border-[#d49a54]/25
          text-[#ffc06b]
          font-medium
          shadow-sm
          transition-all duration-300
          hover:bg-[#211b13]
          hover:text-white
          hover:shadow-md
          hover:-translate-x-1
          cursor-pointer
        "
      >
        <ArrowLeft
          size={18}
          className="
            transition-transform duration-300
            group-hover:-translate-x-1
          "
        />

        <span>Back</span>
      </button>

      <div className="relative z-10 mb-8 flex justify-center">
        <BrandLogo />
      </div>
      <div className="absolute right-4 top-4 z-20 md:right-8 md:top-8">
        <ThemeToggle />
      </div>

      {/* ================= HEADER ================= */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 text-center mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Buy Credits
        </h1>

        <p className="text-[#a09d98] mt-2">
          Choose a plan that suits your needs
        </p>
      </motion.div>

      {/* ================= PRICING CARDS ================= */}
      <div
        className="
          relative z-10
          max-w-5xl
          mx-auto
          grid
          grid-cols-1
          md:grid-cols-3
          gap-6
        "
      >

        {/* ================= BASIC ================= */}
        <PricingCard
          title="Basic"
          price="Rs 100"
          amount={100}
          credits="50 credits"
          description="Perfect for quick revisions"
          features={[
            'Generate AI notes',
            'Access to basic features',
            'Diagram and Charts support',
            'Fast generation',
          ]}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          onBuy={handlePaying}
          paying={paying}
          payingAmount={payingAmount}
        />

        {/* ================= POPULAR ================= */}
        <PricingCard
          popular
          title="Popular"
          price="Rs 200"
          amount={200}
          credits="120 credits"
          description="Best value for students"
          features={[
            'All Starter features',
            'More credits per purchase',
            'Revision Mode Support',
            'Priority AI response',
          ]}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          onBuy={handlePaying}
          paying={paying}
          payingAmount={payingAmount}
        />

        {/* ================= PRO LEARNER ================= */}
        <PricingCard
          title="Pro Learner"
          price="Rs 500"
          amount={500}
          credits="350 credits"
          description="For serious learners and exam takers"
          features={[
            'All Premium features',
            'Maximum credits value',
            'Unlimited Revisions',
            'Ideal for full syllabus preparation',
          ]}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          onBuy={handlePaying}
          paying={paying}
          payingAmount={payingAmount}
        />

      </div>
    </div>
  );
}


/* ============================================================
   PRICING CARD
============================================================ */

function PricingCard({
  title,
  price,
  amount,
  features,
  credits,
  description,
  popular,
  selectedPrice,
  setSelectedPrice,
  onBuy,
  paying,
  payingAmount,
}) {
  const isSelected = selectedPrice === amount;
  const isPayingThisCard = paying && payingAmount === amount;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      onClick={() => setSelectedPrice(amount)}
      className={`
        relative
        cursor-pointer
        p-6
        rounded-2xl
        bg-[#141516]
        backdrop-blur-sm
        border
        transition-all
        duration-300

        ${
          isSelected
            ? 'border-[#f5a13b] shadow-xl shadow-[#f5a13b]/10'
            : popular
            ? 'border-[#d49a54]/60 shadow-lg shadow-[#f5a13b]/10'
            : 'border-white/10 shadow-sm hover:border-[#d49a54]/40 hover:shadow-lg'
        }
      `}
    >

      {/* ================= BADGES ================= */}

      {popular && !isSelected && (
        <span
          className="
            absolute
            top-4
            right-4
            text-xs
            px-2.5
            py-1
            rounded-lg
            bg-[#f5a13b]
            text-[#17110a]
            font-medium
          "
        >
          Popular
        </span>
      )}

      {isSelected && (
        <span
          className="
            absolute
            top-4
            right-4
            text-xs
            px-2.5
            py-1
            rounded-lg
            bg-[#f5a13b]
            text-[#17110a]
            font-medium
          "
        >
          Selected
        </span>
      )}

      {/* ================= TITLE ================= */}

      <h2 className="text-xl font-semibold text-white">
        {title}
      </h2>

      <p className="text-gray-400 text-sm mt-2">
        {description}
      </p>

      {/* ================= PRICE ================= */}

      <div className="mt-5">
        <p className="text-3xl font-bold text-white">
          {price}
        </p>

        <p className="text-[#ffc06b] text-sm mt-1 font-medium">
          {credits}
        </p>
      </div>

      {/* ================= BUY BUTTON ================= */}

      <button
        disabled={isPayingThisCard}
        onClick={(e) => {
          e.stopPropagation();
          onBuy(amount);
        }}
        className={`
          w-full
          mt-6
          py-2.5
          rounded-xl
          font-medium
          transition-all
          duration-300
          cursor-pointer

          ${
            isPayingThisCard
              ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
              : 'bg-[#f5a13b] text-[#17110a] hover:bg-[#ffb858] shadow-md'
          }
        `}
      >
        {isPayingThisCard ? 'Redirecting...' : 'Buy Now'}
      </button>

      {/* ================= FEATURES ================= */}

      <ul className="mt-6 space-y-3 text-sm text-gray-300">
        {features.map((feature, index) => (
          <li
            key={index}
            className="flex items-start gap-2"
          >
            <span className="text-[#ffc06b] font-semibold">
              ✓
            </span>

            <span>{feature}</span>
          </li>
        ))}
      </ul>

    </motion.div>
  );
}

export default Pricing;

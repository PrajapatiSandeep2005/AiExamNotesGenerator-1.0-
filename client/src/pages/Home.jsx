import Navbar from '../components/Navbar'
import { motion } from 'framer-motion';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const homeIllustration = 'https://cdn.notegpt.io/notegpt/static/tario_image/ai-notes-generator/use-case-1.webp';
const features = [
  {
    icon: "📗",
    title: "Exam Notes",
    description: "Create comprehensive, exam-focused notes from any topic.",
  },
  {
    icon: "🤖",
    title: "Multiple AI Models",
    description: "Choose Gemini, Groq, or Cloudflare AI for note generation.",
  },
  {
    icon: "🔄",
    title: "Automatic Model Fallback",
    description: "Auto mode tries another available AI provider if one fails.",
  },
  {
    icon: "📊",
    title: "Charts & Diagrams",
    description: "Turn key ideas into visual charts and flow diagrams.",
  },
  {
    icon: "⚡",
    title: "Quick Revision",
    description: "Create concise revision points for a fast review.",
  },
  {
    icon: "📥",
    title: "PDF Downloads",
    description: "Download generated notes as a shareable PDF.",
  },
  {
    icon: "🕘",
    title: "Saved Notes History",
    description: "Reopen previously generated notes whenever you need them.",
  },
  {
    icon: "🎁",
    title: "50 Daily Free Chats",
    description: "Use a shared daily free chat allowance across supported models.",
  },
];

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08090a] text-white px-4 py-5">
      <Navbar />

      {/* top */}
      <section className='max-w-6xl mx-auto px-4 sm:px-8 pt-16 lg:pt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
        <div>
          <motion.div initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5 }}
            whileHover={{ rotateX: 8, rotateY: -8 }}
            className="transform-gpu">
            <motion.h1 className="text-5xl lg:text-6xl font-extrabold leading-tight text-white"
              whileHover={{ y: -4 }}
              style={{
                transform: "translateZ(40px)",
                textShadow: "0 18px 40px rgba(0,0,0,0.5)"
              }}>
              Create Smart <br /> <span className="text-[#f5a13b]">AI Notes</span> in seconds
            </motion.h1>
            <motion.p className='mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-[#aaa6a0]'
              whileHover={{ y: -2 }}
              style={{ transform: "translateZ(20px)", textShadow: "0 12px 30px rgba(0,0,0,0.15)" }}>
              Generate exam-focused notes, project documents, flow diagrams, and revision-ready content instantly.

            </motion.p>

            <motion.button onClick={() => navigate('/notes')}
              whileHover={{y: -12, rotateX: 8, rotateY: -8, scale: 1.05 }}
              whileTap={{ type: "spring", stiffness: 200, damping: 18  }}
              className='mt-7 px-6 py-3 bg-gradient-to-r from-[#f6a43d] to-[#ee8b25] text-[#17110a] font-semibold rounded-lg shadow-[0_8px_28px_rgba(245,161,59,0.2)] hover:shadow-[0_10px_34px_rgba(245,161,59,0.35)] transition-shadow duration-300 flex items-center gap-2 cursor-pointer'>

                Get Started
            </motion.button>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5 }}
          whileHover={{  y: -12, rotateX: 8, rotateY: -8, scale: 1.05 }}
          className="transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
            <div className="overflow-hidden">
              <img src={homeIllustration} alt="AI notes generator illustration" style={{ transform: "translateZ(40px)" }} className="rounded-3xl opacity-90 [mask-image:radial-gradient(ellipse_at_center,black_55%,transparent_100%)]" />

            </div>
          </motion.div>
      </section>

      {/* bottom */}
      <section className='max-w-6xl mx-auto px-4 sm:px-8 py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {features.map((feature, index) => (
          <FeatureCard key={feature.title} {...feature} index={index} />
        ))}
      </section>
      <Footer />
    </div>
  )
}

function FeatureCard({ title, description, icon, index }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 24, rotateY: index % 2 === 0 ? -12 : 12 }}
            whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            whileHover={{ y: -10, rotateX: 5, rotateY: index % 2 === 0 ? -5 : 5, scale: 1.03 }}
            transition={{
              opacity: { duration: 0.4, delay: (index % 4) * 0.07 },
              y: { type: "spring", stiffness: 200, damping: 18, delay: (index % 4) * 0.07 },
              rotateX: { type: "spring", stiffness: 200, damping: 18 },
              rotateY: { type: "spring", stiffness: 200, damping: 18 },
              scale: { type: "spring", stiffness: 200, damping: 18 },
            }}
            className='group relative rounded-xl p-6 bg-gradient-to-br from-[#111213] to-[#0a0b0c] text-white shadow-[0_16px_40px_rgba(0,0,0,0.35)] border border-white/10 hover:border-[#d89443]/40 transition-colors'
            style={{ transformStyle: "preserve-3d" }}
        >
            <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-[#f5a13b]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' style={{ transform: "translateZ(1px)" }}/>
                <div className='relative z-10 ' style={{ transform: "translateZ(30px)" }}>
                    <motion.div
                      className='text-3xl mb-4 text-[#e6a65d] origin-center'
                      whileHover={{ rotate: 360, scale: 1.15 }}
                      transition={{ duration: 0.65, ease: "easeInOut" }}
                    >
                      {icon}
                    </motion.div>
                    <h3 className='text-lg font-semibold mb-2'>{title}</h3>
                    <p className='text-gray-400 text-sm leading-relaxed'>{description}</p>
                </div>

        </motion.div>
    )
  }

export default Home

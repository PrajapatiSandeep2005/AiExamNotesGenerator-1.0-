import { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import TopicForm from '../components/TopicForm';
import Sidebar from '../components/Sidebar';
import FinalResult from '../components/FinalResult';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';
import { getModelUsage } from '../utils/credits';

const Notes = () => {
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const modelUsage = getModelUsage(userData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // State for AI Model Selector (defaults to auto-switch)
  const [selectedAiModel, setSelectedAiModel] = useState("auto");

  useEffect(() => {
    const updateScrollState = () => {
      setScrollProgress(Math.min(window.scrollY / 180, 1));
    };
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);
  const providerLimits = Object.values(modelUsage);

  return (
    <div className='min-h-screen bg-[#08090a] px-4 sm:px-6 py-5 sm:py-8'>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          "--nav-opacity": 0.96 - scrollProgress * 0.92,
          "--nav-blur": `${16 - scrollProgress * 16}px`,
          "--nav-border-opacity": 0.1 - scrollProgress * 0.08,
          boxShadow: `0 20px 40px rgba(0, 0, 0, ${0.45 - scrollProgress * 0.4})`,
          transition: "background-color 180ms linear, backdrop-filter 180ms linear, border-color 180ms linear, box-shadow 180ms linear",
        }}
        className='notes-page-header sticky top-3 z-40 max-w-6xl mx-auto mb-6 rounded-xl border border-white/10 px-5 sm:px-8 py-4 shadow-[0_20px_40px_rgba(0,0,0,0.45)] items-start flex md:items-center gap-4 justify-between flex-col md:flex-row'>
        <div className='cursor-pointer' onClick={() => navigate('/')}>
          <BrandLogo />
          <p className='text-xs text-[#a09d98] mt-1'>AI-powered study notes and exam preparation resources</p>
        </div>

        <div className='flex items-center gap-4 flex-wrap'>
          {/* AI Selector Dropdown in Header */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <span className="text-xs text-[#a09d98]">AI:</span>
            <select
              value={selectedAiModel}
              onChange={(e) => setSelectedAiModel(e.target.value)}
              className="bg-transparent text-xs text-[#ffc06b] focus:outline-none cursor-pointer"
            >
              <option value="auto" className="bg-[#141516] text-white">Auto-Switch (Recommended)</option>
              <option value="gemini" className="bg-[#141516] text-white">Gemini</option>
              <option value="cloudflare" className="bg-[#141516] text-white">Cloudflare AI</option>
            </select>
          </div>

          <button className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#f5a13b]/10 border border-[#f5a13b]/25 text-[#ffc06b] text-sm" onClick={() => navigate('/pricing')}>
            <span className='text-xs'>◆</span>
            <span>{userData?.credits ?? 0} Credits</span>
            <motion.span whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.97 }}
              className='ml-1 h-4 w-4 rounded-full bg-[#f5a13b] text-black text-xs flex items-center justify-center font-bold cursor-pointer'>
              +
            </motion.span>
          </button>

          <button className='px-4 py-2 rounded-full text-sm font-medium bg-white/5 border border-white/10 transition flex items-center gap-2 text-white hover:bg-white/10 cursor-pointer' onClick={() => navigate('/history')}>
            ▤ Your Notes History
          </button>
          <ThemeToggle />
        </div>
      </motion.header>

      <section
        aria-label="AI provider limits"
        className="max-w-6xl mx-auto mb-6 rounded-xl border border-[#d49a54]/25 bg-[#111213] p-4 sm:p-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#ffc06b]">AI usage and model limits</h2>
            <p className="mt-1 text-xs text-[#a09d98]">
              Credits are deducted after a successful generation. Per-model and shared daily caps protect availability.
            </p>
          </div>
          <p className="shrink-0 rounded-lg border border-[#f5a13b]/25 bg-[#f5a13b]/10 px-3 py-2 text-sm text-[#ffc06b]">
            Credits: <strong>{userData?.credits ?? 0}</strong> · Daily cap left: <strong>{userData?.dailyCreditsRemaining ?? 50}/{userData?.dailyCreditCap ?? 50}</strong>
          </p>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {providerLimits.map((provider) => {
            return (
              <div
                key={provider.id}
                className="rounded-lg border border-white/10 bg-white/[0.03] p-3"
              >
                <p className="text-sm font-medium text-white">{provider.label}</p>
                <p className="mt-1 text-xs text-[#a09d98]">{provider.creditCost} credit{provider.creditCost > 1 ? 's' : ''} per generation</p>
                <p className="mt-2 text-sm font-semibold text-[#ffc06b]">Daily limit: {provider.dailyLimit}</p>
                <p className="mt-2 text-xs text-gray-300">
                  {provider.usedToday} used today · {provider.dailyRemaining} model requests left
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  {provider.estimatedRemaining} estimated generations remaining
                  <span className="block">based on credits and all daily caps</span>
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-[#a09d98]">
          The “left” count is a per-model view of the same shared pool; model counts are not additive. Chats after the daily free pool use purchased credits.
        </p>
      </section>

      <motion.div initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-8">
        {/* Pass selectedAiModel into TopicForm */}
        <TopicForm
          setResults={setResults}
          setLoading={setLoading}
          loading={loading}
          setError={setError}
          selectedAiModel={selectedAiModel}
        />
      </motion.div>

      {loading && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto mb-6"
          role="status"
          aria-live="polite"
        >
          <div className="mb-4 flex items-center justify-center gap-3 text-[#ffc06b]">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#f5a13b]/30 border-t-[#ffc06b]" />
            <span className="font-medium">Generating exam-focused notes...</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-4">
            <div className="animate-pulse rounded-xl border border-[#d49a54]/25 bg-[#111213] p-5 lg:col-span-1">
              <div className="mb-5 h-5 w-3/4 rounded bg-white/10" />
              <div className="space-y-3">
                <div className="h-16 rounded-lg bg-white/5" />
                <div className="h-16 rounded-lg bg-white/5" />
                <div className="h-16 rounded-lg bg-white/5" />
              </div>
            </div>
            <div className="space-y-4 rounded-xl border border-[#d49a54]/25 bg-[#111213] p-5 lg:col-span-3">
              <div className="h-7 w-1/3 animate-pulse rounded bg-[#f5a13b]/15" />
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-full rounded bg-white/10" />
                <div className="h-4 w-11/12 rounded bg-white/10" />
                <div className="h-4 w-4/5 rounded bg-white/10" />
                <div className="h-4 w-full rounded bg-white/10" />
              </div>
              <div className="rounded-xl border border-[#d49a54]/20 bg-[#0b0c0d] p-4">
                <div className="mb-4 flex items-center gap-2 text-sm text-[#a09d98]">
                  <span className="h-3 w-3 animate-spin rounded-full border border-[#f5a13b]/30 border-t-[#ffc06b]" />
                  Preparing notes and charts...
                </div>
                <div className="flex h-36 items-end gap-3 px-3 animate-pulse">
                  <div className="h-1/2 flex-1 rounded-t bg-[#f5a13b]/20" />
                  <div className="h-4/5 flex-1 rounded-t bg-[#f5a13b]/30" />
                  <div className="h-2/3 flex-1 rounded-t bg-[#f5a13b]/20" />
                  <div className="h-full flex-1 rounded-t bg-[#f5a13b]/30" />
                  <div className="h-3/5 flex-1 rounded-t bg-[#f5a13b]/20" />
                </div>
              </div>
            </div>
          </div>
          <motion.div
            className="mt-4 h-1 overflow-hidden rounded-full bg-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-[#ffc06b] to-transparent"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        </motion.div>
      )}

      {error && (
        <div role="alert" className='text-center text-red-400 font-medium mb-6'>
          {error}
        </div>
      )}

      {!loading && !results &&
        <motion.div whileHover={{ scale: 1.02 }}
          className='max-w-6xl mx-auto h-64 rounded-xl flex flex-col items-center justify-center bg-[#0d0e0f] border border-[#d49a54]/25 text-[#a09d98] shadow-inner'>
          <span className='text-4xl mb-3 text-[#bd8545]'>▤</span>
          <p className='text-sm'>Your generated notes will appear here...</p>
        </motion.div>
      }

      {results &&
        <motion.div initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-4 gap-4'>
          <div className='lg:col-span-1'>
            <Sidebar results={results} />
          </div>

          <div className='lg:col-span-3 rounded-xl bg-[#111213] border border-[#d49a54]/25 shadow-[0_15px_40px_rgba(0,0,0,0.35)] p-4 sm:p-6'>
            <FinalResult results={results} />
          </div>
        </motion.div>
      }
    </div>
  )
}

export default Notes

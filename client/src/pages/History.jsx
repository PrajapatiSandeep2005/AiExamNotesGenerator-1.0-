import axios from 'axios';
import { useEffect, useState } from 'react'
import { serverURL } from '../App';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { GiHamburgerMenu } from 'react-icons/gi';
import FinalResult from '../components/FinalResult.jsx';
import BrandLogo from '../components/BrandLogo.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { ArrowLeft } from 'lucide-react';
import { getTotalAvailableAiChats } from '../utils/credits';

function History() {
  const [topics, setTopics] = useState([])
  const navigate = useNavigate();
  const { userData } = useSelector((state) => state.user);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [activeNote, setActiveNote] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const availableAiChats = getTotalAvailableAiChats(userData);

  useEffect(() => {
    const myNotes = async () => {
      try {
        const res = await axios.get(serverURL + "/api/notes/getnotes", { withCredentials: true });
        console.log(res.data)
        setTopics(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    }
    myNotes();
  }, [])

  const openTransactions = async () => {
    setShowTransactions(true);
    setTransactionsLoading(true);

    try {
      const res = await axios.get(
        serverURL + "/api/credit/history",
        { withCredentials: true }
      );
      setTransactions(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const openNote = async (noteId) => {
    setLoading(true);
    setActiveNote(noteId);

    try {
      const res = await axios.get(
        serverURL + `/api/notes/${noteId}`,
        { withCredentials: true }
      );

      setSelectedNote({
        content: res.data.content,
        topic: res.data.topic,
        revisionMode: res.data.revisionMode,
        includeDiagrams: res.data.includeDiagrams,
        includeChart: res.data.includeChart,
        providerUsed: res.data.providerUsed,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching note:", error);
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-[#08090a] px-4 sm:px-6 py-5 sm:py-8'>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-6xl mx-auto mb-6 rounded-xl bg-[#141516] backdrop-blur-lg border border-white/10 px-5 sm:px-8 py-4 items-center flex justify-between md:items-center gap-4 flex-col md:flex-row shadow-[0_20px_40px_rgba(0,0,0,0.45)]'
      >
        <div className='cursor-pointer' onClick={() => navigate('/')}>
          <BrandLogo />
          <p className='text-xs text-[#a09d98] mt-1'>AI-powered study notes and exam preparation resources</p>
        </div>

        <div className='flex items-center gap-4 flex-wrap'>
          {!isSidebarOpen && <button className='lg:hidden text-white text-2xl cursor-pointer' onClick={() => setIsSidebarOpen(true)}>
            <GiHamburgerMenu />
          </button>}

          <button
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#f5a13b]/10 border border-[#f5a13b]/25 text-[#ffc06b] text-sm"
            onClick={() => navigate('/pricing')}
          >
            <span className='text-xs'>◆</span>
            <span>{availableAiChats} AI Chats</span>
            <motion.span
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.97 }}
              className='ml-1 h-4 w-4 rounded-full bg-[#f5a13b] text-black text-xs flex items-center justify-center font-bold cursor-pointer'
            >
              ➕
            </motion.span>
          </button>

          <button
            onClick={openTransactions}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-all"
          >
            <span>💳</span>
            <span className="hidden sm:inline">Transactions</span>
          </button>
          <ThemeToggle />
        </div>
      </motion.header>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        <AnimatePresence>
          {isSidebarOpen &&
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className='lg:static relative top-0 left-0 z-50 lg:z-auto w-72 lg:w-auto h-full lg:h-[75vh] lg:col-span-1 bg-[#141516] backdrop-blur-xl border border-[#d49a54]/25 shadow-[0_20px_40px_rgba(0,0,0,0.5)] p-5 overflow-y-auto lg:rounded-xl'
            >
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="group absolute top-4 left-4 md:top-8 md:left-8 z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-[#211b13] backdrop-blur-md border border-[#d49a54]/30 text-[#ffc06b] font-medium shadow-sm transition-all duration-300 hover:bg-[#302417] hover:shadow-md hover:-translate-x-1"
              >
                <ArrowLeft
                  size={18}
                  className="transition-transform duration-300 group-hover:-translate-x-1"
                />
                <span>Back</span>
              </button>

              <div className='mb-4 space-y-1 pt-16'>
                <button
                  onClick={() => navigate('/notes')}
                  className='w-full px-3 py-2 rounded-lg text-sm text-[#ffc06b] bg-[#f5a13b]/10 hover:bg-[#f5a13b]/20 cursor-pointer'
                >
                  ➕ New Notes
                </button>

                <hr className='border-white/10 mb-4' />

                <h2 className='text-lg font-bold mb-4 text-white'>
                  📋Your Notes
                </h2>

                {topics.length === 0 && (
                  <p className='text-gray-400 text-sm'>No notes created yet.</p>
                )}

                <ul className='space-y-3'>
                  {topics.map((t, i) => (
                    <li
                      key={i}
                      onClick={() => {
                        openNote(t._id);
                      }}
                      className={`cursor-pointer p-3 rounded-xl transition-all
                      ${activeNote === t._id
                          ? "bg-[#f5a13b]/15 border-[#f5a13b]/50 shadow-[0_0_0_1px_rgba(245,161,59,0.35)]"
                          : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                    >
                      <p className='text-sm font-semibold text-white'>
                        {t.topic}
                      </p>

                      <div className='mt-2 flex flex-wrap gap-2 text-xs'>
                        {t.classLevel && <span className='px-2 py-0.5 rounded-full bg-[#f5a13b]/10 text-[#ffc06b]'>ClassLevel: {t.classLevel}</span>}

                        {t.examType && <span className='px-2 py-0.5 rounded-full bg-white/5 text-gray-300'>{t.examType}</span>}
                      </div>

                      <div className='mt-2 flex gap-3 text-xs text-gray-400'>
                        {t.revisionMode && <span>⚡Revision</span>}
                        {t.includeDiagrams && <span>📊 Diagrams</span>}
                        {t.includeChart && <span>📈 Charts</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          }
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='lg:col-span-3 h-[75vh] min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 rounded-xl bg-[#111213] border border-[#d49a54]/25 shadow-[0_20px_40px_rgba(0,0,0,0.4)]'
        >
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-3 text-sm text-[#ffc06b]">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#f5a13b]/30 border-t-[#ffc06b]" />
                Loading saved notes...
              </div>
              <div className="animate-pulse space-y-4">
                <div className="h-8 w-2/5 rounded bg-[#f5a13b]/15" />
                <div className="h-40 rounded-xl bg-white/5" />
                <div className="space-y-3 rounded-xl border border-white/5 p-4">
                  <div className="h-5 w-1/4 rounded bg-white/10" />
                  <div className="h-4 w-full rounded bg-white/10" />
                  <div className="h-4 w-11/12 rounded bg-white/10" />
                  <div className="h-4 w-4/5 rounded bg-white/10" />
                </div>
              </div>
            </motion.div>
          )}

          {!loading && !selectedNote && (
            <div className='h-full min-h-[45vh] flex flex-col gap-4 items-center justify-center text-center text-gray-400'>
              <span className="text-4xl text-[#bd8545]">▤</span>
              Select a note from the left
            </div>
          )}

          {!loading && selectedNote && <FinalResult results={selectedNote} />}
        </motion.div>
      </div>

      {showTransactions && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setShowTransactions(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[80vh] overflow-hidden rounded-2xl bg-[#141516] border border-[#d49a54]/25 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <h2 className="text-xl font-bold text-white">
                  💳 Transaction History
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Your credit purchases
                </p>
              </div>

              <button
                onClick={() => setShowTransactions(false)}
                className="h-9 w-9 rounded-full bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto max-h-[60vh]">
              {transactionsLoading && (
                <div className="py-10 text-center text-gray-400">
                  Loading transactions...
                </div>
              )}

              {!transactionsLoading && transactions.length === 0 && (
                <div className="py-10 text-center text-gray-400">
                  <div className="text-4xl mb-3">💳</div>
                  <p>No transactions yet.</p>
                </div>
              )}

              {!transactionsLoading && transactions.length > 0 && (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction._id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-white font-semibold">
                            💎 {transaction.credits} Credits
                          </p>

                          <p className="text-sm text-gray-400 mt-1">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-white font-semibold">
                            ₹{transaction.amount}
                          </p>

                          <span className="inline-block mt-1 px-2 py-1 rounded-full bg-green-500/20 text-green-300 text-xs capitalize">
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default History
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import logo from '../assets/logo.png';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { serverURL } from '../App';
import { setUserData } from '../redux/userSlice';
import { useNavigate } from 'react-router-dom';
import { getModelUsage } from '../utils/credits';
import ThemeToggle from './ThemeToggle';

function Navbar() {
    const { userData } = useSelector((state) => state.user);
    const modelUsage = getModelUsage(userData);
    const [showCredits, setShowCredits] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const handleLogout = async () => {
        try {
            await axios.post(serverURL + "/api/auth/logout", {}, { withCredentials: true });
        } catch (error) {
            console.error("Error logging out:", error);
        } finally {
            localStorage.removeItem("token");
            dispatch(setUserData(null));
            navigate("/auth");
        }
    };
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            className="relative z-20 max-w-6xl mx-auto mt-2 rounded-xl bg-[#111213]/95 backdrop-blur-2xl border border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.45)] flex items-center justify-between px-5 sm:px-8 py-3">

            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                <img src={logo} alt="ExamNotes AI" className="w-8 h-8 rounded-full object-cover" />
                <span className='text-lg text-white font-bold'>ExamNotes <span className='text-[#f5a13b]'>AI</span></span>
            </div>

            <div className='flex items-center gap-3 sm:gap-6 required'>
                <ThemeToggle />
                <div className='relative'>
                    <motion.div onClick={() => { setShowCredits(!showCredits); setShowProfileMenu(false) }}
                        whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.97 }}
                        className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5a13b]/10 border border-[#f5a13b]/25 text-[#ffc06b] text-sm cursor-pointer'>
                        <span className='text-xs'>◆</span>
                        <span>{userData?.credits ?? 0} Credits</span>
                        <motion.span whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.97 }}
                            className='ml-1 h-4 w-4 rounded-full bg-[#f5a13b] text-[#17110a] text-xs flex items-center justify-center font-bold'>
                            +
                        </motion.span>
                    </motion.div>
                    <AnimatePresence>
                        {showCredits &&
                            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 10, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} transition={{ duration: 0.5 }}
                                className='absolute right-[-50px] mt-2 w-48 rounded-xl bg-[#171819] backdrop-blur-xl border border-[#f5a13b]/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.75)] p-4 text-sm text-white'>
                                <h4 className='font-bold'>Usage & credits</h4>
                                <p className='text-sm text-gray-300 mb-4'>
                                    {userData?.credits ?? 0} credits remaining. Daily weighted cap: {userData?.dailyCreditsRemaining ?? 50}/{userData?.dailyCreditCap ?? 50} credits.
                                </p>
                                <div className='mb-4 space-y-1 text-xs text-gray-300'>
                                    {Object.values(modelUsage).map((model) => <p key={model.id}>{model.label}: {model.estimatedRemaining} left ({model.creditCost} credit{model.creditCost > 1 ? 's' : ''} each)</p>)}
                                </div>
                                <button onClick={() => { setShowCredits(false); navigate('/pricing') }} className='bg-[#f5a13b] hover:bg-[#ffb858] text-[#17110a] py-2 px-4 rounded-lg text-sm font-bold cursor-pointer'>
                                    Buy More Credits
                                </button>
                            </motion.div>
                        } </AnimatePresence>
                </div>

                <div className='relative'>
                    <motion.div onClick={() => { setShowProfileMenu(!showProfileMenu); setShowCredits(false) }}
                        whileHover={{ scale: 1.07 }} whileTap={{ scale: 0.97 }}
                        className='flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-sm cursor-pointer'>
                        <span className='text-sm'>{userData?.name?.slice(0, 1)}</span>
                        <span className="hidden sm:inline">Profile</span>
                        <span className="text-xs">⌄</span>
                    </motion.div>
                    <AnimatePresence>
                        {showProfileMenu &&
                            <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 10, scale: 1 }} exit={{ opacity: 0.4, y: -10, scale: 0.95 }} transition={{ duration: 0.5 }}
                                className='absolute right-0 mt-2 w-48 rounded-xl bg-[#171819] backdrop-blur-xl border border-[#f5a13b]/20 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.75)] p-4 text-sm text-white'>
                                <MenuItem text="History" onClick={() => { setShowProfileMenu(false); navigate('/history') }} />
                                <div className="h-px bg-white/20 mx-2" />
                                <MenuItem text="Logout" red onClick={handleLogout} />
                            </motion.div>
                        }</AnimatePresence>
                </div>

            </div>
        </motion.div>
    )
}
function MenuItem({ onClick, text, red }) {
    return (
        <div onClick={onClick}
            className={`w-full text-left px-4 py-2 text-sm transition-colors ${red ? 'text-red-500 hover:bg-red-500/10' : 'text-gray-200 hover:bg-white/10'} rounded-lg cursor-pointer`}>
            {text}
        </div>
    )
}
export default Navbar

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FcGoogle } from "react-icons/fc";
import { HiOutlineMail } from "react-icons/hi";
import { auth, provider } from '../utils/firebase.js';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import { serverURL } from '../App.jsx';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';

function Auth() {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);

    // Form States
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [googleError, setGoogleError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleGoogleSignIn = async () => {
        setGoogleError('');
        setIsSubmitting(true);
        try {
            const response = await signInWithPopup(auth, provider);
            const User = response.user;
            if (!User.email) {
                throw new Error("Your Google account does not have an email address.");
            }
            const userName = User.displayName;
            const userEmail = User.email;
            const result = await axios.post(serverURL + "/api/auth/google", { name: userName, email: userEmail }, { withCredentials: true });

            localStorage.setItem("token", result.data.token);
            dispatch(setUserData(result.data.user));
        } catch (error) {
            setGoogleError(error.response?.data?.message || error.message || "Google sign-in failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const endpoint = isLoginView ? "/api/auth/login" : "/api/auth/register";
            const payload = isLoginView ? { email, password } : { name, email, password };

            const result = await axios.post(serverURL + endpoint, payload, { withCredentials: true });

            localStorage.setItem("token", result.data.token);
            dispatch(setUserData(result.data.user));
            setIsModalOpen(false);
        } catch (err) {
            setError(err.response?.data?.message || "Authentication failed. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className='min-h-screen overflow-hidden bg-[#08090a] text-white px-4 py-8 relative'>
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5 }}
                className='max-w-6xl mx-auto mt-2 rounded-xl bg-[#141516] backdrop-blur-xl border border-white/10 px-6 py-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)]'>
                <div className="flex items-center justify-between">
                    <span className="w-10" aria-hidden="true" />
                    <BrandLogo />
                    <ThemeToggle />
                </div>
                <p className='text-center text-[#aaa6a0] mt-2'>AI-powered study notes and exam preparation resources</p>
            </motion.header>

            <main className='max-w-6xl mx-auto py-12 lg:py-20 px-2 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                {/* LEFT CONTENT */}
                <motion.div
                    initial={{ opacity: 0, x: -60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1.5 }}>
                    <h1 className='text-5xl lg:text-6xl font-extrabold leading-tight text-white'>
                        Unlock Smart <br /> <span className="text-[#f5a13b]">AI Notes</span>
                    </h1>

                    <div className='flex flex-col sm:flex-row gap-4 mt-8'>
                        <motion.button
                            onClick={handleGoogleSignIn}
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='px-6 py-3 bg-gradient-to-r from-[#f6a43d] to-[#ee8b25] text-[#17110a] font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed'>
                            <FcGoogle size={22} /> {isSubmitting ? 'Signing in...' : 'Continue with Google'}
                        </motion.button>

                        <motion.button
                            onClick={() => setIsModalOpen(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className='px-6 py-3 bg-white/5 text-white rounded-lg shadow-lg hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto border border-white/10'>
                            <HiOutlineMail size={22} /> Continue with Email
                        </motion.button>
                    </div>
                    {googleError && <p role="alert" className="mt-4 text-sm text-red-400">{googleError}</p>}

                    <p className='mt-6 max-w-xl text-lg text-[#aaa6a0]'>
                        Buy credits and choose the right model: Cloudflare costs 1, Gemini costs 2, and Grok costs 5 credits per generation.
                    </p>
                    <p className='mt-4 max-w-xl text-base text-[#aaa6a0]'>
                        After your daily free chats, each generated note uses 10 credits. Upgrade anytime for more.
                    </p>
                </motion.div>

                {/* RIGHT CONTENT */}
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-8'>
                    <FeatureCard icon="🎁" title="Daily model safeguards" description="Per-model limits and a shared 50-credit daily cap keep generations reliable." />
                    <FeatureCard icon="📗" title="Exam Notes" description="High yield exam-oriented notes generated by AI." />
                    <FeatureCard icon="📊" title="Graphs & Diagrams" description="Create clear graphs and diagrams for visual learning." />
                    <FeatureCard icon="📥" title="PDF Downloads" description="Download your notes as clean, well-formatted PDFs." />
                </div>
            </main>

            {/* EMAIL AUTH MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#141516] border border-[#d49a54]/25 p-8 rounded-2xl w-full max-w-md relative shadow-2xl">

                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">
                                ✕
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-6">
                                {isLoginView ? 'Welcome Back' : 'Create Account'}
                            </h2>

                            {error && <div role="alert" className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                            <form onSubmit={handleEmailAuth} className="space-y-4">
                                {!isLoginView && (
                                    <div>
                                        <label className="text-gray-300 text-sm mb-1 block">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-[#0b0c0d] border border-[#8b6337]/45 text-white p-3 rounded-lg focus:border-[#f5a13b] outline-none transition-colors"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="text-gray-300 text-sm mb-1 block">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#0b0c0d] border border-[#8b6337]/45 text-white p-3 rounded-lg focus:border-[#f5a13b] outline-none transition-colors"
                                        placeholder="you@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-300 text-sm mb-1 block">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-[#0b0c0d] border border-[#8b6337]/45 text-white p-3 rounded-lg focus:border-[#f5a13b] outline-none transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full bg-[#f5a13b] hover:bg-[#ffb858] text-[#17110a] font-semibold p-3 rounded-lg transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Please wait...' : isLoginView ? 'Sign In' : 'Register'}
                                </button>
                            </form>

                            <p className="text-gray-400 text-center mt-6 text-sm">
                                {isLoginView ? "Don't have an account? " : "Already have an account? "}
                                <button
                                    onClick={() => {
                                        setIsLoginView(!isLoginView);
                                        setError('');
                                    }}
                                    className="text-[#f5a13b] hover:text-[#ffc06b] font-medium">
                                    {isLoginView ? 'Register here' : 'Sign in here'}
                                </button>
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function FeatureCard({ title, description, icon }) {
    return (
        <motion.div
            whileHover={{ y: -12, rotateX: 8, rotateY: -8, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className='relative rounded-xl p-6 bg-gradient-to-br from-[#141516] to-[#0b0c0d] text-white shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] border border-white/10 hover:border-[#d49a54]/40 transition-colors' style={{ transformStyle: "preserve-3d" }}>
            <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-[#f5a13b]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' style={{ transform: "translateZ(1px)" }}/>
                <div className='relative z-10' style={{ transform: "translateZ(30px)" }}>
                    <div className='text-4xl mb-3 text-[#e6a65d]'>{icon}</div>
                    <h3 className='text-lg font-semibold mb-2'>{title}</h3>
                    <p className='text-gray-400 text-sm leading-relaxed'>{description}</p>
                </div>
        </motion.div>
    )
}

export default Auth

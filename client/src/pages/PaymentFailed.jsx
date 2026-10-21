import { useEffect } from 'react'
import { motion } from 'framer-motion';
import { FaTimesCircle } from 'react-icons/fa';
import { getCurrentUser } from '../services/api';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import ThemeToggle from '../components/ThemeToggle';

function PaymentFailed() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        getCurrentUser(dispatch);

        const timer = setTimeout(() => {
            navigate('/');
        }, 5000);
        return () => clearTimeout(timer);
    }, [dispatch, navigate]);
    return (
        <div className='min-h-screen bg-[#08090a] text-white flex flex-col items-center justify-center p-4 gap-4'>
            <div className="absolute right-4 top-4">
                <ThemeToggle />
            </div>
            <BrandLogo className="mb-4" />
            <motion.div initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className='text-6xl text-[#f5a13b]'>
                <FaTimesCircle />
            </motion.div>

            <motion.h1 initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, }}
                className='text-2xl font-bold text-[#ffc06b]'>Payment Failed! Please try again.</motion.h1>

                <motion.p initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className='text-gray-400 text-sm'>
                    Your payment failed. Please try again. You will be redirected to the homepage shortly...
                </motion.p>
        </div>
    )
}

export default PaymentFailed

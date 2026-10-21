import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { serverURL } from '../App';
import { setUserData } from '../redux/userSlice';

function Footer() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
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
        <motion.div initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5 }}
            viewport={{ once: true }}
            className='z-10 max-w-6xl mx-auto mb-6 mt-16 rounded-xl bg-[#111213] backdrop-blur-2xl border border-white/10 shadow-[0_22px_70px_4px_rgba(0,0,0,0.5)] px-6 sm:px-8 py-8'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 items-start'>
                <motion.div
                    whileHover={{ rotateX: 8, rotateY: -8 }}
                    className="flex flex-col gap-4 transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
                    <div className='flex items-center gap-4 cursor-pointer'
                        style={{ transform: "translateZ(30px)" }}>
                        <img src={logo} alt="logo" className="w-10 h-10 rounded-full" />
                        <span className='text-lg font-semibold text-white'
                            style={{ textShadow: "0 6px 18px rgba(0,0,0,0.5)" }}>ExamNotes <span className='text-[#f5a13b]'>AI</span></span>

                    </div>
                    <p className="text-sm text-gray-400 max-w-sm">ExamNotes AI helps students create personalized study materials and prepare for exams.</p>

                </motion.div>
                
                <div className='text-center'>
                    <h1 className="text-lg font-bold text-white mb-4">Quick Links</h1>
                    <ul className="space-y-2 text-sm">
                        <li className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer" onClick={() => navigate('/notes')}>Notes</li>
                        <li className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer" onClick={() => navigate('/history')}>History</li>
                        <li className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer" onClick={() => navigate('/pricing')}>Add Credits</li>
                    </ul>
                </div>
               
               <div className='text-center'>
                    <h1 className="text-lg font-bold text-white mb-4">Support & Account</h1>
                    <ul className="space-y-2 text-sm">
                        <li className="text-red-400 hover:text-red-300 transition-colors duration-300 cursor-pointer" onClick={handleLogout}>SignOut</li>
                        <li className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer" >support@gmail.com</li>
                    </ul>
                </div>

            </div>

        </motion.div>
    )
}

export default Footer

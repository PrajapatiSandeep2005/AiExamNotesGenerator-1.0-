import { useEffect, useState } from 'react'
import { motion } from 'framer-motion';
import { generateNotes } from '../services/api';
import { useDispatch } from 'react-redux';
import { updateCredits, updateDailyAiUsage } from '../redux/userSlice';

function TopicForm({ setResults, setLoading, loading, setError, selectedAiModel = "auto" }) {
    const [topic, setTopic] = useState("");
    const [classLevel, setClassLevel] = useState("");
    const [examType, setExamType] = useState("");
    const [revisionMode, setRevisionMode] = useState(false);
    const [includeDiagrams, setIncludeDiagrams] = useState(false);
    const [includeChart, setIncludeChart] = useState(false);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState("");
    const dispatch = useDispatch();

    const handleSubmit = async () => {
        if (!topic.trim()) {
            setError("Please enter a topic or question.");
            return;
        }

        setError("")
        setProgress(0);
        setProgressText("");
        setLoading(true);
        setResults(null);

        try {
            const result = await generateNotes({
                topic,
                classLevel,
                examType,
                revisionMode,
                includeDiagrams,
                includeChart,
                aiModel: selectedAiModel,
            });
            if (!result?.data) {
                throw new Error(result?.message || "The AI provider did not return notes.");
            }
            setResults(result.data);
            setLoading(false);
            setClassLevel("");
            setTopic("");
            setExamType("");
            setRevisionMode(false);
            setIncludeDiagrams(false);
            setIncludeChart(false);

            if(typeof result.remainingCredits === "number"){
                dispatch(updateCredits(result.remainingCredits));
            }
            dispatch(updateDailyAiUsage({
                dailyAiChatDate: result.dailyAiChatDate,
                dailyAiChatLimit: result.dailyAiChatLimit,
                dailyAiChatsUsed: result.dailyAiChatsUsed,
                dailyAiChatsRemaining: result.dailyAiChatsRemaining,
                dailyAiChatsByProvider: result.dailyAiChatsByProvider,
            }));
        } catch (error) {
            console.error("Error generating notes:", error);
            const responseData = error.response?.data;
            if (typeof responseData?.remainingCredits === "number") {
                dispatch(updateCredits(responseData.remainingCredits));
            }
            if (typeof responseData?.dailyAiChatsRemaining === "number") {
                dispatch(updateDailyAiUsage({
                    dailyAiChatDate: responseData.dailyAiChatDate,
                    dailyAiChatLimit: responseData.dailyAiChatLimit,
                    dailyAiChatsUsed: responseData.dailyAiChatsUsed,
                    dailyAiChatsRemaining: responseData.dailyAiChatsRemaining,
                    dailyAiChatsByProvider: responseData.dailyAiChatsByProvider,
                }));
            }
            setError(responseData?.message || error.message || "Failed to fetch notes. Please try again.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            return;
        }

        let value = 0;

        const interval = setInterval(() => {
            value += Math.random() * 8; // Increment progress by a random value between 0 and 10

            if (value >= 95) {
                value = 95;
                setProgressText("Almost done...");
                clearInterval(interval);
            } else if (value >= 70) {
                setProgressText("Generating detailed notes...");
            } else if (value >= 40) {
                setProgressText("Analyzing the topic...");
            } else {
                setProgressText("Generating notes...");
            }

            setProgress(Math.floor(value));
        }, 700);

          return()=> clearInterval(interval);
    }, [loading])

    return (
        <motion.div initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-xl bg-[#111213] backdrop-blur-2xl border border-[#d49a54]/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-5 sm:p-7 space-y-3 text-white'>
            <input className='w-full p-3 rounded-lg bg-[#171513] border border-[#8b6337]/45 placeholder-[#a08a72] text-white focus:outline-none focus:ring-2 focus:ring-[#f5a13b]/50 focus:border-[#f5a13b]/70' placeholder='Enter your topic or question...' onChange={(e) => setTopic(e.target.value)}
                value={topic} />

            <input className='w-full p-3 rounded-lg bg-[#171513] border border-[#8b6337]/45 placeholder-[#a08a72] text-white focus:outline-none focus:ring-2 focus:ring-[#f5a13b]/50 focus:border-[#f5a13b]/70' placeholder='Enter your class level... (eg : 10th, 12th)' onChange={(e) => setClassLevel(e.target.value)}
                value={classLevel} />

            <input className='w-full p-3 rounded-lg bg-[#171513] border border-[#8b6337]/45 placeholder-[#a08a72] text-white focus:outline-none focus:ring-2 focus:ring-[#f5a13b]/50 focus:border-[#f5a13b]/70' placeholder='Enter your exam type... (eg : CBSE , JEE)' onChange={(e) => setExamType(e.target.value)}
                value={examType} />

            <div className='flex flex-col gap-4 md:flex-row '>
                <Toggle label="Revision Mode" checked={revisionMode} onChange={() => setRevisionMode(!revisionMode)} />
                <Toggle label="Include Diagrams" checked={includeDiagrams} onChange={() => setIncludeDiagrams(!includeDiagrams)} />
                <Toggle label="Include Chart" checked={includeChart} onChange={() => setIncludeChart(!includeChart)} />
            </div>

            <motion.button onClick={handleSubmit}
                whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.95 } : {}} disabled={loading}
                className={`w-full mt-4 py-3 rounded-xl font-semibold  cursor-pointer flex item-center justify-center gap-3 transition  ${loading
                    ? "bg-[#6d6254] text-[#ddd4ca] cursor-not-allowed"
                    : "bg-gradient-to-r from-[#f8aa46] to-[#ed8e28] text-[#1c130a] shadow-[0_8px_25px_rgba(245,161,59,0.16)] hover:brightness-110"}`}>
                {loading ? "Generating Notes..." : "Generate Notes"}

            </motion.button>

            {loading &&
                <div className="mt-4 space-y-2">
                    <div className='w-full h-2 rounded-full bg-white/10 overflow-hidden'>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className='w-full h-2 bg-gradient-to-r from-[#d68125] via-[#ffc06b] to-[#d68125]'>
                                
                        </motion.div>
                    </div>

                    <div className='flex justify-between text-sm text-gray-400'>
                        <span>{progressText}</span>
                        <span>{progress}%</span>
                    </div>

                    <p className='text-xs text-gray-400 text-center'>
                        Note: This may take upto 2-5 minutes. Please don't refresh or close the page.
                    </p>
                </div>
                }

        </motion.div>
    )
}

function Toggle({ label, checked, onChange }) {
    return (
        <div className='flex items-center gap-4 cursor-pointer select-none' onClick={onChange}>
            <motion.div
                animate={{
                    backgroundColor: checked
                        ? "rgba(245, 161, 59, 0.4)"
                        : "rgba(255, 255, 255, 0.1)"
                }}
                transition={{ duration: 0.25 }}
                className='relative w-12 h-6 rounded-full border border-white/20 backdrop-blur-lg'>
                <motion.div layout transition={{ type: "spring", stiffness: 700, damping: 30 }}
                    className='absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-[0_5px_10px_rgba(0,0,0,0.5)]'
                    style={{ left: checked ? "1.6rem" : "0.25rem" }}>

                </motion.div>
            </motion.div>

            <span className={`text-sm transition-colors ${checked ? 'text-[#ffc06b]' : 'text-gray-400'}`}>{label}</span>

        </div>
    )
}
export default TopicForm

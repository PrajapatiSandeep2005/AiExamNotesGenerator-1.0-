import { motion } from 'framer-motion';
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

function RechartSetup({ charts }) {
    if (!charts || charts.length === 0) return null;
    const COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4"];
  return (
    <div className='space-y-8'>
        {charts.map((chart, index) => (
            <motion.div
                key={`${chart.title || "chart"}-${index}`}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.45, delay: index * 0.12 }}
                className='bg-white border border-gray-200 rounded-xl p-4'
            >
                <h4 className='font-semibold text-gray-800 mb-3'>
                    📊 {chart.title}
                </h4>

                <div className='h-72'>
                    <ResponsiveContainer width="100%" height="100%">
                        {chart.type === 'bar' && (
                            <BarChart data={chart.data} dataKey="value">
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={900}>
                                    {chart.data.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        )}

                            {chart.type === 'line' && (
                            <LineChart data={chart.data} dataKey="value">
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} isAnimationActive animationDuration={900} />
                            </LineChart>
                            )}

                            {chart.type === 'pie' && (
                            <PieChart>
                                <Tooltip />
                                <Pie data={chart.data} dataKey="value" nameKey="name" outerRadius={100} label isAnimationActive animationDuration={900}>
                                    {chart.data.map((_, i) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                            )}


                    </ResponsiveContainer>
                </div>

            </motion.div>
        ))}
    </div>
  )
}

export default RechartSetup

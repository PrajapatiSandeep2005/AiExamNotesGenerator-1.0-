import { formatNoteValue } from '../utils/formatNoteValue';

function Sidebar({ results }) {

    if (!results ||
        !results.subTopics ||
        !results.questions ||
        !results.questions.short ||
        !results.questions.long) {
        return null;
    }

    return (
        <div className='bg-[#111213] text-[#eee9e1] rounded-xl p-5 border border-[#d49a54]/25 shadow-sm space-y-6'>
            <div className='flex items-center gap-2'>
                <span className='text-xl'>📌</span>
                <h3 className='text-lg font-semibold text-[#f5a13b]'>Quick Exam View</h3>
            </div>

            <section >
                <p className='text-sm font-semibold text-gray-200 mb-3'>
                    ⭐Sub Topics : Prioritize based
                </p>
                {
                    Object.entries(results.subTopics).map(([star , topics])=>(
                        <div className='mb-4 rounded-lg p-3 bg-[#191817] border border-[#d49a54]/20' key={star}>
                            <p className='text-sm font-semibold text-[#ffc06b] mb-1'>
                                {star} Priority
                            </p>
                            <ul className='list-disc ml-4 text-sm text-gray-300 space-y-1'>
                                {topics.map((topic , i)=>(
                                    <li key={i}>{formatNoteValue(topic)}</li>
                                ))}
                            </ul>
                        </div>
                    ))
                }
            </section>

                <section className='rounded-lg p-3 bg-[#2a2015] border border-[#d49a54]/25'>
                    <p className='text-sm font-semibold text-gray-200 mb-1'>
                        🔥 Important Notes
                    </p>
                    <span className='text-sm font-bold text-[#ffc06b]'>
                        {formatNoteValue(results.importance)}
                    </span>

                    <p className='text-sm font-semibold text-gray-200 mb-3'>
                        ❓ Important Questions
                    </p>

                    <div className='mb-4 rounded-lg p-3 bg-[#191817] border border-[#d49a54]/20'>
                        <p className='text-sm font-semibold text-[#ffc06b] mb-1'>
                                Short Questions
                            </p>
                            <ul className='list-disc ml-4 text-sm text-gray-300 space-y-1'>
                                {results.questions.short.map((question, i) => (
                                    <li key={i}>{formatNoteValue(question)}</li>
                                ))}
                            </ul>
                    </div>

                     <div className='mb-4 rounded-lg p-3 bg-[#191817] border border-[#d49a54]/20'>
                        <p className='text-sm font-semibold text-[#ffc06b] mb-1'>
                                Long Questions
                            </p>
                            <ul className='list-disc ml-4 text-sm text-gray-300 space-y-1'>
                                {results.questions.long.map((question, i) => (
                                    <li key={i}>{formatNoteValue(question)}</li>
                                ))}
                            </ul>
                    </div>

                    <div className='mb-4 rounded-lg p-3 bg-[#191817] border border-[#d49a54]/20'>
                        <p className='text-sm font-semibold text-[#ffc06b] mb-1'>
                                Diagram Questions
                            </p>
                            <ul className='list-disc ml-4 text-sm text-gray-300 space-y-1'>
                                <li>{formatNoteValue(results.questions.diagram)}</li>
                               
                            </ul>
                    </div>
                </section>

        </div>
    )
}

export default Sidebar

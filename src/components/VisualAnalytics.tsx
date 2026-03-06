import React, { useMemo } from 'react';
import { FormSchema, FormSubmission, QuestionType, Question } from '../types';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

interface VisualAnalyticsProps {
    form: FormSchema;
    submissions: FormSubmission[];
}

const COLORS = ['#22d3ee', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

export const VisualAnalytics: React.FC<VisualAnalyticsProps> = ({ form, submissions }) => {

    const processChoiceData = (question: Question) => {
        const counts: Record<string, number> = {};

        // Initialize with options
        question.options?.forEach(opt => {
            counts[opt.label] = 0;
        });

        // Tally submissions
        submissions.forEach(sub => {
            let answer = sub.answers[question.id];
            if (answer) {
                if (Array.isArray(answer)) {
                    answer.forEach(val => {
                        const label = question.options?.find(o => o.id === val)?.label || val;
                        counts[label] = (counts[label] || 0) + 1;
                    });
                } else {
                    const label = question.options?.find(o => o.id === answer)?.label || answer;
                    counts[label] = (counts[label] || 0) + 1;
                }
            }
        });

        return Object.entries(counts).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
    };

    const processRatingData = (question: Question) => {
        const max = question.maxRating || 5;
        const counts: Record<number, number> = {};

        for (let i = 1; i <= max; i++) {
            counts[i] = 0;
        }

        submissions.forEach(sub => {
            const answer = parseInt(sub.answers[question.id], 10);
            if (!isNaN(answer)) {
                counts[answer] = (counts[answer] || 0) + 1;
            }
        });

        return Object.entries(counts).map(([name, value]) => ({
            name: `${name} ${question.ratingIcon || 'Star'}`,
            value
        }));
    };

    if (submissions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center border border-white/5 rounded-2xl bg-white/5">
                <span className="text-4xl mb-4">📊</span>
                <p className="text-slate-400">Waiting for data signals. No submissions yet.</p>
            </div>
        );
    }

    const renderChart = (q: Question) => {
        if (q.type === QuestionType.MULTIPLE_CHOICE || q.type === QuestionType.DROPDOWN || q.type === QuestionType.CHECKBOXES) {
            const data = processChoiceData(q);
            if (data.length === 0) return <p className="text-sm text-slate-500 italic">No valid data</p>;

            return (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        if (q.type === QuestionType.RATING) {
            const data = processRatingData(q);
            if (data.length === 0) return <p className="text-sm text-slate-500 italic">No valid data</p>;

            return (
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: '#1e293b' }}
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                            />
                            <Bar dataKey="value" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            );
        }

        return null;
    };

    const chartableQuestions = form.questions.filter(q =>
        [QuestionType.MULTIPLE_CHOICE, QuestionType.DROPDOWN, QuestionType.CHECKBOXES, QuestionType.RATING].includes(q.type)
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {chartableQuestions.map(q => (
                    <div key={q.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                        <h3 className="text-lg font-bold text-white mb-6 line-clamp-2">{q.label}</h3>
                        {renderChart(q)}
                    </div>
                ))}
            </div>

            {chartableQuestions.length === 0 && (
                <div className="text-center p-12 border border-white/5 rounded-2xl bg-white/5">
                    <p className="text-slate-400">The AI didn't detect any quantifiable questions (choices or ratings) in this form to visualize.</p>
                </div>
            )}
        </div>
    );
};

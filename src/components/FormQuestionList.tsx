import React, { memo } from 'react';
import { Question, QuestionType } from '../types';
import { ICONS } from '../constants';

interface FormQuestionListProps {
  questions: Question[];
  activeQuestionId: string | null;
  themeStyles: any;
  onSetActiveQuestion: (id: string) => void;
  getIconForType: (type: QuestionType) => JSX.Element;
}

const FormQuestionList: React.FC<FormQuestionListProps> = memo(({ 
  questions, 
  activeQuestionId, 
  themeStyles, 
  onSetActiveQuestion,
  getIconForType
}) => {
  return (
    <>
      {questions.map((q, idx) => (
        <div 
          key={q.id} 
          onClick={() => onSetActiveQuestion(q.id)} 
          className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 group relative ${activeQuestionId === q.id ? `${themeStyles.bgTranslucent} ${themeStyles.border} border-opacity-30 ${themeStyles.shadow.replace('20', '10')}` : 'bg-white/5 border-transparent hover:bg-white/10'}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`${activeQuestionId === q.id ? themeStyles.accent : 'text-slate-500'}`}>{getIconForType(q.type)}</span>
                <span className={`text-[10px] font-mono ${activeQuestionId === q.id ? themeStyles.accent : 'text-slate-600'}`}>0{idx + 1}</span>
              </div>
              <p className="text-sm font-medium truncate text-slate-200">{q.label}</p>
            </div>
          </div>
          {activeQuestionId === q.id && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 ${themeStyles.bg} rounded-r-full shadow-[0_0_8px_currentColor]`}></div>}
        </div>
      ))}
    </>
  );
});

export default FormQuestionList;
import React, { memo } from 'react';
import { FormSchema, Question, QuestionType, ThemeOption } from '../../types';
import { ICONS } from '../../constants';
import { getThemeColor } from '../../utils/themeUtils'; // Import the centralized function

interface QuestionListSidebarProps {
  form: FormSchema;
  addQuestion: () => void;
  activeQuestionId: string | null;
  onSetActiveQuestion: (id: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

const getIconForType = (type: QuestionType) => {
  switch (type) {
    case QuestionType.RATING: return <ICONS.Star className="w-4 h-4" />;
    case QuestionType.DATE: return <ICONS.Calendar className="w-4 h-4" />;
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.CHECKBOXES:
    case QuestionType.DROPDOWN: return <ICONS.List className="w-4 h-4" />;
    case QuestionType.SECTION: return <ICONS.Section className="w-4 h-4" />;
    default: return <ICONS.Text className="w-4 h-4" />;
  }
};

const QuestionListSidebar: React.FC<QuestionListSidebarProps> = memo(({ 
  form, 
  addQuestion, 
  activeQuestionId, 
  onSetActiveQuestion,
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  const themeColors = getThemeColor(form.theme);

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed bottom-4 right-4 z-30 p-3 bg-cyan-600 text-white rounded-full shadow-lg hover:bg-cyan-500 transition"
      >
        <ICONS.Menu className="w-5 h-5" />
      </button>
      
      {/* Sidebar */}
      <aside className={`fixed md:relative z-20 md:z-auto w-80 border-r border-white/5 overflow-y-auto bg-dark-900/50 p-4 space-y-3 custom-scrollbar backdrop-blur-sm md:translate-x-0 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:block h-full md:h-auto`}>
          <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest font-display">Structure</h3>
              <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-slate-500">{form.questions.length} Items</span>
          </div>
          {form.questions.map((q, idx) => (
            <div 
              key={q.id} 
              onClick={() => onSetActiveQuestion(q.id)} 
              className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 group relative ${activeQuestionId === q.id ? `${themeColors.bgTranslucent} ${themeColors.border} border-opacity-30 ${themeColors.shadow.replace('20', '10')}` : 'bg-white/5 border-transparent hover:bg-white/10'}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`${activeQuestionId === q.id ? themeColors.accent : 'text-slate-500'}`}>{getIconForType(q.type)}</span>
                    <span className={`text-[10px] font-mono ${activeQuestionId === q.id ? themeColors.accent : 'text-slate-600'}`}>0{idx + 1}</span>
                  </div>
                  <p className="text-sm font-medium truncate text-slate-200">{q.label}</p>
                </div>
              </div>
              {activeQuestionId === q.id && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-8 ${themeColors.bg} rounded-r-full shadow-[0_0_8px_currentColor]`}></div>}
            </div>
          ))}
          <button onClick={addQuestion} className={`w-full py-3 rounded-xl border border-dashed border-white/10 text-slate-400 ${themeColors.accentHover} hover:border-current hover:bg-white/5 transition flex justify-center items-center gap-2 text-sm mt-4 group`}>
              <div className={`p-1 rounded bg-white/5 group-hover:${themeColors.bgTranslucent} transition`}><ICONS.Plus className="w-3 h-3" /></div>
              Add Element
          </button>
      </aside>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-10"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
});

export default QuestionListSidebar;
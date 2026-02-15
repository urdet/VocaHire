import { useState, useEffect } from 'react';
import { 
  Plus, 
  Upload, 
  Bell, 
  Moon, 
  Sun, 
  Languages, 
  MoreVertical, 
  Calendar, 
  Clock,
  ChevronRight,
  Search,
  Settings,
  Archive,
  FileText
} from 'lucide-react';
import ImportModal from './components/ImportFileModal';
import ProcessingModal from './components/Progression';
import {createCandidate, getListId} from './helpers/importSession';
// --- Constants & Translations ---
const translations = {
  en: {
    brand: "VocaHire",
    welcome: "Good morning,",
    name: "Alex",
    startLive: "New Live Session",
    importFile: "Import Interview",
    history: "Recent Sessions",
    notifications: "Notifications",
    theme: "Toggle Theme",
    language: "العربية",
    status: "Completed",
    allSessions: "All sessions",
    searchPlaceholder: "Search interviews...",
    noSessions: "No sessions found in archive.",
    importTitle: "Import Interview Session",
    importDesc: "Fill in the session details and upload your interview file.",
    candidateName: "Candidate Name",
    sessionTitle: "Session Title",
    jobTitle: "Job Title",
    qualities: "Qualities (Tags)",
    uploadFile: "Upload Interview File",
    uploadDesc: "Click to browse or drag and drop",
    cancel: "Cancel",
    confirm: "Import Session",
    processing: "Processing Interview",
    processingDesc: "Our AI is analyzing your interview. This usually takes a few moments.",
    resultTitle: "Analysis Complete",
    resultDesc: "The interview has been processed successfully. Here are the initial scores.",
    close: "Close Report",
    steps: [
      { id: 0, label: "Uploading media files..." },
      { id: 1, label: "Extracting audio track..." },
      { id: 2, label: "Analyzing candidate responses..." },
      { id: 3, label: "Generating quality scores..." },
      { id: 4, label: "Finalizing report..." }
    ]
  },
  ar: {
    brand: "VocaHire",
    welcome: "صباح الخير،",
    name: "أليكس",
    startLive: "جلسة مباشرة جديدة",
    importFile: "استيراد مقابلة",
    history: "الجلسات الأخيرة",
    notifications: "التنبيهات",
    theme: "تبديل المظهر",
    language: "English",
    status: "مكتمل",
    allSessions: "كل الجلسات",
    searchPlaceholder: "بحث عن المقابلات...",
    noSessions: "لم يتم العثور على جلسات.",
    importTitle: "استيراد جلسة مقابلة",
    importDesc: "املأ تفاصيل الجلسة وقم بتحميل ملف المقابلة.",
    candidateName: "اسم المرشح",
    sessionTitle: "عنوان الجلسة",
    jobTitle: "المسمى الوظيفي",
    qualities: "الصفات (علامات)",
    uploadFile: "تحميل ملف المقابلة",
    uploadDesc: "انقر للتصفح أو اسحب وأفلت",
    cancel: "إلغاء",
    confirm: "استيراد الجلسة",
    processing: "جاري معالجة المقابلة",
    processingDesc: "يقوم الذكاء الاصطناعي بتحليل مقابلتك. يستغرق هذا عادةً بضع لحظات.",
    resultTitle: "اكتمل التحليل",
    resultDesc: "تمت معالجة المقابلة بنجاح. إليك النتائج الأولية.",
    close: "إغلاق التقرير",
    steps: [
      { id: 0, label: "جاري رفع الملفات..." },
      { id: 1, label: "جاري استخراج الصوت..." },
      { id: 2, label: "جاري تحليل إجابات المرشح..." },
      { id: 3, label: "جاري إنشاء درجات الجودة..." },
      { id: 4, label: "جاري إتمام التقرير..." }
    ]
  }
};
const MOCK_SESSIONS = [
  { id: 1, title: "Senior Frontend Engineer", candidate: "Sarah Chen", date: "Oct 24, 2023", duration: "45 min", type: "Live" },
  { id: 2, title: "Product Designer", candidate: "Michael Ross", date: "Oct 23, 2023", duration: "30 min", type: "Import" },
  { id: 3, title: "Backend Lead", candidate: "Elena Gomez", date: "Oct 21, 2023", duration: "60 min", type: "Live" },
];

// --- Small Components ---

const NavItem = ({ icon: Icon, label, active, isDarkMode }) => (
  <button className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${active ? (isDarkMode ? 'bg-slate-800 text-slate-100 font-medium' : 'bg-slate-100 text-slate-900 font-medium') : (isDarkMode ? 'text-slate-400 hover:bg-slate-800/50' : 'text-slate-500 hover:bg-slate-50')}`}>
    <Icon size={16} />
    {label}
  </button>
);

const IconButton = ({ icon: Icon, onClick, badge, isDarkMode }) => (
  <button 
    onClick={onClick}
    className={`relative p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
  >
    <Icon size={18} />
    {badge && (
      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
    )}
  </button>
);

const SessionRow = ({ session, lang, isDarkMode }) => (
  <div className={`group flex items-center justify-between py-3 px-2 border-b transition-all cursor-pointer ${isDarkMode ? 'border-slate-800 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-slate-50/50'}`}>
    <div className="flex items-center gap-4 flex-1">
      <div className={isDarkMode ? "text-slate-500" : "text-slate-400"}>
        <FileText size={18} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 w-full">
        <span className={`text-sm font-medium truncate ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{session.title}</span>
        <span className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>{session.candidate}</span>
      </div>
    </div>
    
    <div className="flex items-center gap-8">
      <div className={`hidden sm:flex items-center gap-4 text-xs tabular-nums ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
        <span className="flex items-center gap-1"><Calendar size={12} /> {session.date}</span>
        <span className="flex items-center gap-1"><Clock size={12} /> {session.duration}</span>
      </div>
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
         <button className={`p-1 rounded ${isDarkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-200 text-slate-400'}`}>
            <MoreVertical size={14} />
         </button>
      </div>
    </div>
  </div>
);

// --- Main App ---

export default function Dashboard() {
  const [lang, setLang] = useState('en');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const t = translations[lang];
  const isRtl = lang === 'ar';
  const [userData, setUserData] = useState({});
  const getUserData = () => {
    // get user d from local storage
    const data = localStorage.getItem('userData');
    if (data) {
      setUserData(JSON.parse(data));
    }
  }
  useEffect(() => {

    getUserData();
  }, []);
  useEffect(() => {
    document.dir = isRtl ? 'rtl' : 'ltr';
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [lang, isDarkMode]);
  const handleStartImport = async(data) => {
    setIsImportOpen(false);
    setIsProcessing(true);
    // Create Candidate in CondidateListTable set status to 0
    // get list id
    /** 
    let listId=0;
    let candidateId=0;
    try {
      const listIdResult = await getListId();
      if (!listIdResult.success) {
        alert('Failed to get list ID: ' + listIdResult.message);
        setIsProcessing(false);
        return;
      }
      listId = listIdResult.listId;
      const res = await createCandidate({
        listId: listId,
        candidateOrder: null,
        candidateFullName: data.candidateName,
        infos: {},
        score: null,
        date: new Date().toISOString().split('T')[0],
        status: 0});
      if (!res.success) {
        alert('Failed to create candidate: ' + res.message);
        setIsProcessing(false);
        return;
      } else {
        candidateId = res.candidateId;
      }
    } catch (error) {
      alert('Error during creating candidate: ' + error.message);
    }
    
    // Create session attached with the id of list of candidates and file and data
    try {
      const res = await createSession({
        sessionCode: null,
        type: data.sessionType,
        candidatesListId: listId,
        userId: localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).id : null,
        sessionTitle: data.sessionTitle,
        jobTitle: data.jobTitle || null,
        qualities: data.qualities || null,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      alert('Error during session creation: ' + error.message);
    }*/
    // Upload file on Fast API
    
  };
  const navBarClasses = `flex items-center justify-between px-4 py-2 border-b sticky top-0 backdrop-blur-md z-10 ${isDarkMode ? 'border-slate-800 bg-[#191919]/80' : 'border-slate-100 bg-white/80'}`;
  const mainContainerClasses = `max-w-4xl mx-auto px-6 py-12 ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`;
  const dividerClasses = `h-4 w-[1px] ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`;
  const headerTextClasses = `text-slate-500 text-sm ${isDarkMode ? 'dark:text-slate-400' : ''}`;
  const actionButtonClasses = `flex items-center gap-2 px-4 py-1.5 rounded border text-sm font-medium transition-all ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-slate-300' : 'border-slate-200 hover:bg-slate-50 text-slate-600'}`;

  return (
    <div className={`min-h-screen font-sans selection:bg-blue-100 ${isDarkMode ? 'dark:selection:bg-blue-900/40 bg-[#191919]' : 'bg-white'}`}>
      
      {/* Notion-style Top Bar */}
      <nav className={navBarClasses}>
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 text-sm font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-[10px] text-white">VH</div>
            {t.brand}
          </div>
          <div className={`${dividerClasses} hidden sm:block`}></div>
          <div className="hidden sm:flex items-center gap-1">
             <NavItem icon={Archive} label={t.allSessions} active isDarkMode={isDarkMode} />
             <NavItem icon={Settings} label="Settings" isDarkMode={isDarkMode} />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton icon={Search} isDarkMode={isDarkMode} />
          <IconButton icon={Languages} onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} isDarkMode={isDarkMode} />
          <IconButton icon={isDarkMode ? Sun : Moon} onClick={() => setIsDarkMode(!isDarkMode)} isDarkMode={isDarkMode} />
          <IconButton icon={Bell} badge isDarkMode={isDarkMode} />
        </div>
      </nav>

      <div className={mainContainerClasses}>
        {/* Formal Header */}
        <header className="mb-12">
          <h1 className={`text-3xl font-bold tracking-tight mb-2 ${isDarkMode ? 'text-slate-50' : 'text-slate-900'}`}>
            {t.welcome} {userData.fullname || 'inconnu'}
          </h1>
          <p className={headerTextClasses}>
            Manage your recruitment sessions and candidate evaluations in one workspace.
          </p>
        </header>

        {/* Action Grid - Minimalist */}
        <div className="flex flex-wrap gap-3 mb-16">
          <button className="flex items-center gap-2 px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-all">
            <Plus size={16} />
            {t.startLive}
          </button>
          <button className={actionButtonClasses} onClick={() => setIsImportOpen(true)}>
            <Upload size={16} />
            {t.importFile}
          </button>
        </div>

        {/* Notion-style List Section */}
        <section>
          <div className="flex items-center gap-2 mb-4 group cursor-default">
            <ChevronRight size={16} className={`transition-colors ${isDarkMode ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-300 group-hover:text-slate-500'}`} />
            <h2 className={`text-sm font-semibold uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {t.history}
            </h2>
          </div>

          <div className={`border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            {MOCK_SESSIONS.map(session => (
              <SessionRow key={session.id} session={session} lang={lang} isDarkMode={isDarkMode} />
            ))}
          </div>
        </section>
      </div>
      <ImportModal 
        isOpen={isImportOpen} 
        onClose={() => setIsImportOpen(false)} 
        t={t} 
        isRtl={isRtl} 
        isDarkMode={isDarkMode}
        onConfirm={handleStartImport}
      />
      <ProcessingModal 
        isOpen={isProcessing} 
        onClose={() => setIsProcessing(false)} 
        t={t} 
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './routes/AuthContext';
import { 
  Github, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Globe, 
  Moon, 
  Sun, 
  ArrowRight,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const translations = {
  en: {
    loginTitle: 'Log in',
    loginSubtitle: 'Welcome back to VocaHire',
    signupTitle: 'Create an account',
    signupSubtitle: 'Start your professional journey',
    email: 'Email',
    password: 'Password',
    firstName: 'First name',
    lastName: 'Last name',
    userType: 'Workspace role',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    signIn: 'Continue',
    signUp: 'Sign up',
    noAccount: "New to VocaHire?",
    hasAccount: 'Have an account?',
    or: 'OR',
    terms: 'I agree to the Terms of Service',
    emailPlaceholder: 'Enter your email address...',
    firstNamePlaceholder: 'Enter your first name...',
    lastNamePlaceholder: 'Enter your last name...',
    hr: 'HR / Examiner',
    candidate: 'Candidate',
    heroTitle: 'Hire with clarity.',
    heroDesc: 'The simple, all-in-one workspace for modern recruitment teams and candidates.',
  },
  ar: {
    loginTitle: 'تسجيل الدخول',
    loginSubtitle: 'مرحباً بك في VocaHire',
    signupTitle: 'إنشاء حساب',
    signupSubtitle: 'ابدأ رحلتك المهنية الآن',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    firstName: 'الاسم الأول',
    lastName: 'اسم العائلة',
    userType: 'نوع الحساب',
    remember: 'تذكرني',
    forgot: 'نسيت كلمة المرور؟',
    signIn: 'متابعة',
    signUp: 'إنشاء حساب',
    noAccount: 'جديد في VocaHire؟',
    hasAccount: 'لديك حساب بالفعل؟',
    or: 'أو',
    terms: 'أوافق على شروط الخدمة',
    emailPlaceholder: 'أدخل البريد الإلكتروني...',
    firstNamePlaceholder: 'أدخل الاسم الأول...',
    lastNamePlaceholder: 'أدخل اسم العائلة...',
    hr: 'مسؤول توظيف / ممتحن',
    candidate: 'مرشح / متقدم',
    heroTitle: 'التوظيف بوضوح.',
    heroDesc: 'مساحة العمل المتكاملة والبسيطة لفرق التوظيف والمرشحين المعاصرين.',
  }
};

const NotionIllustration = ({ isDarkMode }) => (
  <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[400px] drop-shadow-sm opacity-90">
    <rect x="100" y="150" width="300" height="200" rx="8" className={`fill-white stroke-[#E9E9E7] ${isDarkMode ? 'fill-[#252525] stroke-[#373737]' : ''}`} strokeWidth="2" />
    <rect x="120" y="180" width="260" height="12" rx="2" className={`fill-[#F1F1F0] ${isDarkMode ? 'fill-[#2F2F2F]' : ''}`} />
    <rect x="120" y="205" width="180" height="12" rx="2" className={`fill-[#F1F1F0] ${isDarkMode ? 'fill-[#2F2F2F]' : ''}`} />
    <rect x="120" y="250" width="260" height="1" className={`fill-[#E9E9E7] ${isDarkMode ? 'fill-[#373737]' : ''}`} />
    <circle cx="130" cy="285" r="15" className={`fill-indigo-50 stroke-indigo-500 ${isDarkMode ? 'fill-indigo-900/20' : ''}`} strokeWidth="1.5" />
    <rect x="155" y="280" width="100" height="10" rx="2" className={`fill-indigo-100 ${isDarkMode ? 'fill-indigo-800/40' : ''}`} />
    <path d="M420 100 C 440 120, 440 150, 420 170" className={`stroke-indigo-300 ${isDarkMode ? 'stroke-indigo-700' : ''}`} strokeWidth="3" strokeLinecap="round" />
    <circle cx="80" cy="120" r="20" className="fill-indigo-500/10 stroke-indigo-500/30" strokeWidth="1" strokeDasharray="4 4" />
  </svg>
);

const Port = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [lang, setLang] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userRole, setUserRole] = useState('');
  const { setIsAuth } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const t = translations[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [lang, darkMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Login request
        const response = await fetch('http://localhost:5000/base-v1/users/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('jwtToken', data.access_token);
          localStorage.setItem('userData', JSON.stringify(data.data));
          setIsAuth(true);
          navigate('/dashboard', { replace: true });
        } else {
          alert(data.message || 'Login failed. Please check your credentials.');
        }
      } else {
        // Signup request with first_name and last_name
        const response = await fetch('http://localhost:5000/base-v1/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            password: formData.password,
            role: userRole,
          }),
        });

        const data = await response.json();
        
        if (response.status === 201) {
          alert('Account created successfully! Please login.');
          setIsLogin(true);
          setFormData({ firstName: '', lastName: '', email: '', password: '' });
          setUserRole('');
        } else {
          alert(data.message || 'Signup failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en');
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const notionInput = `w-full px-3 py-1.5 bg-white border border-[#E9E9E7] rounded-[4px] focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-shadow text-[14px] placeholder:text-[#ADADAB] ${darkMode ? 'bg-[#252525] border-[#373737]' : ''}`;
  const notionLabel = `text-[12px] font-medium mb-1 block ${darkMode ? 'text-[#9B9B9B]' : 'text-[#73726E]'}`;
  const notionButtonPrimary = `w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[4px] font-medium text-[14px] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm ${darkMode ? 'bg-indigo-500 hover:bg-indigo-600' : ''}`;
  const notionButtonSecondary = `flex items-center justify-center gap-2 py-1.5 px-4 border rounded-[4px] hover:bg-[#F1F1F0] transition-colors text-[14px] font-medium ${darkMode ? 'border-[#373737] hover:bg-[#2F2F2F] text-[#E3E3E3]' : 'border-[#E9E9E7] text-[#37352F]'}`;

  return (
    <div className={`min-h-screen font-sans selection:bg-indigo-100 transition-colors duration-200 ${darkMode ? 'bg-[#191919] text-[#E3E3E3]' : 'bg-white text-[#37352F]'}`}>
      
      <nav className="fixed top-0 w-full p-4 flex justify-between items-center z-50">
        <div className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-colors group ${darkMode ? 'hover:bg-[#2F2F2F]' : 'hover:bg-[#F1F1F0]'}`}>
          <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-white shadow-sm">
            <Sparkles size={12} fill="currentColor" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight">VocaHire</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button 
            onClick={toggleLang} 
            className={`px-2 py-1.5 rounded text-[13px] font-medium transition-colors ${darkMode ? 'hover:bg-[#2F2F2F]' : 'hover:bg-[#F1F1F0]'}`}
          >
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
          <button 
            onClick={toggleDarkMode} 
            className={`p-2 rounded transition-colors ${darkMode ? 'hover:bg-[#2F2F2F]' : 'hover:bg-[#F1F1F0]'}`}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>

      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-[900px] grid md:grid-cols-2 gap-12 items-center">
          
          {/* Visual Content (Illustration) */}
          <div className="hidden md:flex flex-col items-center justify-center text-center px-8 animate-in fade-in slide-in-from-left-4 duration-700">
            <NotionIllustration isDarkMode={darkMode} />
            <div className="mt-8">
              <h2 className={`text-[24px] font-bold tracking-tight mb-2 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                {t.heroTitle}
              </h2>
              <p className={`text-[14px] leading-relaxed max-w-[300px] ${darkMode ? 'text-[#9B9B9B]' : 'text-[#73726E]'}`}>
                {t.heroDesc}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="w-full max-w-[340px] mx-auto animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="mb-8 md:text-start text-center">
              <h1 className="text-[28px] font-bold tracking-tight mb-2">
                {isLogin ? t.loginTitle : t.signupTitle}
              </h1>
              <p className={`text-[14px] ${darkMode ? 'text-[#9B9B9B]' : 'text-[#73726E]'}`}>
                {isLogin ? t.loginSubtitle : t.signupSubtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <label className={notionLabel}>{t.firstName}</label>
                    <input 
                      type="text" 
                      name="firstName"
                      placeholder={t.firstNamePlaceholder} 
                      className={notionInput} 
                      required 
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className={notionLabel}>{t.lastName}</label>
                    <input 
                      type="text" 
                      name="lastName"
                      placeholder={t.lastNamePlaceholder} 
                      className={notionInput} 
                      required 
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className={notionLabel}>{t.userType}</label>
                    <div className="relative">
                      <select 
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value)}
                        className={`${notionInput} appearance-none cursor-pointer ${userRole === '' ? 'text-[#ADADAB]' : ''}`}
                        required
                      >
                        <option value="" disabled>{lang === 'en' ? 'Select...' : 'اختر...'}</option>
                        <option value="recruiter">{t.hr}</option>
                        <option value="candidate">{t.candidate}</option>
                      </select>
                      <ChevronDown size={14} className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 pointer-events-none text-[#ADADAB]`} />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className={notionLabel}>{t.email}</label>
                <input 
                  type="email" 
                  name="email"
                  placeholder={t.emailPlaceholder} 
                  className={notionInput} 
                  required 
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className={notionLabel + " mb-0"}>{t.password}</label>
                  {isLogin && (
                    <button 
                      type="button" 
                      className={`text-[11px] transition-colors ${darkMode ? 'text-[#9B9B9B] hover:text-indigo-400' : 'text-[#73726E] hover:text-indigo-600'}`}
                    >
                      {t.forgot}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="password"
                    placeholder="••••••••"
                    className={notionInput}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-[#ADADAB] ${darkMode ? 'hover:text-white' : 'hover:text-[#37352F]'}`}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button disabled={isLoading} className={notionButtonPrimary}>
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLogin ? t.signIn : t.signUp}
                    <ArrowRight size={14} className={isRTL ? "rotate-180" : ""} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 space-y-4">
              <div className="relative">
                <div className={`absolute inset-0 flex items-center ${darkMode ? 'border-[#373737]' : 'border-[#E9E9E7]'}`}>
                  <div className={`w-full border-t ${darkMode ? 'border-[#373737]' : 'border-[#E9E9E7]'}`}></div>
                </div>
                <div className={`relative flex justify-center text-[10px] font-bold uppercase tracking-widest text-[#ADADAB] ${darkMode ? 'bg-[#191919]' : 'bg-white'}`}>
                  <span className="px-3">{t.or}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button className={notionButtonSecondary}>
                  <Github size={16} />
                  <span className="flex-1 text-center">Continue with Github</span>
                </button>
                <button className={notionButtonSecondary}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  <span className="flex-1 text-center">Continue with Google</span>
                </button>
              </div>

              <div className="pt-4 text-center">
                <p className={`text-[14px] ${darkMode ? 'text-[#9B9B9B]' : 'text-[#73726E]'}`}>
                  {isLogin ? t.noAccount : t.hasAccount}{' '}
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className={`font-semibold hover:underline underline-offset-2 ml-1 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}
                  >
                    {isLogin ? t.signUp : t.signIn}
                  </button>
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className={`fixed bottom-6 w-full text-center text-[11px] font-medium tracking-tight pointer-events-none ${darkMode ? 'text-[#9B9B9B]' : 'text-[#ADADAB]'}`}>
        &copy; 2026 VOCAHIRE &nbsp;•&nbsp; PRIVACY &nbsp;•&nbsp; TERMS
      </footer>
    </div>
  );
};

export default Port;
import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

const translations = {
  en: {
    loginTitle: 'Welcome Back',
    loginSubtitle: 'Enter your details to access your account',
    signupTitle: 'Create Account',
    signupSubtitle: 'Join us and start your journey today',
    email: 'Email Address',
    password: 'Password',
    fullName: 'Full Name',
    remember: 'Remember me',
    forgot: 'Forgot password?',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    or: 'Or continue with',
    terms: 'I agree to the Terms and Conditions',
    emailPlaceholder: 'name@company.com',
    namePlaceholder: 'John Doe',
  },
  ar: {
    loginTitle: 'مرحباً بعودتك',
    loginSubtitle: 'أدخل بياناتك للوصول إلى حسابك',
    signupTitle: 'إنشاء حساب',
    signupSubtitle: 'انضم إلينا وابدأ رحلتك اليوم',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    fullName: 'الاسم الكامل',
    remember: 'تذكرني',
    forgot: 'نسيت كلمة المرور؟',
    signIn: 'تسجيل الدخول',
    signUp: 'إنشاء حساب',
    noAccount: 'ليس لديك حساب؟',
    hasAccount: 'لديك حساب بالفعل؟',
    or: 'أو الاستمرار عبر',
    terms: 'أوافق على الشروط والأحكام',
    emailPlaceholder: 'name@company.com',
    namePlaceholder: 'فلان الفلاني',
  }
};

const Port = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [lang, setLang] = useState('en');
  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    document.dir = isRTL ? 'rtl' : 'ltr';
  }, [lang]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => setIsLoading(false), 2000);
  };

  const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : 'en');
  const toggleDarkMode = () => setDarkMode(!darkMode);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Navigation Controls */}
      <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-indigo-600 dark:text-indigo-400">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <Lock size={20} />
          </div>
          <span>VocaHire</span>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={toggleLang}
            className={`p-2 px-4 rounded-full transition-colors flex items-center gap-2
                ${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-200"}
            `}
            >
            <Globe size={20} />
            <span className="text-sm font-medium">
                {lang === "en" ? "العربية" : "English"}
            </span>
        </button>

          
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-colors
                ${darkMode ? "hover:bg-slate-800" : "hover:bg-slate-200"}
            `}
            >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

        </div>
      </nav>

      <main className="flex min-h-screen items-center justify-center p-4 pt-20">
        <div
        className={`w-full max-w-[1000px] grid lg:grid-cols-2 rounded-[2.5rem] shadow-2xl shadow-indigo-500/10 overflow-hidden border transition-colors
            ${darkMode 
            ? "bg-slate-900 border-slate-800" 
            : "bg-white border-slate-200"}
        `}
        >          
          {/* Form Side */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 tracking-tight">
                {isLogin ? t.loginTitle : t.signupTitle}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                {isLogin ? t.loginSubtitle : t.signupSubtitle}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold px-1">{t.fullName}</label>
                  <div className="relative group">
                    <User className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors`} size={18} />
                    <input
                        type="text"
                        placeholder={t.namePlaceholder}
                        required
                        className={`w-full py-3 border-none rounded-2xl outline-none transition-all
                            ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}
                            ${darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"}
                            focus:ring-2 focus:ring-indigo-500
                        `}
                        />

                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold px-1">{t.email}</label>
                <div className="relative group">
                  <Mail className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors`} size={18} />
                  <input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    required
                    className={`w-full py-3 border-none rounded-2xl outline-none transition-all
                        ${isRTL ? "pr-11 pl-4" : "pl-11 pr-4"}
                        ${darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"}
                        focus:ring-2 focus:ring-indigo-500
                    `}
                    />

                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between px-1">
                  <label className="text-sm font-semibold">{t.password}</label>
                  {isLogin && <button type="button" className="text-xs text-indigo-500 font-bold hover:underline">{t.forgot}</button>}
                </div>
                <div className="relative group">
                  <Lock className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors`} size={18} />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    className={`w-full py-3 border-none rounded-2xl outline-none transition-all
                        ${isRTL ? "pr-11 pl-12" : "pl-11 pr-12"}
                        ${darkMode ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-900"}
                        focus:ring-2 focus:ring-indigo-500
                    `}
                    
                    />

                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors`}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" id="remember" />
                <label htmlFor="remember" className="text-sm text-slate-500 dark:text-slate-400 cursor-pointer">
                  {isLogin ? t.remember : t.terms}
                </label>
              </div>

              <button 
                disabled={isLoading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold transition-all transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLogin ? t.signIn : t.signUp}
                    {isRTL ? <ArrowRight size={20} className="rotate-180" /> : <ArrowRight size={20} />}
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center space-y-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <div
                    className={`w-full border-t
                        ${darkMode ? "border-slate-800" : "border-slate-200"}
                    `}
                    />
                </div>

                <div className="relative flex justify-center text-xs uppercase">
                    <span
                    className={`px-4
                        ${darkMode ? "bg-slate-900 text-slate-400" : "bg-white text-slate-500"}
                    `}
                    >
                    {t.or}
                    </span>
                </div>
            </div>


              <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium">
                  <Github size={18} /> Github
                </button>
                <button className="flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium">
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
              </div>

              <p className="text-slate-500 dark:text-slate-400">
                {isLogin ? t.noAccount : t.hasAccount}{' '}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline ml-1"
                >
                  {isLogin ? t.signUp : t.signIn}
                </button>
              </p>
            </div>
          </div>

          {/* Visual Side */}
          <div className="hidden lg:flex relative bg-indigo-600 p-12 flex-col justify-between overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white mb-8">
                <CheckCircle2 size={24} />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
                Empowering your digital transformation journey.
              </h2>
              <p className="text-indigo-100 text-lg opacity-80">
                Manage your projects, collaborate with your team, and accelerate your growth with our all-in-one platform.
              </p>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-400 flex items-center justify-center font-bold">JD</div>
                <div>
                  <p className="text-white font-medium text-sm">"The best workflow tool I've ever used."</p>
                  <p className="text-indigo-200 text-xs">Jane Doe, CEO at TechFlow</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${i === (isLogin ? 1 : 2) ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}></div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Port;
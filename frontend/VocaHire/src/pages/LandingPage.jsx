import { ArrowRight, BarChart3, Brain, CheckCircle2, Globe, Mic, ShieldCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const features = [
  {
    icon: <Mic className="h-5 w-5" />,
    title: 'Analyse vocale intelligente',
    description: 'Importez ou enregistrez les entretiens, puis laissez VocaHire extraire les signaux clés.',
  },
  {
    icon: <Brain className="h-5 w-5" />,
    title: 'Evaluation assistée par IA',
    description: 'Obtenez des scores lisibles sur la clarté, la confiance, la fluidité et la pertinence.',
  },
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Gestion des candidats',
    description: 'Centralisez les profils, les sessions, les résultats et les suivis dans un seul espace.',
  },
];

const metrics = [
  { value: '4', label: 'Sessions importées' },
  { value: '11', label: 'Candidats suivis' },
  { value: '3', label: 'Analyses prêtes' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem('jwtToken'));

  const goToSignup = () => {
    navigate('/login', { state: { mode: 'signup' } });
  };

  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(79,70,229,0.35),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.22),transparent_32%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-3 text-left"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-indigo-700 shadow-lg shadow-indigo-950/30">
              VH
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">VocaHire</div>
              <div className="text-xs text-slate-300">Voice intelligence for hiring</div>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => (isAuthenticated ? navigate('/dashboard') : goToSignup())}
              className="rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-slate-100"
            >
              {isAuthenticated ? 'Ouvrir le tableau' : 'Commencer'}
            </button>
          </div>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.02fr_0.98fr] lg:py-10">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              <Globe className="h-4 w-4 text-sky-300" />
              Plateforme RH pour entretiens modernes
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              Recrutez avec plus de clarté.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              VocaHire aide les équipes RH à organiser les sessions, analyser les entretiens vocaux
              et comparer les candidats avec des résultats simples à comprendre.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => (isAuthenticated ? navigate('/dashboard') : goToSignup())}
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-500 px-6 py-4 text-sm font-bold shadow-xl shadow-indigo-950/40 transition hover:-translate-y-0.5 hover:bg-indigo-400"
              >
                {isAuthenticated ? 'Accéder à mon espace' : 'Créer un compte gratuit'}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-6 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15"
              >
                Se connecter
              </button>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {metrics.map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <div className="text-2xl font-black">{item.value}</div>
                  <div className="mt-1 text-xs text-slate-300">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[2.5rem] bg-indigo-500/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="rounded-[1.5rem] bg-slate-950/80 p-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="text-sm text-slate-400">Session active</div>
                    <div className="mt-1 text-xl font-bold">UX Designer</div>
                  </div>
                  <div className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-300">
                    Completed
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {[
                    ['Sarah BENALI', 92, 'Très forte adéquation'],
                    ['Rida ELANTARI', 55, 'A revoir'],
                    ['Hamza EL MANOUZI', 48, 'Analyse incomplète'],
                  ].map(([name, score, note]) => (
                    <div key={name} className="rounded-2xl bg-white/[0.06] p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{name}</div>
                          <div className="text-xs text-slate-400">{note}</div>
                        </div>
                        <div className="text-2xl font-black text-sky-300">{score}</div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-400"
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 pb-8 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-3xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-200">
                {feature.icon}
              </div>
              <h2 className="text-lg font-bold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{feature.description}</p>
            </article>
          ))}
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 py-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <div>© 2026 VocaHire. Built for clearer hiring decisions.</div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Données protégées</span>
            <span className="inline-flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Scores lisibles</span>
            <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Workflow simple</span>
          </div>
        </footer>
      </div>
    </main>
  );
}

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const demoAccounts = [
  { role: "Admin",      email: "oscarnyavor99@gmail.com",              password: "admin123", icon: "ri-shield-star-line",      color: "#7c3aed", bg: "#f5f3ff", border: "#ddd6fe" },
  { role: "Teacher",    email: "teacher.demo.schooltest@gmail.com",    password: "admin123", icon: "ri-user-star-line",         color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { role: "Accountant", email: "accountant.demo.schooltest@gmail.com", password: "admin123", icon: "ri-money-dollar-circle-line",color: "#d97706", bg: "#fffbeb", border: "#fde68a" },
  { role: "Secretary",  email: "secretary.demo.schooltest@gmail.com",  password: "admin123", icon: "ri-customer-service-2-line", color: "#db2777", bg: "#fdf2f8", border: "#fbcfe8" },
  { role: "Parent",     email: "parent.demo.schooltest@gmail.com",     password: "admin123", icon: "ri-heart-line",             color: "#059669", bg: "#f0fdf4", border: "#a7f3d0" },
];

const floatingIcons = [
  { icon: "ri-book-open-line",        color: "#a78bfa", size: "text-xl",  top: "18%",  left: "12%",  delay: "0s",    duration: "7s"  },
  { icon: "ri-graduation-cap-line",   color: "#34d399", size: "text-2xl", top: "55%",  left: "6%",   delay: "1.2s",  duration: "9s"  },
  { icon: "ri-pencil-ruler-2-line",   color: "#fbbf24", size: "text-lg",  top: "30%",  left: "72%",  delay: "0.5s",  duration: "8s"  },
  { icon: "ri-bar-chart-grouped-line",color: "#60a5fa", size: "text-xl",  top: "70%",  left: "65%",  delay: "2s",    duration: "10s" },
  { icon: "ri-team-line",             color: "#f472b6", size: "text-lg",  top: "80%",  left: "22%",  delay: "1.6s",  duration: "7s"  },
  { icon: "ri-calendar-event-line",   color: "#38bdf8", size: "text-base",top: "12%",  left: "55%",  delay: "0.9s",  duration: "11s" },
  { icon: "ri-flask-line",            color: "#fb923c", size: "text-base",top: "45%",  left: "85%",  delay: "2.4s",  duration: "8s"  },
  { icon: "ri-music-2-line",          color: "#c084fc", size: "text-sm",  top: "88%",  left: "78%",  delay: "1.8s",  duration: "9s"  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (session) navigate("/"); }, [session, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return;
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes drift {
          0%   { transform: translateY(0px)   rotate(0deg)   scale(1); }
          25%  { transform: translateY(-22px) rotate(6deg)   scale(1.08); }
          50%  { transform: translateY(-10px) rotate(-4deg)  scale(0.95); }
          75%  { transform: translateY(-30px) rotate(3deg)   scale(1.05); }
          100% { transform: translateY(0px)   rotate(0deg)   scale(1); }
        }
        @keyframes iconGlow {
          0%, 100% { opacity: 0.25; filter: blur(0px); }
          50%       { opacity: 0.65; filter: blur(0.5px); }
        }
        @keyframes gridPulse {
          0%, 100% { opacity: 0.06; }
          50%       { opacity: 0.13; }
        }
        @keyframes beam {
          0%   { transform: translateY(100%) rotate(-30deg); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(-200%) rotate(-30deg); opacity: 0; }
        }
        .icon-float { animation: drift var(--dur,8s) ease-in-out infinite; }
        .icon-glow  { animation: iconGlow var(--dur,8s) ease-in-out infinite; }
        .grid-bg    { animation: gridPulse 4s ease-in-out infinite; }
        .light-beam { animation: beam 6s ease-in-out infinite; }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes orb {
          0%, 100% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.15) translate(10px, -10px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .login-left {
          background: linear-gradient(135deg, #1e1040, #3b0764, #4c1d95, #2e1065, #0f172a);
          background-size: 400% 400%;
          animation: gradientShift 10s ease infinite;
        }
        .slide-up { animation: slideUp 0.6s cubic-bezier(.22,1,.36,1) both; }
        .fade-in { animation: fadeIn 0.8s ease both; }
        .orb-pulse { animation: orb 7s ease-in-out infinite; }
        .ring-spin { animation: spin-slow 18s linear infinite; }
      `}</style>

      <div className="min-h-screen flex">
        {/* ── Left brand panel ── */}
        <div className="login-left hidden lg:flex flex-col w-[52%] relative overflow-hidden px-14 py-12">
          {/* Decorative blobs */}
          <div className="absolute top-[-80px] left-[-80px] w-[380px] h-[380px] rounded-full bg-violet-600/20 blur-[80px] orb-pulse pointer-events-none" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[300px] h-[300px] rounded-full bg-indigo-500/20 blur-[70px] orb-pulse pointer-events-none" style={{ animationDelay: "3s" }} />
          <div className="absolute top-[40%] right-[-40px] w-[200px] h-[200px] rounded-full bg-fuchsia-600/15 blur-[60px] pointer-events-none" />

          {/* Spinning ring */}
          <div className="absolute top-[15%] right-[8%] w-48 h-48 rounded-full border border-violet-400/20 ring-spin pointer-events-none" />
          <div className="absolute top-[15%] right-[8%] w-36 h-36 m-6 rounded-full border border-violet-400/15 ring-spin pointer-events-none" style={{ animationDirection: "reverse", animationDuration: "12s" }} />

          {/* Logo */}
          <div className={`flex items-center gap-3 mb-auto ${mounted ? "slide-up" : "opacity-0"}`} style={{ animationDelay: "0.1s" }}>
            <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
              <i className="ri-school-line text-white text-xl"></i>
            </div>
            <div>
              <p className="text-white font-bold text-lg tracking-tight">EduManage</p>
              <p className="text-white/50 text-xs">School Intelligence Platform</p>
            </div>
          </div>

          {/* Hero text */}
          <div className="my-10 relative z-10">
            <div className={`${mounted ? "slide-up" : "opacity-0"}`} style={{ animationDelay: "0.25s" }}>
              <p className="text-[10px] font-bold tracking-[0.2em] text-violet-300/80 uppercase mb-4">Welcome back</p>
              <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-5">
                Manage your<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-fuchsia-300 to-indigo-300">
                  school smarter.
                </span>
              </h1>
              <p className="text-white/55 text-sm leading-relaxed max-w-sm">
                One dashboard for attendance, grades, fees, events, and every part of daily school life.
              </p>
            </div>

            {/* Abstract live wallpaper */}
            <div className="mt-10 relative w-full max-w-sm h-52 rounded-3xl overflow-hidden border border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
              {/* Dot grid */}
              <div
                className="grid-bg absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(167,139,250,0.6) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />

              {/* Sweeping light beams */}
              <div className="light-beam absolute w-16 h-[200%] left-[20%] top-0 pointer-events-none"
                style={{ background: "linear-gradient(180deg, transparent, rgba(167,139,250,0.12), transparent)", animationDelay: "0s" }} />
              <div className="light-beam absolute w-10 h-[200%] left-[60%] top-0 pointer-events-none"
                style={{ background: "linear-gradient(180deg, transparent, rgba(99,102,241,0.10), transparent)", animationDelay: "2.5s" }} />

              {/* Glowing orbs inside card */}
              <div className="absolute top-[20%] left-[15%] w-20 h-20 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)", filter: "blur(8px)", animation: "orb 5s ease-in-out infinite" }} />
              <div className="absolute bottom-[15%] right-[10%] w-16 h-16 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(52,211,153,0.3), transparent 70%)", filter: "blur(8px)", animation: "orb 7s ease-in-out infinite", animationDelay: "2s" }} />
              <div className="absolute top-[50%] right-[30%] w-12 h-12 rounded-full pointer-events-none"
                style={{ background: "radial-gradient(circle, rgba(251,191,36,0.25), transparent 70%)", filter: "blur(6px)", animation: "orb 9s ease-in-out infinite", animationDelay: "1s" }} />

              {/* Floating school icons */}
              {floatingIcons.map((fi) => (
                <div
                  key={fi.icon}
                  className="icon-float absolute pointer-events-none"
                  style={{
                    top: fi.top, left: fi.left,
                    "--dur": fi.duration,
                    animationDelay: fi.delay,
                  } as React.CSSProperties}
                >
                  <div className="relative">
                    <div
                      className="icon-glow absolute inset-0 rounded-xl blur-md"
                      style={{ background: fi.color, "--dur": fi.duration, animationDelay: fi.delay } as React.CSSProperties}
                    />
                    <div className="relative w-9 h-9 flex items-center justify-center rounded-xl border border-white/15"
                      style={{ background: `${fi.color}1a` }}>
                      <i className={`${fi.icon} ${fi.size}`} style={{ color: fi.color }}></i>
                    </div>
                  </div>
                </div>
              ))}

              {/* Centre badge */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-1.5 bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl px-5 py-3">
                  <i className="ri-shield-check-line text-violet-300 text-xl"></i>
                  <p className="text-white/80 text-xs font-semibold tracking-wide">Secure Access Only</p>
                  <p className="text-white/35 text-[10px]">Data visible after login</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom quote */}
          <div className={`mt-auto ${mounted ? "fade-in" : "opacity-0"}`} style={{ animationDelay: "0.9s" }}>
            <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3.5">
              <i className="ri-double-quotes-l text-violet-400/70 text-2xl flex-shrink-0 -mt-1"></i>
              <div>
                <p className="text-white/70 text-xs leading-relaxed italic">Streamlined school operations, real-time insights, and a team that can finally focus on what matters — the students.</p>
                <p className="text-white/40 text-[10px] mt-2 font-semibold">— School Administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right login panel ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-white relative">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-violet-600">
              <i className="ri-school-line text-white text-base"></i>
            </div>
            <p className="font-bold text-slate-800 text-lg">EduManage</p>
          </div>

          <div className={`w-full max-w-[400px] ${mounted ? "slide-up" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-2xl font-black text-slate-900 mb-1.5">Sign in to your account</h2>
              <p className="text-slate-400 text-sm">Enter your credentials to access the dashboard.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                <i className="ri-error-warning-line text-rose-500 text-sm mt-0.5 flex-shrink-0"></i>
                <p className="text-xs text-rose-600 leading-relaxed">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address</label>
                <div className="relative">
                  <i className="ri-mail-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu"
                    required
                    autoComplete="email"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600">Password</label>
                  <button type="button" className="text-xs text-violet-600 hover:text-violet-700 font-medium cursor-pointer">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <i className="ri-lock-line absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                  >
                    <i className={showPassword ? "ri-eye-off-line text-sm" : "ri-eye-line text-sm"}></i>
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="remember" className="w-4 h-4 accent-violet-600 cursor-pointer rounded" />
                <label htmlFor="remember" className="text-xs text-slate-500 cursor-pointer select-none">Keep me signed in</label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-sm font-bold shadow-lg shadow-violet-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-violet-300 hover:shadow-xl active:scale-[.98] cursor-pointer mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign in
                    <i className="ri-arrow-right-line"></i>
                  </span>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-slate-100"></div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Demo Accounts</p>
                <div className="flex-1 h-px bg-slate-100"></div>
              </div>
              <p className="text-[11px] text-slate-400 text-center mb-3">Click a role to auto-fill credentials · Password: <span className="font-semibold text-slate-500">admin123</span></p>
              <div className="grid grid-cols-1 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => { setEmail(acc.email); setPassword(acc.password); setError(null); }}
                    className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer hover:shadow-sm text-left"
                    style={{ background: acc.bg, borderColor: acc.border }}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: acc.color + "20" }}>
                      <i className={`${acc.icon} text-sm`} style={{ color: acc.color }}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700">{acc.role}</p>
                      <p className="text-[10px] text-slate-400 truncate">{acc.email}</p>
                    </div>
                    <i className="ri-arrow-right-s-line text-slate-300 text-sm flex-shrink-0"></i>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom badge */}
          <p className="absolute bottom-5 text-[10px] text-slate-300 text-center">
            © {new Date().getFullYear()} EduManage · All rights reserved
          </p>
        </div>
      </div>
    </>
  );
}

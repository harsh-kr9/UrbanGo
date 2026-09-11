import React, { useState, useEffect, useRef } from 'react';
import { CloudRain, Compass, Layers, ArrowRight, Lock, UserPlus, Building2, Eye, Sparkles, CheckCircle2, Navigation2, Sun, Moon, ShieldCheck, Landmark, LogOut } from 'lucide-react';
import { CITIES } from '../data/metroDatasets';

export interface UserProfile {
  email: string;
  name?: string;
  department?: string;
  isMunicipalOfficial?: boolean;
}

export interface LandingPageProps {
  onLaunchDashboard: () => void;
  themeMode?: 'dark' | 'light';
  onToggleTheme?: () => void;
  currentUser?: UserProfile | null;
  onLoginSuccess?: (user: UserProfile) => void;
  onLogout?: () => void;
  autoOpenMunicipalLogin?: boolean;
}

// Basic Minimal Interactive Water Spotlight & Soft Ripple Canvas
export const WaterFluidInteractiveCanvas: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = width / 2;
    let targetMouseY = height / 2;

    // Minimal Click Ripples
    interface SimpleRipple {
      x: number;
      y: number;
      radius: number;
      opacity: number;
    }
    const ripples: SimpleRipple[] = [];

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleClick = (e: MouseEvent) => {
      ripples.push({
        x: e.clientX,
        y: e.clientY,
        radius: 4,
        opacity: 0.6
      });
      if (ripples.length > 12) ripples.shift();
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);

    const render = () => {
      // Smooth subtle mouse lag
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      ctx.clearRect(0, 0, width, height);

      const primaryColor = isDarkMode ? '0, 180, 216' : '2, 132, 199';

      // 1. Basic Soft Radial Mouse Glow
      const glowGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 320);
      glowGrad.addColorStop(0, `rgba(${primaryColor}, ${isDarkMode ? '0.15' : '0.10'})`);
      glowGrad.addColorStop(0.5, `rgba(${primaryColor}, ${isDarkMode ? '0.04' : '0.02'})`);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Minimal Click Water Ripple Rings
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rip = ripples[i];
        rip.radius += 0.8;
        rip.opacity *= 0.96;

        if (rip.opacity <= 0.02 || rip.radius > 75) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${primaryColor}, ${rip.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isDarkMode]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-500" />;
};

export const LandingPage: React.FC<LandingPageProps> = ({
  onLaunchDashboard,
  themeMode: propsThemeMode,
  onToggleTheme,
  currentUser,
  onLoginSuccess,
  onLogout,
  autoOpenMunicipalLogin
}) => {
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authType, setAuthType] = useState<'municipal' | 'login' | 'signup'>('municipal');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [municipalDept, setMunicipalDept] = useState<string>('Kolkata Municipal Corporation (KMC)');

  useEffect(() => {
    if (autoOpenMunicipalLogin) {
      setAuthType('municipal');
      setShowAuthModal(true);
    }
  }, [autoOpenMunicipalLogin]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAuthModal(false);

    let userToSave: UserProfile;

    if (authType === 'municipal') {
      const emailToUse = authEmail.trim() || 'kmc.official@kolkata.gov.in';
      const nameToUse = authName.trim() || 'Municipal Official';
      userToSave = {
        email: emailToUse,
        name: nameToUse,
        department: municipalDept,
        isMunicipalOfficial: true
      };
    } else {
      const emailToUse = authEmail.trim() || (authType === 'login' ? 'admin@urbango.in' : 'user@example.com');
      const nameToUse = authName.trim() || 'User';
      userToSave = {
        email: emailToUse,
        name: nameToUse,
        isMunicipalOfficial: false
      };
    }

    if (onLoginSuccess) {
      onLoginSuccess(userToSave);
    } else {
      onLaunchDashboard();
    }
  };

  // Local state fallback if prop is not provided
  const [localThemeMode, setLocalThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('urbango_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
  });

  const activeTheme = propsThemeMode || localThemeMode;
  const handleToggle = onToggleTheme || (() => {
    setLocalThemeMode(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('urbango_theme', next);
      return next;
    });
  });

  const isDark = activeTheme === 'dark';

  return (
    <div className={`min-h-screen w-full font-poppins overflow-x-hidden relative transition-colors duration-300 selection:bg-[#00B4D8] selection:text-[#0A192F] ${
      isDark ? 'bg-[#0A192F] text-[#F4F7F6]' : 'bg-[#F4F7F6] text-[#0A192F]'
    }`}>
      
      {/* Interactive Water & Flood Background Canvas */}
      <WaterFluidInteractiveCanvas isDarkMode={isDark} />

      {/* 1. Header Navigation */}
      <header className={`relative z-20 border-b px-6 py-4 backdrop-blur-md transition-colors duration-300 ${
        isDark ? 'border-[#00B4D8]/20 bg-[#0A192F]/90' : 'border-[#00B4D8]/30 bg-[#ffffff]/90 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo with Montserrat Typography */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#00B4D8] text-[#0A192F] shadow-lg shadow-[#00B4D8]/30">
              <CloudRain className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-2xl font-black tracking-tight font-montserrat ${isDark ? 'text-[#F4F7F6]' : 'text-[#0A192F]'}`}>
                  UrbanGo
                </span>
                <span className="rounded bg-[#00B4D8]/20 px-2 py-0.5 text-[10px] font-extrabold text-[#00B4D8] border border-[#00B4D8]/40 uppercase tracking-wider font-montserrat">
                  1D-2D Coupled Engine
                </span>
              </div>
              <p className={`text-xs font-poppins ${isDark ? 'text-[#F4F7F6]/70' : 'text-[#0A192F]/70'}`}>
                Urban Flood Nowcasting System (0–3h Lead Time)
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className={`hidden md:flex items-center gap-8 text-xs font-semibold font-montserrat tracking-wide ${
            isDark ? 'text-[#F4F7F6]/80' : 'text-[#0A192F]/80'
          }`}>
            <a href="#framework" className="hover:text-[#00B4D8] transition-colors">Coupled Framework</a>
            <a href="#metros" className="hover:text-[#00B4D8] transition-colors">Indian Metros</a>
            <a href="#routing" className="hover:text-[#00B4D8] transition-colors">Emergency Routing</a>
          </nav>

          {/* Theme Toggle & Auth Buttons */}
          <div className="flex items-center gap-3">
            
            {/* Dark / Light Theme Toggle Button */}
            <button
              onClick={handleToggle}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer font-montserrat ${
                isDark
                  ? 'border-[#00B4D8]/40 bg-[#0A192F] text-[#00B4D8] hover:bg-[#00B4D8]/10'
                  : 'border-[#00B4D8]/50 bg-white text-[#0A192F] hover:bg-[#00B4D8]/10 shadow-sm'
              }`}
              title="Toggle Dark / Light Theme"
            >
              {isDark ? (
                <>
                  <Sun className="h-4 w-4 text-amber-400" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4 text-sky-600" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            {!currentUser ? (
              <>
                <button
                  onClick={() => {
                    setAuthType('login');
                    setShowAuthModal(true);
                  }}
                  className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer font-montserrat ${
                    isDark ? 'bg-[#0A192F] border-[#00B4D8]/30 text-[#F4F7F6] hover:border-[#00B4D8]' : 'bg-[#ffffff] border-slate-300 text-[#0A192F] hover:border-[#00B4D8]'
                  }`}
                >
                  <Lock className="h-3.5 w-3.5 text-[#00B4D8]" />
                  <span>Login</span>
                </button>

                <button
                  onClick={() => {
                    setAuthType('signup');
                    setShowAuthModal(true);
                  }}
                  className={`hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer font-montserrat ${
                    isDark ? 'bg-[#0A192F] border-[#00B4D8]/30 text-[#F4F7F6] hover:border-[#00B4D8]' : 'bg-[#ffffff] border-slate-300 text-[#0A192F] hover:border-[#00B4D8]'
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5 text-[#00B4D8]" />
                  <span>Sign Up</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                  isDark ? 'border-[#00B4D8]/20 bg-[#00B4D8]/10 text-[#00B4D8]' : 'border-[#00B4D8]/30 bg-[#00B4D8]/10 text-[#0A192F]'
                }`}>
                  <span className="h-2 w-2 rounded-full bg-[#00B4D8] animate-pulse"></span>
                  <span className="truncate max-w-[140px]">{currentUser.name || currentUser.email}</span>
                </div>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer font-montserrat bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white"
                    title="Logout"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            )}

            {/* Accent Call To Action Button */}
            <button
              onClick={onLaunchDashboard}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00B4D8] hover:bg-[#38c9e8] text-[#0A192F] font-black text-xs transition-all shadow-[0_0_20px_rgba(0,180,216,0.4)] cursor-pointer font-montserrat"
            >
              <Eye className="h-4 w-4" />
              <span>Launch Live Dashboard</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 pt-16 pb-20 px-6 max-w-6xl mx-auto text-center">
        
        {/* Top Accent Pill Badge */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold text-[#00B4D8] mb-6 shadow-md font-montserrat ${
          isDark ? 'bg-[#0A192F]/90 border-[#00B4D8]/40 shadow-[#00B4D8]/10' : 'bg-[#ffffff]/90 border-[#00B4D8]/40 shadow-slate-200'
        }`}>
          <span className="h-2 w-2 rounded-full bg-[#00B4D8] animate-pulse"></span>
          <span>HYPER-LOCAL 0–3 HOUR STREET-LEVEL FLOOD PREDICTION ENGINE</span>
        </div>

        {/* Main Headline with Playfair Display Typography */}
        <h1 className={`text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight font-playfair ${
          isDark ? 'text-[#F4F7F6]' : 'text-[#0A192F]'
        }`}>
          Predict Street-Level Inundation <br />
          <span className="text-[#00B4D8] italic drop-shadow-[0_0_25px_rgba(0,180,216,0.35)]">Before It Happens</span>
        </h1>

        {/* Subtitle with Poppins Typography */}
        <p className={`mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-poppins font-normal ${
          isDark ? 'text-[#F4F7F6]/90' : 'text-[#0A192F]/85'
        }`}>
          Traditional weather models only predict total rainfall volume. <strong className={`font-semibold ${isDark ? 'text-[#F4F7F6]' : 'text-[#0A192F]'}`}>UrbanGo</strong> couples real-time Doppler Weather Radar precipitation nowcasts with 2D terrain elevation (DEM) and 1D underground graph drainage network capacity for major Indian Metros.
        </p>

        {/* Action Callouts */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onLaunchDashboard}
            className="flex items-center gap-2.5 px-8 py-4 rounded-xl bg-[#00B4D8] hover:bg-[#38c9e8] text-[#0A192F] font-black text-sm transition-all shadow-[0_0_30px_rgba(0,180,216,0.5)] cursor-pointer hover:scale-105 font-montserrat"
          >
            <span>Launch Live Nowcasting Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={() => {
              setAuthType('municipal');
              setShowAuthModal(true);
            }}
            className={`flex items-center gap-2 px-6 py-4 rounded-xl border text-xs font-bold transition-all cursor-pointer font-montserrat ${
              isDark ? 'bg-[#0A192F]/90 border-[#00B4D8]/30 text-[#F4F7F6] hover:border-[#00B4D8]' : 'bg-[#ffffff] border-slate-300 text-[#0A192F] hover:border-[#00B4D8] shadow-sm'
            }`}
          >
            <Landmark className="h-4 w-4 text-[#00B4D8]" />
            <span>Municipal Login Portal</span>
          </button>
        </div>

        {/* High-Contrast Telemetry Metric Cards */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: 'Forecast Lead Time', val: '0–3 Hours', desc: 'Real-time doppler feed' },
            { label: 'Supported Metros', val: '5 Cities', desc: 'Kolkata, Mumbai, Delhi, Chennai, BLR' },
            { label: 'Hydraulic Solver', val: '1D-2D Coupled', desc: 'Manning pipe flow + DEM surface' },
            { label: 'Emergency Guidance', val: 'Multi-Modal', desc: 'Ambulance, Walk & Vehicle routing' }
          ].map((stat, i) => (
            <div key={i} className={`p-4 rounded-2xl border shadow-xl flex flex-col justify-between ${
              isDark ? 'bg-[#F4F7F6] text-[#0A192F] border-[#00B4D8]/30' : 'bg-[#ffffff] text-[#0A192F] border-[#00B4D8]/40 shadow-slate-200'
            }`}>
              <div>
                <div className="text-2xl font-black text-[#0A192F] font-montserrat">{stat.val}</div>
                <div className="text-xs font-bold text-[#00B4D8] mt-1 font-montserrat">{stat.label}</div>
              </div>
              <div className="text-[10px] text-[#0A192F]/75 font-medium mt-2 pt-2 border-t border-[#0A192F]/10 font-poppins">
                {stat.desc}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 3. Coupled Framework Section */}
      <section id="framework" className={`relative z-10 py-16 px-6 max-w-6xl mx-auto border backdrop-blur-md rounded-3xl my-8 ${
        isDark ? 'border-[#00B4D8]/20 bg-[#0A192F]/80' : 'border-[#00B4D8]/30 bg-[#ffffff]/80 shadow-md'
      }`}>
        
        <div className="text-center mb-12">
          <h2 className={`text-3xl sm:text-4xl font-extrabold font-playfair ${isDark ? 'text-[#F4F7F6]' : 'text-[#0A192F]'}`}>
            Coupled Rainfall-Drainage Framework
          </h2>
          <p className={`text-sm mt-2 max-w-xl mx-auto font-poppins ${isDark ? 'text-[#F4F7F6]/80' : 'text-[#0A192F]/80'}`}>
            Fusing surface runoff dynamics with underground drainage pipe network capacity
          </p>
        </div>

        {/* 3 Secondary Structural Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className={`p-6 rounded-2xl border shadow-xl flex flex-col justify-between hover:translate-y-[-4px] transition-all ${
            isDark ? 'bg-[#F4F7F6] text-[#0A192F] border-[#00B4D8]/40' : 'bg-[#ffffff] text-[#0A192F] border-[#00B4D8]/40 shadow-slate-200'
          }`}>
            <div>
              <div className="h-12 w-12 rounded-xl bg-[#0A192F] text-[#00B4D8] flex items-center justify-center mb-4 shadow-md">
                <CloudRain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#0A192F] font-montserrat">Doppler Weather Radar Field</h3>
              <p className="text-xs text-[#0A192F]/80 mt-2 leading-relaxed font-poppins">
                Converts real-time radar reflectivity (dBZ) into precipitation nowcasts (mm/hr) using Marshall-Palmer Z-R relationships.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#0A192F]/10 text-[11px] font-bold text-[#00B4D8] font-montserrat flex items-center gap-1">
              <span>Radar Telemetry Active</span>
              <Sparkles className="h-3 w-3" />
            </div>
          </div>

          <div className={`p-6 rounded-2xl border shadow-xl flex flex-col justify-between hover:translate-y-[-4px] transition-all ${
            isDark ? 'bg-[#F4F7F6] text-[#0A192F] border-[#00B4D8]/40' : 'bg-[#ffffff] text-[#0A192F] border-[#00B4D8]/40 shadow-slate-200'
          }`}>
            <div>
              <div className="h-12 w-12 rounded-xl bg-[#0A192F] text-[#00B4D8] flex items-center justify-center mb-4 shadow-md">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#0A192F] font-montserrat">1D-2D Manning Hydraulic Solver</h3>
              <p className="text-xs text-[#0A192F]/80 mt-2 leading-relaxed font-poppins">
                Calculates 1D underground pipe flow capacity using Manning equation, manhole surcharge head, and DEM surface inundation depth (cm).
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#0A192F]/10 text-[11px] font-bold text-[#00B4D8] font-montserrat flex items-center gap-1">
              <span>Coupled Physics Engine</span>
              <CheckCircle2 className="h-3 w-3" />
            </div>
          </div>

          <div className={`p-6 rounded-2xl border shadow-xl flex flex-col justify-between hover:translate-y-[-4px] transition-all ${
            isDark ? 'bg-[#F4F7F6] text-[#0A192F] border-[#00B4D8]/40' : 'bg-[#ffffff] text-[#0A192F] border-[#00B4D8]/40 shadow-slate-200'
          }`}>
            <div>
              <div className="h-12 w-12 rounded-xl bg-[#0A192F] text-[#00B4D8] flex items-center justify-center mb-4 shadow-md">
                <Compass className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#0A192F] font-montserrat">Flood-Safe Multi-Modal Navigation</h3>
              <p className="text-xs text-[#0A192F]/80 mt-2 leading-relaxed font-poppins">
                Calculates safe bypass routes for Ambulances, Buses, Civilian Cars, Pedestrians (dotted walk paths), and Metro Rail transit.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#0A192F]/10 text-[11px] font-bold text-[#00B4D8] font-montserrat flex items-center gap-1">
              <span>OSRM Emergency Routing</span>
              <Navigation2 className="h-3 w-3" />
            </div>
          </div>

        </div>
      </section>

      {/* 4. Supported Indian Metros Showcase */}
      <section id="metros" className="relative z-10 py-16 px-6 max-w-6xl mx-auto border-t border-[#00B4D8]/20">
        
        <div className="text-center mb-12">
          <h2 className={`text-3xl sm:text-4xl font-extrabold font-playfair ${isDark ? 'text-[#F4F7F6]' : 'text-[#0A192F]'}`}>
            Supported Indian Metros
          </h2>
          <p className={`text-sm mt-2 font-poppins ${isDark ? 'text-[#F4F7F6]/80' : 'text-[#0A192F]/80'}`}>
            Pre-loaded elevation, manhole graph, and historical flood hotspot datasets
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CITIES.map((city) => (
            <div key={city.id} className={`p-4 rounded-2xl border shadow-xl flex flex-col justify-between hover:border-[#00B4D8] transition-colors ${
              isDark ? 'bg-[#F4F7F6] text-[#0A192F] border-[#00B4D8]/40' : 'bg-[#ffffff] text-[#0A192F] border-[#00B4D8]/40 shadow-slate-200'
            }`}>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Building2 className="h-4 w-4 text-[#00B4D8]" />
                  <h4 className="font-extrabold text-[#0A192F] text-base font-montserrat">{city.name}</h4>
                </div>
                <div className="text-xs text-[#0A192F]/70 font-semibold font-poppins">{city.state}</div>
                <div className="text-[11px] text-[#00B4D8] font-extrabold mt-2 font-montserrat">{city.drainageAuthority}</div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-[#0A192F]/10 text-[10px] text-[#0A192F]/80 font-poppins">
                <span className="font-bold text-[#0A192F]">Hotspots:</span> {city.historicalHotspots.slice(0, 2).join(', ')}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Emergency Routing & Clearance Feature Highlight */}
      <section id="routing" className="relative z-10 py-12 px-6 max-w-6xl mx-auto">
        <div className={`p-8 rounded-3xl border shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 ${
          isDark
            ? 'bg-gradient-to-r from-[#0A192F] via-[#0A192F]/95 to-[#00B4D8]/20 border-[#00B4D8]/40'
            : 'bg-gradient-to-r from-[#ffffff] via-[#ffffff]/95 to-[#00B4D8]/20 border-[#00B4D8]/40 shadow-slate-200'
        }`}>
          <div className="flex-1">
            <span className="px-3 py-1 rounded-full bg-[#00B4D8]/20 text-[#00B4D8] text-xs font-bold border border-[#00B4D8]/40 uppercase tracking-wider font-montserrat">
              Custom Vehicle Clearance & Pedestrian Pathing
            </span>
            <h3 className={`text-2xl sm:text-3xl font-extrabold mt-3 font-playfair ${isDark ? 'text-[#F4F7F6]' : 'text-[#0A192F]'}`}>
              Customizable Ground Clearance & Pedestrian Guidance
            </h3>
            <p className={`text-sm mt-2 leading-relaxed font-poppins ${isDark ? 'text-[#F4F7F6]/80' : 'text-[#0A192F]/80'}`}>
              Specify custom vehicle clearance from <strong className="text-[#00B4D8]">0 to 150 cm</strong> (Hatchback, SUV, Ambulance, Rescue Trucks) and navigate safe pedestrian walk paths with live flood pinpoint markers.
            </p>
          </div>

          <button
            onClick={onLaunchDashboard}
            className="px-7 py-3.5 rounded-xl bg-[#00B4D8] hover:bg-[#38c9e8] text-[#0A192F] font-black text-xs transition-all shadow-[0_0_25px_rgba(0,180,216,0.4)] shrink-0 cursor-pointer font-montserrat"
          >
            Try Routing Engine Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative z-10 border-t py-8 text-center text-xs transition-colors duration-300 ${
        isDark ? 'border-[#00B4D8]/20 bg-[#0A192F] text-[#F4F7F6]/60' : 'border-[#00B4D8]/30 bg-[#ffffff] text-[#0A192F]/70'
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-poppins">
          <div>© {new Date().getFullYear()} UrbanGo - Urban Flood Nowcasting System.</div>
          <div className="flex items-center gap-6 font-montserrat">
            <button onClick={onLaunchDashboard} className="text-[#00B4D8] font-bold hover:underline cursor-pointer">Launch Live Dashboard</button>
            <a href="#framework" className="hover:text-[#00B4D8]">System Architecture</a>
          </div>
        </div>
      </footer>

      {/* Interactive Auth Modal (Municipal Portal / Login / Sign Up) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0A192F]/90 p-4 backdrop-blur-md">
          <div className="bg-[#F4F7F6] text-[#0A192F] w-full max-w-lg rounded-3xl border border-[#00B4D8]/50 p-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-[#0A192F]/10 pb-3">
              <div className="flex items-center gap-2">
                {authType === 'municipal' ? (
                  <Landmark className="h-5 w-5 text-amber-500" />
                ) : authType === 'login' ? (
                  <Lock className="h-5 w-5 text-[#00B4D8]" />
                ) : (
                  <UserPlus className="h-5 w-5 text-[#00B4D8]" />
                )}
                <h3 className="text-base font-bold text-[#0A192F] font-playfair">
                  {authType === 'municipal' ? '🏛️ Municipal Officer Command Portal' : authType === 'login' ? 'User Login' : 'Create Account'}
                </h3>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-[#0A192F]/60 hover:text-[#0A192F] text-xs font-bold px-2.5 py-1 bg-[#0A192F]/10 rounded-lg cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-[#0A192F]/10 p-1 rounded-xl mt-4 font-montserrat text-[11px] font-bold gap-1">
              <button
                type="button"
                onClick={() => setAuthType('municipal')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  authType === 'municipal' ? 'bg-[#00B4D8] text-[#0A192F] shadow-md font-extrabold' : 'text-[#0A192F]/70 hover:text-[#0A192F]'
                }`}
              >
                <span>🏛️ Municipal Portal</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthType('login')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  authType === 'login' ? 'bg-[#00B4D8] text-[#0A192F] shadow-md font-extrabold' : 'text-[#0A192F]/70 hover:text-[#0A192F]'
                }`}
              >
                User Login
              </button>
              <button
                type="button"
                onClick={() => setAuthType('signup')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  authType === 'signup' ? 'bg-[#00B4D8] text-[#0A192F] shadow-md font-extrabold' : 'text-[#0A192F]/70 hover:text-[#0A192F]'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="mt-4 flex flex-col gap-4">
              
              {authType === 'municipal' && (
                <>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 font-poppins flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0" />
                    <span>Official authentication for Municipal Corporations, Hydrodynamic Engineers, & Emergency Command Centers.</span>
                  </div>

                  <div className="flex flex-col gap-1 font-poppins">
                    <label className="text-xs text-[#0A192F]/80 font-bold">Municipal Corporation / Dept:</label>
                    <select
                      value={municipalDept}
                      onChange={(e) => setMunicipalDept(e.target.value)}
                      className="rounded-xl bg-white border border-[#0A192F]/20 px-3.5 py-2 text-xs text-[#0A192F] font-bold focus:outline-none focus:border-[#00B4D8]"
                    >
                      <option value="Kolkata Municipal Corporation (KMC)">Kolkata Municipal Corp (KMC)</option>
                      <option value="Brihanmumbai Municipal Corp (BMC)">Brihanmumbai Municipal Corp (BMC)</option>
                      <option value="Bruhat Bengaluru Mahanagara Palike (BBMP)">Bruhat Bengaluru Palike (BBMP)</option>
                      <option value="Chennai Metro Water (CMWSSB)">Chennai Metro Water (CMWSSB)</option>
                      <option value="Delhi Jal Board (DJB)">Delhi Jal Board (DJB)</option>
                    </select>
                  </div>
                </>
              )}

              {authType === 'signup' && (
                <div className="flex flex-col gap-1.5 font-poppins">
                  <label className="text-xs text-[#0A192F]/80 font-bold">Full Name:</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Enter your full name"
                    className="rounded-xl bg-white border border-[#0A192F]/20 px-3.5 py-2.5 text-xs text-[#0A192F] focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] shadow-sm transition-all"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5 font-poppins">
                <label className="text-xs text-[#0A192F]/80 font-bold">
                  {authType === 'municipal' ? 'Official Government Email:' : 'Email Address:'}
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder={authType === 'municipal' ? 'kmc.chief.engineer@kolkata.gov.in' : authType === 'login' ? 'admin@urbango.in' : 'user@example.com'}
                  className="rounded-xl bg-white border border-[#0A192F]/20 px-3.5 py-2.5 text-xs text-[#0A192F] focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] shadow-sm transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5 font-poppins">
                <label className="text-xs text-[#0A192F]/80 font-bold">
                  {authType === 'municipal' ? 'Government Badge Token / Password:' : 'Password:'}
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="rounded-xl bg-white border border-[#0A192F]/20 px-3.5 py-2.5 text-xs text-[#0A192F] focus:outline-none focus:border-[#00B4D8] focus:ring-1 focus:ring-[#00B4D8] shadow-sm transition-all"
                />
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#00B4D8] hover:bg-[#38c9e8] text-[#0A192F] font-black text-xs transition-all shadow-md shadow-[#00B4D8]/30 cursor-pointer font-montserrat"
              >
                <span>
                  {authType === 'municipal'
                    ? '🏛️ Authenticate Municipal Officer Access & Launch Dashboard'
                    : authType === 'login'
                    ? 'Login & Enter Dashboard'
                    : 'Sign Up & Enter Dashboard'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center text-[11px] text-[#0A192F]/70 font-poppins pt-1">
                {authType === 'municipal' ? (
                  <span>Accessing Municipal Command Portal. <button type="button" onClick={() => setAuthType('login')} className="text-[#00B4D8] font-bold hover:underline">Switch to User Login</button></span>
                ) : authType === 'login' ? (
                  <span>Don't have an account? <button type="button" onClick={() => setAuthType('signup')} className="text-[#00B4D8] font-bold hover:underline">Sign Up</button></span>
                ) : (
                  <span>Already have an account? <button type="button" onClick={() => setAuthType('login')} className="text-[#00B4D8] font-bold hover:underline">Login</button></span>
                )}
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};




import React, { useState, useMemo } from 'react';
import * as htmlToImage from 'html-to-image';

// --- KOMPONEN IKON SVG (Custom Atletik) ---
const IconUser = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconActivity = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>;
const IconScale = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>;
const IconDownload = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>;
const IconRunning = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/><path d="M13 13h5l2 3"/><path d="M8 7l4 2 2 4-2 4"/><path d="M11 22v-3l-2-2"/></svg>;
const IconReset = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>;

// --- FUNGSI SCORING LOGIC ATLETIK ---
const getScoreAtletik = (test, gender, value) => {
  if (value === '' || value === null || isNaN(value)) return 0;
  const v = parseFloat(value); const isM = gender === 'Putra';
  switch(test) {
    case 'sitReach': 
      return isM ? (v >= 30.61 ? 100 : v >= 24.49 ? 80 : v >= 21.43 ? 70 : v >= 18.37 ? 60 : 40) 
                 : (v >= 32.12 ? 100 : v >= 25.70 ? 80 : v >= 22.48 ? 70 : v >= 19.27 ? 60 : 40);
    case 'broadJump': 
      return isM ? (v >= 2.63 ? 100 : v >= 2.37 ? 80 : v >= 2.10 ? 70 : v >= 1.84 ? 60 : 40) 
                 : (v >= 2.39 ? 100 : v >= 2.15 ? 80 : v >= 1.91 ? 70 : v >= 1.67 ? 60 : 40);
    case 'pushUp': 
      return isM ? (v >= 75 ? 100 : v >= 60 ? 80 : v >= 53 ? 70 : v >= 45 ? 60 : 40) 
                 : (v >= 50 ? 100 : v >= 40 ? 80 : v >= 35 ? 70 : v >= 30 ? 60 : 40);
    case 'sitUp': 
      return isM ? (v >= 110 ? 100 : v >= 88 ? 80 : v >= 77 ? 70 : v >= 66 ? 60 : 40) 
                 : (v >= 90 ? 100 : v >= 72 ? 80 : v >= 63 ? 70 : v >= 54 ? 60 : 40);
    case 'sprint30': 
      return isM ? (v <= 3.00 ? 100 : v <= 3.60 ? 80 : v <= 3.90 ? 70 : v <= 4.20 ? 60 : 40) 
                 : (v <= 3.20 ? 100 : v <= 3.84 ? 80 : v <= 4.16 ? 70 : v <= 4.48 ? 60 : 40);
    case 'beep': 
      return isM ? (v >= 57.78 ? 100 : v >= 52.00 ? 80 : v >= 40.45 ? 70 : v >= 37.56 ? 60 : 40) 
                 : (v >= 49.17 ? 100 : v >= 44.25 ? 80 : v >= 34.42 ? 70 : v >= 31.96 ? 60 : 40);
    default: return 0;
  }
};

// --- FUNGSI TARGET PLACEHOLDER ---
const getTargetPlaceholder = (test, gender) => {
  const isM = gender === 'Putra';
  switch(test) {
    case 'sitReach': return isM ? '≥ 30.61' : '≥ 32.12';
    case 'broadJump': return isM ? '≥ 2.63' : '≥ 2.39';
    case 'pushUp': return isM ? '≥ 75' : '≥ 50';
    case 'sitUp': return isM ? '≥ 110' : '≥ 90';
    case 'sprint30': return isM ? '≤ 3.00' : '≤ 3.20';
    case 'beep': return isM ? '≥ 57.78' : '≥ 49.17';
    default: return '';
  }
};

// --- KOMPONEN RADAR CHART ---
const RadarChart = ({ data, labels, isBlanko }) => {
  const size = 320; const center = size / 2; const radius = 100;
  const angleStep = (Math.PI * 2) / labels.length;

  const getCoordinates = (val, i) => {
    const r = (val / 100) * radius;
    const a = i * angleStep - Math.PI / 2;
    return { x: center + r * Math.cos(a), y: center + r * Math.sin(a) };
  };

  const dataPoints = data.map((val, i) => getCoordinates(val, i));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {[20, 40, 60, 80, 100].map(level => {
        const pts = labels.map((_, i) => getCoordinates(level, i));
        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
        return <path key={level} d={path} fill="none" stroke={level === 100 ? '#e11d48' : '#e2e8f0'} strokeWidth={level === 100 ? 2 : 1} strokeDasharray={level < 100 ? "4 4" : "none"} />
      })}
      
      {labels.map((label, i) => {
        const pOuter = getCoordinates(125, i);
        const pEdge = getCoordinates(100, i);
        return (
          <g key={i}>
            <line x1={center} y1={center} x2={pEdge.x} y2={pEdge.y} stroke="#e2e8f0" strokeWidth="1" />
            <text x={pOuter.x} y={pOuter.y} textAnchor="middle" dominantBaseline="middle" className="text-[10px] font-black fill-slate-500 uppercase">{label}</text>
          </g>
        );
      })}

      {!isBlanko && (
        <>
          <path d={dataPath} fill="rgba(225, 29, 72, 0.3)" stroke="#e11d48" strokeWidth="3" strokeLinejoin="round" />
          {dataPoints.map((p, i) => ( <circle key={i} cx={p.x} cy={p.y} r="4" fill="#9f1239" /> ))}
        </>
      )}
    </svg>
  );
};

export default function App() {
  const [identity, setIdentity] = useState({ name: '', origin: '', dob: '', gender: 'Putra' });
  const [anthro, setAnthro] = useState({ weight: '', height: '', armSpan: '', sitHeight: '' });
  const [tests, setTests] = useState({ sitReach: '', broadJump: '', pushUp: '', sitUp: '', sprint30: '', beepLevel: '', beepShuttle: '' });
  const [isExporting, setIsExporting] = useState(false);

  const age = useMemo(() => {
    if (!identity.dob) return '-';
    const birthDate = new Date(identity.dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) calculatedAge--;
    return calculatedAge;
  }, [identity.dob]);

  const bmiData = useMemo(() => {
    if (!anthro.weight || !anthro.height || anthro.height <= 0) return { bmi: '-', status: '-', color: 'text-slate-400' };
    const hM = anthro.height / 100;
    const bmiValue = (anthro.weight / (hM * hM));
    const bmi = bmiValue.toFixed(1);
    let status = 'Kurus'; let color = 'text-blue-500';
    if (bmi >= 18.5 && bmi <= 24.9) { status = 'Ideal'; color = 'text-emerald-500'; }
    else if (bmi >= 25 && bmi <= 29.9) { status = 'Gemuk'; color = 'text-amber-500'; }
    else if (bmi >= 30) { status = 'Obesitas'; color = 'text-rose-500'; }
    return { bmi, status, color };
  }, [anthro.weight, anthro.height]);

  const proportionData = useMemo(() => {
    const h = parseFloat(anthro.height);
    const arm = parseFloat(anthro.armSpan);
    const sit = parseFloat(anthro.sitHeight);

    let apeIndex = { value: 0, text: '-', color: 'text-slate-400', desc: 'Isi Tinggi & Lengan' };
    let legRatio = { value: 0, text: '-', color: 'text-slate-400', desc: 'Isi Tinggi Duduk' };

    if (h > 0 && arm > 0) {
      const ratio = arm / h;
      if (ratio > 1.02) apeIndex = { value: ratio.toFixed(2), text: 'Superior', color: 'text-emerald-500', desc: 'Keuntungan Ayunan Lengan' };
      else if (ratio >= 1.0) apeIndex = { value: ratio.toFixed(2), text: 'Ideal', color: 'text-blue-500', desc: 'Proporsi Normal' };
      else apeIndex = { value: ratio.toFixed(2), text: 'Standar', color: 'text-rose-500', desc: 'Jangkauan Pendek' };
    }

    if (h > 0 && sit > 0 && sit < h) {
      const legLength = h - sit;
      const legPercentage = (legLength / h) * 100;
      if (legPercentage >= 50) legRatio = { value: legPercentage.toFixed(1) + '%', text: 'Tungkai Panjang', color: 'text-emerald-500', desc: 'Potensi Stride Maksimal' };
      else if (legPercentage >= 47) legRatio = { value: legPercentage.toFixed(1) + '%', text: 'Tungkai Ideal', color: 'text-blue-500', desc: 'Proporsi Seimbang' };
      else legRatio = { value: legPercentage.toFixed(1) + '%', text: 'Tungkai Pendek', color: 'text-rose-500', desc: 'Fokus Frekuensi Langkah' };
    }

    return { apeIndex, legRatio };
  }, [anthro.height, anthro.armSpan, anthro.sitHeight]);

  // --- MESIN PENGHITUNG VO2MAX OTOMATIS ---
  const calculatedVO2Max = useMemo(() => {
    const l = parseInt(tests.beepLevel);
    const s = parseInt(tests.beepShuttle);
    if (!l || !s || l < 1 || s < 1) return ''; 
    const vo2max = 3.46 * (l + s / (l * 0.4325 + 7.0048)) + 12.2;
    return parseFloat(vo2max.toFixed(2));
  }, [tests.beepLevel, tests.beepShuttle]);

  const scores = useMemo(() => ({
    sitReach: getScoreAtletik('sitReach', identity.gender, tests.sitReach),
    broadJump: getScoreAtletik('broadJump', identity.gender, tests.broadJump),
    pushUp: getScoreAtletik('pushUp', identity.gender, tests.pushUp),
    sitUp: getScoreAtletik('sitUp', identity.gender, tests.sitUp),
    sprint30: getScoreAtletik('sprint30', identity.gender, tests.sprint30),
    beep: getScoreAtletik('beep', identity.gender, calculatedVO2Max),
  }), [tests, identity.gender, calculatedVO2Max]);

  const activeLabels = ['Flexibility', 'Broad Jump', 'Push Up', 'Sit Up', 'Sprint 30m', 'VO2 Max'];
  const averageScore = useMemo(() => {
    const vals = Object.values(scores);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [scores]);

  const isBlanko = !identity.name && averageScore === 0;

  const handleReset = () => { if (window.confirm("Hapus semua data isian?")) window.location.reload(); };

  const handleDownloadImage = async () => {
    setIsExporting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    try {
      const element = document.getElementById('report-container');
      const dataUrl = await htmlToImage.toPng(element, { quality: 1.0, backgroundColor: "#f8fafc", pixelRatio: 2 });
      const safeName = identity?.name ? identity.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'atlet';
      const link = document.createElement("a");
      link.download = `Rapor_Atletik_Elite_${safeName}.png`;
      link.href = dataUrl; link.click();
    } catch (error) { console.error(error); alert("Gagal membuat gambar."); } finally { setIsExporting(false); }
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-rose-500 transition-all";
  const testInputClass = "w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-900 focus:outline-none focus:border-rose-500 transition-all pr-24 placeholder:text-[11px] placeholder:font-bold placeholder:text-slate-400/70 text-right";

  return (
    <div id="report-container" className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4 font-sans print:bg-white">
      
      {isExporting && (
        <style dangerouslySetInnerHTML={{__html: `
          #report-container input, #report-container select { appearance: none !important; -webkit-appearance: none; padding-bottom: 8px !important; }
          #report-container input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none !important; margin: 0 !important; }
        `}} />
      )}

      {/* HEADER: TRACK & FIELD VELOCITY THEME */}
      <header className="bg-slate-900 text-white p-8 shadow-2xl relative overflow-hidden w-full max-w-7xl rounded-[2.5rem] border-b-8 border-rose-600">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[repeating-linear-gradient(90deg,transparent,transparent_40px,#fff_40px,#fff_41px)]"></div>
        </div>
        
        <div className="mx-auto relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="inline-block bg-rose-600 text-white font-black text-[10px] px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 shadow-lg border border-rose-500">
              PERMENPORA 15 / 2024 • ELITE STANDARD
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight italic">
              VELOCITY <span className="text-rose-500">ATHLETICS</span>
            </h1>
          </div>
          <div className="text-left md:text-right w-full md:w-auto">
            {!isExporting && (
              <div className="no-print flex flex-wrap items-center justify-start md:justify-end gap-3 mb-4">
                <button onClick={handleReset} className="bg-white/10 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-xs font-bold tracking-wider backdrop-blur-sm border border-white/10">
                  <IconReset /> <span>Reset</span>
                </button>
                <button onClick={handleDownloadImage} disabled={isExporting} className="bg-rose-600 hover:bg-rose-500 text-white px-6 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2 text-xs font-black tracking-wider shadow-[0_0_20px_rgba(225,29,72,0.4)] disabled:opacity-50">
                  <IconDownload /> {isExporting ? 'Processing...' : 'Export PNG'}
                </button>
              </div>
            )}
            <div className="mt-2">
                <p className="font-black text-rose-500/80 text-[11px] tracking-[0.3em] uppercase">
                  System Developed <span className="text-white">by fiqhipondaa9</span>
                </p>
            </div>
          </div>
        </div>
      </header>

      <main className={`${isExporting ? 'w-[1200px]' : 'max-w-7xl w-full'} mx-auto mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8`}>
        
        {/* LEFT COLUMN: DATA INPUT */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 z-0"></div>
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-5 relative z-10">
              <div className="bg-rose-600 text-white p-3 rounded-2xl shadow-lg shadow-rose-200"><IconUser /></div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Biographical Profile</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10">
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label><input type="text" value={identity.name} onChange={e => setIdentity({...identity, name: e.target.value})} className={inputClass} placeholder={isExporting ? "" : "Nama atlet..."} /></div>
              <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Provinsi / Klub</label><input type="text" value={identity.origin} onChange={e => setIdentity({...identity, origin: e.target.value})} className={inputClass} placeholder={isExporting ? "" : "Asal instansi..."} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tgl Lahir</label><input type="date" value={identity.dob} onChange={e => setIdentity({...identity, dob: e.target.value})} className={`${inputClass} text-sm`} /></div>
                <div className="space-y-1"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age Index</label><div className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 font-black text-slate-900 text-center">{age !== '-' ? `${age} Thn` : '\u00A0'}</div></div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kategori Gender</label>
                <select value={identity.gender} onChange={e => setIdentity({...identity, gender: e.target.value})} className={`${inputClass} cursor-pointer`}>
                  <option value="Putra">Putra (Male)</option><option value="Putri">Putri (Female)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {[{label: 'Tinggi (cm)', id: 'height'}, {label: 'Berat (kg)', id: 'weight'}, {label: 'Rentang Lengan', id: 'armSpan'}, {label: 'Tinggi Duduk', id: 'sitHeight'}].map(item => (
                 <div key={item.id} className="space-y-1">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</label>
                   <input type="number" value={anthro[item.id]} onChange={e => setAnthro({...anthro, [item.id]: e.target.value})} className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-3 font-black text-center focus:border-rose-500 outline-none" placeholder={isExporting ? "" : "0"} />
                 </div>
              ))}
            </div>
            
            <div className="mt-4 flex items-center justify-between bg-slate-900 text-white rounded-[2rem] p-6 shadow-xl border-l-8 border-rose-600 relative z-10">
               <div className="flex items-center gap-4"><IconScale /> <span className="font-black text-xs tracking-[0.2em] uppercase text-slate-400">Body Mass Index</span></div>
               <div className="flex items-center gap-5">
                 <span className="text-4xl font-black italic">{bmiData.bmi}</span>
                 {bmiData.status !== '-' && <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white shadow-inner ${bmiData.color}`}>{bmiData.status}</span>}
               </div>
            </div>

            {/* KOTAK RASIO TUNGKAI & LENGAN */}
            {(anthro.height > 0 && (anthro.armSpan > 0 || anthro.sitHeight > 0)) && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 animate-in fade-in">
                <div className="bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm flex flex-col justify-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600"></div>
                   <div className="flex justify-between items-start mb-2 pl-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Ape Index</span>
                      <span className={`text-[9px] bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg font-black uppercase tracking-widest ${proportionData.apeIndex.color}`}>{proportionData.apeIndex.text}</span>
                   </div>
                   <div className="flex items-end gap-2 pl-2 mt-1">
                      <span className="text-3xl font-black text-slate-900 leading-none italic">{proportionData.apeIndex.value}</span>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 mt-2 pl-2 uppercase tracking-widest">{proportionData.apeIndex.desc}</p>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-[2rem] p-5 shadow-sm flex flex-col justify-center relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-900"></div>
                   <div className="flex justify-between items-start mb-2 pl-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Rasio Tungkai</span>
                      <span className={`text-[9px] bg-slate-50 border border-slate-100 px-2 py-1 rounded-lg font-black uppercase tracking-widest ${proportionData.legRatio.color}`}>{proportionData.legRatio.text}</span>
                   </div>
                   <div className="flex items-end gap-2 pl-2 mt-1">
                      <span className="text-3xl font-black text-slate-900 leading-none italic">{proportionData.legRatio.value}</span>
                   </div>
                   <p className="text-[10px] font-bold text-slate-400 mt-2 pl-2 uppercase tracking-widest">{proportionData.legRatio.desc}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200">
            <div className="flex items-center gap-4 mb-8 border-b border-slate-100 pb-5">
              <div className="bg-rose-100 text-rose-600 p-3 rounded-2xl"><IconRunning /></div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Performance Metrics</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
               {[
                 { id: 'sitReach', label: 'Sit & Reach Flexibility', unit: 'CM' },
                 { id: 'broadJump', label: 'Standing Broad Jump', unit: 'METER' },
                 { id: 'pushUp', label: 'Push Up (1 Menit)', unit: 'REPS' },
                 { id: 'sitUp', label: 'Sit Up (2 Menit)', unit: 'REPS' },
                 { id: 'sprint30', label: 'Sprint 30 Meter', unit: 'DETIK' },
               ].map(item => (
                 <div key={item.id} className="flex flex-col">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">{item.label}</label>
                   <div className="relative">
                     <input type="number" step="0.01" value={tests[item.id]} onChange={e => setTests({...tests, [item.id]: e.target.value})} className={testInputClass} placeholder={getTargetPlaceholder(item.id, identity.gender)} />
                     <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.unit}</span>
                   </div>
                 </div>
               ))}

               {/* BLOK KHUSUS BEEP TEST OTOMATIS */}
               <div className="sm:col-span-2 bg-rose-50/80 p-6 rounded-[2rem] border border-rose-100 mt-2 shadow-inner">
                 <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-3">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                     Beep Test (Bleep / Yoyo)
                   </label>
                   <div className="flex flex-wrap items-center gap-2">
                     {calculatedVO2Max > 0 && (
                       <span className="bg-rose-600 text-white px-3 py-1.5 rounded-xl text-xs font-black shadow-sm animate-in fade-in slide-in-from-right-2 flex items-center gap-2">
                         VO2Max: {calculatedVO2Max} <span className="text-[10px] opacity-70">ML/KG/MIN</span>
                       </span>
                     )}
                     <span className="bg-slate-900 text-rose-400 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                       Target Emas: {getTargetPlaceholder('beep', identity.gender)}
                     </span>
                   </div>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                   <div className="relative">
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Level</span>
                     <input type="number" min="1" value={tests.beepLevel} onChange={e => setTests({...tests, beepLevel: e.target.value})} className={`${testInputClass} pl-16 pr-6`} placeholder="0" />
                   </div>
                   <div className="relative">
                     <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Balikan</span>
                     <input type="number" min="1" value={tests.beepShuttle} onChange={e => setTests({...tests, beepShuttle: e.target.value})} className={`${testInputClass} pl-20 pr-6`} placeholder="0" />
                   </div>
                 </div>
               </div>
               {/* AKHIR BLOK BEEP TEST */}

            </div>
            <p className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-[10px] font-bold text-rose-800 text-center uppercase tracking-widest leading-relaxed">
              *Penghitungan skor mengacu pada tabel norma elit dunia<br/>Hasil Sprint 30m otomatis dikalkulasi berdasarkan reduksi waktu (Lower is Faster).
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: ANALYTICS */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          <div className={`rounded-[3rem] p-10 shadow-2xl text-center relative overflow-hidden transition-all duration-700 border-b-[12px] ${averageScore > 80 ? 'bg-slate-900 text-white border-rose-600' : averageScore < 60 && averageScore > 0 ? 'bg-rose-700 text-white border-rose-900' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-[11px] font-black uppercase tracking-[0.3em] mb-3 ${averageScore > 80 || (averageScore < 60 && averageScore > 0) ? 'text-rose-400/60' : 'text-slate-400'}`}>Athletic Performance Score</h3>
            <div className="text-[100px] font-black tracking-tighter mb-4 italic leading-none drop-shadow-lg">{isBlanko ? '-' : averageScore || 0}</div>
            
            <div className={`inline-flex items-center justify-center gap-3 px-8 py-3 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-inner border ${averageScore > 80 ? 'bg-rose-600/20 text-rose-400 border-rose-500/30' : averageScore < 60 && averageScore > 0 ? 'bg-rose-900/50 text-rose-100 border-rose-500/30' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
               {averageScore > 80 ? 'WORLD CLASS ELITE' : averageScore < 60 && averageScore > 0 ? 'NEEDS INTENSIVE DRILL' : averageScore > 0 ? 'QUALIFIED ATHLETE' : isBlanko ? 'BLANKO RECORDING' : 'WAITING FOR DATA'}
            </div>
          </div>

          <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-200 flex-1 flex flex-col items-center">
             <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.3em] text-center mb-8 italic">Biokinetic Radar Analysis</h3>
             <div className="flex-1 w-full flex items-center justify-center min-h-[300px] bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100">
               <RadarChart data={Object.values(scores)} labels={activeLabels} isBlanko={isBlanko} />
             </div>
             <p className="text-[10px] font-black text-slate-400 text-center mt-6 uppercase tracking-[0.2em]">Red Polygon = Actual Capacity • Gray Line = Elite Standard</p>
          </div>

          <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 to-slate-900"></div>
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Point Distribution (0-100)</h3>
            <div className="space-y-4">
              {activeLabels.map((label, idx) => {
                const val = Object.values(scores)[idx];
                return (
                  <div key={idx} className="flex items-center">
                    <span className="text-[10px] font-black text-slate-700 uppercase w-28 tracking-tighter">{label}</span>
                    {isBlanko ? (
                      <div className="flex-1 border-b-2 border-dotted border-slate-200 mx-4"></div>
                    ) : (
                      <div className="flex-1 flex justify-end items-center gap-4 ml-2">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full transition-all duration-1000 ${val >= 80 ? 'bg-rose-600' : val >= 60 ? 'bg-slate-400' : 'bg-rose-900'}`} style={{ width: `${val}%` }}></div>
                        </div>
                        <span className={`text-xs font-black w-8 text-right ${val >= 80 ? 'text-rose-600' : 'text-slate-500'}`}>{val}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
               <span className="text-[10px] font-black text-slate-300 tracking-[0.4em] uppercase">by fiqhipondaa9</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
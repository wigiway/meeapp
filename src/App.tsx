import React, { useEffect, useState } from "react";
import { Wallet, Download, RotateCcw, Sun, Moon, CheckCircle2, Clock, ChevronDown, ChevronRight, ChevronLeft, Layers, Map, Brain, Eye } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const fmt = (n: number | string) => new Intl.NumberFormat("th-TH", { maximumFractionDigits: 2 }).format(Number(n || 0));
const todayISO = () => new Date().toISOString().slice(0, 10);
const ym = (d?: string) => (d || todayISO()).slice(0, 7);
const uid = () => (typeof crypto !== 'undefined' && (crypto as any).randomUUID ? (crypto as any).randomUUID() : `${Math.random().toString(36).slice(2)}-${Date.now()}`);

const PATH = { home: "/", budget: "/budget", travel: "/travel", brain: "/brain", eyes: "/eyes" } as const;
const hrefPath = (p: string) => `#${p.startsWith('/') ? p : `/${p}`}`;
function useHashPath(){
  const get = () => (typeof window !== 'undefined' ? (window.location.hash || '#/') : '#/');
  const [hp, setHp] = useState<string>(get());
  useEffect(() => { const onHash = () => setHp(get()); window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash); }, []);
  return hp;
}
function pathFromHash(hash: string){ const raw = hash || '#/'; const h = raw.startsWith('#') ? raw.slice(1) : raw; const q = h.split('?')[0].split('#')[0]; return q? (q.startsWith('/')? q : `/${q}`) : '/'; }
function goto(p: string){ if (typeof window !== 'undefined') window.location.hash = hrefPath(p); }

function GlobalFonts(){
  return (<style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Noto+Sans+Thai:wght@400;600;700&display=swap');
    :root { --app-font: 'Inter','Noto Sans Thai', system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Sarabun', 'Kanit', sans-serif; }
    body { font-family: var(--app-font); }`}</style>);
}

type TxType = 'income' | 'expense' | 'invest';
type TxStatus = 'actual' | 'forecast';
type Tx = { id: string; date: string; type: TxType; status: TxStatus; category: string; amount: number; note?: string };

const INCOME_CATS = ["เงินเดือน","ฟรีแลนซ์","โบนัส","ดอกเบี้ย","ขายของ","เงินปั่นผล","เทรดหุ้น","อื่น ๆ"] as const;
const DAILY_CATS = ["ค่ากิน", "ค่าน้ำมัน", "ออกกำลังกาย"] as const;
const BILLS_CATS = ["ค่าบ้าน","ค่ารถ","ค่าเน็ตบ้าน","ค่าเน็ตโทรศัพท์","ค่าน้ำ","ค่าไฟ","ค่าประกันรถ","ค่าหนี้รายเดือน"] as const;
const SPECIAL_CATS = ["ให้เงินแม่","เที่ยว","ไหว้พระ","อื่น ๆ"] as const;
const INVEST_CATS = ["โอนเงินไปเทรดหุ้น","ออมทอง","ซื้อหุ้น"] as const;

const sum = (a: Array<number | string>): number => a.reduce((acc: number, curr: number | string) => acc + Number(curr || 0), 0);

export default function App(){
  const [theme,setTheme] = useState<'dark'|'light'>(() => (localStorage.getItem('mee_theme') as 'dark'|'light')||'dark');
  useEffect(()=>localStorage.setItem('mee_theme', theme),[theme]);
  const isDark = theme==='dark';
  const baseBg = isDark ? 'text-slate-100' : 'text-slate-900';

  const route = pathFromHash(useHashPath());
  let Page: React.ReactNode;
  if (route==='/') Page = <Home/>;
  else if (route==='/budget') Page = <BudgetMiniApp/>;
  else if (route==='/travel') Page = <TravelMock/>;
  else if (route==='/brain') Page = <BrainMock/>;
  else if (route==='/eyes') Page = <EyesMock/>;
  else Page = <NotFound/>;

  return (
    <div className={`min-h-screen ${baseBg} relative overflow-hidden`} style={{background: isDark? 'linear-gradient(180deg,#0b1220, #111a2f 40%, #0b1220)': 'linear-gradient(180deg,#e6eefc,#ffffff 40%, #eef5ff)'}}>
      <GlobalFonts />
      <MeeBackdrop theme={theme} />
      <Navbar theme={theme} setTheme={setTheme}/>
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">{Page}</main>
      <Footer/>
    </div>
  );
}

function Navbar({ theme, setTheme }: { theme:'dark'|'light'; setTheme:(t:'dark'|'light')=>void }){
  const isDark = theme==='dark';
  return (
    <nav className={`sticky top-0 z-40 backdrop-blur-2xl ${isDark? 'bg-white/5 border-white/10':'bg-white/70 border-black/10'} border-b`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <a href={"#/"} onClick={(e)=>{e.preventDefault(); goto('/');}} className="flex items-center gap-2 font-semibold">
          <Layers className="w-5 h-5"/> MeeApp
        </a>
        <div className="flex items-center gap-3">
          <button onClick={() => setTheme(isDark ? 'light':'dark')} className={`ml-2 text-xs inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ${isDark? 'ring-white/15 bg-white/10 hover:bg-white/20' : 'ring-black/10 bg-white/70 hover:bg-white/80'}`}>
            {isDark ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>} {isDark? 'Day' : 'Night'}
          </button>
        </div>
      </div>
    </nav>
  );
}

function MeeBackdrop({ theme }: { theme:'dark'|'light' }){
  const isDark = theme==='dark';
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -left-24 w-[42rem] h-[42rem] rounded-full blur-3xl" style={{
        background: isDark
          ? 'radial-gradient(circle at 30% 30%, rgba(56,189,248,.18), transparent 60%), radial-gradient(circle at 60% 10%, rgba(99,102,241,.16), transparent 55%)'
          : 'radial-gradient(circle at 30% 30%, rgba(56,189,248,.25), transparent 60%), radial-gradient(circle at 60% 10%, rgba(99,102,241,.22), transparent 55%)'
      }}/>
      <div className="absolute -bottom-52 -right-16 w-[46rem] h-[46rem] rounded-full blur-3xl" style={{
        background: isDark
          ? 'radial-gradient(circle at 70% 70%, rgba(16,185,129,.18), transparent 60%), radial-gradient(circle at 40% 90%, rgba(236,72,153,.12), transparent 55%)'
          : 'radial-gradient(circle at 70% 70%, rgba(16,185,129,.22), transparent 60%), radial-gradient(circle at 40% 90%, rgba(236,72,153,.16), transparent 55%)'
      }}/>
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.6),transparent_60%)]"/>
    </div>
  );
}

function Home(){
  return (
    <section>
      <div className="text-center py-6 sm:py-10">
        <p className="uppercase tracking-widest text-xs sm:text-sm opacity-80">Welcome</p>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight mt-2">
          <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(90deg, #a78bfa, #60a5fa, #34d399, #fbbf24, #f472b6, #a78bfa)' }}>
            MeeApp — เว็บรวมมินิแอพที่ใช้งานจริงในชีวิตประจำวัน
          </span>
        </h1>
        <p className="mt-3 sm:mt-4 text-sm sm:text-base opacity-80 max-w-2xl mx-auto">
          จัดการเงินส่วนตัว • วางแผนการเดินทาง • คลังความรู้ • เกมวัดสายตา — ทุกอย่างรวมไว้ในเว็บเดียว
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <MiniCard onClick={() => goto('/budget')} icon={<Wallet className="w-5 h-5"/>} title="แอพบัญชี" desc="จัดการรายรับ-รายจ่าย"/>
        <MiniCard onClick={() => goto('/travel')} icon={<Map className="w-5 h-5"/>} title="แผนการเดินทาง" desc="วางแผนทริป/เช็กลิสต์"/>
        <MiniCard onClick={() => goto('/brain')} icon={<Brain className="w-5 h-5"/>} title="คลังความรู้" desc="Quiz/Flashcards (Mock)"/>
        <MiniCard onClick={() => goto('/eyes')} icon={<Eye className="w-5 h-5"/>} title="เกมวัดสายตา" desc="Snellen E (Mock)"/>
      </div>
    </section>
  );
}

function MiniCard({ onClick, icon, title, desc }: { onClick:()=>void; icon:React.ReactNode; title:string; desc:string; }){
  return (
    <button onClick={onClick} className="rainbow-border-hover group text-left rounded-3xl bg-white/5 backdrop-blur-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition-all duration-300 block w-full">
      <div className="flex items-center gap-2 font-semibold">{icon} {title}</div>
      <div className="mt-1 opacity-80 text-sm">{desc}</div>
      <div className="mt-3 text-xs inline-flex items-center gap-1 opacity-80 group-hover:opacity-100">เปิดแอพ <ChevronRight className="w-4 h-4"/></div>
    </button>
  );
}

function Footer(){
  return (
    <footer className="py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-xs opacity-70 flex items-center justify-between">
        <span>© {new Date().getFullYear()} MeeApp</span>
        <span>Pay what you want (เร็ว ๆ นี้)</span>
      </div>
    </footer>
  );
}

type TxT = Tx;

const INVEST_CATS_ARR = ["โอนเงินไปเทรดหุ้น","ออมทอง","ซื้อหุ้น"] as const;

function BudgetMiniApp(){
  const [startBalance, setStartBalance] = useState<number>(() => Number(localStorage.getItem('budget_start')||78956.64));
  const [transactions, setTransactions] = useState<TxT[]>(() => { try { return JSON.parse(localStorage.getItem('budget_tx')||'[]'); } catch(e){ return []; } });
  const [showOnboarding, setShowOnboarding] = useState<boolean>(() => localStorage.getItem('budget_onboard')!=='1');
  const [addOpen, setAddOpen] = useState<boolean>(() => (localStorage.getItem('budget_addOpen') ?? '1') === '1');
  useEffect(()=>localStorage.setItem('budget_tx', JSON.stringify(transactions)),[transactions]);
  useEffect(()=>localStorage.setItem('budget_start', String(startBalance)),[startBalance]);
  useEffect(()=>localStorage.setItem('budget_addOpen', addOpen?'1':'0'),[addOpen]);

  const incomeActual = Number(sum(transactions.filter(t => t.type==='income' && t.status!=='forecast').map(t => t.amount)));
  const expenseActual = Number(sum(transactions.filter(t => t.type!=='income' && t.status!=='forecast').map(t => t.amount)));
  const incomeForecast = Number(sum(transactions.filter(t => t.type==='income' && t.status==='forecast').map(t=>t.amount)));
  const expenseForecast = Number(sum(transactions.filter(t => (t.type==='expense' || t.type==='invest') && t.status==='forecast').map(t=>t.amount)));
  const investedActual = Number(sum(transactions.filter(t => t.status!=='forecast' && (t.type==='invest' || (t.type==='expense' && (INVEST_CATS_ARR as readonly string[]).includes(t.category)))).map(t=>t.amount)));

  const segCash = Math.max(0, startBalance + Number(incomeActual) - Number(expenseActual));
  const segInvest = Math.max(0, Number(investedActual));
  const segIncF = Math.max(0, Number(incomeForecast));
  const segExpF = Math.max(0, Number(expenseForecast));
  const wheelData = [{name:'เงินคงเหลือ', value: segCash, color:'#22c55e'},{name:'เงินลงทุน', value: segInvest, color:'#0ea5e9'},{name:'คาดการณ์รายรับ', value: segIncF, color:'#a78bfa'},{name:'คาดการณ์รายจ่าย', value: segExpF, color:'#f43f5e'}].filter(s=>s.value>0);

  const balanceActual = startBalance + Number(incomeActual) - Number(expenseActual);
  const netForecast = Number(incomeForecast) - Number(expenseForecast);
  const combinedWithInvest = balanceActual + Number(investedActual) + netForecast;

  const [form, setForm] = useState<{date:string;type:TxType;status:TxStatus;category:string;amount:number;note?:string}>({
    date: todayISO(), type: "expense", status: 'actual', category: "ค่ากิน", amount: 0, note: ""
  });
  const addTx = () => {
    const amt = Number(form.amount); if (!amt || amt <= 0) return alert("กรุณาใส่จำนวนเงินที่มากกว่า 0"); if (!form.category) return alert("กรุณาเลือกหมวดหมู่");
    const tx: Tx = { id: uid(), date: form.date, type: form.type, status: form.status, category: form.category, amount: amt, note: form.note };
    setTransactions(prev => [tx, ...prev]); setForm(f => ({ ...f, amount: 0, note: "" }));
  };
  const removeTx = (id: string) => setTransactions(prev => prev.filter(t => t.id !== id));
  const confirmTx = (id: string) => setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'actual' } : t));

  return (
    <div className="max-w-5xl mx-auto">
      <header className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5 flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 truncate"><Wallet className="w-5 h-5 sm:w-6 sm:h-6" /> MeeApp — บัญชี</h1>
          <p className="text-slate-400 text-xs sm:text-sm">เดือนปัจจุบัน: <span className="font-semibold">{ym()}</span></p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => exportCSV(transactions, ym())} className="px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 ring-1 ring-white/20 text-xs sm:text-sm inline-flex items-center gap-2"><Download className="w-4 h-4"/> CSV</button>
          {/* Reset lightweight (clear localStorage keys) */}
          <button onClick={() => { localStorage.removeItem('budget_tx'); localStorage.removeItem('budget_start'); setTransactions([]); setStartBalance(78956.64); }} className="px-3 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-xs sm:text-sm inline-flex items-center gap-2"><RotateCcw className="w-4 h-4"/> รีเซ็ต</button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 mb-5">
        <GaugeCard title="ยอดเงินคงเหลือ" centerValue={balanceActual} subtitle="เงินเหลือจริง ปัจจุบัน (ไม่ร่วมอย่างอื่น)"
          segments={wheelData} details={{ current: balanceActual, invest: segInvest, incomeForecast: segIncF, expenseForecast: segExpF, netForecast, combinedWithInvest }}/>
      </div>

      <section className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5 mb-5">
        <button type="button" onClick={() => setAddOpen(o => !o)} aria-expanded={addOpen} className="w-full flex items-center justify-between font-semibold mb-3">
          <span>เพิ่มรายการ</span>
          <span className="inline-flex items-center gap-1 text-xs opacity-80">{addOpen ? 'ย่อ' : 'ขยาย'} {addOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}</span>
        </button>
        <div className={`grid grid-cols-1 sm:grid-cols-6 gap-3 ${addOpen ? '' : 'hidden'}`}>
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-400">วันที่</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20 focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-400/40 transition" />
          </div>
          <div>
            <label className="text-sm text-slate-400">ประเภท</label>
            <select value={form.type} onChange={(e) => { const newType = e.target.value as TxType; let cat = newType==='income'? 'เงินเดือน' : newType==='invest'? 'โอนเงินไปเทรดหุ้น': 'ค่ากิน'; setForm(f => ({ ...f, type: newType, category: cat })); }} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20">
              <option value="expense">รายจ่าย</option><option value="income">รายรับ</option><option value="invest">ลงทุน</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400">หมวดหมู่</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20">
              {form.type === 'income' && (INCOME_CATS as readonly string[]).map(c => <option key={c} value={c}>{c}</option>)}
              {form.type === 'invest' && (INVEST_CATS as readonly string[]).map(c => <option key={c} value={c}>{c}</option>)}
              {form.type === 'expense' && (<>
                <optgroup label="รายวัน (Daily)">{(DAILY_CATS as readonly string[]).map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
                <optgroup label="รายเดือน (Bills)">{(BILLS_CATS as readonly string[]).map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
                <optgroup label="พิเศษ/อื่น ๆ">{(SPECIAL_CATS as readonly string[]).map(c => <option key={c} value={c}>{c}</option>)}</optgroup>
              </>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-slate-400">จำนวนเงิน (บาท)</label>
            <input type="number" inputMode="decimal" step="0.01" placeholder="0.00" value={Number(form.amount) || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-400">หมายเหตุ (ถ้ามี)</label>
            <input type="text" placeholder="รายละเอียดเพิ่มเติม" value={form.note || ''} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-sm text-slate-400">สถานะ</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TxStatus })} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20">
              <option value="actual">จริง</option><option value="forecast">คาดการณ์</option>
            </select>
            <p className="text-xs mt-1 text-slate-400">{form.status === 'forecast' ? 'ค่านี้จะถูกรวมในยอดรวม (เงินสะสม) และวงเล็บจะแสดงยอดปัจจุบันแยกไว้' : 'บันทึกเป็นรายการจริงทันที'}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 mt-4 ${addOpen ? '' : 'hidden'}`}>
          <button onClick={addTx} className="px-4 py-2 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-500 text-black font-medium shadow-[0_8px_24px_rgba(250,204,21,0.25)]">บันทึกรายการ</button>
        </div>
      </section>

      <section className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5 mb-8">
        <h2 className="font-semibold mb-3">รายการล่าสุด</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left text-slate-400"><th className="py-2 pr-4">วันที่</th><th className="py-2 pr-4">ประเภท</th><th className="py-2 pr-4">หมวด</th><th className="py-2 pr-4 text-right">จำนวน</th><th className="py-2 pr-4">หมายเหตุ</th><th className="py-2 pr-4 text-right">#</th></tr></thead>
            <tbody>
              {transactions.length===0 && (<tr><td colSpan={6} className="py-6 text-center opacity-70">ยังไม่มีรายการ — เพิ่มด้านบนได้เลย</td></tr>)}
              {transactions.map(t => (<tr key={t.id} className="border-t border-white/10 hover:bg-white/5 transition">
                <td className="py-2 pr-4">{t.date}</td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${t.type === 'income' ? 'bg-emerald-700/40 text-emerald-200' : t.type === 'invest' ? 'bg-sky-700/40 text-sky-200' : 'bg-rose-700/40 text-rose-200'}`}>{t.type === 'income' ? 'รายรับ' : t.type === 'invest' ? 'ลงทุน' : 'รายจ่าย'}</span>
                  {t.status === 'forecast' && (<span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300"><Clock className="w-3 h-3"/> คาดการณ์</span>)}
                </td>
                <td className="py-2 pr-4">{t.category}</td>
                <td className={`py-2 pr-4 text-right ${t.type === 'income' ? 'text-emerald-300' : t.type === 'invest' ? 'text-sky-300' : 'text-rose-300'}`}>{t.type === 'income' ? "+" : "-"}{fmt(t.amount)}</td>
                <td className="py-2 pr-4">{t.note || "-"}</td>
                <td className="py-2 pr-4 text-right">
                  {t.status === 'forecast' ? (<button aria-label="ยืนยันรายการ" title="ยืนยันรายการ" onClick={() => confirmTx(t.id)} className="px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs inline-flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> ยืนยันแล้ว</button>) : (<button aria-label="ลบรายการ" title="ลบรายการ" onClick={() => removeTx(t.id)} className="px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs">ลบ</button>)}
                </td>
              </tr>))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function exportCSV(transactions: TxT[], currentYM: string){
  const header = ["id,date,type,status,category,amount,note"]; 
  const rows = transactions.map((t) => [t.id, t.date, t.type, t.status, t.category, t.amount, (t.note || "").replace(/,/g, " ")].join(","));
  const csv = [...header, ...rows].join("\\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `budget-${currentYM}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
}

function GaugeCard({ title, centerValue, subtitle, segments, details }: { title:string; centerValue:number; subtitle?:string; segments:{name:string; value:number; color:string}[]; details:any; }){
  const [open, setOpen] = useState(false);
  const total = segments.reduce((a, s) => a + s.value, 0);
  const data = (total > 0 ? segments : [{ name: 'ว่าง', value: 1, color: '#334155' }]);
  return (
    <div className="rainbow-border rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-slate-300 text-xs">{title}</div>
        <button type="button" onClick={() => setOpen(o => !o)} aria-expanded={open} className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition">
          {open ? <ChevronDown className="w-3.5 h-3.5"/> : <ChevronRight className="w-3.5 h-3.5"/>} รายละเอียด
        </button>
      </div>
      <div className="h-36 sm:h-40 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270} isAnimationActive={false}>
              {data.map((entry, i) => (<Cell key={`cell-${i}`} fill={entry.color} />))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-xl font-semibold">{fmt(centerValue)}</div>
          <div className="text-[10px] sm:text-xs opacity-70">บาท</div>
        </div>
      </div>
      {subtitle && <div className="text-slate-400 text-xs mt-1 text-center">{subtitle}</div>}
      <div className={`mt-2 text-xs ${open ? '' : 'hidden'}`}>
        <div className="flex items-center justify-between py-0.5"><span className="text-slate-300">ปัจจุบัน</span><span className="font-medium">{fmt(details.current)}</span></div>
        <div className="flex items-center justify-between py-0.5"><span className="text-slate-300">ลงทุน (ออมทอง, เทรด, ซื้อหุ้น)</span><span className="font-medium">{fmt(details.invest)}</span></div>
        <div className="flex items-center justify-between py-0.5"><span className="text-slate-300">เงินคาดการณ์ รายรับ</span><span className="font-medium">{fmt(details.incomeForecast)}</span></div>
        <div className="flex items-center justify-between py-0.5"><span className="text-slate-300">เงินคาดการณ์ รายจ่าย</span><span className="font-medium">{fmt(details.expenseForecast)}</span></div>
        <div className="flex items-center justify-between py-0.5"><span className="text-slate-300">รวมเงินคาดการณ์ (สุทธิ)</span><span className="font-medium">{fmt(details.netForecast)}</span></div>
        <div className="flex items-center justify-between py-0.5"><span className="text-slate-300">รวม (ปัจจุบัน + คาดการณ์ + ลงทุน)</span><span className="font-semibold">{fmt(details.combinedWithInvest)}</span></div>
      </div>
    </div>
  );
}

function TravelMock(){
  const [trips, setTrips] = useState<Array<{
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    status: 'planning' | 'ongoing' | 'completed';
    budget: number;
    notes: string;
    checklist: Array<{id: string; item: string; completed: boolean}>;
  }>>(() => {
    try { return JSON.parse(localStorage.getItem('travel_trips')||'[]'); } catch(e){ return []; }
  });
  
  const [showAddTrip, setShowAddTrip] = useState(false);
  const [form, setForm] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 0,
    notes: '',
    checklist: [{id: uid(), item: 'หนังสือเดินทาง', completed: false}]
  });

  useEffect(() => localStorage.setItem('travel_trips', JSON.stringify(trips)), [trips]);

  const addTrip = () => {
    if (!form.title || !form.destination || !form.startDate || !form.endDate) {
      return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
    const newTrip = {
      id: uid(),
      ...form,
      status: 'planning' as const,
      checklist: form.checklist.filter(item => item.item.trim())
    };
    setTrips(prev => [newTrip, ...prev]);
    setForm({
      title: '',
      destination: '',
      startDate: '',
      endDate: '',
      budget: 0,
      notes: '',
      checklist: [{id: uid(), item: 'หนังสือเดินทาง', completed: false}]
    });
    setShowAddTrip(false);
  };

  const updateTrip = (id: string, updates: any) => {
    setTrips(prev => prev.map(trip => trip.id === id ? {...trip, ...updates} : trip));
  };

  const deleteTrip = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบทริปนี้?')) {
      setTrips(prev => prev.filter(trip => trip.id !== id));
    }
  };

  const addChecklistItem = (tripId: string) => {
    const newItem = {id: uid(), item: '', completed: false};
    updateTrip(tripId, {
      checklist: [...trips.find(t => t.id === tripId)!.checklist, newItem]
    });
  };

  const updateChecklistItem = (tripId: string, itemId: string, updates: any) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const updatedChecklist = trip.checklist.map(item => 
      item.id === itemId ? {...item, ...updates} : item
    );
    updateTrip(tripId, {checklist: updatedChecklist});
  };

  const removeChecklistItem = (tripId: string, itemId: string) => {
    const trip = trips.find(t => t.id === tripId);
    if (!trip) return;
    const updatedChecklist = trip.checklist.filter(item => item.id !== itemId);
    updateTrip(tripId, {checklist: updatedChecklist});
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'planning': return 'bg-blue-600/40 text-blue-200';
      case 'ongoing': return 'bg-green-600/40 text-green-200';
      case 'completed': return 'bg-gray-600/40 text-gray-200';
      default: return 'bg-gray-600/40 text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'planning': return 'วางแผน';
      case 'ongoing': return 'กำลังเดินทาง';
      case 'completed': return 'เสร็จสิ้น';
      default: return 'ไม่ทราบ';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5 flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 truncate"><Map className="w-5 h-5 sm:w-6 sm:h-6" /> MeeApp — แผนการเดินทาง</h1>
          <p className="text-slate-400 text-xs sm:text-sm">จัดการทริปและเช็กลิสต์การเดินทาง</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setShowAddTrip(true)} className="px-3 py-2 rounded-full bg-gradient-to-br from-blue-200 to-blue-500 text-black font-medium shadow-[0_8px_24px_rgba(59,130,246,0.25)]">เพิ่มทริปใหม่</button>
        </div>
      </header>

      {showAddTrip && (
        <div className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5 mb-5">
          <h3 className="font-semibold mb-3">เพิ่มทริปใหม่</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="text-sm text-slate-400">ชื่อทริป</label>
              <input type="text" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" placeholder="เช่น เที่ยวญี่ปุ่น" />
            </div>
            <div>
              <label className="text-sm text-slate-400">จุดหมาย</label>
              <input type="text" value={form.destination} onChange={(e) => setForm({...form, destination: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" placeholder="เช่น โตเกียว, ญี่ปุ่น" />
            </div>
            <div>
              <label className="text-sm text-slate-400">วันที่เริ่ม</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" />
            </div>
            <div>
              <label className="text-sm text-slate-400">วันที่สิ้นสุด</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" />
            </div>
            <div>
              <label className="text-sm text-slate-400">งบประมาณ (บาท)</label>
              <input type="number" value={form.budget || ''} onChange={(e) => setForm({...form, budget: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" placeholder="0" />
            </div>
            <div>
              <label className="text-sm text-slate-400">สถานะ</label>
              <select value="planning" className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" disabled>
                <option value="planning">วางแผน</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="text-sm text-slate-400">หมายเหตุ</label>
            <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" rows={3} placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับทริป" />
          </div>
          <div className="mb-3">
            <label className="text-sm text-slate-400">เช็กลิสต์เริ่มต้น</label>
            <div className="space-y-2">
              {form.checklist.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                  <input type="text" value={item.item} onChange={(e) => {
                    const newChecklist = [...form.checklist];
                    newChecklist[index].item = e.target.value;
                    setForm({...form, checklist: newChecklist});
                  }} className="flex-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" placeholder="รายการที่ต้องทำ" />
                  <button onClick={() => {
                    const newChecklist = form.checklist.filter((_, i) => i !== index);
                    setForm({...form, checklist: newChecklist});
                  }} className="px-2 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300">ลบ</button>
                </div>
              ))}
            </div>
            <button onClick={() => setForm({...form, checklist: [...form.checklist, {id: uid(), item: '', completed: false}]})} className="mt-2 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs">+ เพิ่มรายการ</button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={addTrip} className="px-4 py-2 rounded-full bg-gradient-to-br from-green-200 to-green-500 text-black font-medium">บันทึกทริป</button>
            <button onClick={() => setShowAddTrip(false)} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20">ยกเลิก</button>
          </div>
        </div>
      )}

      {trips.length === 0 ? (
        <div className="text-center py-12 opacity-70">
          <Map className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">ยังไม่มีทริป</h3>
          <p className="text-sm mb-4">เริ่มต้นวางแผนการเดินทางของคุณ</p>
          <button onClick={() => setShowAddTrip(true)} className="px-4 py-2 rounded-full bg-gradient-to-br from-blue-200 to-blue-500 text-black font-medium">สร้างทริปแรก</button>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map(trip => (
            <div key={trip.id} className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{trip.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(trip.status)}`}>
                      {getStatusText(trip.status)}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mb-1">📍 {trip.destination}</p>
                  <p className="text-slate-400 text-sm mb-1">📅 {trip.startDate} - {trip.endDate}</p>
                  {trip.budget > 0 && <p className="text-slate-400 text-sm mb-1">💰 งบประมาณ: {fmt(trip.budget)} บาท</p>}
                  {trip.notes && <p className="text-slate-400 text-sm mb-1">📝 {trip.notes}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select value={trip.status} onChange={(e) => updateTrip(trip.id, {status: e.target.value})} className="px-2 py-1 rounded-lg bg-white/10 border border-white/20 text-xs">
                    <option value="planning">วางแผน</option>
                    <option value="ongoing">กำลังเดินทาง</option>
                    <option value="completed">เสร็จสิ้น</option>
                  </select>
                  <button onClick={() => deleteTrip(trip.id)} className="px-2 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs">ลบ</button>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">เช็กลิสต์</h4>
                  <button onClick={() => addChecklistItem(trip.id)} className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-xs">+ เพิ่ม</button>
                </div>
                <div className="space-y-2">
                  {trip.checklist.map(item => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input type="checkbox" checked={item.completed} onChange={(e) => updateChecklistItem(trip.id, item.id, {completed: e.target.checked})} className="w-4 h-4" />
                      <input type="text" value={item.item} onChange={(e) => updateChecklistItem(trip.id, item.id, {item: e.target.value})} className={`flex-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-sm ${item.completed ? 'line-through opacity-60' : 'text-slate-300'}`} />
                      <button onClick={() => removeChecklistItem(trip.id, item.id)} className="px-2 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs">ลบ</button>
                    </div>
                  ))}
                </div>
                {trip.checklist.length > 0 && (
                  <div className="mt-2 text-xs text-slate-400">
                    เสร็จแล้ว {trip.checklist.filter(item => item.completed).length} จาก {trip.checklist.length} รายการ
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function BrainMock(){
  const [activeTab, setActiveTab] = useState<'flashcards' | 'quiz' | 'notes'>('flashcards');
  const [flashcards, setFlashcards] = useState<Array<{
    id: string;
    front: string;
    back: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    lastReviewed: string | null;
    reviewCount: number;
  }>>(() => {
    try { return JSON.parse(localStorage.getItem('brain_flashcards')||'[]'); } catch(e){ return []; }
  });
  
  const [notes, setNotes] = useState<Array<{
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
  }>>(() => {
    try { return JSON.parse(localStorage.getItem('brain_notes')||'[]'); } catch(e){ return []; }
  });

  const [showAddFlashcard, setShowAddFlashcard] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [quizMode, setQuizMode] = useState<'multiple' | 'truefalse'>('multiple');
  const [quizQuestions, setQuizQuestions] = useState<Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>>(() => {
    try { return JSON.parse(localStorage.getItem('brain_quiz')||'[]'); } catch(e){ return []; }
  });

  const [flashcardForm, setFlashcardForm] = useState({
    front: '',
    back: '',
    category: 'ทั่วไป',
    difficulty: 'medium' as const
  });

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    category: 'ทั่วไป',
    tags: ''
  });

  const [quizForm, setQuizForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: ''
  });

  useEffect(() => localStorage.setItem('brain_flashcards', JSON.stringify(flashcards)), [flashcards]);
  useEffect(() => localStorage.setItem('brain_notes', JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem('brain_quiz', JSON.stringify(quizQuestions)), [quizQuestions]);

  const addFlashcard = () => {
    if (!flashcardForm.front || !flashcardForm.back) {
      return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
    const newFlashcard = {
      id: uid(),
      ...flashcardForm,
      lastReviewed: null,
      reviewCount: 0
    };
    setFlashcards(prev => [newFlashcard, ...prev]);
    setFlashcardForm({ front: '', back: '', category: 'ทั่วไป', difficulty: 'medium' });
    setShowAddFlashcard(false);
  };

  const addNote = () => {
    if (!noteForm.title || !noteForm.content) {
      return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
    const newNote = {
      id: uid(),
      ...noteForm,
      tags: noteForm.tags.split(',').map(t => t.trim()).filter(t => t),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    setNoteForm({ title: '', content: '', category: 'ทั่วไป', tags: '' });
    setShowAddNote(false);
  };

  const addQuizQuestion = () => {
    if (!quizForm.question || quizForm.options.some(opt => !opt.trim()) || quizForm.explanation.trim() === '') {
      return alert('กรุณากรอกข้อมูลให้ครบถ้วน');
    }
    const newQuestion = {
      id: uid(),
      ...quizForm,
      options: quizForm.options.map(opt => opt.trim())
    };
    setQuizQuestions(prev => [newQuestion, ...prev]);
    setQuizForm({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' });
  };

  const deleteFlashcard = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบแฟลชการ์ดนี้?')) {
      setFlashcards(prev => prev.filter(f => f.id !== id));
    }
  };

  const deleteNote = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบโน้ตนี้?')) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  };

  const deleteQuizQuestion = (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบคำถามนี้?')) {
      setQuizQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  const markFlashcardReviewed = (id: string) => {
    setFlashcards(prev => prev.map(f => f.id === id ? {
      ...f,
      lastReviewed: new Date().toISOString(),
      reviewCount: f.reviewCount + 1
    } : f));
  };

  const nextFlashcard = () => {
    if (flashcards.length === 0) return;
    setCurrentFlashcardIndex(prev => (prev + 1) % flashcards.length);
    setShowAnswer(false);
  };

  const prevFlashcard = () => {
    if (flashcards.length === 0) return;
    setCurrentFlashcardIndex(prev => prev === 0 ? flashcards.length - 1 : prev - 1);
    setShowAnswer(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-600/40 text-green-200';
      case 'medium': return 'bg-yellow-600/40 text-yellow-200';
      case 'hard': return 'bg-red-600/40 text-red-200';
      default: return 'bg-gray-600/40 text-gray-200';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'ง่าย';
      case 'medium': return 'ปานกลาง';
      case 'hard': return 'ยาก';
      default: return 'ไม่ทราบ';
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <header className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5 flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 truncate"><Brain className="w-5 h-5 sm:w-6 sm:h-6" /> MeeApp — คลังความรู้</h1>
          <p className="text-slate-400 text-xs sm:text-sm">แฟลชการ์ด • แบบทดสอบ • โน้ตส่วนตัว</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => setShowAddFlashcard(true)} className="px-3 py-2 rounded-full bg-gradient-to-br from-purple-200 to-purple-500 text-black font-medium shadow-[0_8px_24px_rgba(147,51,234,0.25)]">+ แฟลชการ์ด</button>
          <button onClick={() => setShowAddNote(true)} className="px-3 py-2 rounded-full bg-gradient-to-br from-green-200 to-green-500 text-black font-medium shadow-[0_8px_24px_rgba(34,197,94,0.25)]">+ โน้ต</button>
        </div>
      </header>

      <div className="flex items-center gap-2 mb-5 p-1 rounded-2xl bg-white/5 backdrop-blur-2xl">
        <button onClick={() => setActiveTab('flashcards')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'flashcards' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}>
          แฟลชการ์ด ({flashcards.length})
        </button>
        <button onClick={() => setActiveTab('quiz')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'quiz' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}>
          แบบทดสอบ ({quizQuestions.length})
        </button>
        <button onClick={() => setActiveTab('notes')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'notes' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'}`}>
          โน้ต ({notes.length})
        </button>
      </div>

      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          {showAddFlashcard && (
            <div className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5">
              <h3 className="font-semibold mb-3">เพิ่มแฟลชการ์ดใหม่</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-sm text-slate-400">ด้านหน้า (คำถาม)</label>
                  <textarea value={flashcardForm.front} onChange={(e) => setFlashcardForm({...flashcardForm, front: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" rows={3} placeholder="คำถามหรือหัวข้อ" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">ด้านหลัง (คำตอบ)</label>
                  <textarea value={flashcardForm.back} onChange={(e) => setFlashcardForm({...flashcardForm, back: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" rows={3} placeholder="คำตอบหรือคำอธิบาย" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">หมวดหมู่</label>
                  <input type="text" value={flashcardForm.category} onChange={(e) => setFlashcardForm({...flashcardForm, category: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" placeholder="เช่น คณิตศาสตร์, ภาษาไทย" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">ระดับความยาก</label>
                  <select value={flashcardForm.difficulty} onChange={(e) => setFlashcardForm({...flashcardForm, difficulty: e.target.value as any})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                    <option value="easy">ง่าย</option>
                    <option value="medium">ปานกลาง</option>
                    <option value="hard">ยาก</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={addFlashcard} className="px-4 py-2 rounded-full bg-gradient-to-br from-green-200 to-green-500 text-black font-medium">บันทึก</button>
                <button onClick={() => setShowAddFlashcard(false)} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20">ยกเลิก</button>
              </div>
            </div>
          )}

          {flashcards.length === 0 ? (
            <div className="text-center py-12 opacity-70">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">ยังไม่มีแฟลชการ์ด</h3>
              <p className="text-sm mb-4">เริ่มต้นสร้างแฟลชการ์ดเพื่อทบทวนความรู้</p>
              <button onClick={() => setShowAddFlashcard(true)} className="px-4 py-2 rounded-full bg-gradient-to-br from-purple-200 to-purple-500 text-black font-medium">สร้างแฟลชการ์ดแรก</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rainbow-border rounded-3xl p-6 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5">
                <div className="text-center mb-4">
                  <div className="text-xs text-slate-400 mb-2">
                    {currentFlashcardIndex + 1} จาก {flashcards.length}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <button onClick={prevFlashcard} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(flashcards[currentFlashcardIndex]?.difficulty)}`}>
                      {getDifficultyText(flashcards[currentFlashcardIndex]?.difficulty)}
                    </span>
                    <button onClick={nextFlashcard} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="min-h-[200px] flex flex-col justify-center">
                  <div className="text-center mb-4">
                    <div className="text-lg font-medium mb-2">ด้านหน้า</div>
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 min-h-[100px] flex items-center justify-center">
                      {flashcards[currentFlashcardIndex]?.front || 'ไม่มีแฟลชการ์ด'}
                    </div>
                  </div>
                  
                  {showAnswer && (
                    <div className="text-center mb-4">
                      <div className="text-lg font-medium mb-2">ด้านหลัง</div>
                      <div className="p-4 bg-white/5 rounded-xl border border-white/10 min-h-[100px] flex items-center justify-center">
                        {flashcards[currentFlashcardIndex]?.back || 'ไม่มีคำตอบ'}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <button onClick={() => setShowAnswer(!showAnswer)} className="px-4 py-2 rounded-full bg-gradient-to-br from-blue-200 to-blue-500 text-black font-medium">
                      {showAnswer ? 'ซ่อนคำตอบ' : 'ดูคำตอบ'}
                    </button>
                    {showAnswer && (
                      <button onClick={() => markFlashcardReviewed(flashcards[currentFlashcardIndex]?.id || '')} className="ml-2 px-4 py-2 rounded-full bg-gradient-to-br from-green-200 to-green-500 text-black font-medium">
                        ทบทวนแล้ว
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm">รายการแฟลชการ์ด</h3>
                {flashcards.map((card, index) => (
                  <div key={card.id} className={`p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer transition ${index === currentFlashcardIndex ? 'ring-2 ring-blue-400/50' : 'hover:bg-white/10'}`} onClick={() => setCurrentFlashcardIndex(index)}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{card.front}</div>
                        <div className="text-xs text-slate-400 mt-1">{card.category}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${getDifficultyColor(card.difficulty)}`}>
                            {getDifficultyText(card.difficulty)}
                          </span>
                          {card.reviewCount > 0 && (
                            <span className="text-xs text-slate-400">ทบทวน {card.reviewCount} ครั้ง</span>
                          )}
                        </div>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteFlashcard(card.id); }} className="px-2 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs">ลบ</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'quiz' && (
        <div className="space-y-4">
          <div className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5">
            <h3 className="font-semibold mb-3">เพิ่มคำถามใหม่</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-slate-400">คำถาม</label>
                <textarea value={quizForm.question} onChange={(e) => setQuizForm({...quizForm, question: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" rows={2} placeholder="คำถามของคุณ" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quizForm.options.map((option, index) => (
                  <div key={index}>
                    <label className="text-sm text-slate-400">
                      ตัวเลือก {index + 1} {index === quizForm.correctAnswer && '(คำตอบที่ถูกต้อง)'}
                    </label>
                    <input type="text" value={option} onChange={(e) => {
                      const newOptions = [...quizForm.options];
                      newOptions[index] = e.target.value;
                      setQuizForm({...quizForm, options: newOptions});
                    }} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" placeholder={`ตัวเลือก ${index + 1}`} />
                  </div>
                ))}
              </div>
              <div>
                <label className="text-sm text-slate-400">คำตอบที่ถูกต้อง</label>
                <select value={quizForm.correctAnswer} onChange={(e) => setQuizForm({...quizForm, correctAnswer: Number(e.target.value)})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                  {quizForm.options.map((_, index) => (
                    <option key={index} value={index}>ตัวเลือก {index + 1}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400">คำอธิบาย</label>
                <textarea value={quizForm.explanation} onChange={(e) => setQuizForm({...quizForm, explanation: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" rows={2} placeholder="คำอธิบายว่าทำไมคำตอบนี้ถูกต้อง" />
              </div>
              <button onClick={addQuizQuestion} className="px-4 py-2 rounded-full bg-gradient-to-br from-blue-200 to-blue-500 text-black font-medium">เพิ่มคำถาม</button>
            </div>
          </div>

          {quizQuestions.length === 0 ? (
            <div className="text-center py-12 opacity-70">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">ยังไม่มีคำถาม</h3>
              <p className="text-sm mb-4">สร้างคำถามเพื่อทดสอบความรู้ของคุณ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quizQuestions.map((question, index) => (
                <div key={question.id} className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h4 className="font-semibold">คำถาม {index + 1}</h4>
                    <button onClick={() => deleteQuizQuestion(question.id)} className="px-2 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs">ลบ</button>
                  </div>
                  <div className="space-y-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="font-medium mb-2">{question.question}</div>
                      <div className="space-y-2">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className={`p-2 rounded-lg border ${optIndex === question.correctAnswer ? 'border-green-400/50 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                            <span className={`text-sm ${optIndex === question.correctAnswer ? 'text-green-300 font-medium' : 'text-slate-300'}`}>
                              {optIndex + 1}. {option}
                            </span>
                            {optIndex === question.correctAnswer && (
                              <span className="ml-2 text-xs text-green-400">✓ คำตอบที่ถูกต้อง</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                      <div className="text-sm text-slate-400 mb-1">คำอธิบาย:</div>
                      <div className="text-sm">{question.explanation}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'notes' && (
        <div className="space-y-4">
          {showAddNote && (
            <div className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5">
              <h3 className="font-semibold mb-3">เพิ่มโน้ตใหม่</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-slate-400">หัวข้อ</label>
                  <input type="text" value={noteForm.title} onChange={(e) => setNoteForm({...noteForm, title: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" placeholder="หัวข้อโน้ต" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">หมวดหมู่</label>
                  <input type="text" value={noteForm.category} onChange={(e) => setNoteForm({...noteForm, category: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" placeholder="เช่น การเรียน, งาน, ไอเดีย" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">แท็ก (คั่นด้วยเครื่องหมายจุลภาค)</label>
                  <input type="text" value={noteForm.tags} onChange={(e) => setNoteForm({...noteForm, tags: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" placeholder="เช่น เรียน, คณิตศาสตร์, สูตร" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">เนื้อหา</label>
                  <textarea value={noteForm.content} onChange={(e) => setNoteForm({...noteForm, content: e.target.value})} className="w-full mt-1 px-3 py-2 rounded-xl bg-white/10 border border-white/20" rows={6} placeholder="เนื้อหาโน้ตของคุณ" />
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={addNote} className="px-4 py-2 rounded-full bg-gradient-to-br from-green-200 to-green-500 text-black font-medium">บันทึก</button>
                  <button onClick={() => setShowAddNote(false)} className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20">ยกเลิก</button>
                </div>
              </div>
            </div>
          )}

          {notes.length === 0 ? (
            <div className="text-center py-12 opacity-70">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">ยังไม่มีโน้ต</h3>
              <p className="text-sm mb-4">เริ่มต้นเขียนโน้ตเพื่อบันทึกความรู้และไอเดีย</p>
              <button onClick={() => setShowAddNote(true)} className="px-4 py-2 rounded-full bg-gradient-to-br from-green-200 to-green-500 text-black font-medium">เขียนโน้ตแรก</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map(note => (
                <div key={note.id} className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1 truncate">{note.title}</h3>
                      <div className="text-sm text-slate-400 mb-2">{note.category}</div>
                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {note.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 rounded-full text-xs bg-white/10 text-slate-300">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button onClick={() => deleteNote(note.id)} className="px-2 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 text-xs">ลบ</button>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10 mb-3">
                    <div className="text-sm whitespace-pre-wrap">{note.content}</div>
                  </div>
                  <div className="text-xs text-slate-400">
                    สร้างเมื่อ: {new Date(note.createdAt).toLocaleDateString('th-TH')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function EyesMock(){
  const [currentLevel, setCurrentLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentDirection, setCurrentDirection] = useState<'up' | 'down' | 'left' | 'right'>('up');
  const [showResult, setShowResult] = useState(false);
  const [userAnswer, setUserAnswer] = useState<'up' | 'down' | 'left' | 'right' | null>(null);

  const directions = ['up', 'down', 'left', 'right'] as const;
  const directionArrows = {
    up: '↑',
    down: '↓',
    left: '←',
    right: '→'
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setCurrentLevel(1);
    setShowResult(false);
    setUserAnswer(null);
    generateNewDirection();
  };

  const generateNewDirection = () => {
    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
    setCurrentDirection(randomDirection);
    setUserAnswer(null);
  };

  const checkAnswer = (answer: 'up' | 'down' | 'left' | 'right') => {
    setUserAnswer(answer);
    if (answer === currentDirection) {
      setScore(prev => prev + 1);
      if (score + 1 >= 5) {
        setCurrentLevel(prev => prev + 1);
        setScore(0);
      }
    }
    setShowResult(true);
    
    setTimeout(() => {
      setShowResult(false);
      generateNewDirection();
    }, 1500);
  };

  const getLevelSize = (level: number) => {
    return Math.max(20, 100 - (level - 1) * 10);
  };

  const getLevelDescription = (level: number) => {
    if (level <= 3) return 'ง่าย';
    if (level <= 6) return 'ปานกลาง';
    if (level <= 9) return 'ยาก';
    return 'ยากมาก';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="rainbow-border rounded-3xl p-4 backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.45)] bg-gradient-to-br from-white/10 to-white/5 flex items-start justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 truncate"><Eye className="w-5 h-5 sm:w-6 sm:h-6" /> MeeApp — เกมวัดสายตา</h1>
          <p className="text-slate-400 text-xs sm:text-sm">ทดสอบการมองเห็นด้วย Snellen E Chart</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <div className="text-sm text-slate-400">ระดับ</div>
            <div className="text-lg font-bold">{currentLevel}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">คะแนน</div>
            <div className="text-lg font-bold">{score}/5</div>
          </div>
        </div>
      </header>

      {!gameStarted ? (
        <div className="text-center py-12">
          <Eye className="w-24 h-24 mx-auto mb-6 opacity-70" />
          <h2 className="text-2xl font-bold mb-4">เกมวัดสายตา</h2>
          <p className="text-lg mb-6 opacity-80">
            ทดสอบการมองเห็นของคุณด้วยเกม Snellen E Chart<br/>
            ดูทิศทางของตัว E และเลือกทิศทางที่ถูกต้อง
          </p>
          <div className="space-y-4 mb-8">
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-3xl mb-2">↑</div>
                <div className="text-sm text-slate-400">ขึ้น</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-3xl mb-2">↓</div>
                <div className="text-sm text-slate-400">ลง</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-3xl mb-2">←</div>
                <div className="text-sm text-slate-400">ซ้าย</div>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <div className="text-3xl mb-2">→</div>
                <div className="text-sm text-slate-400">ขวา</div>
              </div>
            </div>
          </div>
          <button onClick={startGame} className="px-8 py-4 rounded-full bg-gradient-to-br from-green-200 to-green-500 text-black font-bold text-lg shadow-[0_8px_24px_rgba(34,197,94,0.25)]">
            เริ่มเกม
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-center">
            <div className="text-sm text-slate-400 mb-2">ระดับ {currentLevel} - {getLevelDescription(currentLevel)}</div>
            <div className="text-xs text-slate-500 mb-4">ขนาดตัวอักษร: {getLevelSize(currentLevel)}px</div>
          </div>

          <div className="flex justify-center">
            <div 
              className="bg-white text-black font-bold flex items-center justify-center rounded-lg shadow-lg"
              style={{ 
                width: getLevelSize(currentLevel), 
                height: getLevelSize(currentLevel),
                fontSize: getLevelSize(currentLevel) * 0.6
              }}
            >
              {directionArrows[currentDirection]}
            </div>
          </div>

          {showResult && (
            <div className="text-center">
              <div className={`text-lg font-semibold mb-2 ${userAnswer === currentDirection ? 'text-green-400' : 'text-red-400'}`}>
                {userAnswer === currentDirection ? '✓ ถูกต้อง!' : '✗ ผิด!'}
              </div>
              <div className="text-sm text-slate-400">
                คำตอบที่ถูกต้อง: {directionArrows[currentDirection]}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {directions.map(direction => (
              <button
                key={direction}
                onClick={() => checkAnswer(direction)}
                disabled={showResult}
                className={`p-6 rounded-xl border-2 transition-all ${
                  showResult && userAnswer === direction
                    ? userAnswer === currentDirection
                      ? 'border-green-400 bg-green-500/20'
                      : 'border-red-400 bg-red-500/20'
                    : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
                } ${showResult ? 'opacity-60' : ''}`}
              >
                <div className="text-4xl mb-2">{directionArrows[direction]}</div>
                <div className="text-sm text-slate-400">
                  {direction === 'up' ? 'ขึ้น' : direction === 'down' ? 'ลง' : direction === 'left' ? 'ซ้าย' : 'ขวา'}
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <button 
              onClick={startGame} 
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-sm"
            >
              เริ่มใหม่
            </button>
          </div>

          <div className="text-center text-xs text-slate-500">
            <p>เกมนี้ช่วยทดสอบการมองเห็นและความแม่นยำในการแยกแยะทิศทาง</p>
            <p>หากมีปัญหาในการมองเห็น กรุณาปรึกษาจักษุแพทย์</p>
          </div>
        </div>
      )}
    </div>
  );
}

function NotFound(){ return <div className="p-6">ไม่พบหน้า</div>; }

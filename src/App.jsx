import { useEffect, useRef, useState } from 'react';
import { LayoutGrid, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { StoreProvider, useStore } from './store.jsx';
import { SCREENS, SHEETS } from './screens.jsx';
import { Header, TabBar, Toast } from './ui/kit.jsx';
import { StaffHeader, STAFF_TABS } from './screens/staff/Staff.jsx';
import { ParentHeader, PARENT_TABS } from './screens/parent/Parent.jsx';
import { SUP_TABS } from './screens/supervisor/Supervisor.jsx';
import { OrigHeader } from './screens/orig/OrigStaff.jsx';

const logo = `${import.meta.env.BASE_URL}logo-icon.svg`;

// ---------------------------------------------------------------- Login (as apps/mobile/app/(auth)/login.tsx)
function Field({ label, icon, ...rest }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 700 }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid var(--n-200)', borderRadius: 18, padding: '0 14px', height: 54, background: 'var(--n-50)' }}>
        {icon}
        <input {...rest} style={{ flex: 1, border: 0, outline: 0, background: 'none', fontFamily: 'inherit', fontSize: 16, color: 'var(--ink)', minWidth: 0 }} />
        {rest.trailing}
      </span>
    </label>
  );
}

function Login() {
  const { login, toast } = useStore();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr] = useState(null);
  const signIn = () => {
    if (!email || !pw) { setErr('يرجى إدخال البريد الإلكتروني وكلمة المرور.'); return; }
    setErr(null);
    login(/parent|ولي/i.test(email) ? 'parent' : /super|مشرف/i.test(email) ? 'supervisor' : 'staff');
  };
  return (
    <div className="scroll" style={{ background: 'var(--n-50)' }}>
      <div style={{ minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 22, padding: '40px 22px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <img src={logo} alt="KIDAY" style={{ height: 76 }} />
          <span style={{ fontSize: 28, fontWeight: 800, marginTop: 8 }}>مرحباً بعودتك</span>
          <span style={{ fontSize: 16, color: 'var(--ink-2)' }}>تسجيل الدخول إلى كيداي</span>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); signIn(); }} style={{ width: '100%', maxWidth: 420, background: '#FFF', border: '1px solid var(--n-100)', borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Field label="البريد الإلكتروني" icon={<Mail size={20} color="var(--ink-2)" />} placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} type="email" id="login-email" dir="ltr" />
          <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>كلمة المرور</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid var(--n-200)', borderRadius: 18, padding: '0 14px', height: 54, background: 'var(--n-50)' }}>
              <Lock size={20} color="var(--ink-2)" />
              <input id="login-password" type={show ? 'text' : 'password'} placeholder="أدخل كلمة المرور" value={pw} onChange={(e) => setPw(e.target.value)} style={{ flex: 1, border: 0, outline: 0, background: 'none', fontFamily: 'inherit', fontSize: 16, minWidth: 0 }} />
              <button type="button" onClick={() => setShow(!show)} aria-label="إظهار كلمة المرور" style={{ border: 0, background: 'none', cursor: 'pointer', display: 'flex' }}>{show ? <EyeOff size={20} color="var(--ink-2)" /> : <Eye size={20} color="var(--ink-2)" />}</button>
            </span>
          </label>
          <button type="submit" className="btn primary" style={{ borderRadius: 999, minHeight: 56 }}>تسجيل الدخول <ArrowLeft size={18} /></button>
          <button type="button" onClick={() => toast('نسيت كلمة المرور — غير مفعّل في النموذج')} style={{ border: 0, background: 'none', color: 'var(--violet-600)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>نسيت كلمة المرور؟</button>
          {err && <div className="banner danger" style={{ justifyContent: 'center' }}>{err}</div>}
          <div style={{ borderTop: '1px solid var(--n-100)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>دخول سريع (تطوير)</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['staff', 'موظف'], ['supervisor', 'مشرف'], ['parent', 'ولي أمر']].map(([r, l]) => (
                <button key={r} type="button" onClick={() => login(r)} style={{ flex: 1, height: 52, borderRadius: 999, border: '1.5px solid var(--violet-600)', background: 'var(--violet-50)', color: 'var(--violet-600)', fontWeight: 700, fontSize: 15, cursor: 'pointer', fontFamily: 'inherit' }}>{l}</button>
              ))}
            </div>
          </div>
        </form>
        <button type="button" onClick={() => toast('صفحة التعريف — غير مفعّلة في النموذج')} style={{ border: 0, background: 'none', color: 'var(--violet-600)', fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>جديد على كيداي؟ اعرف المزيد</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- the app inside the phone
function AppScreen() {
  const st = useStore();
  const { role, screen, sheet, data } = st;
  const scrollRef = useRef();
  useEffect(() => { scrollRef.current?.scrollTo(0, 0); }, [screen?.id, role]);
  const s = SCREENS[screen.id];
  const C = s.C;
  const Sh = sheet && SHEETS[sheet.id];
  const tabs = role === 'staff' ? STAFF_TABS(data) : role === 'parent' ? PARENT_TABS(data) : SUP_TABS(data);
  const header = s.header === 'back' ? <Header back title={s.title} />
    : s.header === 'staff' ? <StaffHeader /> : s.header === 'parent' ? <ParentHeader /> : <OrigHeader />;
  const conv = screen.id === 'P-05' || screen.id === 'T-11';
  const hub = role === 'staff' ? { icon: LayoutGrid, label: 'المركز', onClick: () => st.openSheet('hub') }
    : role === 'supervisor' ? { icon: LayoutGrid, label: 'المركز', onClick: () => st.openSheet('o-hub') } : null;
  return (
    <>
      {header}
      <div className="scroll" ref={scrollRef} key={`${role}-${screen.id}`}>
        {C && <C {...screen.params} />}
      </div>
      {!conv && <TabBar tabs={tabs} current={s.tab} hub={hub} />}
      {Sh && <Sh params={sheet.params || {}} key={sheet.id + JSON.stringify(sheet.params || {})} />}
    </>
  );
}

function Phone() {
  const st = useStore();
  return (
    <div className="phone-wrap">
      <div className="phone">
        <div className="screen">
          <div className="island" />
          <div className="status"><span>9:41</span><span style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13 }}>5G <span style={{ width: 24, height: 12, border: '1.5px solid #111', borderRadius: 4, display: 'inline-block', position: 'relative' }}><span style={{ position: 'absolute', inset: 1.5, width: '70%', background: '#111', borderRadius: 2 }} /></span></span></div>
          <div className="app">
            {st.role ? <AppScreen /> : <Login />}
            <Toast />
          </div>
          <div className="homebar" />
        </div>
      </div>
      <button className="phone-caption reset-link" onClick={st.reset}>إعادة ضبط بيانات النموذج</button>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <div className="stage" dir="rtl" lang="ar"><Phone /></div>
    </StoreProvider>
  );
}

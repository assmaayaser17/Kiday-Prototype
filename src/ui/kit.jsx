import { ChevronRight, X } from 'lucide-react';
import { useStore } from '../store.jsx';

export const PAL = [
  ['#ECE6F8', '#58447E'], ['#D5F1F1', '#0E6867'], ['#FFF2D8', '#8A5F0B'],
  ['#FEE4E3', '#923E39'], ['#F5F0EC', '#593C34'], ['#DDD2F3', '#3F325C'],
];

// state: in | exp | abs | sel | exc | sleep | lock | due | done | nudge | plain
export function Av({ name, pal = 0, size = 46, state = 'plain', badge }) {
  const [bg, fg] = PAL[pal % PAL.length];
  let style = { width: size, height: size, background: bg, color: fg, fontSize: size * 0.4 };
  let b = badge;
  switch (state) {
    case 'in': style.borderColor = '#7BC49A'; break;
    case 'exp': style = { ...style, background: '#FFF', color: 'var(--ink-3)', borderColor: 'var(--n-300)', borderStyle: 'dashed' }; break;
    case 'abs': case 'left': style.opacity = 0.35; break;
    case 'sel': style = { ...style, background: 'var(--brand)', color: '#FFF', borderColor: 'var(--brand)' }; b = b || ['✓', '#2E7D57']; break;
    case 'exc': style.borderColor = '#E08A00'; b = b || ['!', '#E08A00']; break;
    case 'sleep': style = { ...style, background: '#3B3270', color: '#FFF', borderColor: '#3B3270' }; b = b || ['☾', '#6B4BB5']; break;
    case 'lock': style = { ...style, background: '#ECE8EF', color: '#A49BB0', borderColor: 'var(--coral-700)' }; b = b || ['⊘', 'var(--coral-700)']; break;
    case 'due': style.borderColor = '#E08A00'; break;
    case 'done': style.borderColor = '#2E7D57'; b = b || ['✓', '#2E7D57']; break;
    case 'nudge': b = b || ['', '#E08A00']; break;
    default: break;
  }
  return (
    <span className="av" style={style} aria-hidden="true">
      {name[0]}
      {b && <span className="bdg" style={{ background: b[1], width: b[0] ? 18 : 12, height: b[0] ? 18 : 12 }}>{b[0]}</span>}
    </span>
  );
}

export function Tile({ child, state, note, size = 46, onClick, label, disabled }) {
  return (
    <button className="tile" onClick={onClick} disabled={disabled} aria-label={label || child.name}>
      <Av name={child.name} pal={child.pal} size={size} state={state} />
      <span className="nm" style={{ opacity: state === 'abs' || state === 'left' ? 0.45 : 1 }}>{child.name}</span>
      {note && <span className="nt">{note}</span>}
    </button>
  );
}

export function Header({ title, sub, start, end, back }) {
  const { back: goBack } = useStore();
  return (
    <div className="hdr">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        {back && <button className="iconbtn" onClick={goBack} aria-label="رجوع"><ChevronRight size={22} /></button>}
        {start}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span className="hdr-title">{title}</span>
          {sub && <span className="hdr-sub">{sub}</span>}
        </div>
      </div>
      {end}
    </div>
  );
}

export function Sheet({ title, sub, children, onClose }) {
  const { closeSheet } = useStore();
  const close = onClose || closeSheet;
  return (
    <>
      <div className="scrim" onClick={close} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="grab" />
        <div className="sbody">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <span className="stitle">{title}</span>
              {sub && <span className="ssub">{sub}</span>}
            </div>
            <button className="iconbtn" style={{ background: 'var(--surface-2)', width: 36, height: 36 }} onClick={close} aria-label="إغلاق"><X size={18} /></button>
          </div>
          {children}
        </div>
      </div>
    </>
  );
}

export function Seg({ items, value, onChange }) {
  return (
    <div className="seg" role="tablist">
      {items.map(([v, l]) => (
        <button key={v} aria-pressed={value === v} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}

export function Chip({ on, children, onClick }) {
  return <button className="chip" aria-pressed={!!on} onClick={onClick}>{on ? '✓ ' : ''}{children}</button>;
}

export function TabBar({ tabs, current, hub }) {
  const { tab } = useStore();
  const first = tabs.slice(0, Math.ceil(tabs.length / 2));
  const rest = tabs.slice(Math.ceil(tabs.length / 2));
  const B = ({ t }) => (
    <button aria-current={current === t.id ? 'page' : undefined} onClick={() => tab(t.id)}>
      <t.icon size={23} strokeWidth={current === t.id ? 2.4 : 1.8} />
      {t.label}
      {t.badge ? <span className="dot">{t.badge}</span> : null}
    </button>
  );
  return (
    <nav className="tabbar" aria-label="التنقل">
      {hub ? (
        <>
          <div className="tab-group">{first.map((t) => <B key={t.id} t={t} />)}</div>
          <button className="hub-button" onClick={hub.onClick} aria-label={hub.label}>
            <span className="hub"><hub.icon size={24} /></span>
          </button>
          <div className="tab-group">{rest.map((t) => <B key={t.id} t={t} />)}</div>
        </>
      ) : tabs.map((t) => <B key={t.id} t={t} />)}
    </nav>
  );
}

export function Toast() {
  const { toastState, clearToast } = useStore();
  if (!toastState) return null;
  return (
    <div className="toast" key={toastState.k} role="status">
      <span>{toastState.text}</span>
      {toastState.undo && <button onClick={() => { toastState.undo(); clearToast(); }}>تراجع</button>}
    </div>
  );
}

const SCENES = [
  ['#FEDB8D', '#FDB924', '☀'], ['#B3E6E6', '#18B3B2', '✿'], ['#DDD2F3', '#9776DA', '✎'],
  ['#FECECC', '#FC6B63', '♥'], ['#D5F1F1', '#52C6C5', '☁'],
];
export function Photo({ n = 0, label, h }) {
  const [a, b, g] = SCENES[n % SCENES.length];
  return (
    <div className="photo" style={{ background: `linear-gradient(135deg, ${a}, ${b})`, aspectRatio: h ? 'auto' : undefined, height: h }}>
      <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, opacity: 0.55 }}>{g}</span>
      {label && <span style={{ position: 'relative' }}>{label}</span>}
    </div>
  );
}

export function Row({ child, title, sub, end, onClick, avState }) {
  return (
    <button className="row" onClick={onClick}>
      {child && <Av name={child.name} pal={child.pal} size={40} state={avState} />}
      <span className="grow"><span className="t">{title}</span>{sub && <span className="s">{sub}</span>}</span>
      {end}
    </button>
  );
}

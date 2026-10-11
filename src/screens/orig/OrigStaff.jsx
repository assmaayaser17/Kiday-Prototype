// The staff screens EXACTLY as they are in today's code (apps/mobile (work)).
// Used by the supervisor role. The teacher role uses the improved versions in screens/staff.
import { useState } from 'react';
import {
  Bell, Camera, Utensils, Moon, Droplets, PenLine, MoreHorizontal, Check, Image as ImageIcon, FileText, HeartPulse,
  AlertTriangle, Shield, Star, Users, LogIn, LogOut, ArrowLeftRight, ClipboardCheck, Clock, Megaphone, UserCheck, Search,
} from 'lucide-react';
import { useStore } from '../../store.jsx';
import { STAFF, ROOMS, childById, roomById, staffById } from '../../data.js';
import { ar, clockStr, presentIn, inRoom, ratio, staffIn, mealSentence, addLogs, isF } from '../../logic.js';
import { Av, Sheet, Chip, Photo } from '../../ui/kit.jsx';

export const SUP = 'maryam';
export const SUP_ROOM = 'sun';
const BY = 'مريم';

const MEAL_TYPES = ['الإفطار', 'وجبة الصباح الخفيفة', 'الغداء', 'وجبة العصر الخفيفة', 'العشاء'];
const MEAL_OUT = [['all', 'الكل', '🍽'], ['most', 'المعظم', '🙂'], ['some', 'البعض', '😕'], ['none', 'لا شيء', '✋']];
const CHANGE_OUT = [['wet', 'مبلّل', '💧'], ['dirty', 'متّسخ', '💩'], ['both', 'كلاهما', '➕'], ['dry', 'جاف', '✅']];
const OUT_WORD = { all: 'الكل', most: 'المعظم', some: 'البعض', none: 'لا شيء' };

const st = (d, c) => (d.picked[c.id] ? 'out' : d.attendance[c.id]?.status);
const ticks = (d, c) => {
  const t = [];
  d.logs.filter((l) => l.child === c.id).forEach((l) => {
    if (l.kind === 'meal') t.push(`${l.meal === 'الغداء' ? 'غداء' : l.meal === 'وجبة العصر' ? 'وجبة خفيفة' : 'فطور'} ✓`);
    if (l.kind === 'change') t.push(`تغيير ${l.time}`);
    if (l.kind === 'nap') t.push(`قيلولة ${l.time}`);
    if (l.kind === 'photo') t.push(`صورة ${l.time}`);
  });
  return [...new Set(t)];
};
const flags = (c) => (
  <>
    {c.allergy && <span style={{ color: 'var(--danger)', fontSize: 11, fontWeight: 800, marginInlineStart: 6 }}>{c.allergy}</span>}
    {c.noPhoto && <span style={{ color: 'var(--ink)', fontSize: 11, fontWeight: 800, marginInlineStart: 6 }}>بدون صور</span>}
  </>
);
function rosterLine(d, c) {
  const s = st(d, c);
  const base = s === 'in' ? `الوصول ${d.attendance[c.id].at}` : s === 'out' ? `المغادرة ${d.picked[c.id].at}` : s === 'expected' ? 'متوقّع الوصول' : 'غياب اليوم';
  return [base, ...ticks(d, c)].join(' · ');
}
const nudge = (c) => (c.id === 's2' ? 'لا تغيير منذ ٩:١٠' : c.id === 's7' ? 'لا وجبة مسجّلة' : null);

function RosterRow({ c, sel, onClick }) {
  const { data } = useStore();
  const s = st(data, c);
  const dot = s === 'in' ? '#2E7D57' : s === 'out' ? 'var(--n-400)' : null;
  const n = s === 'in' ? nudge(c) : null;
  return (
    <button className="row" style={{ borderRadius: 0, background: sel ? 'var(--violet-50)' : '#FFF', borderBottom: '1px solid var(--line)' }} onClick={onClick}>
      <span style={{ position: 'relative' }}>
        <span className="av" style={{ width: 40, height: 40, borderRadius: 13, background: 'var(--violet-100)', color: 'var(--violet-600)', fontSize: 16 }}>{c.name[0]}</span>
        {dot && <span style={{ position: 'absolute', bottom: -1, insetInlineEnd: -1, width: 11, height: 11, borderRadius: 6, background: dot, border: '2px solid #FFF' }} />}
      </span>
      <span className="grow">
        <span className="t" style={{ fontSize: 14.5 }}>{c.name}{flags(c)}</span>
        <span className="s">{rosterLine(data, c)}{n && <span style={{ color: 'var(--warn)', fontWeight: 700 }}> · {n}</span>}</span>
      </span>
      {sel !== undefined && <span style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${sel ? 'var(--brand)' : 'var(--n-300)'}`, background: sel ? 'var(--brand)' : '#FFF', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sel && <Check size={14} />}</span>}
    </button>
  );
}

// ---------------------------------------------------------------- header
export function OrigHeader() {
  const { data, openSheet } = useStore();
  const room = roomById(SUP_ROOM);
  const r = ratio(data, room.id);
  const exp = inRoom(room.id).filter((c) => data.attendance[c.id]?.status === 'expected').length;
  return (
    <div className="hdr">
      <button className="row" style={{ width: 'auto', padding: '6px 12px', borderRadius: 16, gap: 8 }} onClick={() => openSheet('o-switch')}>
        <span style={{ fontSize: 18 }}>🌻</span>
        <span className="grow">
          <span className="t" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{room.name}<span className={`pill ${r.kind}`}>{r.label} {r.word || ''}</span></span>
          <span className="s">{ar(r.kids)} حاضرون{exp ? ` · ${ar(exp)} متوقّعون` : ''}</span>
        </span>
      </button>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="iconbtn" aria-label="الإشعارات"><Bell size={20} /></button>
        <button className="iconbtn" style={{ background: 'var(--violet-100)', color: 'var(--violet-700)', fontWeight: 800 }} onClick={() => openSheet('o-me')} aria-label="ملفك الشخصي">م</button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Today (code)
const STRIP = [['photo', 'صورة', Camera], ['meal', 'وجبة', Utensils], ['nap', 'نوم', Moon], ['change', 'تغيير', Droplets], ['say', 'قولها', PenLine], ['more', 'المزيد', MoreHorizontal]];

export function OrigToday() {
  const { data, update, openSheet, toast } = useStore();
  const [sel, setSel] = useState(null);
  const all = inRoom(SUP_ROOM);
  const groups = { in: all.filter((c) => st(data, c) === 'in'), expected: all.filter((c) => st(data, c) === 'expected'), absent: all.filter((c) => st(data, c) === 'absent'), out: all.filter((c) => st(data, c) === 'out') };
  const meals = data.logs.filter((l) => l.kind === 'meal' && childById(l.child)?.room === SUP_ROOM).length;
  const photos = data.logs.filter((l) => l.photo && childById(l.child)?.room === SUP_ROOM).length;
  const lunchLeft = groups.in.filter((c) => !data.logs.some((l) => l.child === c.id && l.meal === 'الغداء'));

  let card = null;
  if (!data.supClockIn) card = { eb: 'وردية اليوم', title: 'صباح الخير، مريم', body: 'سجّل حضورك لتبدأ يومك مع الفصل.', cta: `تسجيل الحضور · ${clockStr(data.clock)}`, go: () => { update({ supClockIn: true }); toast('تم تسجيل الحضور'); } };
  else if (lunchLeft.length && !data.supSkip) card = { eb: `الساعة ${clockStr(data.clock)} · وقت الغداء عادةً`, title: `الغداء للجميع (${ar(groups.in.length)})؟`, cta: `سجّل الغداء · ${ar(groups.in.length)} أطفال`, go: () => openSheet('o-meal', {}), skip: () => update({ supSkip: true }) };

  const toggle = (c) => setSel((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; });
  const run = (k) => {
    if (sel && !sel.size) { toast('اختر طفلاً واحداً على الأقل أولاً'); return; }
    const ids = sel ? [...sel] : null;
    openSheet({ photo: 'o-photo', meal: 'o-meal', nap: 'o-nap', change: 'o-change', say: 'o-say', more: 'o-more' }[k], { ids });
  };
  const Sec = ({ title, n, action, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div className="sec"><span>{title} · {ar(n)}</span>{action}</div>
      <div className="card" style={{ padding: 0, gap: 0, overflow: 'hidden' }}>{children}</div>
    </div>
  );
  return (
    <div className="pad" style={{ paddingBottom: sel?.size ? 120 : 24 }}>
      <div className="card" style={{ borderRadius: 32 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
          {[[groups.in.length, 'حاضر', UserCheck], [meals, 'وجبات حتى الآن', Utensils], [photos, 'صور', Camera]].map(([v, l, I]) => (
            <span key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}><I size={18} color="var(--violet-600)" /><b style={{ fontSize: 22 }}>{ar(v)}</b><span className="small muted">{l}</span></span>
          ))}
        </div>
        {groups.absent.length > 0 && <span className="small muted" style={{ borderTop: '1px solid var(--line)', paddingTop: 8 }}>غياب اليوم: {groups.absent.map((c) => c.name).join('، ')}. لا شيء مطلوب.</span>}
      </div>
      {card && (
        <div className="card">
          <span className="small muted" style={{ fontWeight: 700 }}>{card.eb}</span>
          <span style={{ fontSize: 22, fontWeight: 800 }}>{card.title}</span>
          {card.body && <span className="small muted">{card.body}</span>}
          <button className="btn primary" onClick={card.go}>{card.cta}</button>
          {card.skip && <button className="btn" style={{ minHeight: 36, background: 'none', color: 'var(--ink-2)', fontSize: 14 }} onClick={card.skip}>ليس الآن</button>}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 2 }}>
        {STRIP.map(([k, l, I]) => (
          <button key={k} className="tile" onClick={() => run(k)} aria-label={l}>
            <span style={{ width: 46, height: 46, borderRadius: 23, background: k === 'say' ? 'var(--brand)' : '#FFF', color: k === 'say' ? '#FFF' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(55,21,14,.06)' }}><I size={20} /></span>
            <span className="nm" style={{ fontSize: 11.5 }}>{l}</span>
          </button>
        ))}
      </div>
      <Sec title="في الفصل" n={groups.in.length} action={<button onClick={() => setSel(sel ? null : new Set())}>{sel ? 'تم' : 'تحديد'}</button>}>
        {groups.in.map((c) => <RosterRow key={c.id} c={c} sel={sel ? sel.has(c.id) : undefined} onClick={() => (sel ? toggle(c) : openSheet('o-checkout', { id: c.id }))} />)}
      </Sec>
      {groups.expected.length > 0 && <Sec title="متوقّعون" n={groups.expected.length} action={<button onClick={() => openSheet('o-arrivals', {})}>الوصول</button>}>{groups.expected.map((c) => <RosterRow key={c.id} c={c} onClick={() => openSheet('o-arrivals', { pre: c.id })} />)}</Sec>}
      {groups.absent.length > 0 && <Sec title="غائبون" n={groups.absent.length}>{groups.absent.map((c) => <RosterRow key={c.id} c={c} />)}</Sec>}
      {groups.out.length > 0 && <Sec title="غادروا" n={groups.out.length}>{groups.out.map((c) => <RosterRow key={c.id} c={c} />)}</Sec>}
      {sel && sel.size > 0 && (
        <div style={{ position: 'absolute', left: 12, right: 12, bottom: 96, zIndex: 20, background: 'var(--violet-950)', color: '#FFF', borderRadius: 18, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800 }}>
            <span>{ar(sel.size)} محدّد</span>
            <span style={{ display: 'flex', gap: 12 }}><button style={{ border: 0, background: 'none', color: 'var(--violet-300)', fontWeight: 800, cursor: 'pointer' }} onClick={() => setSel(new Set(groups.in.map((c) => c.id)))}>الكل {ar(groups.in.length)}</button><button style={{ border: 0, background: 'none', color: 'var(--violet-300)', fontWeight: 800, cursor: 'pointer' }} onClick={() => setSel(null)}>إلغاء التحديد</button></span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {STRIP.slice(0, 4).map(([k, l, I]) => <button key={k} onClick={() => { run(k); setSel(null); }} style={{ border: 0, background: 'none', color: '#FFF', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}><I size={20} />{l}</button>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- Children (code)
export function OrigChildren() {
  const { data, push } = useStore();
  const [f, setF] = useState('in');
  const rooms = f === 'all' ? ROOMS : [roomById(SUP_ROOM)];
  const all = inRoom(SUP_ROOM);
  const n = { in: all.filter((c) => st(data, c) === 'in').length, away: all.filter((c) => st(data, c) !== 'in').length, look: all.filter((c) => st(data, c) === 'in' && nudge(c)).length };
  const pick = (c) => (f === 'in' ? st(data, c) === 'in' : f === 'away' ? st(data, c) !== 'in' : f === 'look' ? st(data, c) === 'in' && nudge(c) : true);
  return (
    <div className="pad">
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
        <Chip on={f === 'in'} onClick={() => setF('in')}>حاضرون اليوم · {ar(n.in)}</Chip>
        <Chip on={f === 'away'} onClick={() => setF('away')}>غائبون · {ar(n.away)}</Chip>
        <Chip on={f === 'look'} onClick={() => setF('look')}>يحتاج نظرة {ar(n.look)}</Chip>
        <Chip on={f === 'all'} onClick={() => setF('all')}>كل الغرف</Chip>
      </div>
      {rooms.map((r) => {
        const kids = inRoom(r.id).filter(pick);
        return (
          <div key={r.id} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {f === 'all' && <div className="sec"><span>{r.name} · {ar(kids.length)}</span></div>}
            <div className="card" style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
              {kids.map((c) => <RosterRow key={c.id} c={c} onClick={() => push('T-09', { id: c.id })} />)}
              {!kids.length && <div style={{ padding: 16, textAlign: 'center' }} className="small muted">لا شيء يحتاج نظرة — لكل طفل في الغرفة تسجيل حديث.</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------- sheets (code)
function ForBox({ kids, selIds, toggle }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: 16, padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, color: 'var(--ink-2)' }}><span>تسجيل لـ</span><span>{selIds.size === 1 ? childById([...selIds][0]).name : `${ar(selIds.size)} أطفال`}</span></div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {kids.map((c) => {
          const on = selIds.has(c.id);
          return (
            <button key={c.id} onClick={() => toggle(c)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#FFF', border: `1.5px solid ${on ? 'var(--brand)' : 'var(--line-2)'}`, opacity: on ? 1 : 0.5, borderRadius: 16, padding: '3px 8px 3px 4px', fontFamily: 'inherit', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              <span className="av" style={{ width: 22, height: 22, borderRadius: 11, background: 'var(--violet-100)', color: 'var(--violet-600)', fontSize: 11 }}>{c.name[0]}</span>{c.name}{on && <Check size={12} color="var(--brand)" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Routine({ params, kind }) {
  const { data, update, closeSheet, toast } = useStore();
  const avail = presentIn(data, SUP_ROOM);
  const [selIds, setSel] = useState(() => new Set(params.ids?.length ? params.ids : avail.map((c) => c.id)));
  const [meal, setMeal] = useState('الغداء');
  const [out, setOut] = useState(null);
  const [exc, setExc] = useState({});
  const opts = kind === 'meal' ? MEAL_OUT : CHANGE_OUT;
  const kids = avail.filter((c) => selIds.has(c.id));
  const toggle = (c) => setSel((s) => { const n = new Set(s); if (n.has(c.id)) { if (n.size > 1) n.delete(c.id); } else n.add(c.id); return n; });
  const save = (o = out) => {
    const entries = kids.map((c) => {
      const v = exc[c.id] || o;
      return kind === 'meal'
        ? { child: c.id, kind: 'meal', meal, by: BY, title: meal, text: mealSentence(c, meal, v), fresh: true }
        : { child: c.id, kind: 'change', by: BY, title: 'تغيير حفاض', text: `تم تغيير الحفاض — ${CHANGE_OUT.find((x) => x[0] === v)[1]}.`, fresh: true };
    });
    update((d) => addLogs({ ...d }, entries));
    closeSheet(); toast('تم الحفظ');
  };
  const pick = (v) => { setOut(v); setExc({}); if (kind === 'change' && kids.length === 1) save(v); };
  const cycle = (c) => { const order = opts.map((x) => x[0]); const cur = exc[c.id] || out; const nx = order[(order.indexOf(cur) + 1) % order.length]; setExc((e) => { const n = { ...e }; if (nx === out) delete n[c.id]; else n[c.id] = nx; return n; }); };
  const word = (v) => opts.find((x) => x[0] === v)[1];
  const first = kids[0];
  return (
    <Sheet title={kind === 'meal' ? meal : 'تغيير'} sub={`${ar(kids.length)} طفل · ${clockStr(data.clock)}`}>
      <ForBox kids={avail} selIds={selIds} toggle={toggle} />
      {kind === 'meal' && <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>{MEAL_TYPES.map((m) => <Chip key={m} on={meal === m} onClick={() => setMeal(m)}>{m}</Chip>)}</div>}
      <b style={{ fontSize: 18 }}>{kind === 'meal' ? `${meal} — كيف كانت الوجبة؟` : 'ما نوع التغيير؟'}</b>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {opts.map(([v, l, e]) => <button key={v} className="chip" aria-pressed={out === v} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 4px', alignItems: 'center' }} onClick={() => pick(v)}><span style={{ fontSize: 22 }}>{e}</span>{l}</button>)}
      </div>
      {out && kids.length > 1 && (<>
        <span className="small" style={{ fontWeight: 800, color: 'var(--ink-2)' }}>الاستثناءات · اضغط على طفل للتغيير</span>
        <div className="card" style={{ padding: 0, gap: 0, overflow: 'hidden', border: '1px solid var(--line)' }}>
          {kids.map((c) => (
            <button key={c.id} className="row" style={{ borderRadius: 0, borderBottom: '1px solid var(--line)', background: exc[c.id] ? 'var(--warn-soft)' : '#FFF' }} onClick={() => cycle(c)}>
              <Av name={c.name} pal={c.pal} size={32} />
              <span className="grow"><span className="t" style={{ fontSize: 14 }}>{c.name}</span>{c.allergy && kind === 'meal' && <span className="s">طبق خالٍ من {c.allergy}</span>}</span>
              <span className={`pill ${exc[c.id] ? 'warn' : 'ok'}`}>{word(exc[c.id] || out)} ▾</span>
            </button>
          ))}
        </div>
      </>)}
      {out && first && (
        <div className="card tight" style={{ background: 'var(--violet-50)' }}>
          <span className="small" style={{ fontWeight: 800, color: 'var(--violet-700)' }}>{kids.length === 1 ? `ستقرأ عائلة ${first.name} · AR` : `ستقرأ ${ar(kids.length)} عائلات · AR`}</span>
          <span style={{ fontSize: 15 }}>{kind === 'meal' ? mealSentence(first, meal, out).split('— ')[1] : `تم تغيير الحفاض — ${word(out)}.`}</span>
          <span className="small" style={{ color: 'var(--violet-600)', fontWeight: 800 }}>تعديل</span>
        </div>
      )}
      <span className="small muted">يظهر الأطفال الآخرون للعائلات باسم «صديق» — لا تذكر أسماءهم.</span>
      <button className="btn primary" disabled={!out} onClick={() => save()}>{!out ? 'اختر النتيجة' : kids.length === 1 ? `حفظ لـ ${first.name}` : `حفظ لـ ${ar(kids.length)} أطفال`}</button>
    </Sheet>
  );
}
const OMeal = (p) => <Routine {...p} kind="meal" />;
const OChange = (p) => <Routine {...p} kind="change" />;

function ONap() {
  const { data, update, toast } = useStore();
  const kids = presentIn(data, SUP_ROOM);
  const s = (c) => { const n = data.nap[c.id]; return !n ? 'awake' : n.end ? 'done' : 'asleep'; };
  const start = (c) => update((d) => ({ ...d, nap: { ...d.nap, [c.id]: { start: d.clock, by: BY } } }));
  const end = (c) => update((d) => { const n = d.nap[c.id]; const e = d.clock + 50; return addLogs({ ...d, nap: { ...d.nap, [c.id]: { ...n, end: e } } }, [{ child: c.id, kind: 'nap', by: BY, title: 'قيلولة', text: `${isF(c) ? 'نامت' : 'نام'} ${ar(e - n.start)} دقيقة.`, fresh: true }]); });
  const awake = kids.filter((c) => s(c) === 'awake');
  return (
    <Sheet title="القيلولة" sub={`${ar(kids.length)} أطفال`}>
      <div className="card" style={{ padding: 0, gap: 0, overflow: 'hidden', border: '1px solid var(--line)' }}>
        {kids.map((c) => (
          <div key={c.id} className="row" style={{ borderRadius: 0, borderBottom: '1px solid var(--line)', cursor: 'default' }}>
            <Av name={c.name} pal={c.pal} size={36} />
            <span className="grow"><span className="t" style={{ fontSize: 14 }}>{c.name}</span><span className="s">{s(c) === 'awake' ? 'استيقاظ · لا قيلولة بعد' : s(c) === 'asleep' ? `نوم منذ ${clockStr(data.nap[c.id].start)} · بواسطتك` : `استيقاظ · ${ar(data.nap[c.id].end - data.nap[c.id].start)} دقيقة`}</span></span>
            {s(c) === 'awake' && <button className="pill brand" style={{ border: 0, padding: '6px 12px', cursor: 'pointer' }} onClick={() => start(c)}>نوم الآن</button>}
            {s(c) === 'asleep' && <button className="pill warn" style={{ border: 0, padding: '6px 12px', cursor: 'pointer' }} onClick={() => { end(c); toast(`تم حفظ قيلولة ${c.name}`); }}>استيقاظ</button>}
            {s(c) === 'done' && <span className="pill mute">تم</span>}
          </div>
        ))}
      </div>
      <span className="small muted">كل من لا يزال نائماً عند ٣:٠٠ سيُسجَّل استيقاظه تلقائياً — يمكنك التعديل لاحقاً.</span>
      {awake.length > 0 && <button className="btn primary" onClick={() => update((d) => { const nap = { ...d.nap }; awake.forEach((c) => { nap[c.id] = { start: d.clock, by: BY }; }); return { ...d, nap }; })}>البقية نائمون الآن</button>}
    </Sheet>
  );
}

function OPhoto({ params }) {
  const { data, update, closeSheet, toast } = useStore();
  const [shot, setShot] = useState(false);
  const kids = presentIn(data, SUP_ROOM);
  const [sel, setSel] = useState(() => new Set((params.ids || []).filter((id) => !childById(id).noPhoto)));
  const [cap, setCap] = useState('');
  if (!shot) return (
    <Sheet title="صورة">
      {[['التقاط صورة', Camera], ['اختيار من المكتبة', ImageIcon]].map(([l, I]) => (
        <button key={l} className="row" style={{ background: 'var(--surface-2)', minHeight: 64 }} onClick={() => setShot(true)}><I size={22} /><span className="grow"><span className="t">{l}</span></span></button>
      ))}
    </Sheet>
  );
  return (
    <Sheet title="صورة">
      <Photo n={2} />
      <span className="small" style={{ color: 'var(--violet-600)', fontWeight: 800, textAlign: 'center' }}>إعادة الالتقاط</span>
      <span className="small" style={{ fontWeight: 800, color: 'var(--ink-2)' }}>في هذه الصورة · اضغط للإشارة</span>
      <div className="card" style={{ padding: 0, gap: 0, overflow: 'hidden', border: '1px solid var(--line)' }}>
        {kids.map((c) => (
          <button key={c.id} className="row" disabled={c.noPhoto} style={{ borderRadius: 0, borderBottom: '1px solid var(--line)', opacity: c.noPhoto ? 0.7 : 1, cursor: c.noPhoto ? 'not-allowed' : 'pointer' }} onClick={() => setSel((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; })}>
            <Av name={c.name} pal={c.pal} size={34} />
            <span className="grow"><span className="t" style={{ fontSize: 14 }}>{c.name}</span>{c.noPhoto && <span className="s" style={{ color: 'var(--warn)' }}>لا توجد موافقة تصوير لـ {c.name} — لن تتم الإشارة ولن تستلم العائلة هذه الصورة.</span>}</span>
            {!c.noPhoto && <span style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${sel.has(c.id) ? 'var(--brand)' : 'var(--n-300)'}`, background: sel.has(c.id) ? 'var(--brand)' : '#FFF', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sel.has(c.id) && <Check size={13} />}</span>}
          </button>
        ))}
      </div>
      <label className="small" style={{ fontWeight: 800 }}>التعليق<input value={cap} onChange={(e) => setCap(e.target.value)} placeholder="ماذا يحدث؟" style={{ width: '100%', marginTop: 6, border: '1.5px solid var(--line-2)', borderRadius: 12, padding: '10px 12px', fontFamily: 'inherit', fontSize: 15 }} /></label>
      <span className="small muted">النص المكتوب يُرسل كما هو باللغتين — دون ترجمة.</span>
      <button className="btn primary" disabled={!sel.size} onClick={() => { update((d) => addLogs({ ...d }, [...sel].map((id) => ({ child: id, kind: 'photo', by: BY, title: 'صورة جديدة', text: cap || 'لحظة من اليوم.', photo: 2, fresh: true })))); closeSheet(); toast('تم الحفظ'); }}>{sel.size ? `إرسال إلى ${ar(sel.size)} عائلات` : 'لا أحد لإرسال الصورة إليه'}</button>
    </Sheet>
  );
}

function OSay() {
  const { data, update, closeSheet, toast } = useStore();
  const [routine, setRoutine] = useState('وجبة');
  const [rows, setRows] = useState([]);
  const kids = inRoom(SUP_ROOM);
  const add = (c) => setRows((r) => (r.some((x) => x.id === c.id && x.r === routine) ? r.filter((x) => !(x.id === c.id && x.r === routine)) : [...r, { id: c.id, r: routine, o: routine === 'وجبة' ? 'الكل' : routine === 'تغيير' ? 'مبلّل' : 'نوم هادئ' }]));
  return (
    <Sheet title="قُلها">
      <span className="small" style={{ color: 'var(--violet-600)', fontWeight: 800, display: 'flex', gap: 6, alignItems: 'center' }}><PenLine size={14} /> اكتبها — الصوت قادم</span>
      <textarea placeholder="من وماذا — سارة وعمر أكلا كل الوجبة الخفيفة، آدم تغيير حفاض، مبلّل" style={{ border: '1.5px solid var(--line-2)', borderRadius: 14, padding: 12, minHeight: 88, fontFamily: 'inherit', fontSize: 15 }} />
      <span className="small muted">ابنِ الصفوف أدناه؛ يبقى النص مع السجلات للطاقم فقط.</span>
      <div className="chips">{['وجبة', 'تغيير', 'قيلولة'].map((r) => <Chip key={r} on={routine === r} onClick={() => setRoutine(r)}>{r}</Chip>)}</div>
      <span className="small" style={{ fontWeight: 800 }}>إضافة أطفال</span>
      <div className="chips">{kids.slice(0, 16).map((c) => <Chip key={c.id} on={rows.some((x) => x.id === c.id && x.r === routine)} onClick={() => add(c)}>{c.name}</Chip>)}</div>
      {rows.length === 0 ? <span className="small muted">لا سجلات بعد — اختر روتيناً واضغط على الأطفال.</span> : <b>{ar(rows.length)} سجلات</b>}
      <button className="btn primary" disabled={!rows.length} onClick={() => { update((d) => addLogs({ ...d }, rows.map((x) => ({ child: x.id, kind: x.r === 'وجبة' ? 'meal' : x.r === 'تغيير' ? 'change' : 'nap', by: BY, title: x.r, text: `${x.r} — ${x.o}.`, fresh: true })))); closeSheet(); toast('تم الحفظ'); }}>تأكيد {ar(rows.length)} سجلات</button>
    </Sheet>
  );
}

function OMore() {
  const { closeSheet, toast } = useStore();
  return (
    <Sheet title="المزيد">
      {[['ملاحظة', FileText], ['الصحة', HeartPulse], ['حادثة', AlertTriangle], ['طلب إذن', Shield]].map(([l, I]) => (
        <button key={l} className="row" style={{ minHeight: 64, background: 'var(--surface-2)' }} onClick={() => { closeSheet(); toast(`«${l}»`); }}><I size={20} /><span className="grow"><span className="t">{l}</span></span></button>
      ))}
      <span className="small" style={{ fontWeight: 800, color: 'var(--ink-2)' }}>أيضاً في هذه الغرفة</span>
      {['ماء', 'واقي شمس'].map((l) => <div key={l} className="row" style={{ cursor: 'default' }}><Star size={18} /><span className="grow"><span className="t">{l}</span></span></div>)}
    </Sheet>
  );
}

function OArrivals({ params }) {
  const { data, update, closeSheet, toast } = useStore();
  const exp = inRoom(SUP_ROOM).filter((c) => data.attendance[c.id]?.status === 'expected');
  const [sel, setSel] = useState(() => new Set(params.pre ? [params.pre] : []));
  const [mood, setMood] = useState(null);
  const go = () => {
    update((d) => { const att = { ...d.attendance }; sel.forEach((id) => { att[id] = { status: 'in', at: clockStr(d.clock), by: childById(id).dropoff }; }); return addLogs({ ...d, attendance: att }, [...sel].map((id) => ({ child: id, kind: 'arrival', by: BY, title: 'الوصول', text: `${isF(childById(id)) ? 'وصلت' : 'وصل'} ${childById(id).name}${mood ? ' — ' + mood : ''}.`, fresh: true }))); });
    closeSheet(); toast(`تم تسجيل وصول ${ar(sel.size)}`);
  };
  return (
    <Sheet title="الوصول الآن" sub="اضغط على من عند الباب. المزاج اختياري.">
      {exp.length === 0 ? <span className="small muted">لا أحد متوقّع الآن.</span> : (
        <div className="card" style={{ padding: 0, gap: 0, overflow: 'hidden', border: '1px solid var(--line)' }}>
          {exp.map((c) => { const on = sel.has(c.id); return (
            <button key={c.id} className="row" style={{ borderRadius: 0, borderBottom: '1px solid var(--line)', background: on ? 'var(--violet-50)' : '#FFF', minHeight: 64 }} onClick={() => setSel((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; })}>
              <Av name={c.name} pal={c.pal} size={40} />
              <span className="grow"><span className="t">{c.name}</span><span className="s">{c.dropoff} · عادةً {c.usual}</span></span>
              <span style={{ width: 24, height: 24, borderRadius: 12, border: `2px solid ${on ? 'var(--brand)' : 'var(--n-300)'}`, background: on ? 'var(--brand)' : '#FFF', color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{on && <Check size={14} />}</span>
            </button>
          ); })}
        </div>
      )}
      <div className="chips">{['😊 سعادة', '😐 هدوء', '😢 بكاء'].map((m) => <Chip key={m} on={mood === m} onClick={() => setMood(mood === m ? null : m)}>{m}</Chip>)}</div>
      <button className="btn primary" disabled={!sel.size} onClick={go}>تسجيل وصول {ar(sel.size)} · {clockStr(data.clock)}</button>
    </Sheet>
  );
}

function OCheckout({ params }) {
  const { data, update, closeSheet, toast } = useStore();
  const c = childById(params.id);
  const pickups = [['الأم', 'الهوية مسجّلة · 05x xxx 1234'], ['الأب', 'الهوية مسجّلة · 05x xxx 5678'], ['السائق', 'الهوية مسجّلة · 05x xxx 9012']];
  const [who, setWho] = useState(null);
  return (
    <Sheet title={`مغادرة ${c.name}`} sub={`وقت الوصول ${data.attendance[c.id]?.at || '—'} · ٤س ٣٥د`}>
      <span className="small" style={{ fontWeight: 800, color: 'var(--ink-2)' }}>من يستلم</span>
      {pickups.map(([n, s]) => (
        <button key={n} className="row" style={{ minHeight: 64, border: who === n ? '2px solid var(--brand)' : '2px solid var(--line)', background: who === n ? 'var(--violet-50)' : '#FFF' }} onClick={() => setWho(n)}>
          <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={18} /></span>
          <span className="grow"><span className="t">{n}</span><span className="s ltr" style={{ textAlign: 'right' }}>{s}</span></span>
          {who === n && <Check size={20} color="var(--brand)" />}
        </button>
      ))}
      <button className="btn primary" onClick={() => { update((d) => addLogs({ ...d, picked: { ...d.picked, [c.id]: { by: who || '', at: clockStr(d.clock) } } }, [{ child: c.id, kind: 'departure', by: BY, title: 'الاستلام', text: `تم استلام ${c.name} في الساعة ${clockStr(d.clock)}.`, fresh: true }])); closeSheet(); toast(`تم تسجيل مغادرة ${c.name}`); }}>تسجيل مغادرة · {clockStr(data.clock)}</button>
    </Sheet>
  );
}

function ODayClose() {
  const { data, update, closeSheet, toast } = useStore();
  const kids = inRoom(SUP_ROOM).filter((c) => st(data, c) === 'in' || st(data, c) === 'out');
  const flagged = new Set(['s3', 's7']);
  const [ok, setOk] = useState({});
  const pending = kids.filter((c) => flagged.has(c.id) && !ok[c.id]).length;
  return (
    <Sheet title={`ملخصات اليوم · ${ar(kids.length)}`}>
      {pending > 0 && <span className="small" style={{ color: 'var(--warn)', fontWeight: 800 }}>{ar(pending)} ملخصات تحمل علامة راجع — اقرأها قبل الإرسال.</span>}
      {kids.slice(0, 8).map((c) => (
        <div key={c.id} className="card tight" style={{ border: `1px solid ${flagged.has(c.id) && !ok[c.id] ? '#E08A00' : 'var(--line)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Av name={c.name} pal={c.pal} size={28} /><b style={{ flex: 1 }}>{c.name}</b><span className="pill mute">AR</span>{flagged.has(c.id) && <span className="pill warn">راجع</span>}</div>
          <span style={{ fontSize: 14, lineHeight: 1.7 }}>يوم جميل لـ{c.name}: لعب في الساحة صباحًا، {data.logs.some((l) => l.child === c.id && l.meal === 'الغداء') ? 'وأكل غداءه' : 'وشارك في نشاط الرسم'}.</span>
          <div style={{ display: 'flex', gap: 14 }}><button className="small" style={{ border: 0, background: 'none', color: ok[c.id] ? 'var(--ok)' : 'var(--violet-600)', fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setOk((o) => ({ ...o, [c.id]: !o[c.id] }))}>{ok[c.id] ? '✓ صحيح' : 'صحيح'}</button><span className="small" style={{ color: 'var(--violet-600)', fontWeight: 800 }}>تعديل</span></div>
        </div>
      ))}
      {kids.length > 8 && <span className="small muted">+ {ar(kids.length - 8)} ملخصات أخرى</span>}
      <button className="btn primary" disabled={pending > 0 || data.supDayClosed} onClick={() => { update({ supDayClosed: true }); closeSheet(); toast(`أُرسلت ${ar(kids.length)} ملخصات`); }}>إرسال الكل {ar(kids.length)}</button>
    </Sheet>
  );
}

function OHub() {
  const { openSheet, closeSheet, toast } = useStore();
  const S = ({ title, items }) => (<>
    <span className="small" style={{ fontWeight: 800, color: 'var(--ink-2)' }}>{title}</span>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
      {items.map(([l, d, I, go]) => <button key={l} className="card tight" style={{ border: 0, cursor: 'pointer', background: 'var(--surface-2)', alignItems: 'flex-start' }} onClick={go || (() => { closeSheet(); toast(`«${l}»`); })}><I size={20} color="var(--violet-700)" /><b style={{ fontSize: 13 }}>{l}</b><span style={{ fontSize: 10.5 }} className="muted">{d}</span></button>)}
    </div>
  </>);
  return (
    <Sheet title="المركز" sub="عمليات الفصل وإدارة الطاقم">
      <S title="التسجيل السريع" items={[['صورة', 'توثيق اللحظات', Camera, () => openSheet('o-photo', {})], ['وجبة', 'تسجيل الوجبات', Utensils, () => openSheet('o-meal', {})], ['قيلولة', 'متابعة النوم', Moon, () => openSheet('o-nap', {})], ['غيار', 'النظافة والحفاض', Droplets, () => openSheet('o-change', {})], ['ملاحظة', 'ملاحظة تربوية', FileText], ['حادثة', 'تقرير حادثة', AlertTriangle]]} />
      <S title="عمليات الفصل" items={[['تسجيل دخول', 'استقبال الباب', LogIn, () => openSheet('o-arrivals', {})], ['تسجيل خروج', 'تسليم الأطفال', LogOut, () => openSheet('o-checkout', { id: 's0' })], ['تبديل الفصل', 'تغيير الفصل النشط', ArrowLeftRight, () => openSheet('o-switch')], ['إغلاق اليوم', 'ملخص نهاية اليوم', ClipboardCheck, () => openSheet('o-dayclose')], ['طلب إذن', 'طلب موافقة ولي الأمر', Shield]]} />
      <S title="إدارة الطاقم والمهام" items={[['جدول الطاقم', 'توزيع المعلمات', Users, () => openSheet('o-reassign')], ['حضور الطاقم', 'سجل الحضور والورديات', Clock], ['طلب بديل', 'تغطية النقص والغياب', Search, () => openSheet('o-substitute')], ['مشرف الفصل', 'تعيين مسؤول الفصل', Star, () => openSheet('o-lead')]]} />
      <S title="ورديتي والتواصل" items={[['ورديتي', 'ساعاتي والجدول', Clock, () => openSheet('o-me')], ['مراسلة الغرفة', 'محادثات عائلات الفصل', Megaphone], ['التنبيهات', 'الموافقات والمراجعة', Bell], ['تعميم', 'نشر تعميم أو إعلان', Megaphone]]} />
    </Sheet>
  );
}

function OSwitch() {
  const { closeSheet, toast } = useStore();
  return (
    <Sheet title="تبديل الفصل">
      {ROOMS.map((r) => <button key={r.id} className="row" style={{ border: r.id === SUP_ROOM ? '2px solid var(--brand)' : '2px solid var(--line)' }} onClick={() => { closeSheet(); if (r.id !== SUP_ROOM) toast('في النموذج: يبقى عبّاد الشمس هو الفصل النشط'); }}><span style={{ width: 12, height: 12, borderRadius: 6, background: r.color }} /><span className="grow"><span className="t">{r.name}</span><span className="s">{r.age}</span></span>{r.id === SUP_ROOM && <Check size={18} color="var(--brand)" />}</button>)}
    </Sheet>
  );
}

function OMe() {
  const { data, update, closeSheet, logout } = useStore();
  return (
    <Sheet title="مريم الغامدي" sub={`مشرفة · ${roomById(SUP_ROOM).name} · حضانة واحة الصغار`}>
      <div className={`banner ${data.supClockIn ? 'ok' : 'warn'}`}>{data.supClockIn ? 'في الوردية منذ ١٢:٠٥' : 'غير مسجل حضور'}</div>
      <button className="btn primary" onClick={() => { update({ supClockIn: !data.supClockIn }); closeSheet(); }}>{data.supClockIn ? 'تسجيل الانصراف' : 'تسجيل الحضور'}</button>
      <div className="row" style={{ cursor: 'default' }}><span className="grow"><span className="t">اللغة</span></span><span className="pill brand">العربية</span></div>
      <div className="row" style={{ cursor: 'default' }}><span className="grow"><span className="t">الإشعارات</span><span className="s">فقط ما يحتاج إليك. · مفعّل دائماً — سلامة الأطفال</span></span><span className="pill ok">مفعّل</span></div>
      <button className="btn" style={{ background: 'var(--surface-2)' }} onClick={logout}>تسجيل الخروج</button>
    </Sheet>
  );
}

// ---- supervisor-only global sheets (as in code — note the English fallback strings)
function OReassign() {
  const { data, update, closeSheet, toast } = useStore();
  const r = ratio(data, SUP_ROOM);
  const staff = staffIn(data, SUP_ROOM).filter((s) => s.on || data.clockedIn[s.id]);
  const [who, setWho] = useState(null); const [to, setTo] = useState(null);
  return (
    <Sheet title="جدول الطاقم" sub="توزيع المعلمات">
      <div className="row" style={{ cursor: 'default', border: '1px solid var(--line)' }}><span style={{ fontSize: 22 }}>🌻</span><span className="grow"><span className="t">عبّاد الشمس</span><span className="s">{ar(r.kids)} حاضر · {ar(r.staff)} من الطاقم</span></span><span className={`pill ${r.kind}`}>{r.label}</span></div>
      <span className="small" style={{ fontWeight: 800, color: 'var(--ink-2)' }}>طاقم عبّاد الشمس</span>
      {staff.map((s) => <button key={s.id} className="row" style={{ border: who === s.id ? '2px solid var(--brand)' : '2px solid var(--line)' }} onClick={() => setWho(s.id)}><span className="grow"><span className="t">{s.name}</span></span>{who === s.id && <Check size={18} color="var(--brand)" />}</button>)}
      <span className="small ltr" style={{ fontWeight: 800, color: 'var(--ink-2)', textAlign: 'right' }}>Move to Room</span>
      {ROOMS.filter((x) => x.id !== SUP_ROOM).map((x) => { const q = ratio(data, x.id); return <button key={x.id} className="row" style={{ border: to === x.id ? '2px solid var(--brand)' : '2px solid var(--line)' }} onClick={() => setTo(x.id)}><span className="grow"><span className="t">{x.name}</span><span className="s">{ar(q.kids)} حاضر · {ar(q.staff)} من الطاقم</span></span><span className={`pill ${q.kind}`}>{q.label}</span></button>; })}
      <button className="btn primary" style={{ opacity: who && to ? 1 : 0.4 }} disabled={!who || !to} onClick={() => { update((d) => ({ ...d, assign: { ...d.assign, [who]: to } })); closeSheet(); toast(`تم نقل ${staffById(who).short} إلى ${roomById(to).name}`); }}>نقل</button>
    </Sheet>
  );
}
function OSubstitute() {
  const { data, update, closeSheet, toast } = useStore();
  const cands = STAFF.filter((s) => s.role === 'teacher' && data.assign[s.id] !== SUP_ROOM);
  const [who, setWho] = useState(null);
  return (
    <Sheet title="طلب بديل" sub="Find available staff to cover عبّاد الشمس">
      <div className="row ltr" style={{ cursor: 'text', color: 'var(--ink-3)', justifyContent: 'flex-start' }}><Search size={16} /> Search available staff…</div>
      <span className="small ltr" style={{ fontWeight: 800, color: 'var(--ink-2)', textAlign: 'right' }}>{cands.length} Available</span>
      {cands.map((s) => <button key={s.id} className="row" style={{ border: who === s.id ? '2px solid var(--brand)' : '2px solid var(--line)' }} onClick={() => setWho(s.id)}><span className="grow"><span className="t">{s.name}</span><span className="s">{data.assign[s.id] ? roomById(data.assign[s.id]).name : 'Floating / Unassigned'}</span></span><span className={`pill ${s.on ? 'ok' : 'mute'} ltr`}>{s.on ? 'Clocked In' : 'Scheduled'}</span></button>)}
      <button className="btn primary ltr" disabled={!who} onClick={() => { update((d) => ({ ...d, assign: { ...d.assign, [who]: SUP_ROOM } })); closeSheet(); toast(`تم نقل ${staffById(who).short} إلى عبّاد الشمس`); }}>Assign to عبّاد الشمس</button>
    </Sheet>
  );
}
function OLead() {
  const { closeSheet, toast } = useStore();
  const sups = STAFF.filter((s) => s.role === 'supervisor');
  const [who, setWho] = useState(null);
  return (
    <Sheet title="مشرف الفصل" sub="Assign or change classroom lead for عبّاد الشمس">
      <div className="card tight ltr" style={{ border: '1px solid var(--line)', textAlign: 'right' }}><span className="small muted">★ Current Classroom Lead</span><b>مريم الغامدي</b><span className="small muted">maryam@example.com · Active Lead</span></div>
      <span className="small ltr" style={{ fontWeight: 800, color: 'var(--ink-2)', textAlign: 'right' }}>Eligible Supervisors</span>
      {sups.map((s) => <button key={s.id} className="row" disabled={s.id === SUP} style={{ opacity: s.id === SUP ? 0.6 : 1, border: who === s.id ? '2px solid var(--brand)' : '2px solid var(--line)' }} onClick={() => setWho(s.id)}><span className="grow"><span className="t">{s.name}</span><span className="s ltr" style={{ textAlign: 'right' }}>{s.id === SUP ? 'Current Lead' : 'Supervisor'}</span></span>{(who === s.id || s.id === SUP) && <Check size={18} color="var(--brand)" />}</button>)}
      <button className="btn primary ltr" disabled={!who} onClick={() => { closeSheet(); toast(`Assigned ${staffById(who).short} as Lead for عبّاد الشمس`); }}>Assign as Classroom Lead</button>
    </Sheet>
  );
}

export const ORIG_SHEETS = {
  'o-meal': OMeal, 'o-change': OChange, 'o-nap': ONap, 'o-photo': OPhoto, 'o-say': OSay, 'o-more': OMore,
  'o-arrivals': OArrivals, 'o-checkout': OCheckout, 'o-dayclose': ODayClose, 'o-hub': OHub, 'o-switch': OSwitch, 'o-me': OMe,
  'o-reassign': OReassign, 'o-substitute': OSubstitute, 'o-lead': OLead,
};

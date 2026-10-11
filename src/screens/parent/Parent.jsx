import { useState } from 'react';
import {
  Home, LayoutGrid, MessageCircle, Baby, Bell, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Utensils, Moon, Camera, Megaphone,
  HeartPulse, AlertTriangle, FileText, ShieldCheck, Users, Phone, Clock, Heart, Play, Lock, UserPlus, X,
} from 'lucide-react';
import { useStore } from '../../store.jsx';
import { PARENT, childById, roomById } from '../../data.js';
import { ar, isF } from '../../logic.js';
import { Av, Sheet, Seg, Chip, Photo, Row } from '../../ui/kit.jsx';
import { Timeline } from '../staff/Staff.jsx';
import { Inbox, Conversation } from '../shared/Messages.jsx';

const kidId = (d) => d.activeKid || PARENT.kids[0];
const AGE = { s0: 3, u0: 1 };

export const PARENT_TABS = (d) => [
  { id: 'P-01', label: 'اليوم', icon: Home },
  { id: 'P-03', label: 'لحظات', icon: LayoutGrid },
  { id: 'P-04', label: 'الرسائل', icon: MessageCircle, badge: d.threads.filter((t) => PARENT.kids.includes(t.child) && t.unread).length || null },
  { id: 'P-06', label: 'طفلي', icon: Baby },
];

export function ParentHeader() {
  const { data, openSheet, toast, push } = useStore();
  const c = childById(kidId(data));
  return (
    <div className="hdr">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src={`${import.meta.env.BASE_URL}logo-icon.svg`} alt="KIDAY" style={{ height: 30 }} />
        <button className="row" style={{ width: 'auto', borderRadius: 999, padding: '5px 8px 5px 12px', gap: 8 }} onClick={() => openSheet('switch')}>
          <Av name={c.name} pal={c.pal} size={30} />
          <span className="t" style={{ fontSize: 14 }}>{c.name}</span>
          <ChevronDown size={16} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="iconbtn" aria-label="الإشعارات" onClick={() => toast('الإشعارات — في النسخة الكاملة')}><Bell size={20} /></button>
        <button className="iconbtn" style={{ borderRadius: 13, background: 'var(--violet-100)', color: 'var(--violet-600)', fontWeight: 800 }} aria-label="الحساب" onClick={() => push('P-11')}>أ</button>
      </div>
    </div>
  );
}

function dayState(d, c) {
  const a = d.attendance[c.id];
  if (d.picked[c.id]) return [`${isF(c) ? 'استُلمت' : 'استُلم'} في ${d.picked[c.id].at}`, 'out'];
  if (a?.status === 'in') return [`في الحضانة منذ ${a.at}`, 'in'];
  if (a?.status === 'absent') return ['مسجل غائبًا اليوم', 'abs'];
  return ['لم يصل بعد', 'exp'];
}

// ---------------------------------------------------------------- P-01 Today
export function ParentToday() {
  const { data, openSheet, push } = useStore();
  const c = childById(kidId(data));
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const logs = data.logs.filter((l) => l.child === c.id);
  const meals = logs.filter((l) => l.kind === 'meal').length;
  const photos = logs.filter((l) => l.photo).length;
  const nap = logs.find((l) => l.kind === 'nap');
  const [line, st] = dayState(data, c);
  const needs = NEEDS(c).filter((n) => !data.needsDone?.[n.id]);
  return (
    <div className="pad">
      <div className="card" style={{ background: 'var(--violet-50)', padding: 0, gap: 0, boxShadow: '0 8px 24px rgba(63,50,92,0.10)' }}>
        <div style={{ display: 'flex', gap: 14, padding: 16, alignItems: 'center' }}>
          <span style={{ position: 'relative' }}>
            <span className="av" style={{ width: 72, height: 72, borderRadius: 23, background: 'var(--violet-100)', color: 'var(--violet-600)', fontSize: 30 }}>{c.name[0]}</span>
            {st !== 'exp' && <span style={{ position: 'absolute', bottom: 0, insetInlineEnd: 0, width: 14, height: 14, borderRadius: 7, border: '2px solid #FFF', background: st === 'in' ? 'var(--violet-500)' : 'var(--n-400)' }} />}
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 26, fontWeight: 800 }}>{c.name}</span>
            <span className="small muted" style={{ fontSize: 14 }}>{line}</span>
            <span className="small muted">{roomById(c.room).name} · سعيد{isF(c) ? 'ة' : ''}</span>
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid var(--violet-100)', padding: '12px 0' }}>
          {[[Utensils, ar(meals), 'وجبات'], [Moon, nap ? nap.text.match(/[٠-٩]+/)?.[0] + ' د' : '—', 'نوم'], [Camera, ar(photos), 'صور']].map(([I, v, l]) => (
            <span key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}><I size={18} color="var(--violet-600)" /><b style={{ fontSize: 18 }}>{v}</b><span className="small muted">{l}</span></span>
          ))}
        </div>
        <button onClick={() => setOpen(!open)} style={{ border: 0, borderTop: '1px solid var(--violet-100)', background: 'none', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>
          <span style={{ display: 'flex', gap: 8, alignItems: 'center', fontWeight: 700 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: '#2E7D57' }} />بخير وبمزاج جيد <span className="small muted ltr">98 bpm · 36.6°</span></span>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        {open && (
          <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div className="card tight"><span className="small muted">نبض القلب</span><b className="ltr">98 bpm</b></div>
              <div className="card tight"><span className="small muted">الحرارة</span><b className="ltr">36.6°</b></div>
            </div>
            <span className="small muted">بطارية السوار ٧٢٪ · يُنبَّه الطاقم تلقائيًا إذا خرجت أي قيمة عن المدى المتوقع.</span>
          </div>
        )}
      </div>

      <button className="row" style={{ borderInlineStart: '4px solid var(--sun-500)' }} onClick={() => openSheet('announce')}>
        <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--sun-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Megaphone size={20} color="var(--sun-800)" /></span>
        <span className="grow"><span className="s" style={{ fontWeight: 800 }}>إعلان</span><span className="t">رحلة الحديقة يوم الأربعاء — قبعة شمس وزجاجة ماء</span></span>
        <ChevronLeft size={18} />
      </button>
      <button className="btn" style={{ background: 'var(--surface-2)' }} onClick={() => openSheet('absence')}>الإبلاغ عن غياب</button>
      <button className="sec" style={{ border: 0, background: 'none', cursor: 'pointer', padding: 0 }} onClick={() => push('P-09', { day: 'yesterday' })}><span>ملخص الأمس</span><ChevronLeft size={16} /></button>

      {needs.length > 0 && (<>
        <div className="sec"><span>يحتاجك · {ar(needs.length)}</span><button onClick={() => push('P-10')}>عرض الكل</button></div>
        <div className="card tight">
          <div style={{ display: 'flex', gap: 4 }}>{NEEDS(c).map((n) => <span key={n.id} style={{ flex: 1, height: 6, borderRadius: 3, background: data.needsDone?.[n.id] ? 'var(--brand)' : 'var(--n-200)' }} />)}</div>
          <span className="small muted">{needs.length === 1 ? 'أمر واحد متبقٍ — يستغرق أقل من دقيقة' : needs.length === 2 ? 'أمران متبقيان — كلاهما سريع' : `${ar(needs.length)} أمور متبقية — كلها سريعة`}</span>
        </div>
        <NeedCard n={needs[page % needs.length]} />
        {needs.length > 1 && <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>{needs.map((n, i) => <button key={n.id} aria-label={`بطاقة ${i + 1}`} onClick={() => setPage(i)} style={{ width: 8, height: 8, borderRadius: 4, border: 0, padding: 0, cursor: 'pointer', background: i === page % needs.length ? 'var(--brand)' : 'var(--n-200)' }} />)}</div>}
      </>)}

      <div className="sec"><span>قصة اليوم</span></div>
      <Timeline logs={logs} onItem={(l) => openSheet('activity', { id: l.id })} />
      {data.picked[c.id] && <button className="btn ghost" onClick={() => push('P-09', { day: 'today' })}>اقرأ اليوم كاملًا</button>}
    </div>
  );
}

const NEEDS = (c) => [
  { id: 'n1', edge: 'var(--sun-500)', title: 'موافقة بانتظار إجابتك', body: 'رحلة الحديقة يوم الأربعاء ١٠ص – ١٢م. تحتاج الحضانة موافقتك قبل الثلاثاء.', cta: 'أجب الآن', chip: 'قبل الثلاثاء' },
  { id: 'n2', edge: 'var(--n-300)', title: 'طلبت الحضانة النموذج الطبي', body: `ملف ${c.name} ينقصه.`, cta: 'رفعه الآن' },
  { id: 'n3', edge: 'var(--n-300)', title: 'جهة اتصال إضافية تساعد', body: 'إن لم نصل إليك، بمن نتصل؟', cta: 'إضافة شخص آخر' },
];
function NeedCard({ n }) {
  const { update, toast } = useStore();
  return (
    <div className="card" style={{ borderInlineStart: `3px solid ${n.edge}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><b>{n.title}</b>{n.chip && <span className="pill warn"><Clock size={12} /> {n.chip}</span>}</div>
      <span className="small muted">{n.body}</span>
      <button className="btn primary" onClick={() => { update((d) => ({ ...d, needsDone: { ...(d.needsDone || {}), [n.id]: true } })); toast('تم ✓'); }}>{n.cta}</button>
    </div>
  );
}

// ---------------------------------------------------------------- P-03 Moments
export function Moments() {
  const { data } = useStore();
  const [f, setF] = useState('all');
  const c = childById(kidId(data));
  const live = data.logs.filter((l) => l.child === c.id && l.photo).map((l) => ({ n: l.photo, label: l.text, isNew: l.fresh }));
  const items = [...live.reverse(), { n: 4, video: '0:42' }, { n: 0 }, { n: 1, video: '0:18' }, { n: 2 }];
  const shown = items.filter((x) => f === 'all' || (f === 'video' ? x.video : !x.video));
  return (
    <div className="pad">
      <Seg items={[['all', 'الكل'], ['photo', 'صور'], ['video', 'فيديو']]} value={f} onChange={setF} />
      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}><b style={{ fontSize: 20 }}>اليوم</b><span className="small muted">· {ar(live.length)} جديدة</span></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {shown.map((x, i) => (
          <div key={i} style={{ position: 'relative', gridColumn: i === 0 ? 'span 2' : undefined, gridRow: i === 0 ? 'span 2' : undefined }}>
            <Photo n={x.n} h={i === 0 ? 228 : 110} />
            {(x.isNew || i < live.length) && <span className="pill" style={{ position: 'absolute', top: 6, insetInlineStart: 6, background: 'var(--brand)', color: '#FFF' }}>جديد</span>}
            {x.video && <span className="pill" style={{ position: 'absolute', bottom: 6, insetInlineEnd: 6, background: 'rgba(36,11,7,.8)', color: '#FFF' }}><Play size={10} /> <span className="ltr">{x.video}</span></span>}
          </div>
        ))}
      </div>
      <b style={{ fontSize: 18, marginTop: 6 }}>الأحد، ١١ أكتوبر</b>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>{[3, 0, 4].map((n) => <Photo key={n} n={n} h={110} />)}</div>
    </div>
  );
}

// ---------------------------------------------------------------- P-06 Child
export function ChildTab() {
  const { data, push, toast } = useStore();
  const c = childById(kidId(data));
  const R = ({ icon: I, t, s, chip, go }) => (
    <button className="row" style={{ borderRadius: 0, borderBottom: '1px solid var(--line)' }} onClick={go || (() => toast(`«${t}» — في النسخة الكاملة`))}>
      <span style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--violet-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><I size={19} color="var(--violet-600)" /></span>
      <span className="grow"><span className="t" style={{ fontSize: 14.5 }}>{t}</span>{s && <span className="s">{s}</span>}</span>
      {chip ? <span className="pill warn">{chip}</span> : <ChevronLeft size={18} color="var(--ink-3)" />}
    </button>
  );
  return (
    <div className="pad">
      <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
        <span className="av" style={{ width: 72, height: 72, borderRadius: 23, background: 'var(--violet-100)', color: 'var(--violet-600)', fontSize: 30 }}>{c.name[0]}</span>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <b style={{ fontSize: 26 }}>{c.name}</b>
          <span className="small muted">{ar(AGE[c.id] || 3)} سنوات · {roomById(c.room).name}</span>
        </span>
      </div>
      <div className="sec"><span>الرعاية</span></div>
      <div className="card" style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
        <R icon={HeartPulse} t="الصحة والسوار" s="قراءات مباشرة، نوم، الجهاز" />
        <R icon={AlertTriangle} t="الحوادث" s="لا شيء معلق" />
      </div>
      <div className="sec"><span>الأذونات والسجلات</span></div>
      <div className="card" style={{ padding: 0, gap: 0, overflow: 'hidden' }}>
        <R icon={Baby} t="الملف والتفاصيل" s="الصحة، جهات الاتصال، التفضيلات" />
        <R icon={ShieldCheck} t={`من يمكنه رؤية ${c.name}`} />
        <R icon={ShieldCheck} t="الموافقات" s="إذن واحد بلا إجابة" chip={data.needsDone?.n1 ? null : 'بانتظار إجابتك'} />
        <R icon={FileText} t="المستندات" s="مستند واحد معلق" />
        <R icon={Users} t="المصرح لهم بالاستلام" s={data.tempPickup ? `شخصان + ${data.tempPickup.name} اليوم فقط` : 'شخصان مصرح لهما'} go={() => push('P-08')} />
        <R icon={Phone} t="جهات اتصال الطوارئ" s="جهتا اتصال في القائمة" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- P-08 Pickup
export function ParentPickup() {
  const { data, openSheet, update, toast } = useStore();
  const c = childById(kidId(data));
  return (
    <div className="pad">
      <span className="small muted" style={{ fontSize: 14 }}>فقط الأشخاص المدرجون هنا يمكنهم استلام طفلك. يتحقق الطاقم من الهوية في كل مرة. التغييرات تظهر للحضانة فورًا.</span>
      <div className="sec"><span>الأشخاص المصرح لهم</span></div>
      <div className="list">
        {[['خالد (الأب)', '‎+966 5• ••• 1234'], ['السائق — عبدالرحمن', '‎+966 5• ••• 9012']].map(([n, p]) => <Row key={n} title={n} sub={p} />)}
      </div>
      <div className="sec"><span>اليوم فقط</span></div>
      {data.tempPickup ? (
        <div className="row" style={{ cursor: 'default' }}>
          <span className="grow"><span className="t">{data.tempPickup.name}</span><span className="s">{data.tempPickup.phone}</span></span>
          <span className="pill warn"><Clock size={12} /> اليوم فقط</span>
          <button className="iconbtn" style={{ color: 'var(--danger)', background: 'var(--danger-soft)' }} aria-label="إزالة" onClick={() => { update({ tempPickup: null }); toast('أُزيل'); }}><X size={18} /></button>
        </div>
      ) : (
        <button className="btn" style={{ background: 'var(--surface-2)' }} onClick={() => openSheet('temp')}><UserPlus size={18} /> تصريح لشخص لهذا اليوم</button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- P-09 Day summary
export function DaySummary({ day = 'today' }) {
  const { data, push } = useStore();
  const c = childById(kidId(data));
  const today = day === 'today';
  const logs = today ? data.logs.filter((l) => l.child === c.id) : [
    { id: 'y1', kind: 'arrival', time: '٧:٥٠', text: 'وصلت مع الأب.' }, { id: 'y2', kind: 'meal', time: '١٢:٠٠', title: 'الغداء', text: 'الغداء — أنهت طبقها كاملًا.' },
    { id: 'y3', kind: 'nap', time: '١:٠٥', text: 'نامت ٩٥ دقيقة.' }, { id: 'y4', kind: 'departure', time: '٣:١٠', text: 'استلمها الأب.' }];
  return (
    <div className="pad">
      <div className="card" style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <ChevronRight size={20} /><b>{today ? 'الأحد، ١١ أكتوبر ٢٠٢٦' : 'السبت، ١٠ أكتوبر ٢٠٢٦'}</b><ChevronLeft size={20} opacity={today ? 0.3 : 1} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div className="card tight"><span className="small muted">الوصول</span><b style={{ fontSize: 20 }}>{today ? data.attendance[c.id]?.at || '—' : '٧:٥٠'} ص</b></div>
        <div className="card tight"><span className="small muted">الاستلام</span><b style={{ fontSize: 20 }}>{today ? data.picked[c.id]?.at || '—' : '٣:١٠'}</b></div>
      </div>
      <div className="sec"><span>اليوم باختصار</span></div>
      <Timeline logs={logs} author={false} />
      <div className="sec"><span>صور اليوم</span></div>
      <div style={{ display: 'flex', gap: 8 }}>{[1, 2, 3].map((n) => <button key={n} style={{ border: 0, padding: 0, width: 88, cursor: 'pointer', background: 'none' }} onClick={() => push('P-03')}><Photo n={n} h={88} /></button>)}</div>
    </div>
  );
}

// ---------------------------------------------------------------- P-10 Needs you
export function NeedsYou() {
  const { data } = useStore();
  const c = childById(kidId(data));
  const left = NEEDS(c).filter((n) => !data.needsDone?.[n.id]);
  return (
    <div className="pad">
      {left.length === 0 ? <div className="card" style={{ alignItems: 'center', textAlign: 'center' }}><b>لا شيء يحتاجك الآن</b><span className="small muted">سنعرض هنا أي جديد فور ظهوره.</span></div>
        : left.map((n) => <NeedCard key={n.id} n={n} />)}
    </div>
  );
}

// ---------------------------------------------------------------- sheets
function SwitchSheet() {
  const { data, update, closeSheet } = useStore();
  return (
    <Sheet title="تبديل الطفل">
      {PARENT.kids.map((id) => { const c = childById(id); return (
        <Row key={id} child={c} title={c.name} sub={`${ar(AGE[id])} ${AGE[id] > 2 ? 'سنوات' : 'سنة'} · ${roomById(c.room).name}`} end={kidId(data) === id ? <span className="pill brand">✓</span> : null} onClick={() => { update({ activeKid: id }); closeSheet(); }} />
      ); })}
    </Sheet>
  );
}
function ActivitySheet({ params }) {
  const { data, update } = useStore();
  const l = data.logs.find((x) => x.id === params.id);
  if (!l) return null;
  const liked = data.likes[l.id];
  return (
    <Sheet title={l.title || 'نشاط'} sub={`${l.time}${l.by ? ' · سجّلته ' + l.by : ''}`}>
      {l.photo && <Photo n={l.photo} />}
      <span style={{ fontSize: 17, lineHeight: 1.8 }}>{l.text}</span>
      <button className="btn" style={{ background: liked ? 'var(--violet-50)' : 'var(--surface-2)', color: liked ? 'var(--violet-600)' : 'var(--ink)', borderRadius: 999 }} onClick={() => update((d) => ({ ...d, likes: { ...d.likes, [l.id]: !liked } }))}>
        <Heart size={18} fill={liked ? 'currentColor' : 'none'} /> {liked ? 'أعجبك' : 'إعجاب'}
      </button>
    </Sheet>
  );
}
function AbsenceSheet() {
  const { data, update, closeSheet, toast } = useStore();
  const c = childById(kidId(data));
  const [why, setWhy] = useState('مرض');
  const [when, setWhen] = useState('غدًا');
  const inToday = data.attendance[c.id]?.status === 'in';
  return (
    <Sheet title="الإبلاغ عن غياب">
      <Row child={c} title={c.name} />
      {inToday && <div className="banner brand">{c.name} في الحضانة اليوم، لذا سيكون هذا الإبلاغ عن غياب في يوم قادم.</div>}
      <span style={{ fontWeight: 800 }}>السبب</span>
      <div className="chips">{['مرض', 'ظرف عائلي', 'سفر', 'موعد', 'أخرى'].map((r) => <Chip key={r} on={why === r} onClick={() => setWhy(r)}>{r}</Chip>)}</div>
      <span style={{ fontWeight: 800 }}>التاريخ</span>
      <div className="chips">{(inToday ? ['غدًا', 'بعد غد'] : ['اليوم', 'غدًا']).map((r) => <Chip key={r} on={when === r} onClick={() => setWhen(r)}>{r}</Chip>)}</div>
      <span className="small muted">سيُبلغ فريق {roomById(c.room).name} فورًا.</span>
      <button className="btn primary" onClick={() => { update({ parentAbsence: { child: c.id, why, when } }); closeSheet(); toast('تم إبلاغ الحضانة.'); }}>إرسال إلى الحضانة</button>
    </Sheet>
  );
}
function TempSheet() {
  const { update, closeSheet, toast } = useStore();
  const [name, setName] = useState('الجد — سعد');
  return (
    <Sheet title="تصريح لشخص لهذا اليوم" sub="يُطلب منه إبراز الهوية عند الاستلام">
      <label className="small" style={{ fontWeight: 800 }}>الاسم الكامل
        <input value={name} onChange={(e) => setName(e.target.value)} style={{ width: '100%', marginTop: 6, border: '1.5px solid var(--line-2)', borderRadius: 12, padding: '11px 12px', fontFamily: 'inherit', fontSize: 15 }} />
      </label>
      <label className="small" style={{ fontWeight: 800 }}>الهاتف
        <input defaultValue="+966 5• ••• 4411" className="ltr" style={{ width: '100%', marginTop: 6, border: '1.5px solid var(--line-2)', borderRadius: 12, padding: '11px 12px', fontFamily: 'inherit', fontSize: 15, textAlign: 'right' }} />
      </label>
      <button className="btn primary" disabled={!name.trim()} onClick={() => { update({ tempPickup: { name: name.trim(), phone: '+966 5• ••• 4411' } }); closeSheet(); toast('تم التصريح لهذا اليوم'); }}>تصريح لهذا اليوم</button>
    </Sheet>
  );
}
function AnnounceSheet() {
  return (
    <Sheet title="رحلة الحديقة يوم الأربعاء" sub="من إدارة الحضانة · أُرسل إلى جميع العائلات">
      <span style={{ fontSize: 16, lineHeight: 1.9 }}>نخرج يوم الأربعاء من ١٠ص إلى ١٢م إلى حديقة الحي. نرجو إرسال قبعة شمس وزجاجة ماء باسم الطفل، والموافقة على الرحلة من «يحتاجك».</span>
    </Sheet>
  );
}

export function Account() {
  const { data, update, logout, back } = useStore();
  const S = ({ t, children }) => (<><div className="sec"><span>{t}</span></div><div className="card" style={{ padding: 0, gap: 0, overflow: 'hidden' }}>{children}</div></>);
  return (
    <div className="pad">
      <div className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <span className="av" style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--violet-100)', color: 'var(--violet-600)', fontSize: 22 }}>أ</span>
        <span style={{ display: 'flex', flexDirection: 'column' }}><b style={{ fontSize: 18 }}>أسماء</b><span className="small muted ltr" style={{ textAlign: 'right' }}>asmaa@example.com</span></span>
      </div>
      <S t="أطفالك">{PARENT.kids.map((id) => { const c = childById(id); return <Row key={id} title={c.name} sub={roomById(c.room).name} end={kidId(data) === id ? <span className="pill brand">✓</span> : null} onClick={() => { update({ activeKid: id }); back(); }} />; })}</S>
      <S t="التفضيلات"><Row title="اللغة" end={<span className="pill brand">العربية</span>} /><Row title="إعدادات الإشعارات" sub="ما يرسله كيدي ومتى" end={<ChevronLeft size={18} />} /></S>
      <S t="الخصوصية والقانون"><Row title="سياسة الخصوصية" end={<ChevronLeft size={18} />} /><Row title="شروط الخدمة" end={<ChevronLeft size={18} />} /></S>
      <button className="btn" style={{ background: 'var(--surface-2)' }} onClick={logout}>تسجيل الخروج</button>
      <span className="small muted" style={{ textAlign: 'center' }}>حذف الحساب</span>
    </div>
  );
}

export function ParentMessages() { return <Inbox side="parent" />; }
export function ParentConversation({ id }) { return <Conversation id={id} side="parent" />; }
export const PARENT_SHEETS = { switch: SwitchSheet, activity: ActivitySheet, absence: AbsenceSheet, temp: TempSheet, announce: AnnounceSheet };
export { Lock };

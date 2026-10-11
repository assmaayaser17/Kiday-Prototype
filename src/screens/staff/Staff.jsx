import { useEffect, useMemo, useState } from 'react';
import {
  Home, Baby, MessageCircle, LayoutGrid, Bell, Camera, Utensils, Moon, Droplets, Mic, MoreHorizontal, Search,
  Users, UserRoundCheck, LogOut, Image as ImageIcon, AlertTriangle, ChevronLeft, ClipboardCheck, Send, Sparkles, FileText, HeartPulse, Shield,
} from 'lucide-react';
import { useStore } from '../../store.jsx';
import { CHILDREN, STAFF, childById, roomById, staffById } from '../../data.js';
import { ar, clockStr, presentIn, inRoom, ratio, staffOn, MEAL_OUT, CHANGE_OUT, mealSentence, addLogs, isF } from '../../logic.js';
import { Av, Tile, Header, Sheet, Seg, Chip, TabBar, Photo, Row } from '../../ui/kit.jsx';
import { Conversation, Inbox } from '../shared/Messages.jsx';

export const ME = 'noura';
const myRoom = (d) => d.assign[ME];
const lunchLog = (d, id) => d.logs.find((l) => l.child === id && l.kind === 'meal' && l.meal === 'الغداء');
const lunchLogged = (d, id) => !!lunchLog(d, id);
const myGroup = (d) => inRoom(myRoom(d)).filter((c) => d.groups[c.id] === ME);
const ownerShort = (d, id) => staffById(d.groups[id])?.short;
// every log is signed by Noura; when the child is in a colleague's group it also says whose
const logAsMe = (d, entries) => addLogs(d, entries.map((e) => ({ ...e, by: 'نورة', for: d.groups[e.child] !== ME ? ownerShort(d, e.child) : undefined })));
// colleagues' logs for my group, merged per teacher + action (what the bell shows)
function notifsFor(d) {
  const by = {};
  d.logs.filter((l) => l.for === 'نورة' && l.by !== 'نورة').forEach((l) => {
    const k = `${l.by}|${l.title || KIND[l.kind]?.[0]}`;
    (by[k] = by[k] || { who: l.by, what: l.title || KIND[l.kind]?.[0], time: l.time, kids: [] }).kids.push(childById(l.child).name);
  });
  return Object.values(by);
}

function tileState(d, c) {
  const a = d.attendance[c.id];
  if (d.picked[c.id]) return 'left';
  if (!a || a.status === 'absent') return 'abs';
  if (a.status === 'expected') return 'exp';
  if (d.nap[c.id] && !d.nap[c.id].end) return 'sleep';
  if (c.id === 's2' || c.id === 's7') return 'nudge';
  return 'in';
}
function tileNote(d, c) {
  const a = d.attendance[c.id];
  if (d.picked[c.id]) return `غادر ${d.picked[c.id].at}`;
  if (a?.status === 'absent') return 'غائب';
  if (a?.status === 'expected') return `عادة ${c.usual}`;
  if (c.id === 's2') return 'لا تغيير ٩:١٠';
  if (c.id === 's7' && !lunchLogged(d, c.id)) return 'لم تأكل';
  return '';
}

// ---------------------------------------------------------------- shell
export const STAFF_TABS = (d) => [
  { id: 'T-01', label: 'اليوم', icon: Home },
  { id: 'T-13', label: 'الأطفال', icon: Baby },
  { id: 'T-10', label: 'الرسائل', icon: MessageCircle, badge: d.threads.filter((t) => t.staffUnread).length || null },
];

export function StaffHeader() {
  const { data, openSheet, tab } = useStore();
  const room = roomById(myRoom(data));
  const r = ratio(data, room.id);
  const exp = inRoom(room.id).filter((c) => data.attendance[c.id]?.status === 'expected').length;
  const unread = data.notifsSeen ? 0 : notifsFor(data).length;
  return (
    <div className="hdr">
      <button className="row" style={{ width: 'auto', flex: '0 1 auto', minWidth: 0, padding: '6px 12px', borderRadius: 16, gap: 8 }} onClick={() => tab('T-01')}>
        <span style={{ width: 10, height: 10, borderRadius: 5, background: room.color }} />
        <span className="grow">
          <span className="t" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>{room.name}<span className={`pill ${r.kind}`}>{r.label} {r.word || ''}</span></span>
          <span className="s">{ar(r.kids)} حاضرون{exp ? `، ${ar(exp)} متوقّعون` : ''}</span>
        </span>
      </button>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flex: 'none' }}>
        <button className="iconbtn" style={{ position: 'relative' }} onClick={() => openSheet('notifs')} aria-label="الإشعارات">
          <Bell size={20} />
          {unread > 0 && <span className="hdr-dot">{ar(unread)}</span>}
        </button>
        <button className="iconbtn me-btn" onClick={() => openSheet('me')} aria-label={`نورة العتيبي — ${data.shiftStarted ? `ورديتي منذ ${data.shiftAt || '٧:٢٨'}` : 'لم تبدأ الوردية'}`}>
          ن<span className="me-status" style={{ background: data.shiftStarted ? '#2E8B57' : 'var(--n-300)' }} />
        </button>
      </div>
    </div>
  );
}

const STRIP = [
  ['photo', 'صورة', Camera], ['meal', 'وجبة', Utensils], ['nap', 'نوم', Moon], ['change', 'تغيير', Droplets], ['say', 'قولها', Mic], ['more', 'المزيد', MoreHorizontal],
];

// ---------------------------------------------------------------- T-01 Today
export function Today() {
  const { data, openSheet, push, update, toast } = useStore();
  const [scope, setScope] = useState('mine');
  const [sel, setSel] = useState(null); // null = not selecting, else Set
  const room = roomById(myRoom(data));
  const all = inRoom(room.id);
  const mine = myGroup(data);
  const minePresent = mine.filter((c) => tileState(data, c) !== 'abs' && tileState(data, c) !== 'exp' && !data.picked[c.id]);
  const lunchLeft = minePresent.filter((c) => !lunchLogged(data, c.id));
  const napStarted = Object.keys(data.nap).length > 0;
  const expected = all.filter((c) => data.attendance[c.id]?.status === 'expected');
  const colleagues = staffOn(data, room.id).filter((s) => s.id !== ME);

  let card;
  if (!data.shiftStarted) {
    card = null;
  } else if (lunchLeft.length && !data.lunchSkip) {
    card = { eyebrow: `الساعة ${clockStr(data.clock)}، وقت الغداء عادةً`, title: `الغداء لمجموعتك (${ar(lunchLeft.length)})؟`, cta: `سجّلي الغداء، ${ar(lunchLeft.length)}`, go: () => openSheet('meal', { scope: 'mine' }), skip: () => update({ lunchSkip: true }) };
  } else if (!napStarted) {
    card = { eyebrow: 'مخطّط، ١:٠٠ – ٢:٣٠', title: 'القيلولة', body: `${ar(minePresent.length)} أطفال، زر واحد ينيم الجميع`, cta: 'ابدئي القيلولة', go: () => openSheet('nap', { scope: 'mine' }) };
  } else if (!data.dayClosed) {
    card = { eyebrow: 'إغلاق اليوم', title: 'ملخصات اليوم جاهزة', body: 'مصاغة من تسجيلات اليوم — اقرئي ما يحتاج فقط.', cta: 'مراجعة وإرسال', go: () => openSheet('dayclose') };
  }

  const toggle = (c) => setSel((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; });
  const selectable = (c) => !['abs', 'exp', 'left'].includes(tileState(data, c));
  const onTile = (c) => (sel ? selectable(c) && toggle(c) : push('T-09', { id: c.id }));
  const runStrip = (k) => {
    const ids = sel ? [...sel] : null;
    if (sel && !ids.length) { toast('اختاري طفلًا واحدًا على الأقل أولًا'); return; }
    const map = { photo: 'photo', meal: 'meal', nap: 'nap', change: 'change', say: 'voice', more: 'more' };
    openSheet(map[k], { ids, scope });
    setSel(null);
  };

  const groups = [[ME, 'مجموعتي'], ['huda', 'مجموعة هدى'], ['sara', 'مجموعة سارة']];
  const others = sel ? [...sel].filter((id) => data.groups[id] !== ME) : [];
  const owners = [...new Set(others.map((id) => ownerShort(data, id)))];
  const othersNote = !others.length ? '' : owners.length === 1 ? `، منهم ${ar(others.length)} من مجموعة ${owners[0]}` : `، منهم ${ar(others.length)} من مجموعات أخرى`;
  return (
    <div className="pad">
      <Seg items={[['mine', `مجموعتي (${ar(mine.length)})`], ['room', `الفصل كله (${ar(all.length)})`]]} value={scope} onChange={setScope} />
      {!data.shiftStarted && (
        <div style={{ background: '#FFF4E5', border: '1.5px solid #EBC58F', borderRadius: 20, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 38, height: 38, borderRadius: 12, background: '#FCE7C8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserRoundCheck size={21} color="#7A4A0E" /></span>
            <span style={{ display: 'flex', flexDirection: 'column' }}>
              <b style={{ color: '#6B3A00', fontSize: 15 }}>ورديتي</b>
              <span style={{ color: '#7A4A0E', fontSize: 13 }}>تبدأ ٧:٣٠ ص، معك {colleagues.map((s) => s.short).join(' و') || '—'}، مجموعتك {ar(mine.length)} أطفال</span>
            </span>
          </div>
          <button className="btn" style={{ background: '#7A4A0E', color: '#FFF', minHeight: 48 }} onClick={() => { update({ shiftStarted: true, shiftAt: '٧:٢٨' }); toast('بدأت ورديتك، ٧:٢٨'); }}>بدء ورديتي</button>
        </div>
      )}
      {expected.length > 0 && (() => {
        const present = all.filter((c) => data.attendance[c.id]?.status === 'in').length;
        const absent = all.filter((c) => data.attendance[c.id]?.status === 'absent').length;
        const total = all.length - absent;
        return (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--violet-50)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={20} color="var(--violet-700)" /></span>
              <b style={{ color: 'var(--violet-700)', fontSize: 15 }}>وصول الأطفال</b>
            </div>
            <b style={{ fontSize: 28, lineHeight: 1.1 }}>{present ? `وصل ${ar(present)} من ${ar(total)}` : 'لم يصل أحد بعد'}</b>
            <div style={{ height: 10, borderRadius: 5, background: 'var(--n-100)', overflow: 'hidden' }}><div style={{ width: `${Math.round((100 * present) / total)}%`, height: 10, background: 'var(--brand)' }} /></div>
            <span className="small muted">{ar(present)} وصلوا، {ar(expected.length)} متوقَّعون، {ar(absent)} غائب — {expected.map((c) => c.name).join('، ')}</span>
            <button className="btn primary" onClick={() => openSheet('arrivals')}>تسجيل وصول طفل</button>
          </div>
        );
      })()}
      {card && (
        <div className="card">
          <span className="small muted" style={{ fontWeight: 700 }}>{card.eyebrow}</span>
          <span style={{ fontSize: 24, fontWeight: 800, lineHeight: 1.3 }}>{card.title}</span>
          {card.body && <span className="small muted">{card.body}</span>}
          <button className="btn primary" onClick={card.go}>{card.cta}</button>
          {card.skip && <button className="btn" style={{ minHeight: 36, background: 'none', color: 'var(--ink-2)', fontSize: 14 }} onClick={card.skip}>ليس الآن</button>}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 2 }}>
        {STRIP.map(([k, l, I]) => (
          <button key={k} className="tile" onClick={() => runStrip(k)} aria-label={l}>
            <span style={{ width: 50, height: 50, borderRadius: 17, background: k === 'say' ? 'var(--brand)' : '#FFF', color: k === 'say' ? '#FFF' : 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 2px rgba(55,21,14,.06)' }}><I size={22} /></span>
            <span className="nm" style={{ fontSize: 12 }}>{l}</span>
          </button>
        ))}
      </div>
      {data.parentAbsence && childById(data.parentAbsence.child).room === room.id && (
        <div className="banner warn">{childById(data.parentAbsence.child).name}: غياب {data.parentAbsence.when} ({data.parentAbsence.why}) — بلّغت الأسرة من التطبيق. لا شيء مطلوب.</div>
      )}
      <div className="sec">
        <span>{sel ? `${ar(sel.size)} محدّد${othersNote} — اختاري الإجراء من الشريط أعلاه` : scope === 'mine' ? 'مجموعتي — اضغطي الطفل لفتحه' : 'الفصل كله'}</span>
        <button onClick={() => setSel(sel ? null : new Set())}>{sel ? 'تم' : 'تحديد'}</button>
      </div>
      {(scope === 'mine' ? [[ME, null]] : groups).map(([g, label]) => {
        const kids = all.filter((c) => data.groups[c.id] === g);
        return (
          <div key={g} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {label && <div className="sec" style={{ color: 'var(--ink)' }}><span>{label}{g === ME ? ' (أنتِ)' : ''}</span><span className="small muted">{ar(kids.filter((c) => tileState(data, c) === 'in' || tileState(data, c) === 'nudge' || tileState(data, c) === 'sleep').length)} حاضرون</span></div>}
            <div className={scope === 'mine' ? 'grid5' : 'grid6'}>
              {kids.map((c) => (
                <Tile key={c.id} child={c} size={scope === 'mine' ? 50 : 42} state={sel?.has(c.id) ? 'sel' : tileState(data, c)} note={scope === 'mine' ? tileNote(data, c) : ''} disabled={!!sel && !selectable(c)} onClick={() => onTile(c)} />
              ))}
            </div>
          </div>
        );
      })}
      {scope === 'mine' && (
        <button className="row" onClick={() => setScope('room')}>
          <span className="grow"><span className="t">باقي الفصل، {ar(all.length - mine.length)} طفلًا</span><span className="s">مع {colleagues.map((s) => s.short).join(' و') || '—'}</span></span>
          <ChevronLeft size={18} />
        </button>
      )}
      <button className="row" onClick={() => push('T-08')}>
        <span className="grow"><span className="t">الاستلام</span><span className="s">من يغادر قريبًا — مرتّب بوقت الاستلام المعتاد</span></span>
        <ChevronLeft size={18} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------- T-13 Children
export function Children() {
  const { data, push } = useStore();
  const [f, setF] = useState('in');
  const all = inRoom(myRoom(data));
  const st = (c) => (data.picked[c.id] ? 'out' : data.attendance[c.id]?.status);
  const sets = { in: all.filter((c) => st(c) === 'in'), expected: all.filter((c) => st(c) === 'expected'), absent: all.filter((c) => st(c) === 'absent'), out: all.filter((c) => st(c) === 'out') };
  return (
    <div className="pad">
      <div className="chips">
        {[['in', 'حاضرون'], ['expected', 'متوقّعون'], ['absent', 'غائبون'], ['out', 'غادروا']].map(([k, l]) => (
          <Chip key={k} on={f === k} onClick={() => setF(k)}>{l} {ar(sets[k].length)}</Chip>
        ))}
      </div>
      <div className="list">
        {sets[f].length === 0 && <div className="card" style={{ alignItems: 'center', color: 'var(--ink-2)' }}>لا أحد هنا الآن.</div>}
        {sets[f].map((c) => (
          <Row key={c.id} child={c} avState={tileState(data, c)} onClick={() => push('T-09', { id: c.id })}
            title={<span>{c.name} {c.allergy && <span className="pill danger">{c.allergy}</span>} {c.noPhoto && <span className="pill mute">بدون صور</span>}</span>}
            sub={`${staffById(data.groups[c.id])?.short ? 'مجموعة ' + staffById(data.groups[c.id]).short : ''}، ${f === 'in' ? 'الوصول ' + (data.attendance[c.id].at || '') : f === 'expected' ? 'عادة ' + c.usual : f === 'absent' ? 'غياب اليوم' : 'غادر ' + data.picked[c.id]?.at}`}
            end={<ChevronLeft size={18} color="var(--ink-3)" />} />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- T-09 Child page
const KIND = { arrival: ['وصول', '🚪'], meal: ['وجبة', '🍽'], change: ['تغيير', '💧'], nap: ['قيلولة', '☾'], photo: ['صورة', '📷'], activity: ['نشاط', '🎨'], note: ['ملاحظة', '📝'], departure: ['استلام', '👋'], summary: ['ملخص اليوم', '✉️'] };
export function ChildPage({ id }) {
  const { data, openSheet, role } = useStore();
  const [seg, setSeg] = useState('today');
  const c = childById(id);
  const logs = data.logs.filter((l) => l.child === id);
  const a = data.attendance[c.id];
  const state = data.picked[c.id] ? `خروج عند ${data.picked[c.id].at}` : a?.status === 'in' ? `في الحضانة منذ ${a.at}، ٣ سنوات و٤ أشهر` : a?.status === 'absent' ? 'غياب اليوم' : 'متوقّع الوصول';
  const meals = logs.filter((l) => l.kind === 'meal').length;
  const changes = logs.filter((l) => l.kind === 'change').length;
  const sup = role === 'supervisor';
  const open = (k) => openSheet(sup ? { meal: 'o-meal', change: 'o-change', photo: 'o-photo', nap: 'o-nap', more: 'o-more' }[k] : k, { ids: [id] });
  return (
    <div className="pad">
      <div className="card" style={{ background: 'var(--violet-50)', padding: 0, gap: 0 }}>
        <div style={{ display: 'flex', gap: 14, padding: 16, alignItems: 'center' }}>
          <span className="av" style={{ width: 64, height: 64, borderRadius: 20, background: 'var(--violet-100)', color: 'var(--violet-600)', fontSize: 26 }}>{c.name[0]}</span>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <b style={{ fontSize: 24 }}>{c.name}</b>
            <span className="small muted">{state}</span>
            <span className="small muted">الاستلام: {c.collector}، عادةً {c.pick}</span>
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderTop: '1px solid var(--violet-100)', padding: '10px 0' }}>
          {[[ar(meals), 'وجبات'], [logs.some((l) => l.kind === 'nap') ? '٥٠د' : '—', 'قيلولة'], [ar(changes), 'تغييرات']].map(([v, l]) => <span key={l} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}><b style={{ fontSize: 18 }}>{v}</b><span className="small muted">{l}</span></span>)}
        </div>
      </div>
      {(c.allergy || c.veg) && <div className="banner danger"><AlertTriangle size={18} /> {c.allergy ? `حساسية: ${c.allergy}` : 'أيضاً: نباتية'}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 6 }}>
        {[['photo', 'صورة', Camera], ['meal', 'وجبة', Utensils], ['nap', 'قيلولة', Moon], ['change', 'تغيير', Droplets], ['more', 'المزيد', MoreHorizontal]].map(([k, l, I]) => (
          <button key={k} className="card tight" style={{ alignItems: 'center', border: 0, cursor: 'pointer', padding: 10 }} onClick={() => open(k)}><I size={20} /><span className="small" style={{ fontWeight: 700 }}>{l}</span></button>
        ))}
      </div>
      <Seg items={[['today', 'اليوم'], ['info', 'معلومات'], ['rec', 'سجلات']]} value={seg} onChange={setSeg} />
      {seg === 'today' && (logs.length ? <Timeline logs={logs} /> : <div className="card" style={{ alignItems: 'center', textAlign: 'center' }}><b>لا تسجيلات بعد اليوم</b><span className="small muted">استخدم الشريط أعلاه — أول تسجيل يأتي عادةً بعد استقرار الصباح.</span></div>)}
      {seg === 'info' && (<>
        <div className="sec"><span>العائلة</span></div><Row title="أسماء (الأم)" sub="05x xxx 1234" />
        <div className="sec"><span>المصرّح لهم بالاستلام</span></div><Row title="الأب" sub="الهوية ١٠٨٨•••٢١" /><Row title="السائق" sub="الهوية ٢٤٥١•••٠٩" />
        <div className="sec"><span>موافقة الصور</span></div><Row title={c.noPhoto ? 'لا مشاركة للصور' : 'يمكن مشاركة الصور'} />
      </>)}
      {seg === 'rec' && (<>
        <div className="sec"><span>الحوادث</span></div><Row title="لا حوادث" />
        <div className="sec"><span>المستندات</span></div><Row title="النموذج الطبي" end={<span className="pill ok">معتمد</span>} />
        <span className="small muted">للقراءة فقط للطاقم — التعديل من البوابة.</span>
      </>)}
    </div>
  );
}

export function Timeline({ logs, author = true, onItem }) {
  if (!logs.length) return <div className="card" style={{ alignItems: 'center', textAlign: 'center' }}><span style={{ fontWeight: 800 }}>لا تسجيلات بعد</span><span className="small muted">يسجّل الطاقم عادةً أول نشاط بعد استقرار الصباح.</span></div>;
  return (
    <div className="tl">
      {[...logs].reverse().map((l, i) => (
        <div className="tl-item" key={l.id}>
          <span className="tl-ic" style={{ background: l.kind === 'departure' || l.kind === 'arrival' ? 'var(--violet-100)' : 'var(--violet-50)', border: '2px solid #FFF' }}>{KIND[l.kind]?.[1]}</span>
          <div className={`tl-body ${l.fresh ? 'tl-new' : ''}`} onClick={onItem ? () => onItem(l) : undefined} style={onItem ? { cursor: 'pointer' } : undefined}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontWeight: 800, fontSize: 14.5 }}>{l.title || KIND[l.kind]?.[0]}</span>
              <span className="small muted">{l.time}</span>
            </div>
            <span style={{ fontSize: 14, lineHeight: 1.65 }}>{l.text}</span>
            {l.photo && <div style={{ maxWidth: 180 }}><Photo n={l.photo} /></div>}
            {author && l.by && <span className="small muted">سجّله {l.by}{l.for ? ` (نيابةً عن ${l.for})` : ''}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- T-08 Pickup
export function Pickup() {
  const { data, openSheet } = useStore();
  const [q, setQ] = useState('');
  const kids = presentIn(data, myRoom(data)).filter((c) => !q || c.name.includes(q) || c.collector.includes(q))
    .sort((a, b) => a.pick.localeCompare(b.pick, 'ar'));
  const left = inRoom(myRoom(data)).filter((c) => data.picked[c.id]).length;
  return (
    <div className="pad">
      <div className="banner brand">غادر {ar(left)}، باقٍ {ar(kids.length)} — مرتّبون بوقت الاستلام المعتاد</div>
      <label className="row" style={{ cursor: 'text' }}>
        <Search size={18} color="var(--ink-2)" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحثي باسم الطفل أو المستلم" style={{ border: 0, outline: 0, flex: 1, fontFamily: 'inherit', fontSize: 15, background: 'none' }} />
      </label>
      <div className="list">
        {kids.map((c) => {
          const temp = c.id === 's0' && data.tempPickup;
          return (
            <Row key={c.id} child={c} onClick={() => openSheet('checkout', { id: c.id })}
              title={<span>{c.name} {temp && <span className="pill warn">تحقق هوية</span>}</span>}
              sub={temp ? `${data.tempPickup.name} — إضافة اليوم من الأسرة` : `${c.collector}، عادة ${c.pick}`}
              end={<span className="pill brand">تسليم</span>} />
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- sheets
function scopeKids(d, p, filter = () => true) {
  if (p.ids?.length) return p.ids.map(childById);
  const base = p.scope === 'room' ? presentIn(d, myRoom(d)) : myGroup(d).filter((c) => d.attendance[c.id]?.status === 'in' && !d.picked[c.id]);
  return base.filter(filter);
}

export function MealSheet({ params }) {
  const { data, update, closeSheet, toast } = useStore();
  const [scope, setScope] = useState(params.scope === 'room' ? 'room' : 'mine');
  const [out, setOut] = useState(null);      // result for most children
  const [exc, setExc] = useState({});        // childId -> different result
  const [pick, setPick] = useState(null);    // child whose result is being changed
  const all = scopeKids(data, { ...params, scope });
  const done = all.filter((c) => lunchLogged(data, c.id));
  const kids = all.filter((c) => !lunchLogged(data, c.id));
  const allergies = kids.filter((c) => c.allergy || c.veg);
  const label = (v) => MEAL_OUT.find((o) => o[0] === v)?.[1];
  const nExc = Object.keys(exc).length;
  const setFor = (c, v) => { setExc((e) => { const n = { ...e }; if (v === out) delete n[c.id]; else n[c.id] = v; return n; }); setPick(null); };
  const save = () => {
    update((d) => logAsMe({ ...d }, kids.map((c) => ({ child: c.id, kind: 'meal', meal: 'الغداء', by: 'نورة', title: 'الغداء', text: mealSentence(c, 'الغداء', exc[c.id] || out), fresh: true }))));
    closeSheet();
    toast(`حُفظ الغداء لـ ${ar(kids.length)} أطفال${nExc ? (nExc === 1 ? ' (طفل واحد مختلف)' : ` (${ar(nExc)} مختلفين)`) : ''}`);
  };
  const pc = pick && childById(pick);
  return (
    <Sheet title="الغداء" sub={`${clockStr(data.clock)}، ${ar(kids.length)} أطفال`}>
      {!params.ids && <Seg items={[['mine', 'مجموعتي'], ['room', 'الفصل كله']]} value={scope} onChange={(v) => { setScope(v); setExc({}); setPick(null); }} />}
      {allergies.length > 0 && <div className="banner danger"><AlertTriangle size={18} /> {allergies.map((c) => `${c.name} — ${c.allergy ? 'بدون ' + c.allergy : 'نباتية'}`).join('، ')}</div>}
      {done.length > 0 && (
        <div className="banner brand" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
          <span>سُجّل غداؤهم مسبقًا — لن يتكرر ولن يصل الأهل إشعار ثانٍ</span>
          <div className="grid6">{done.map((c) => { const l = lunchLog(data, c.id); return <Tile key={c.id} child={c} size={38} state="done" note={`${l.by === 'نورة' ? 'أنتِ' : l.by} ${l.time}`} />; })}</div>
        </div>
      )}
      {kids.length === 0 ? <div className="banner ok">سُجّل الغداء للجميع ✓</div> : (<>
        <b style={{ fontSize: 16 }}>١. معظم الأطفال أكلوا إيه؟</b>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {MEAL_OUT.map(([v, l, e]) => (
            <button key={v} className="chip" aria-pressed={out === v} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 4px', alignItems: 'center' }} onClick={() => { setOut(v); setExc({}); setPick(null); }}>
              <span style={{ fontSize: 22 }}>{e}</span>{l}
            </button>
          ))}
        </div>
        {kids.length > 1 && (<>
          <b style={{ fontSize: 16, opacity: out ? 1 : 0.45 }}>٢. فيه طفل أكل غير كده؟ اضغطي على وشّه</b>
          {!out && <span className="small muted" style={{ marginTop: -8 }}>اختاري الأول نتيجة معظم الأطفال من فوق.</span>}
          <div className="grid6" style={{ opacity: out ? 1 : 0.45, pointerEvents: out ? 'auto' : 'none' }}>
            {kids.map((c) => <Tile key={c.id} child={c} size={42} state={pick === c.id ? 'sel' : exc[c.id] ? 'exc' : 'in'} note={exc[c.id] ? label(exc[c.id]) : out ? label(out) : ''} onClick={() => setPick(pick === c.id ? null : c.id)} />)}
          </div>
          {pc && (
            <div className="card" style={{ border: '2px solid var(--brand)', background: 'var(--violet-50)' }}>
              <b>{pc.name} {isF(pc) ? 'أكلت' : 'أكل'} إيه؟</b>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                {MEAL_OUT.map(([v, l, e]) => (
                  <button key={v} className="chip" aria-pressed={(exc[pc.id] || out) === v} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '8px 2px', alignItems: 'center', background: '#FFF' }} onClick={() => setFor(pc, v)}>
                    <span style={{ fontSize: 18 }}>{e}</span>{l}
                  </button>
                ))}
              </div>
            </div>
          )}
          {nExc > 0 && (
            <div className="chips">
              {Object.entries(exc).map(([id, v]) => (
                <button key={id} className="chip" style={{ background: 'var(--warn-soft)', color: 'var(--warn)' }} onClick={() => setFor(childById(id), out)}>{childById(id).name}: {label(v)} ✕</button>
              ))}
            </div>
          )}
        </>)}
        {out && (
          <div className="card tight" style={{ background: 'var(--surface-2)' }}>
            <span className="small" style={{ fontWeight: 800 }}>اللي هيوصل للأهل:</span>
            <span className="small">• {ar(kids.length - nExc)} أطفال: «{{ all: 'أنهوا أطباقهم كاملة.', most: 'أكلوا معظم أطباقهم.', some: 'أكلوا جزءًا من أطباقهم.', none: 'لم يأكلوا هذه الوجبة.' }[out]}» — كل أسرة تقرأها باسم طفلها</span>
            {Object.entries(exc).map(([id, v]) => <span key={id} className="small">• {childById(id).name}: «{mealSentence(childById(id), 'الغداء', v).split('— ')[1]}»</span>)}
          </div>
        )}
        <span className="small muted">يظهر الأطفال الآخرون للعائلات باسم «صديق».</span>
        <button className="btn primary" disabled={!out} onClick={save}>{out ? `حفظ الغداء لـ ${ar(kids.length)} أطفال` : 'اختاري نتيجة معظم الأطفال أولًا'}</button>
      </>)}
    </Sheet>
  );
}

const minutes = (s) => { const [h, m] = s.replace(/[٠-٩]/g, (x) => '٠١٢٣٤٥٦٧٨٩'.indexOf(x)).split(':').map(Number); return (h < 7 ? h + 12 : h) * 60 + m; };
export function ChangeSheet({ params }) {
  const { data, update, closeSheet, toast } = useStore();
  const diaperKids = presentIn(data, myRoom(data)).filter((c) => c.diaper);
  const since = (c) => (data.diaperLast[c.id] ? data.clock - minutes(data.diaperLast[c.id]) : 999);
  const due = diaperKids.filter((c) => since(c) >= 180);
  const soon = diaperKids.filter((c) => since(c) >= 120 && since(c) < 180);
  const recent = diaperKids.filter((c) => since(c) < 120);
  const [sel, setSel] = useState(() => new Set(params.ids?.length ? params.ids : due.map((c) => c.id)));
  const tog = (c) => setSel((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; });
  const lastBy = (c) => [...data.logs].reverse().find((l) => l.child === c.id && l.kind === 'change')?.by;
  const hrs = (c) => { const m = since(c); if (m >= 999) return ''; const w = lastBy(c); return `${ar(Math.floor(m / 60))}:${ar(String(m % 60).padStart(2, '0'))} س${w && w !== 'نورة' ? `، ${w}` : ''}`; };
  const save = (type, label) => {
    if (!sel.size) { toast('اختاري طفلًا واحدًا على الأقل'); return; }
    const ids = [...sel];
    const prev = data;
    update((d) => {
      const n = logAsMe({ ...d }, ids.map((id) => ({ child: id, kind: 'change', by: 'نورة', title: 'تغيير حفاض', text: `تم تغيير الحفاض — ${label}.`, meta: label, fresh: true })));
      const dl = { ...n.diaperLast }; ids.forEach((id) => { dl[id] = clockStr(d.clock); });
      return { ...n, diaperLast: dl };
    });
    closeSheet();
    toast(`سُجّل «${label}» لـ ${ar(ids.length)} أطفال، ${clockStr(data.clock)}`, () => update(() => prev));
  };
  const G = ({ title, kids }) => kids.length > 0 && (<>
    <div className="sec"><span>{title}</span></div>
    <div className="grid5">{kids.map((c) => <Tile key={c.id} child={c} state={sel.has(c.id) ? 'sel' : since(c) >= 180 ? 'due' : 'in'} note={hrs(c)} onClick={() => tog(c)} />)}</div>
  </>);
  return (
    <Sheet title="تغيير الحفاض" sub={`${clockStr(data.clock)}، ${ar(diaperKids.length)} أطفال يلبسون حفاضًا`}>
      <G title={`مستحق الآن، أكثر من ٣ ساعات (${ar(due.length)}) — محدّدون تلقائيًا`} kids={due} />
      <G title="قريبًا، ٢–٣ ساعات" kids={soon} />
      <G title="تم مؤخرًا" kids={recent} />
      <span style={{ fontWeight: 800 }}>اضغطي النوع — يُحفظ فورًا لـ {ar(sel.size)} أطفال</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {CHANGE_OUT.map(([v, l, e]) => (
          <button key={v} className="btn" style={{ flexDirection: 'column', gap: 2, background: 'var(--violet-50)', color: 'var(--violet-800)', minHeight: 64 }} onClick={() => save(v, l)}><span style={{ fontSize: 20 }}>{e}</span>{l}</button>
        ))}
      </div>
      <span className="small muted">«مستحق» يقترحه السيستم من وقت آخر تغيير. اضغطي أي طفل لإضافته أو إزالته قبل اختيار النوع.</span>
    </Sheet>
  );
}

export function NapSheet({ params }) {
  const { data, update, toast } = useStore();
  const kids = scopeKids(data, { ...params, scope: params.scope || 'mine' });
  const st = (c) => { const n = data.nap[c.id]; return !n ? 'awake' : n.end ? 'done' : 'asleep'; };
  const awake = kids.filter((c) => st(c) === 'awake');
  const asleep = kids.filter((c) => st(c) === 'asleep');
  const startAll = () => update((d) => { const nap = { ...d.nap }; awake.forEach((c) => { nap[c.id] = { start: d.clock }; }); return { ...d, nap }; });
  const wake = (c, auto) => update((d) => {
    const s = d.nap[c.id]; const end = d.clock + 45 + (c.pal * 3);
    const nap = { ...d.nap, [c.id]: { ...s, end } };
    return logAsMe({ ...d, nap }, [{ child: c.id, kind: 'nap', by: 'نورة', title: 'قيلولة', text: `${isF(c) ? 'نامت' : 'نام'} ${ar(end - s.start)} دقيقة بهدوء.`, fresh: true }]);
  });
  const tap = (c) => {
    if (st(c) === 'asleep') { wake(c); toast(`${isF(c) ? 'استيقظت' : 'استيقظ'} ${c.name}، حُفظت القيلولة`); }
    else if (st(c) === 'awake') update((d) => ({ ...d, nap: { ...d.nap, [c.id]: { start: d.clock } } }));
  };
  const endAll = () => { asleep.forEach((c) => wake(c, true)); toast(`انتهت القيلولة، حُفظت ${ar(asleep.length)}`); };
  return (
    <Sheet title="القيلولة" sub={`${ar(kids.length)} حاضرون، تنتهي تلقائيًا ٢:٣٠`}>
      <div className="chips"><span className="pill brand">نائمون {ar(asleep.length)}</span><span className="pill ok">استيقظوا {ar(kids.filter((c) => st(c) === 'done').length)}</span><span className="pill mute">مستيقظون {ar(awake.length)}</span></div>
      <span className="small muted">{asleep.length ? 'اضغطي الطفل حين يستيقظ' : 'اضغطي الطفل حين ينام، أو زر واحد للجميع'}</span>
      <div className="grid5">
        {kids.map((c) => <Tile key={c.id} child={c} state={st(c) === 'asleep' ? 'sleep' : st(c) === 'done' ? 'done' : 'in'} note={st(c) === 'asleep' ? 'نائم' : st(c) === 'done' ? `${ar(data.nap[c.id].end - data.nap[c.id].start)} د` : 'مستيقظ'} onClick={() => tap(c)} />)}
      </div>
      {awake.length > 0 && <button className="btn primary" onClick={startAll}>البقية نائمون الآن ({ar(awake.length)})</button>}
      {asleep.length > 0 && <button className="btn ghost" onClick={endAll}>انتهت القيلولة — أيقظي الباقين ({ar(asleep.length)})</button>}
    </Sheet>
  );
}

export function PhotoSheet({ params }) {
  const { data, update, closeSheet, toast } = useStore();
  const [step, setStep] = useState('source');
  const [cap, setCap] = useState('نشاط الرسم بالألوان المائية');
  const kids = presentIn(data, myRoom(data));
  const locked = kids.filter((c) => c.noPhoto);
  const [sel, setSel] = useState(() => new Set((params.ids || []).filter((id) => !childById(id).noPhoto)));
  const [mineOnly, setMineOnly] = useState(true);
  const shown = kids.filter((c) => !mineOnly || data.groups[c.id] === ME);
  const send = () => {
    update((d) => logAsMe({ ...d }, [...sel].map((id) => ({ child: id, kind: 'photo', by: 'نورة', title: 'صورة جديدة', text: cap, photo: 3, fresh: true }))));
    closeSheet(); toast(`أُرسلت الصورة إلى ${ar(sel.size)} عائلات`);
  };
  if (step === 'source') return (
    <Sheet title="صورة" sub="من أين الصورة؟">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[['التقاط صورة', 'بالكاميرا الآن', Camera, true], ['من المكتبة', 'صورة التقطتِها سابقًا', ImageIcon, false]].map(([t, s, I, p]) => (
          <button key={t} className="card" style={{ alignItems: 'center', border: p ? '2px solid var(--brand)' : '2px solid transparent', background: p ? 'var(--violet-50)' : 'var(--surface-2)', cursor: 'pointer' }} onClick={() => setStep('tag')}>
            <I size={34} color="var(--violet-700)" /><span style={{ fontWeight: 800 }}>{t}</span><span className="small muted">{s}</span>
          </button>
        ))}
      </div>
      {locked.length > 0 && (
        <div className="banner danger" style={{ flexDirection: 'column' }}>
          <span>قبل التصوير: {ar(locked.length)} أطفال لا يُصوَّرون — أبعديهم عن الكادر</span>
          <div style={{ display: 'flex', gap: 14 }}>{locked.map((c) => <Tile key={c.id} child={c} size={40} state="lock" />)}</div>
        </div>
      )}
    </Sheet>
  );
  return (
    <Sheet title="من في الصورة؟" sub={`${ar(sel.size)} محدّدون`}>
      <Photo n={3} label="معاينة الصورة" />
      <div className="sec"><span>اضغطي من ظهر في الصورة</span><button onClick={() => setMineOnly(!mineOnly)}>{mineOnly ? 'الفصل كله' : 'مجموعتي فقط'}</button></div>
      <div className="grid5">
        {shown.map((c) => <Tile key={c.id} child={c} size={44} state={c.noPhoto ? 'lock' : sel.has(c.id) ? 'sel' : 'in'} onClick={() => { if (c.noPhoto) { toast(`لا توجد موافقة تصوير لـ ${c.name}`); return; } setSel((s) => { const n = new Set(s); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; }); }} />)}
      </div>
      <label className="small" style={{ fontWeight: 800 }}>التعليق
        <input value={cap} onChange={(e) => setCap(e.target.value)} style={{ width: '100%', marginTop: 6, border: '1.5px solid var(--line-2)', borderRadius: 12, padding: '10px 12px', fontFamily: 'inherit', fontSize: 15 }} />
      </label>
      <button className="btn primary" disabled={!sel.size} onClick={send}>{sel.size ? `إرسال إلى ${ar(sel.size)} عائلات` : 'اختاري طفلًا واحدًا على الأقل'}</button>
    </Sheet>
  );
}

const SPOKEN = '«كلهم أكلوا وجبة العصر كلها، ما عدا لمى ما أكلت، وعمر أكل أغلبها»';
const SNACK = 'وجبة العصر';
const snackLogged = (d, id) => d.logs.some((l) => l.child === id && l.meal === SNACK);
export function VoiceSheet() {
  const { data, update, closeSheet, toast } = useStore();
  const [step, setStep] = useState('listen');
  const [typed, setTyped] = useState('');
  const [omar, setOmar] = useState(null);
  useEffect(() => {
    if (step !== 'listen') return undefined;
    let i = 0; const id = setInterval(() => { i += 2; setTyped(SPOKEN.slice(0, i)); if (i >= SPOKEN.length) clearInterval(id); }, 45);
    return () => clearInterval(id);
  }, [step]);
  const kids = presentIn(data, myRoom(data)).filter((c) => !snackLogged(data, c.id));
  const lama = kids.find((c) => c.name === 'لمى');
  const omars = kids.filter((c) => c.name.startsWith('عمر'));
  const rest = kids.filter((c) => c !== lama && !omars.includes(c));
  const confirm = () => {
    const entries = kids.map((c) => {
      let o = 'all';
      if (c === lama) o = 'none';
      if (c.id === omar) o = 'most';
      return { child: c.id, kind: 'meal', meal: SNACK, by: 'نورة', title: SNACK, text: mealSentence(c, SNACK, o), fresh: true };
    });
    update((d) => logAsMe({ ...d }, entries));
    closeSheet(); toast(`حُفظت ${ar(entries.length)} سجلات من جملة واحدة`);
  };
  if (step === 'listen') return (
    <Sheet title="قولها" sub={`الفصل كله، ${ar(kids.length)} أطفال`}>
      <Seg items={[['ar', 'العربية'], ['en', 'English'], ['both', 'الاثنتان']]} value="ar" onChange={() => {}} />
      <div className="card" style={{ background: 'var(--violet-50)', minHeight: 110, fontSize: 17, lineHeight: 1.8 }}>{typed}<span style={{ color: 'var(--brand)' }}>|</span></div>
      <span className="small muted">قولي الاسم وماذا حدث. يتعرّف فقط على أسماء فصلك، ولا يُحفظ شيء قبل تأكيدك.</span>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <button onClick={() => setStep('confirm')} aria-label="انتهيت" style={{ width: 96, height: 96, borderRadius: 48, border: 0, background: 'var(--violet-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span style={{ width: 72, height: 72, borderRadius: 36, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Mic size={32} color="#FFF" /></span>
        </button>
        <span style={{ fontWeight: 800 }}>اضغطي عند الانتهاء</span>
      </div>
    </Sheet>
  );
  return (
    <Sheet title="سمعتُ" sub={SPOKEN}>
      <div className="row" style={{ border: '1.5px solid var(--ok)', cursor: 'default' }}><span className="grow"><span className="t">{SNACK}، أكل كله</span></span><span className="pill ok">{ar(rest.length)} طفلًا ✓</span></div>
      <div className="sec"><span>الاستثناءات</span></div>
      {lama && <div className="row" style={{ cursor: 'default' }}><Av name={lama.name} pal={lama.pal} size={36} /><span className="grow"><span className="t">لمى</span></span><span className="pill danger">لا شيء</span></div>}
      {omars.length > 1 && (
        <div className="card" style={{ border: '2px solid #E08A00', background: '#FFFBF4' }}>
          <span style={{ fontWeight: 800, color: 'var(--warn)' }}>في الفصل طفلان اسمهما عمر — أيّهما أكل أغلبه؟</span>
          <div style={{ display: 'flex', gap: 22 }}>{omars.map((c) => <Tile key={c.id} child={c} state={omar === c.id ? 'sel' : 'in'} note={`مجموعة ${staffById(data.groups[c.id]).short}`} onClick={() => setOmar(c.id)} />)}</div>
        </div>
      )}
      <span className="small muted">«كلهم» = الحاضرون فقط. لا يُحفظ شيء حتى تختاري عمر الصحيح.</span>
      <button className="btn primary" disabled={omars.length > 1 && !omar} onClick={confirm}>تأكيد، {ar(kids.length)} أطفال</button>
    </Sheet>
  );
}

export function ArrivalsSheet() {
  const { data, update, toast } = useStore();
  const exp = inRoom(myRoom(data)).filter((c) => data.attendance[c.id]?.status === 'expected').sort((a, b) => a.usual.localeCompare(b.usual));
  const arrive = (c) => {
    const prev = data;
    update((d) => logAsMe({ ...d, attendance: { ...d.attendance, [c.id]: { status: 'in', at: clockStr(d.clock), by: c.dropoff } } }, [{ child: c.id, kind: 'arrival', by: 'نورة', title: 'الوصول', text: `${isF(c) ? 'وصلت' : 'وصل'} ${c.name} ${c.dropoff}.`, fresh: true }]));
    toast(`${isF(c) ? 'وصلت' : 'وصل'} ${c.name}، ${clockStr(data.clock)}`, () => update(() => prev));
  };
  return (
    <Sheet title="استقبال الأطفال" sub="اضغطي الطفل عند وصوله — يُحفظ فورًا">
      {exp.length === 0 ? <div className="banner ok">وصل الجميع ✓</div> : (
        <div className="grid4">{exp.map((c) => <Tile key={c.id} child={c} size={54} state="exp" note={`${c.dropoff}، ${c.usual}`} onClick={() => arrive(c)} />)}</div>
      )}
      <span className="small muted">المزاج والملاحظة اختياريان — من صفحة الطفل لاحقًا.</span>
    </Sheet>
  );
}

export function CheckoutSheet({ params }) {
  const { data, update, closeSheet, toast } = useStore();
  const c = childById(params.id);
  const temp = c.id === 's0' && data.tempPickup;
  const opts = [...(temp ? [`${temp.name} (اليوم فقط)`] : []), 'الأم', 'الأب', 'السائق', 'غير مصرح له — إبلاغ ولي الأمر'];
  const [who, setWho] = useState(temp ? opts[0] : c.collector);
  const [idOk, setIdOk] = useState(false);
  const [parentCalled, setParentCalled] = useState(false);
  const [alertNote, setAlertNote] = useState('');
  const needId = who.includes('اليوم فقط');
  const isUnauthorized = who === 'غير مصرح له — إبلاغ ولي الأمر';

  const go = () => {
    if (isUnauthorized) {
      update((d) => {
        const note = alertNote.trim() || 'شخص غير مصرح له طلب استلام الطفل — تم إيقاف التسليم حتى موافقة ولي الأمر.';
        return logAsMe({
          ...d,
          pickupAlert: { ...d.pickupAlert, [c.id]: { child: c.id, by: 'غير مصرح', at: clockStr(d.clock), note, parentCalled, status: 'blocked' } },
        }, [{
          child: c.id,
          kind: 'pickup_alert',
          by: 'نورة',
          title: 'محاولة استلام غير مصرح',
          text: `${isF(c) ? 'حاولت' : 'حاول'} شخصًا غير مصرح له استلام ${c.name} في ${clockStr(d.clock)}. تم إيقاف التسليم وإبلاغ ولي الأمر.`,
          fresh: true,
        }]);
      });
      closeSheet();
      toast('تم إيقاف التسليم — تم إبلاغ ولي الأمر');
      return;
    }

    update((d) => logAsMe({ ...d, picked: { ...d.picked, [c.id]: { by: who, at: clockStr(d.clock) } } }, [{ child: c.id, kind: 'departure', by: 'نورة', title: 'الاستلام', text: `${isF(c) ? 'استلمها' : 'استلمه'} ${who.replace(' (اليوم فقط)', '')} في ${clockStr(d.clock)}.`, fresh: true }]));
    closeSheet(); toast(`تم تسليم ${c.name} إلى ${who.replace(' (اليوم فقط)', '')}`);
  };

  return (
    <Sheet title={`تسليم ${c.name}`} sub="المستلم المتوقع محدد مسبقًا — غيّريه فقط إن جاء شخص آخر">
      <div className="chips">{opts.map((o) => <Chip key={o} on={who === o} onClick={() => setWho(o)}>{o}</Chip>)}</div>
      {needId && (
        <button className="row" style={{ background: 'var(--warn-soft)' }} onClick={() => setIdOk(!idOk)}>
          <Shield size={20} color="var(--warn)" /><span className="grow"><span className="t">إضافة اليوم من الأسرة — تحققي من الهوية</span><span className="s">رقم الهوية المسجّل: ١٠٨٨•••٢١</span></span>
          <span className={`pill ${idOk ? 'ok' : 'warn'}`}>{idOk ? 'تم التحقق ✓' : 'تحقق'}</span>
        </button>
      )}
      {isUnauthorized && (
        <div className="card" style={{ background: 'var(--danger-soft)', border: '2px solid var(--danger)' }}>
          <span className="t" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> لا يتم تسليم الطفل دون موافقة ولي الأمر</span>
          <div className="row" style={{ background: '#fff', borderRadius: 12, marginTop: 8 }} onClick={() => setParentCalled(!parentCalled)}>
            <span className="grow"><span className="t">أبلغت ولي الأمر؟</span></span>
            <span className={`pill ${parentCalled ? 'ok' : 'warn'}`}>{parentCalled ? 'تم الإبلاغ ✓' : 'إبلاغ'}</span>
          </div>
          <label className="small" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10, fontWeight: 800 }}>
            ملاحظات الطاقم
            <input value={alertNote} onChange={(e) => setAlertNote(e.target.value)} placeholder="مثل: شخص غير مسجّل طلب استلام الطفل" style={{ width: '100%', border: '1.5px solid var(--line-2)', borderRadius: 12, padding: '10px 12px', fontFamily: 'inherit', fontSize: 15 }} />
          </label>
        </div>
      )}
      {c.id === 's0' && <div className="banner brand">اسألي عن: الأسرة سألت عن قبعة الشمس للرحلة يوم الأربعاء.</div>}
      <button className="btn primary" disabled={(needId && !idOk) || (isUnauthorized && !parentCalled)} onClick={go}>{isUnauthorized ? 'إيقاف التسليم وإبلاغ ولي الأمر' : `تأكيد التسليم إلى ${who.replace(' (اليوم فقط)', '')}`}</button>
    </Sheet>
  );
}

export function DayCloseSheet() {
  const { data, update, closeSheet, toast, openSheet } = useStore();
  const kids = myGroup(data).filter((c) => data.attendance[c.id]?.status === 'in');
  const missing = kids.filter((c) => !lunchLogged(data, c.id));
  const flagged = kids.filter((c) => c.id === 's3' || c.id === 's7').filter((c) => !missing.includes(c));
  const [read, setRead] = useState({});
  const ready = kids.filter((c) => !missing.includes(c) && (!flagged.includes(c) || read[c.id]));
  const send = () => {
    update((d) => logAsMe({ ...d, dayClosed: true }, ready.map((c) => ({ child: c.id, kind: 'summary', by: 'نورة', title: 'ملخص اليوم', text: 'وصل ملخص اليوم — اقرئيه كاملًا عند الاستلام.', fresh: true }))));
    closeSheet(); toast(`أُرسلت ${ar(ready.length)} ملخصات`);
  };
  return (
    <Sheet title="ملخصات اليوم" sub={`مجموعتي، ${ar(kids.length)} أطفال`}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
        {[[ready.length, 'جاهزة', 'ok'], [flagged.filter((c) => !read[c.id]).length, 'تحتاج قراءة', 'warn'], [missing.length, 'ناقصة', 'danger']].map(([v, l, k]) => (
          <div key={l} className={`card tight pill ${k}`} style={{ borderRadius: 16, flexDirection: 'column', alignItems: 'flex-start', padding: 12 }}><span style={{ fontSize: 24 }}>{ar(v)}</span><span>{l}</span></div>
        ))}
      </div>
      {missing.length > 0 && (<>
        <div className="sec"><span>ناقص قبل الإرسال</span></div>
        {missing.map((c) => <Row key={c.id} child={c} avState="exc" title={`${c.name} — لا يوجد غداء`} end={<span className="pill brand">أضيفي</span>} onClick={() => openSheet('meal', { ids: [c.id] })} />)}
      </>)}
      {flagged.length > 0 && (<>
        <div className="sec"><span>تحتاج قراءة — تذكر طفلًا آخر أو حادثًا</span></div>
        {flagged.map((c) => <Row key={c.id} child={c} avState={read[c.id] ? 'done' : 'exc'} title={c.name} sub={read[c.id] ? 'قُرئت ✓' : c.id === 's7' ? 'خدش بسيط في الركبة — موقّع من المشرفة' : 'ذُكر اسم صديق في الملاحظة'} end={!read[c.id] && <span className="pill warn">اقرئي</span>} onClick={() => setRead((r) => ({ ...r, [c.id]: true }))} />)}
      </>)}
      <button className="btn primary" disabled={!ready.length || data.dayClosed} onClick={send}>{data.dayClosed ? 'أُرسلت ✓' : `إرسال ${ar(ready.length)} جاهزة الآن`}</button>
    </Sheet>
  );
}

export function MeSheet() {
  const { data, update, closeSheet, toast, logout } = useStore();
  const asleep = Object.entries(data.nap).filter(([, n]) => !n.end).map(([id]) => childById(id)).filter((c) => data.groups[c.id] === ME);
  const noLunch = myGroup(data).filter((c) => data.attendance[c.id]?.status === 'in' && !lunchLogged(data, c.id));
  const items = [
    ...asleep.slice(0, 2).map((c) => [c, `${isF(c) ? 'ما زالت نائمة' : 'ما زال نائمًا'}`, 'ستُسجَّل تلقائيًا عند الاستيقاظ', 'sleep']),
    ...noLunch.slice(0, 2).map((c) => [c, 'لا يوجد غداء مسجّل', 'افتحي الطفل لإضافته', 'exc']),
    ...(data.tempPickup ? [[childById('s0'), `يستلمها ${data.tempPickup.name} اليوم`, 'إضافة من الأسرة، يحتاج تحقق هوية', 'in']] : []),
  ];
  return (
    <Sheet title="نورة العتيبي" sub={`معلّمة، ${roomById(myRoom(data)).name}، ورديتي ٧:٣٠ – ٣:٣٠`}>
      <div className={`banner ${data.shiftStarted ? 'ok' : 'warn'}`}>{data.shiftStarted ? `ورديتي منذ ${data.shiftAt || '٧:٢٨'}` : 'لم تبدأ ورديتك بعد'}</div>
      <div className="sec"><span>تسليم مجموعتك — يُجهَّز تلقائيًا</span></div>
      {items.length === 0 && <span className="small muted">لا شيء مفتوح — كل شيء مسجّل.</span>}
      {items.map(([c, t, s, st], i) => <Row key={i} child={c} avState={st} title={`${c.name} — ${t}`} sub={s} />)}
      <span className="small muted">كل سجل يحمل اسم من كتبه، فلا يتكرر التسجيل بين المعلمات.</span>
      <button className="btn primary" disabled={data.handedOver} onClick={() => { update({ handedOver: true }); closeSheet(); toast('سُلّمت المجموعة إلى هدى وانتهت ورديتك'); }}>{data.handedOver ? 'سُلّمت ✓' : 'تسليم إلى هدى وإنهاء ورديتي'}</button>
      <button className="btn" style={{ background: 'var(--surface-2)' }} onClick={logout}>تسجيل الخروج</button>
    </Sheet>
  );
}

export function NotifsSheet() {
  const { data, update } = useStore();
  const items = notifsFor(data);
  useEffect(() => { if (!data.notifsSeen) update({ notifsSeen: true }); }, []);
  return (
    <Sheet title="الإشعارات" sub="ما سجّلته زميلاتك لأطفال مجموعتك">
      {items.length === 0 && <span className="small muted">لا جديد — كل تسجيلات مجموعتك منك.</span>}
      {items.map((n) => (
        <Row key={n.who + n.what} title={`${n.who} سجّلت «${n.what}»`} sub={`${n.kids.join('، ')} · ${n.time}`} />
      ))}
      <span className="small muted">لا داعي لتسجيلها مرة ثانية — تظهر في يوميات الطفل باسم من سجّلها.</span>
    </Sheet>
  );
}

export function MoreSheet({ params }) {
  const { closeSheet, toast, update } = useStore();
  const rows = [['ملاحظة', FileText], ['الصحة', HeartPulse], ['حادثة', AlertTriangle], ['طلب إذن', Shield]];
  return (
    <Sheet title="المزيد">
      {rows.map(([l, I]) => <Row key={l} title={l} end={<ChevronLeft size={18} />} onClick={() => { closeSheet(); toast(`«${l}» — في النسخة الكاملة`); }} child={null} />)}
    </Sheet>
  );
}

export function HubSheet() {
  const { openSheet, push, closeSheet } = useStore();
  const tiles = [
    ['صورة', Camera, () => openSheet('photo', {})], ['وجبة', Utensils, () => openSheet('meal', {})], ['قيلولة', Moon, () => openSheet('nap', {})],
    ['تغيير', Droplets, () => openSheet('change', {})], ['قولها', Mic, () => openSheet('voice')], ['استقبال', Users, () => openSheet('arrivals')],
    ['الاستلام', LogOut, () => push('T-08')], ['إغلاق اليوم', ClipboardCheck, () => openSheet('dayclose')], ['تسليم الوردية', Sparkles, () => openSheet('me')],
  ];
  return (
    <Sheet title="المركز" sub="كل الإجراءات في مكان واحد">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
        {tiles.map(([l, I, go]) => <button key={l} className="card tight" style={{ alignItems: 'center', border: 0, cursor: 'pointer', background: 'var(--surface-2)' }} onClick={go}><I size={22} color="var(--violet-700)" /><span className="small" style={{ fontWeight: 800 }}>{l}</span></button>)}
      </div>
    </Sheet>
  );
}

export function StaffMessages() { return <Inbox side="staff" />; }
export function StaffConversation({ id }) { return <Conversation id={id} side="staff" />; }

export const STAFF_SHEETS = { meal: MealSheet, change: ChangeSheet, nap: NapSheet, photo: PhotoSheet, voice: VoiceSheet, arrivals: ArrivalsSheet, checkout: CheckoutSheet, dayclose: DayCloseSheet, me: MeSheet, notifs: NotifsSheet, more: MoreSheet, hub: HubSheet };
export { LayoutGrid, Send };

import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { initialState } from './data.js';

const KEY = 'kiday-proto-v4';
const Ctx = createContext(null);

const HOME = { parent: 'P-01', staff: 'T-01', supervisor: 'S-11' };

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* storage blocked — start fresh */ }
  return null;
}

function fresh() {
  return {
    role: null,
    stacks: { parent: [{ id: HOME.parent }], staff: [{ id: HOME.staff }], supervisor: [{ id: HOME.supervisor }] },
    sheet: null,
    data: initialState(),
  };
}

function reducer(s, a) {
  const stack = s.role ? s.stacks[s.role] : [];
  switch (a.type) {
    case 'role': return { ...s, role: a.role, sheet: null };
    case 'login': return { ...s, role: a.role, sheet: null, stacks: { ...s.stacks, [a.role]: [{ id: HOME[a.role] }] } };
    case 'logout': return { ...s, role: null, sheet: null };
    case 'push': return { ...s, sheet: null, stacks: { ...s.stacks, [s.role]: [...stack, { id: a.id, params: a.params || {} }] } };
    case 'tab': return { ...s, sheet: null, stacks: { ...s.stacks, [s.role]: [{ id: a.id, params: a.params || {} }] } };
    case 'back': return { ...s, sheet: null, stacks: { ...s.stacks, [s.role]: stack.length > 1 ? stack.slice(0, -1) : stack } };
    case 'jump': return { ...s, role: a.role, sheet: a.sheet || null, stacks: { ...s.stacks, [a.role]: a.stack } };
    case 'sheet': return { ...s, sheet: a.sheet };
    case 'data': return { ...s, data: typeof a.fn === 'function' ? a.fn(s.data) : { ...s.data, ...a.fn } };
    case 'reset': return fresh();
    default: return s;
  }
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => load() || fresh());
  const [toast, setToast] = useState(null);
  const timer = useRef();

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const api = useMemo(() => ({
    state,
    role: state.role,
    data: state.data,
    screen: state.role ? state.stacks[state.role][state.stacks[state.role].length - 1] : null,
    sheet: state.sheet,
    setRole: (role) => dispatch({ type: 'role', role }),
    login: (role) => dispatch({ type: 'login', role }),
    logout: () => dispatch({ type: 'logout' }),
    push: (id, params) => dispatch({ type: 'push', id, params }),
    tab: (id, params) => dispatch({ type: 'tab', id, params }),
    back: () => dispatch({ type: 'back' }),
    jump: (role, stack, sheet) => dispatch({ type: 'jump', role, stack, sheet }),
    openSheet: (id, params) => dispatch({ type: 'sheet', sheet: { id, params: params || {} } }),
    closeSheet: () => dispatch({ type: 'sheet', sheet: null }),
    update: (fn) => dispatch({ type: 'data', fn }),
    reset: () => dispatch({ type: 'reset' }),
    toast: (text, undo) => {
      clearTimeout(timer.current);
      setToast({ text, undo, k: Date.now() });
      timer.current = setTimeout(() => setToast(null), 3200);
    },
    toastState: toast,
    clearToast: () => setToast(null),
  }), [state, toast]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);
export { HOME };

// Arabic-Indic digits + clock
const AR = '٠١٢٣٤٥٦٧٨٩';
export const ar = (n) => String(n).replace(/[0-9]/g, (d) => AR[d]);
export function nowAr() {
  const d = new Date();
  let h = d.getHours() % 12 || 12;
  return ar(`${h}:${String(d.getMinutes()).padStart(2, '0')}`);
}

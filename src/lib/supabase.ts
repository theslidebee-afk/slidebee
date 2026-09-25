import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://whwyfqtvuubkfypmgosi.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indod3lmcXR2dXVia2Z5cG1nb3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNjcyMzQsImV4cCI6MjEwMzk0MzIzNH0.cDUR7AhCc_5NGgO_iYHAka7wpk0cKTR0GsofBLw-taE';

// Raw Supabase Client for fallback resilience
export const rawSupabase = createClient(supabaseUrl, supabaseAnonKey);

export interface OrderRecord {
  id?: string;
  created_at?: string;
  order_reference: string;
  service_type: string;
  slide_count: string;
  timeline: string;
  formats: string[];
  style_preference: string;
  drive_url?: string;
  project_brief: string;
  full_name: string;
  email: string;
  company?: string;
  phone?: string;
  status?: 'pending' | 'in_review' | 'in_progress' | 'completed' | 'cancelled';
}

export interface WaitlistRecord {
  id?: string;
  created_at?: string;
  email: string;
  source?: string;
}

// =========================================================
// Cloudflare Edge & D1 Query Engine Adapter
// =========================================================

type AuthChangeCallback = (event: string, session: any) => void;
const authListeners = new Set<AuthChangeCallback>();

function notifyAuthListeners(event: string, session: any) {
  for (const cb of authListeners) {
    try {
      cb(event, session);
    } catch (e) {
      console.warn('Auth listener notification warning:', e);
    }
  }
}

class EdgeQueryBuilder implements PromiseLike<any> {
  private table: string;
  private action: string = 'select';
  private selectCols: string = '*';
  private filters: Array<{ column: string; op: string; value: any }> = [];
  private orderOpt?: { column: string; ascending?: boolean };
  private limitVal?: number;
  private offsetVal?: number;
  private valuesPayload?: any;
  private isSingle: boolean = false;

  constructor(table: string) {
    this.table = table;
  }

  select(cols: string = '*') {
    this.selectCols = cols;
    return this;
  }

  insert(values: any) {
    this.action = 'insert';
    this.valuesPayload = values;
    return this;
  }

  update(values: any) {
    this.action = 'update';
    this.valuesPayload = values;
    return this;
  }

  upsert(values: any) {
    this.action = 'upsert';
    this.valuesPayload = values;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, op: 'eq', value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ column, op: 'neq', value });
    return this;
  }

  like(column: string, value: any) {
    this.filters.push({ column, op: 'like', value });
    return this;
  }

  ilike(column: string, value: any) {
    this.filters.push({ column, op: 'ilike', value });
    return this;
  }

  in(column: string, value: any[]) {
    this.filters.push({ column, op: 'in', value });
    return this;
  }

  is(column: string, value: any) {
    this.filters.push({ column, op: 'is', value });
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }) {
    this.orderOpt = { column, ascending: opts?.ascending !== false };
    return this;
  }

  limit(count: number) {
    this.limitVal = count;
    return this;
  }

  range(from: number, to: number) {
    this.offsetVal = from;
    this.limitVal = to - from + 1;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  async execute(): Promise<{ data: any; error: any; count?: number }> {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: this.action,
          table: this.table,
          select: this.selectCols,
          filters: this.filters,
          order: this.orderOpt,
          limit: this.limitVal,
          offset: this.offsetVal,
          values: this.valuesPayload,
          single: this.isSingle,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json && !json.error) {
          const count = Array.isArray(json.data) ? json.data.length : (json.data ? 1 : 0);
          return { data: json.data, error: null, count };
        }
      }
    } catch {
      // Fall through to raw Supabase fallback
    }

    // Fallback: Delegate to raw Supabase client
    try {
      let query: any = (rawSupabase.from as any)(this.table);
      if (this.action === 'select') query = query.select(this.selectCols);
      else if (this.action === 'insert') query = query.insert(this.valuesPayload);
      else if (this.action === 'update') query = query.update(this.valuesPayload);
      else if (this.action === 'upsert') query = query.upsert(this.valuesPayload);
      else if (this.action === 'delete') query = query.delete();

      for (const f of this.filters) {
        if (f.op === 'eq') query = query.eq(f.column, f.value);
        else if (f.op === 'neq') query = query.neq(f.column, f.value);
        else if (f.op === 'like') query = query.like(f.column, f.value);
        else if (f.op === 'ilike') query = query.ilike(f.column, f.value);
        else if (f.op === 'in') query = query.in(f.column, f.value);
        else if (f.op === 'is') query = query.is(f.column, f.value);
      }

      if (this.orderOpt) query = query.order(this.orderOpt.column, { ascending: this.orderOpt.ascending });
      if (typeof this.limitVal === 'number') query = query.limit(this.limitVal);
      if (typeof this.offsetVal === 'number' && typeof this.limitVal === 'number') {
        query = query.range(this.offsetVal, this.offsetVal + this.limitVal - 1);
      }
      if (this.isSingle) query = query.single();

      return await query;
    } catch (fallbackErr: any) {
      return { data: null, error: fallbackErr };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any; count?: number }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

const edgeAuth = {
  async signInWithPassword({ email, password }: { email: string; password?: string }) {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.session) {
          localStorage.setItem('slidebee_edge_session', JSON.stringify(json.data.session));
          notifyAuthListeners('SIGNED_IN', json.data.session);
          // Sync with raw Supabase in background if available
          if (password) rawSupabase.auth.signInWithPassword({ email, password }).catch(() => {});
          return { data: json.data, error: null };
        }
      }
    } catch {}

    // Fallback to Supabase GoTrue
    return rawSupabase.auth.signInWithPassword({ email, password: password || '' });
  },

  async signUp({ email, password, options }: { email: string; password?: string; options?: any }) {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email,
          password,
          full_name: options?.data?.full_name,
          company: options?.data?.company,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.data?.session) {
          localStorage.setItem('slidebee_edge_session', JSON.stringify(json.data.session));
          notifyAuthListeners('SIGNED_IN', json.data.session);
          if (password) rawSupabase.auth.signUp({ email, password, options }).catch(() => {});
          return { data: json.data, error: null };
        }
      }
    } catch {}

    return rawSupabase.auth.signUp({ email, password: password || '', options });
  },

  async signOut(options?: any) {
    try {
      const rawStored = localStorage.getItem('slidebee_edge_session');
      const stored = rawStored ? JSON.parse(rawStored) : null;
      if (stored?.access_token) {
        await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'logout', sessionId: stored.access_token }),
        }).catch(() => {});
      }
    } catch {}

    localStorage.removeItem('slidebee_edge_session');
    notifyAuthListeners('SIGNED_OUT', null);
    return rawSupabase.auth.signOut(options);
  },

  async getSession() {
    try {
      const rawStored = localStorage.getItem('slidebee_edge_session');
      if (rawStored) {
        const session = JSON.parse(rawStored);
        if (session && session.user) {
          return { data: { session }, error: null };
        }
      }
    } catch {}

    return rawSupabase.auth.getSession();
  },

  async getUser() {
    try {
      const rawStored = localStorage.getItem('slidebee_edge_session');
      if (rawStored) {
        const session = JSON.parse(rawStored);
        if (session && session.user) {
          return { data: { user: session.user }, error: null };
        }
      }
    } catch {}

    return rawSupabase.auth.getUser();
  },

  onAuthStateChange(callback: AuthChangeCallback) {
    authListeners.add(callback);
    const { data: rawListener } = rawSupabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            authListeners.delete(callback);
            rawListener?.subscription?.unsubscribe();
          },
        },
      },
    };
  },

  updateUser: (attributes: any) => rawSupabase.auth.updateUser(attributes),
  resetPasswordForEmail: (email: string, options?: any) => rawSupabase.auth.resetPasswordForEmail(email, options),
};

export const supabase = {
  auth: edgeAuth,
  from: (table: string) => new EdgeQueryBuilder(table),
  rpc: async (fnName: string, params?: any) => {
    try {
      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rpc', rpcName: fnName, rpcParams: params }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json && !json.error) {
          return { data: json.data, error: null };
        }
      }
    } catch {}

    return (rawSupabase.rpc as any)(fnName, params);
  },
} as unknown as typeof rawSupabase;

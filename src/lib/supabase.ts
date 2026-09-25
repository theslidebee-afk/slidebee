// Cloudflare Edge & D1 Query Engine Client for SlideBee
// 100% Serverless Edge Data & Auth Engine backed by Cloudflare D1
// Zero Supabase dependency, zero inactivity pause, instant cold starts.

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

export class EdgeQueryBuilder implements PromiseLike<any> {
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

  upsert(values: any, _options?: { onConflict?: string; ignoreDuplicates?: boolean }) {
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

  or(expr: string) {
    this.filters.push({ column: '', op: 'or', value: expr });
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
        return { data: null, error: json?.error || { message: 'Query error' } };
      }
      return { data: null, error: { message: `HTTP ${res.status}: Query failed` } };
    } catch (err: any) {
      return { data: null, error: { message: err?.message || 'Network error' } };
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
      const json = await res.json();
      if (res.ok && json?.data?.session) {
        localStorage.setItem('slidebee_edge_session', JSON.stringify(json.data.session));
        localStorage.setItem('slidebee_client_user', JSON.stringify({
          email: json.data.user.email,
          tier: json.data.profile?.tier || 'free',
          role: json.data.user.role || 'client',
          user_metadata: json.data.user.user_metadata,
        }));
        notifyAuthListeners('SIGNED_IN', json.data.session);
        return { data: json.data, error: null };
      }
      return { data: { user: null, session: null }, error: json?.error || { message: 'Invalid credentials' } };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: { message: err?.message || 'Login failed' } };
    }
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
      const json = await res.json();
      if (res.ok && json?.data?.session) {
        localStorage.setItem('slidebee_edge_session', JSON.stringify(json.data.session));
        localStorage.setItem('slidebee_client_user', JSON.stringify({
          email: json.data.user.email,
          tier: 'free',
          role: json.data.user.role || 'client',
          user_metadata: json.data.user.user_metadata,
        }));
        notifyAuthListeners('SIGNED_IN', json.data.session);
        return { data: json.data, error: null };
      }
      return { data: { user: null, session: null }, error: json?.error || { message: 'Signup failed' } };
    } catch (err: any) {
      return { data: { user: null, session: null }, error: { message: err?.message || 'Signup failed' } };
    }
  },

  async signOut(_options?: any) {
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
    localStorage.removeItem('slidebee_client_user');
    notifyAuthListeners('SIGNED_OUT', null);
    return { error: null };
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

    return { data: { session: null }, error: null };
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

    return { data: { user: null }, error: null };
  },

  onAuthStateChange(callback: AuthChangeCallback) {
    authListeners.add(callback);

    // Initial check
    const rawStored = localStorage.getItem('slidebee_edge_session');
    if (rawStored) {
      try {
        const session = JSON.parse(rawStored);
        if (session?.user) {
          setTimeout(() => callback('SIGNED_IN', session), 0);
        }
      } catch {}
    }

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            authListeners.delete(callback);
          },
        },
      },
    };
  },

  async updateUser(attributes: any) {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_user', ...attributes }),
      });
      const json = await res.json();
      return { data: json?.data || null, error: json?.error || null };
    } catch (err: any) {
      return { data: null, error: { message: err?.message || 'Update failed' } };
    }
  },

  async resetPasswordForEmail(email: string, _options?: any) {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_password', email }),
      });
      const json = await res.json();
      return { data: json?.data || null, error: json?.error || null };
    } catch (err: any) {
      return { data: null, error: { message: err?.message || 'Reset failed' } };
    }
  },
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
        return { data: null, error: json?.error || { message: 'RPC execution failed.' } };
      }
      return { data: null, error: { message: `HTTP ${res.status}: RPC failed` } };
    } catch (err: any) {
      return { data: null, error: { message: err?.message || 'RPC invocation failed' } };
    }
  },
};

// Aliases for seamless backward compatibility
export const rawSupabase = supabase;

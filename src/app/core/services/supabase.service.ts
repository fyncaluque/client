import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUser = new BehaviorSubject<User | null>(null);
  private currentSession = new BehaviorSubject<Session | null>(null);

  readonly user$: Observable<User | null> = this.currentUser.asObservable();
  readonly session$: Observable<Session | null> = this.currentSession.asObservable();

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );

    // Listen for auth state changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentSession.next(session);
      this.currentUser.next(session?.user ?? null);
    });

    // Check initial session
    this.supabase.auth.getSession().then(({ data: { session } }) => {
      this.currentSession.next(session);
      this.currentUser.next(session?.user ?? null);
    });
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  async signUp(email: string, password: string, name?: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session?.access_token ?? null;
  }

  get isAuthenticated(): boolean {
    return this.currentUser.value !== null;
  }
}

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const initialized = useRef(false);

    // Fetch profile from users table
    const fetchProfile = async (authUser) => {
        if (!authUser) {
            setProfile(null);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('auth_id', authUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }

            // If no profile exists, create one
            if (!data) {
                const newProfile = {
                    auth_id: authUser.id,
                    email: authUser.email,
                    full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || 'لاعب جديد',
                    avatar_url: authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || null,
                    user_type: 'google',
                    total_xp: 0,
                    current_level: 1,
                    accuracy: 0,
                    total_stars: 0,
                    completed_stages: 0,
                };

                const { data: created, error: createError } = await supabase
                    .from('users')
                    .insert(newProfile)
                    .select()
                    .single();

                if (createError) {
                    console.error('Error creating profile:', createError);
                } else {
                    setProfile(created);
                }
            } else {
                // Update last_login
                await supabase
                    .from('users')
                    .update({ last_login: new Date().toISOString() })
                    .eq('auth_id', authUser.id);

                setProfile(data);
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
        }
    };

    useEffect(() => {
        // Prevent double initialization in React Strict Mode
        if (initialized.current) return;
        initialized.current = true;

        // Get initial session
        const initAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error('Session error:', error);
                }
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user);
                }
            } catch (err) {
                // Ignore abort errors from React Strict Mode
                if (err.name !== 'AbortError') {
                    console.error('Auth init error:', err);
                }
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchProfile(session.user);
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin,
            },
        });
        if (error) console.error('Google sign-in error:', error);
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    const value = {
        user,
        profile,
        loading,
        signInWithGoogle,
        signOut,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

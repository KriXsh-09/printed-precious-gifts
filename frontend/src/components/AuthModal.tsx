import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { supabase, isPlaceholderClient } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'register';
  onAuthSuccess: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'signin',
  onAuthSuccess,
}) => {
  const [tab, setTab] = useState<'signin' | 'register'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      if (tab === 'register') {
        if (isPlaceholderClient) {
          // Mock SignUp Simulation
          console.log('[Auth Mock] SignUp request with:', email);
          setTimeout(() => {
            setSuccessMsg('Perfect! A verification link has been sent to your email. Please check your inbox.');
            setLoading(false);
          }, 1000);
          return;
        }

        // Live Supabase SignUp with Email Confirmation
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          }
        });

        if (error) throw error;

        // If signUp returns a user but user.identities is empty, it means user already exists
        if (data.user && data.user.identities && data.user.identities.length === 0) {
          setErrorMsg('An account with this email already exists.');
        } else {
          setSuccessMsg('Registration successful! Please check your email to confirm your account before logging in.');
        }
      } else {
        if (isPlaceholderClient) {
          // Mock SignIn Simulation
          console.log('[Auth Mock] SignIn request with:', email);
          setTimeout(() => {
            const mockUser = {
              id: 'mock-uuid-1234',
              email: email,
              user_metadata: {},
            };
            onAuthSuccess(mockUser);
            setSuccessMsg('Successfully signed in!');
            setTimeout(() => {
              onClose();
            }, 1200);
            setLoading(false);
          }, 800);
          return;
        }

        // Live Supabase SignIn
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          onAuthSuccess(data.user);
          setSuccessMsg('Successfully signed in!');
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || 'An error occurred during authentication');
    } finally {
      if (!isPlaceholderClient) {
        setLoading(false);
      }
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose} aria-label="Close modal">
          <Icons.X size={20} />
        </button>

        <div className="auth-tabs">
          <button
            className={`auth-tab-btn ${tab === 'signin' ? 'active' : ''}`}
            onClick={() => {
              setTab('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            Sign In
          </button>
          <button
            className={`auth-tab-btn ${tab === 'register' ? 'active' : ''}`}
            onClick={() => {
              setTab('register');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            Register
          </button>
        </div>

        <h3 className="auth-title">
          {tab === 'signin' ? 'Welcome Back' : 'Create an Account'}
        </h3>
        <p className="auth-subtitle">
          {tab === 'signin'
            ? 'Sign in to access your customized orders and cart'
            : 'Join Giftworld to customize statues and track your gifts'}
        </p>



        {errorMsg && (
          <div className="auth-message error">
            <Icons.AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-message success">
            <Icons.CheckCircle size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleAuth} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Icons.Mail className="input-icon" size={16} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Icons.Lock className="input-icon" size={16} />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner">Processing...</span>
            ) : tab === 'signin' ? (
              'Sign In'
            ) : (
              'Register & Confirm Email'
            )}
          </button>
        </form>

        <p className="auth-toggle-hint">
          {tab === 'signin' ? (
            <>
              Don't have an account?{' '}
              <button className="text-link" onClick={() => setTab('register')}>
                Register here
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="text-link" onClick={() => setTab('signin')}>
                Sign in here
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'Incident Lead' | 'SRE' | 'Backend Engineer' | 'DevOps Engineer' | 'Support' | 'Product Manager' | 'Observer';
  createdAt: string;
  provider: 'google' | 'password' | 'otp';
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  googleClientId: string | undefined;
  signInWithGoogle: (emailHint?: string, nameHint?: string) => Promise<UserProfile>;
  sendEmailOtp: (email: string) => Promise<{ success: boolean; simulatedOtp: string }>;
  verifyOtpAndCreateAccount: (email: string, otp: string, password: string, displayName: string, role: UserProfile['role']) => Promise<UserProfile>;
  verifyOtpAndLogin: (email: string, otp: string) => Promise<UserProfile>;
  signUpWithEmail: (email: string, password: string, displayName: string, role: UserProfile['role']) => Promise<UserProfile>;
  signInWithEmail: (email: string, password: string) => Promise<UserProfile>;
  signOut: () => void;
  updateUserRole: (role: UserProfile['role']) => void;
}

const STORAGE_KEY = 'echoaid_incident_officer_session';
const ACCOUNTS_DB_KEY = 'echoaid_registered_accounts';
const OTP_STORE_KEY = 'echoaid_active_otps';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;

  // Initialize session from persistent local storage
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(STORAGE_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession) as UserProfile;
        setUser(parsed);
      }
    } catch (e) {
      console.warn('Failed to load saved session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save session helper
  const saveSession = (profile: UserProfile) => {
    setUser(profile);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  };

  // Google 1-Click Sign-In
  const signInWithGoogle = async (emailHint?: string, nameHint?: string): Promise<UserProfile> => {
    const email = emailHint || 'aryan.sharma.dev@gmail.com';
    const displayName = nameHint || 'Aryan Sharma';
    
    const profile: UserProfile = {
      uid: 'google-' + Math.random().toString(36).substring(2, 9),
      displayName,
      email,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}`,
      role: 'Incident Lead',
      createdAt: new Date().toISOString(),
      provider: 'google',
    };

    saveSession(profile);
    return profile;
  };

  // Send 6-Digit Email OTP
  const sendEmailOtp = async (email: string): Promise<{ success: boolean; simulatedOtp: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      throw new Error('Please enter a valid email address.');
    }

    // Generate 6-digit random verification code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      const otps = JSON.parse(localStorage.getItem(OTP_STORE_KEY) || '{}');
      otps[cleanEmail] = {
        code: otp,
        timestamp: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes validity
      };
      localStorage.setItem(OTP_STORE_KEY, JSON.stringify(otps));
    } catch (err) {
      console.warn('Failed saving OTP to store:', err);
    }

    console.log(`[AUTH] 📧 Verification OTP for ${cleanEmail}: ${otp}`);
    return { success: true, simulatedOtp: otp };
  };

  // Verify OTP and Create Account with Master Password
  const verifyOtpAndCreateAccount = async (
    email: string,
    otp: string,
    password: string,
    displayName: string,
    role: UserProfile['role']
  ): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    // Check OTP
    const otps = JSON.parse(localStorage.getItem(OTP_STORE_KEY) || '{}');
    const record = otps[cleanEmail];

    if (!record || record.code !== cleanOtp) {
      // Allow fallback code 123456 or 777777 for frictionless demo testing if needed
      if (cleanOtp !== '123456' && cleanOtp !== '777777' && cleanOtp !== record?.code) {
        throw new Error('Invalid 6-digit verification code. Please check and try again.');
      }
    }

    const profile: UserProfile = {
      uid: 'usr-' + Math.random().toString(36).substring(2, 9),
      displayName: displayName || cleanEmail.split('@')[0],
      email: cleanEmail,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName || cleanEmail)}`,
      role: role || 'Incident Lead',
      createdAt: new Date().toISOString(),
      provider: 'otp',
    };

    // Save to local accounts registry with password
    try {
      const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_DB_KEY) || '{}');
      accounts[cleanEmail] = { profile, password };
      localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(accounts));
    } catch (err) {
      console.warn('Failed to save account DB:', err);
    }

    saveSession(profile);
    return profile;
  };

  // Verify OTP and direct login
  const verifyOtpAndLogin = async (email: string, otp: string): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.trim();

    const otps = JSON.parse(localStorage.getItem(OTP_STORE_KEY) || '{}');
    const record = otps[cleanEmail];

    if (!record || record.code !== cleanOtp) {
      if (cleanOtp !== '123456' && cleanOtp !== '777777' && cleanOtp !== record?.code) {
        throw new Error('Invalid 6-digit verification code.');
      }
    }

    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_DB_KEY) || '{}');
    const existing = accounts[cleanEmail];

    const profile: UserProfile = existing?.profile || {
      uid: 'usr-' + Math.random().toString(36).substring(2, 9),
      displayName: cleanEmail.split('@')[0],
      email: cleanEmail,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanEmail)}`,
      role: 'Incident Lead',
      createdAt: new Date().toISOString(),
      provider: 'otp',
    };

    saveSession(profile);
    return profile;
  };

  // Email + Password Sign-Up
  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    role: UserProfile['role']
  ): Promise<UserProfile> => {
    if (!email || !password) throw new Error('Email and password required');

    const cleanEmail = email.trim().toLowerCase();
    const profile: UserProfile = {
      uid: 'usr-' + Math.random().toString(36).substring(2, 9),
      displayName: displayName || cleanEmail.split('@')[0],
      email: cleanEmail,
      photoURL: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName || cleanEmail)}`,
      role: role || 'SRE',
      createdAt: new Date().toISOString(),
      provider: 'password',
    };

    try {
      const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_DB_KEY) || '{}');
      accounts[cleanEmail] = { profile, password };
      localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(accounts));
    } catch (err) {
      console.warn('Failed to save account DB:', err);
    }

    saveSession(profile);
    return profile;
  };

  // Email + Password Sign-In
  const signInWithEmail = async (email: string, password: string): Promise<UserProfile> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_DB_KEY) || '{}');
      const account = accounts[cleanEmail];
      if (account && account.password === password) {
        saveSession(account.profile);
        return account.profile;
      }
    } catch (e) {
      console.warn('Sign-in error:', e);
    }

    return signUpWithEmail(cleanEmail, password, cleanEmail.split('@')[0], 'SRE');
  };

  // Sign out
  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Update role
  const updateUserRole = (role: UserProfile['role']) => {
    if (!user) return;
    const updated = { ...user, role };
    saveSession(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        googleClientId,
        signInWithGoogle,
        sendEmailOtp,
        verifyOtpAndCreateAccount,
        verifyOtpAndLogin,
        signUpWithEmail,
        signInWithEmail,
        signOut,
        updateUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

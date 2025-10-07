import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Auth: React.FC = () => {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (isRegister) {
      const ok = await register(username.trim(), password);
      setMessage(ok ? 'Registered and logged in.' : 'Registration failed (maybe username exists or admin is reserved)');
    } else {
      const ok = await login(username.trim(), password);
      setMessage(ok ? 'Logged in.' : 'Login failed.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-hud-bg-secondary p-6 rounded-md">
      <h2 className="text-lg font-bold mb-4">{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm">Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} className="w-full px-3 py-2 rounded-md bg-hud-bg border border-hud-border" />
        </div>
        <div>
          <label className="block text-sm">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 rounded-md bg-hud-bg border border-hud-border" />
        </div>
        <div className="flex items-center justify-between">
          <button type="submit" className="bg-hud-accent text-white px-4 py-2 rounded-md">{isRegister ? 'Register' : 'Login'}</button>
          <button type="button" onClick={() => setIsRegister(prev => !prev)} className="text-sm underline">{isRegister ? 'Switch to Login' : 'Switch to Register'}</button>
        </div>
        {message && <p className="text-sm mt-2">{message}</p>}
      </form>
      <p className="text-xs mt-4">Default admin: <strong>admin</strong> / <strong>0968885430</strong></p>
    </div>
  );
};

export default Auth;

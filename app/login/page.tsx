'use client';
import { useState } from 'react';
import Link from 'next/link';
import supabase from '../Supabase';
import { useRouter } from 'next/navigation';
import BackGroundComponent from '../components/BackGroundComponent';
import ThemeChanger from '../components/ThemeChanger';
import { useTheme } from 'next-themes';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleLogin = async () => {
    try {
      router.push('/');
      const { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error('Error logging in:', error);
      } else {
        // setAuthenticated(true); // Set authenticated to true
        // checkUser(); // Check the logged in user
        router.push('/');
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  return (
    <BackGroundComponent>
      <title>BIMVet Login</title>
      <div
        className={`min-h-screen flex items-center justify-center ${
          theme === 'dark' ? 'dark-theme' : 'light-theme'
        }`}
      >
        <div className="absolute top-10 right-10">
          <ThemeChanger></ThemeChanger>
        </div>
        <div
          className={`w-full max-w-md p-8 rounded-md shadow-md ${
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          <h1
            className={`text-4xl font-bold ${
              theme === 'dark' ? 'text-white' : 'text-gray-700'
            } mb-6`}
          >
            BIMVet
          </h1>
          <h2
            className={`text-2xl font-medium ${
              theme === 'dark' ? 'text-white' : 'text-gray-600'
            } mb-4`}
          >
            Login
          </h2>
          <form>
            <div className="mb-4">
              <label
                htmlFor="email"
                className={`block ${
                  theme === 'dark' ? 'text-white' : 'text-gray-700'
                }`}
              >
                Email:
              </label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 mt-2 ${
                  theme === 'dark' ? 'text-gray-700' : 'text-gray-700'
                } bg-white border border-gray-300 rounded-md focus:outline-none`}
              />
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className={`block ${
                  theme === 'dark' ? 'text-white' : 'text-gray-700'
                }`}
              >
                Password:
              </label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 mt-2 ${
                  theme === 'dark' ? 'text-gray-700' : 'text-gray-700'
                } bg-white border border-gray-300 rounded-md focus:outline-none`}
              />
            </div>
            <button
              type="button"
              onClick={handleLogin}
              className={`w-full px-4 py-2 mt-4 text-white ${
                theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
              } rounded-md focus:outline-none hover:${
                theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
              } transition-all duration-300`}
            >
              Login
            </button>
          </form>
          <p
            className={`mt-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Don't have an account?{' '}
            <Link
              href="/register"
              className={`${
                theme === 'dark'
                  ? 'text-blue-600 hover:text-blue-400 underline'
                  : 'text-blue-600 hover:text-blue-400 underline'
              } transition-all duration-300`}
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </BackGroundComponent>
  );
}

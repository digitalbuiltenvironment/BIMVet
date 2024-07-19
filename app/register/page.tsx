'use client';
import supabase from '../Supabase';
import Swal from 'sweetalert2';
import Link from 'next/link';
import React, { useState, useEffect, ChangeEvent } from 'react';
import BackGroundComponent from '../components/BackGroundComponent';
import ThemeChanger from '../components/ThemeChanger';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordConfirm, setPasswordConfirm] = useState<string>('');
  const [passwordFormatValid, setPasswordFormatValid] =
    useState<boolean>(false);
  // const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newPassword: string = e.target.value;
    setPassword(newPassword);

    // Perform your password format validation here
    const isValid: boolean = validatePasswordFormat(newPassword);
    console.log(isValid);
    setPasswordFormatValid(isValid);
  };
  const validatePasswordFormat = (password: string): boolean => {
    const minLength = 8;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const digitRegex = /\d/;
    const symbolRegex = /[@$!%*?&]/;

    return (
      password.length >= minLength &&
      uppercaseRegex.test(password) &&
      lowercaseRegex.test(password) &&
      digitRegex.test(password) &&
      symbolRegex.test(password)
    );
  };

  async function checkAuth() {
    // Implement your authentication logic here to determine if the user is authenticated
    const currentUser = await supabase.auth.getUser();
    console.log(currentUser);
    // if (currentUser.error) {
    //   setAuthenticated(false);
    // } else {
    //   setUserID(currentUser.data.user.id);
    //   setAuthenticated(true);
    // }
  }

  useEffect(() => {
    checkAuth();
  });

  useEffect(() => {
    if (password !== passwordConfirm && passwordConfirm !== '') {
      document.querySelector('.password-error').innerHTML =
        'Passwords do not match!';
    } else {
      document.querySelector('.password-error').innerHTML = '';
    }
  }, [password, passwordConfirm]);

  const handleRegister = async () => {
    if (password === passwordConfirm) {
      try {
        const { user, error } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (error) {
          // Use Swal to display an error message
          Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: error.message,
          });
        } else {
          // Use Swal to display a success message with email verification instructions
          Swal.fire({
            icon: 'success',
            title: 'Registration Successful',
            html: `Registered as ${email}.<br>Please check your email for a verification link.`,
          }).then(() => {
            console.log('Registered as:', user);
            // router.push('/dashboard');
          });
        }
      } catch (error) {
        console.error('Error registering:', error);
      }
    }
  };

  return (
    <BackGroundComponent>
      <title>BIMVet Register</title>
      <div
        className={`min-h-screen flex flex-col justify-center items-center ${
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
            Register
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
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full px-4 py-2 mt-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-700'
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
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                className={`block w-full px-4 py-2 mt-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-700'
                } bg-white border border-gray-300 rounded-md focus:outline-none`}
              />
              {password !== '' && (
                <p
                  className={`text-xs mt-1 ${
                    passwordFormatValid ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {
                    'Password must contain at least 8 characters, lowercase and uppercase letters, digits, and symbols.'
                  }
                </p>
              )}
            </div>
            <div className="mb-4">
              <label
                htmlFor="password"
                className={`block ${
                  theme === 'dark' ? 'text-white' : 'text-gray-700'
                }`}
              >
                Password Confirmation:
              </label>
              <input
                type="password"
                placeholder="Confirm Password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                className={`block w-full px-4 py-2 mt-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-700'
                } bg-white border border-gray-300 rounded-md focus:outline-none`}
              />
              <div className="password-error text-red-500 text-xs m-0"></div>
            </div>
          </form>
          <button
            onClick={handleRegister}
            className={`w-full px-4 py-2 mt-4 text-white ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-blue-500'
            } rounded-md focus:outline-none hover:${
              theme === 'dark' ? 'bg-blue-500' : 'bg-blue-400'
            } transition-all duration-300`}
          >
            Register
          </button>
          <p
            className={`mt-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-600'
            }`}
          >
            Have an Account?{' '}
            <Link
              href="/login"
              className={`${
                theme === 'dark'
                  ? 'text-blue-600 hover:text-blue-400 underline'
                  : 'text-blue-600 hover:text-blue-400 underline'
              } transition-all duration-300`}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </BackGroundComponent>
  );
}

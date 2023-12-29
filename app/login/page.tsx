"use client";
import { useState } from "react";
import Link from "next/link";
import supabase from "../Supabase";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        console.error("Error logging in:", error);
      } else {
        // setAuthenticated(true); // Set authenticated to true
        // checkUser(); // Check the logged in user
        // navigate("/"); // Redirect to the main page
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-md shadow-md">
        <h1 className="text-4xl font-bold text-gray-700 mb-6">BIMVet</h1>
        <h2 className="text-2xl font-medium text-gray-600 mb-4">Login</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">
              Email:
            </label>
            <input
              type="email"
              id="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Password:
            </label>
            <input
              type="password"
              id="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleLogin}
            className="w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded-md focus:outline-none hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-gray-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

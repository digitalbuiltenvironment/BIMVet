"use client";
import supabase from "../Supabase";
import Swal from "sweetalert2";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (password !== passwordConfirm) {
      document.querySelector(".password-error").innerHTML =
        "Passwords do not match!";
    } else {
      document.querySelector(".password-error").innerHTML = "";
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
            icon: "error",
            title: "Registration Failed",
            text: error.message,
          });
        } else {
          // Use Swal to display a success message with email verification instructions
          Swal.fire({
            icon: "success",
            title: "Registration Successful",
            html: `Registered as ${email}.<br>Please check your email for a verification link.`,
          }).then(() => {
            router.push("/dashboard");
          });
        }
      } catch (error) {
        console.error("Error registering:", error);
      }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col justify-center items-center">
      <div className="w-full max-w-md p-8 bg-white rounded-md shadow-md">
        <h1 className="text-4xl font-bold text-gray-700 mb-6">BIMVet</h1>
        <h2 className="text-2xl font-medium text-gray-600 mb-4">Register</h2>
        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">
              Email:
            </label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Password:
            </label>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Password Confirmation:
            </label>
            <input
              type="password"
              placeholder="Confirm Password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="block w-full px-4 py-2 mt-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:outline-none"
            />
            <div className="password-error text-red-500 text-xs m-0"></div>
          </div>
          <button
            onClick={handleRegister}
            className="w-full px-4 py-2 mt-4 text-white bg-blue-600 rounded-md focus:outline-none hover:bg-blue-500 transition-all duration-300"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-gray-600">
          Have an Account?{" "}
          <Link
            href="/login"
            className="text-blue-600 hover:text-blue-400 underline transition-all duration-300"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

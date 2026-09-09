"use client";

import { useActionState } from "react";
import { signInAction, type AuthActionState } from "@/lib/auth/actions";

const initialState: AuthActionState = { error: null };

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="sw-admin-form">
      {state.error ? (
        <p className="sw-admin-error" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="sw-admin-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="admin@swiftwavegroup.com"
        />
      </div>

      <div className="sw-admin-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
        />
      </div>

      <button
        className="sw-admin-btn sw-admin-btn-block"
        type="submit"
        disabled={pending}
      >
        {pending ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

'use client';

import React, { useActionState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { login } from './actions';

const initialState = {
  error: '',
}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-blue-500 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <img src="/logo.png" alt="Rise & Shine ABA Logo" className="mx-auto w-24 h-24 object-contain mb-4 drop-shadow-2xl" />
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Rise & Shine CRM</h1>
          <p className="text-slate-400">Sign in to your enterprise account</p>
        </div>
        
        <Card className="glass-dark border-none">
          <CardHeader>
            <CardTitle className="text-white">Welcome back</CardTitle>
            <CardDescription className="text-slate-400">Enter your credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Email Address</label>
                <Input name="email" type="email" placeholder="you@riseandshineaba.com" className="text-white" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Input name="password" type="password" placeholder="••••••••" className="text-white" required />
              </div>
              
              {state?.error && (
                <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-md border border-red-500/20">
                  {state.error}
                </div>
              )}
              
              <Button className="w-full mt-4" size="lg" type="submit" isLoading={isPending}>
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

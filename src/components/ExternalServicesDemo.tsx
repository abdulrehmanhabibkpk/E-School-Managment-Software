import React from 'react';
import { getSupabase } from '../lib/supabaseClient';
import { useQuery, gql } from '@apollo/client';
import { Database, Shield, Lock, Phone, Mail, Award, Activity } from 'lucide-react';
import { motion } from 'motion/react';

// Apollo Query Example provided by user
const GET_DOGS = gql`
  query GetDogs {
    dogs {
      id
      breed
      owner {
        id
        name
      }
    }
  }
`;

export default function ExternalServicesDemo() {
  // Demo functions based on user snippets
  const handleSignUp = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    let { data, error } = await supabase.auth.signUp({
      email: 'someone@email.com',
      password: 'DMCRETzKljUeHixVWwdY'
    });
    console.log('SignUp:', { data, error });
  };

  const handleSignIn = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    let { data, error } = await supabase.auth.signInWithPassword({
      email: 'someone@email.com',
      password: 'DMCRETzKljUeHixVWwdY'
    });
    console.log('SignIn:', { data, error });
  };

  const handleOTP = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    let { data, error } = await supabase.auth.signInWithOtp({
      email: 'someone@email.com'
    });
    console.log('OTP:', { data, error });
  };

  const handlePhoneSignUp = async () => {
    const supabase = getSupabase();
    if (!supabase) return;
    let { data, error } = await supabase.auth.signUp({
      phone: '+13334445555',
      password: 'some-password'
    });
    console.log('Phone SignUp:', { data, error });
  };

  // Apollo Hook Example
  // Note: This will likely fail until a real GraphQL endpoint is provided in apolloClient.ts
  const { loading, error, data } = useQuery(GET_DOGS, {
    skip: true // Skipping execution to prevent crashes with placeholder URI
  });

  return (
    <div className="p-8 bg-white rounded-[32px] border border-slate-200 shadow-sm space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-600" />
          External Services Integration
        </h2>
        <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
          Supabase & Apollo
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supabase Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Shield className="w-4 h-4" /> Supabase Authentication
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={handleSignUp}
              className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all group"
            >
              <Mail className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
              <div className="text-left">
                <div className="text-sm font-bold text-slate-700">Email Sign Up</div>
                <div className="text-[10px] text-slate-400 font-bold">Register with Email/Password</div>
              </div>
            </button>

            <button 
              onClick={handleSignIn}
              className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all group"
            >
              <Lock className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
              <div className="text-left">
                <div className="text-sm font-bold text-slate-700">Email Sign In</div>
                <div className="text-[10px] text-slate-400 font-bold">Log in with Credentials</div>
              </div>
            </button>

            <button 
              onClick={handleOTP}
              className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all group"
            >
              <Activity className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
              <div className="text-left">
                <div className="text-sm font-bold text-slate-700">Magic Link (OTP)</div>
                <div className="text-[10px] text-slate-400 font-bold">Sign in with One-Time Password</div>
              </div>
            </button>

            <button 
              onClick={handlePhoneSignUp}
              className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100 transition-all group"
            >
              <Phone className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
              <div className="text-left">
                <div className="text-sm font-bold text-slate-700">Phone Sign Up</div>
                <div className="text-[10px] text-slate-400 font-bold">Register with Mobile Number</div>
              </div>
            </button>
          </div>
        </div>

        {/* Apollo Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Award className="w-4 h-4" /> Apollo Client (GraphQL)
          </h3>
          <div className="p-6 bg-slate-50 border border-slate-100 rounded-[24px] h-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Query State</span>
                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-black uppercase">Placeholder</span>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 overflow-hidden">
                <pre className="text-[10px] text-blue-400 font-mono leading-relaxed">
{`query GetDogs {
  dogs {
    id
    breed
    owner {
      id
      name
    }
  }
}`}
                </pre>
              </div>

              <div className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                Note: Apollo Client is initialized in lib/apolloClient.ts. Update the URI to start fetching real data.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

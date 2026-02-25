import { ShoppingBag } from "lucide-react";
import React from "react";
import { SignInForm } from "./SignInForm";

export const LoginPage: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary/40 mx-auto mb-6">
                <ShoppingBag size={32} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">LaundryClean Pro</h1>
            <p className="text-slate-500 mt-3 font-medium">Elevate your cleaning business management.</p>
        </div>
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-slate-200/60 transition-all hover:shadow-2xl border border-slate-100">
            <SignInForm />
        </div>
    </div>
);

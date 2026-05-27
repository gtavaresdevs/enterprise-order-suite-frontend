import { Package } from 'lucide-react';
import { LoginForm } from '@/features/auth/components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 p-8">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-slate-700 rounded-xl flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Order Processing System</h1>
            <p className="text-sm text-slate-500 text-center">Access your order operations dashboard</p>
          </div>

          {/* Form Section */}
          <LoginForm />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-slate-400">
          <p className="text-[11px]">
            <a href="#" className="hover:text-slate-500">Privacy Policy</a>
            <span className="mx-2">•</span>
            <a href="#" className="hover:text-slate-500">Terms of Service</a>
          </p>
          <p className="text-[10px] mt-2">© 2026 Order Processing System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
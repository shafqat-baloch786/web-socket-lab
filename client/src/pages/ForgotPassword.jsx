import { Link } from 'react-router-dom';
import { Input } from '../components/Input';

const ForgotPassword = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Reset Password</h2>
                <p className="text-gray-600 mb-8">Enter your email and we'll send you a link to reset your password.</p>
                
                <Input label="Email Address" type="email" placeholder="email@example.com" />
                
                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    Send Reset Link
                </button>
                
                <div className="mt-6">
                    <Link to="/login" className="text-indigo-600 hover:underline text-sm">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
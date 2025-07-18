import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { BaseUrl } from '../utils/baseUrl';

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const endpoint = isLogin ? '/api/login' : '/api/createuser';

    try {
      const res = await fetch(`${BaseUrl + endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        login(data.authtoken);
        navigate('/');
        alert(`${isLogin ? 'Login' : 'Signup'} successful!`);
      } else {
        setError(data.message || `${isLogin ? 'Login' : 'Signup'} failed`);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg">
      {/* Toggle Tabs */}
      <div className="flex justify-center mb-6">
        <button
          className={`w-1/2 py-2 font-semibold border-b-2 ${isLogin ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
            }`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </button>
        <button
          className={`w-1/2 py-2 font-semibold border-b-2 ${!isLogin ? 'border-green-600 text-green-600' : 'border-transparent text-gray-500'
            }`}
          onClick={() => setIsLogin(false)}
        >
          Signup
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="John Doe"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="w-full p-3 border border-gray-300 rounded-md"
            placeholder="********"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-md text-white font-semibold flex justify-center items-center ${isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : isLogin
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? 'Login' : 'Signup'}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogo } from '../context/LogoContext';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaEnvelope, FaGoogle, FaFacebook } from 'react-icons/fa';
import '../assets/css/login-styles.css';

const Login = () => {
  const { websiteLogo } = useLogo();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      const response = await login(formData.email, formData.password);
      
      console.log('Login response:', response); // Debug log
      console.log('User role:', response.user?.role); // Debug log
      
      toast.success('Login successful!');
      
      // Role-based navigation
      if (response.user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed');
    }
  };

  const handleSocialLogin = (provider) => {
    toast.info(`${provider} login coming soon!`);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="logo-section">
          <img 
            src={websiteLogo} 
            alt="Kids Colours Logo" 
          />
          <h1 className="login-title">Welcome Back</h1>
          <p className="login-subtitle">
            Sign in to your Kids Colours account to continue shopping
          </p>
        </div>
        
        {/* Login Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <FaEnvelope className="icon" />
              Email Address
            </label>
            <div className="password-input-wrapper">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <FaLock className="icon" />
              Password
            </label>
            <div className="password-input-wrapper">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaEyeSlash />
                ) : (
                  <FaEye />
                )}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="form-options">
            <div className="checkbox-wrapper">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label htmlFor="remember-me"
              style={{marginTop: '9px'}}>
                Remember me
              </label>
            </div>

            <div>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Signing in...
                </>
              ) : (
                'Sign in to your account'
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        {/* <div className="form-divider">
          <span>Or continue with</span>
        </div> */}

        {/* Social Login */}
        {/* <div className="social-login">
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="social-btn google-btn"
          >
            <FaGoogle />
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('Facebook')}
            className="social-btn facebook-btn"
          >
            <FaFacebook />
            Facebook
          </button>
        </div> */}

        {/* Sign Up Link */}
        <div className="signup-link">
          Don't have an account?{' '}
          <Link to="/register">
            Create a free account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

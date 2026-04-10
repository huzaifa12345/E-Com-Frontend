import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogo } from '../context/LogoContext';
import toast from 'react-hot-toast';
import { FaEye, FaEyeSlash, FaUser, FaLock, FaEnvelope, FaGoogle, FaFacebook, FaCheck } from 'react-icons/fa';
import '../assets/css/register-styles.css';

const Register = () => {
  const { websiteLogo } = useLogo();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!agreeTerms) {
      toast.error('Please agree to the Terms and Conditions');
      return;
    }

    try {
      await register({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone
      });
      
      toast.success('Registration successful! Please login.');
      navigate('/login');
      
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleSocialRegister = (provider) => {
    toast.info(`${provider} registration coming soon!`);
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, color: 'bg-gray-200', text: 'Very Weak' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    const strengthMap = {
      1: { strength: 1, color: 'bg-red-200', text: 'Weak' },
      2: { strength: 2, color: 'bg-orange-200', text: 'Fair' },
      3: { strength: 3, color: 'bg-yellow-200', text: 'Good' },
      4: { strength: 4, color: 'bg-green-200', text: 'Strong' },
      5: { strength: 5, color: 'bg-green-500', text: 'Very Strong' }
    };

    return strengthMap[Math.min(strength, 5)] || { strength: 0, color: 'bg-gray-200', text: 'Very Weak' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getStrengthClass = (text) => {
    switch(text.toLowerCase()) {
      case 'very weak': return 'strength-very-weak';
      case 'weak': return 'strength-weak';
      case 'fair': return 'strength-fair';
      case 'good': return 'strength-good';
      case 'strong': return 'strength-strong';
      default: return 'strength-very-weak';
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Header */}
        <div className="logo-section">
          <img 
            src={websiteLogo} 
            alt="Kids Colours Logo" 
          />
          <h1 className="register-title">Create Your Account</h1>
          <p className="register-subtitle">
            Join Kids Colours today and enjoy exclusive offers, fast checkout, and personalized shopping experience
          </p>
        </div>
        
        {/* Registration Form */}
        <form className="register-form" onSubmit={handleSubmit}>
          {/* Name Fields */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                <FaUser className="icon" />
                First Name
              </label>
              <input
                id="firstName"
                name="first_name"
                type="text"
                required
                className="form-input"
                placeholder="Enter your first name"
                value={formData.first_name}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                id="lastName"
                name="last_name"
                type="text" 
                required
                className="form-input"
                placeholder="Enter your last name"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

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
                placeholder="Enter your email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Phone Field */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number (Optional)
            </label>
            <div className="password-input-wrapper">
              <input
                id="phone"
                name="phone"
                type="tel"
                className="form-input"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="form-row">
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
                  autoComplete="new-password"
                  required
                  className="form-input"
                  placeholder="Create a strong password (min 6 chars)"
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
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-header">
                    <span className="strength-label">Password Strength:</span>
                    <span className={`strength-badge ${getStrengthClass(passwordStrength.text)}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="strength-bar">
                    <div 
                      className="strength-fill"
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="form-input"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="terms-checkbox">
            <input
              id="agree-terms"
              name="agree-terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <label htmlFor="agree-terms">
              I agree to the{' '}
              <Link to="/terms">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link to="/privacy">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading || !agreeTerms}
              className="submit-btn"
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="form-divider">
          <span>Or register with</span>
        </div>

        {/* Social Registration */}
        <div className="social-login">
          <button
            type="button"
            onClick={() => handleSocialRegister('Google')}
            className="social-btn google-btn"
          >
            <FaGoogle />
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialRegister('Facebook')}
            className="social-btn facebook-btn"
          >
            <FaFacebook />
            Facebook
          </button>
        </div>

        {/* Sign In Link */}
        <div className="signin-link">
          Already have an account?{' '}
          <Link to="/login">
            Sign in here
          </Link>
        </div>

        {/* Benefits Section */}
        <div className="benefits-section">
          <h3 className="benefits-title">Why Join Kids Colours?</h3>
          <div className="benefits-grid">
            <div className="benefit-item">
              <div className="benefit-icon">
                <FaCheck />
              </div>
              <div className="benefit-text">
                <div className="benefit-title">Fast and Secure Checkout</div>
                <p className="benefit-description">Quick and secure payment process</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <FaCheck />
              </div>
              <div className="benefit-text">
                <div className="benefit-title">Track Your Orders</div>
                <p className="benefit-description">Monitor your order status in real-time</p>
              </div>
            </div>

            <div className="benefit-item">
              <div className="benefit-icon">
                <FaCheck />
              </div>
              <div className="benefit-text">
                <div className="benefit-title">Exclusive Offers</div>
                <p className="benefit-description">Get special discounts and promotions</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

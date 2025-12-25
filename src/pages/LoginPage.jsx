import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../services/authService";
import OtpVerificationModal from "../components/OtpVerificationModal.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (isSignup && !name)) {
      setError("Please fill all required fields");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      if (isSignup) {
        await register({ name, mail: email, password });
        setSuccess("Registration successful! Please verify the OTP sent to your email.");
        setOtpOpen(true);
      } else {
        // Login API call
        const response = await login({
          mail: email,
          password,
        });

        // Extract token and user from response
        const token = response.data.token;
        const userData = response.data.user;
        
        if (token && userData) {
          const user = {
            id: userData.id,
            name: userData.name,
            email: userData.email
          };
          
          authLogin(user, token);
          navigate('/'); // Redirect to dashboard
        } else {
          setError("Invalid response from server - missing token or user data");
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data || "An error occurred. Please try again.";
      
      // Handle specific error cases with better user guidance
      if (err.response?.status === 401) {
        if (errorMessage.toLowerCase().includes("email not verified")) {
          setError("Email not verified. Please check your email and verify the OTP, or sign up if you haven't registered yet.");
        } else if (errorMessage.toLowerCase().includes("invalid credentials")) {
          setError("Invalid email or password. Please check your credentials or sign up if you haven't registered yet.");
        } else {
          setError("Invalid email or password. Please check your credentials.");
        }
      } else if (err.response?.status === 404) {
        setError("User not found. Please sign up if you haven't registered yet.");
      } else if (err.response?.status === 400) {
        if (errorMessage.toLowerCase().includes("email already in use")) {
          setError("Email already registered. Please log in instead or use a different email.");
        } else {
          setError(errorMessage);
        }
      } else {
        setError(errorMessage);
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-teal-600">FinSight</div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setIsSignup(false);
                  setError("");
                  setSuccess("");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  !isSignup
                    ? "bg-teal-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => {
                  setIsSignup(true);
                  setError("");
                  setSuccess("");
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  isSignup
                    ? "bg-teal-600 text-white"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white py-8 px-8 shadow-lg rounded-lg">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 text-center">
                {isSignup ? "Sign up" : "Log in"}
              </h2>
            </div>

            {success && (
              <div className="mb-4 p-3 rounded-md text-sm bg-green-50 text-green-700 border border-green-200">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 rounded-md text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {isSignup && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Full name"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    loading ? "bg-teal-300 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500`}
                >
                  {loading ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                
              </div>
            </div>
          </div>

          {/* Footer text */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Track budgets and understand where your money is going with FinSight.
            </p>
          </div>
        </div>
      </div>
      <OtpVerificationModal
        isOpen={otpOpen}
        email={email}
        onVerified={() => {
          setOtpOpen(false);
          setIsSignup(false);
          setSuccess("Email verified successfully! Please log in.");
        }}
        onClose={() => setOtpOpen(false)}
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../Auth/AuthContext";
import {auth} from "../Auth/FirebaseSdk"
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { firestore } from "../Auth/FirebaseSdk";
const Login = () => {
  
  const navigate = useNavigate();
  const {role} = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

    useEffect(()=>{
      if (role === "admin") navigate("/admin");
        else if (role === "seller") navigate("/seller");
      else if (role === "buyer") navigate("/buyer");

    },[role] )
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user= userCredential.user;

      const userDoc= await getDoc(doc(firestore, "users", user.uid));
      const userData = userDoc.data();
      
      console.log("user role:", userData?.role);
      if (userData?.role=== "admin") navigate("/admin");
      else if (userData?.role==="seller") navigate("/seller");
      else if (userData?.role ==="buyer") navigate("/buyer")

    } catch (error: any){
      console.error("Login error:", error.message);
    }

    console.log("Logging in with:", { email, password });
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("google user:", user);
      navigate("/");

    } catch (error : any ) {
    console.error(" Google login error:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src="/Images/Bazarbuddy.png" alt="BazaarBuddy" className="h-30 w-30" />
        </div>

        <h2 className="text-2xl font-bold text-center text-teal-600 mb-6">
          Login to BazaarBuddy
        </h2>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition mb-6"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            alt="Google"
            className="h-5 w-5 mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Login with Google</span>
        </button>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm text-gray-600">
              <input type="checkbox" className="mr-2" />
              Remember me
            </label>
            <Link to="password-forgot" className="text-sm text-teal-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition"
          >
            Login
          </button>
        </form>

        {/* Signup Link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link to="/signup"  className="text-teal-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
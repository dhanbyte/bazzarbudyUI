import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../Auth/FirebaseSdk";
import {doc, setDoc} from "firebase/firestore";
import { db } from "../Auth/FirebaseSdk";

const Signup = () => {


const navigate = useNavigate()
  const [role, setRole] = useState<"buyer" | "seller">("buyer");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
       e.preventDefault(); 
       try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userData = {
          role,
          email,
          mobile,
          address:{ houseNo, area, city, state, pincode},
          createAt: new Date(),
        }
        await setDoc (doc(db, "users", user.uid), userData)
        console.log("user Signed up and saved", userData);
        if (role === "seller") navigate("/seller");
        else navigate("/buyer");
       }catch (error: any){
        console.log("signup error:", error.message)
       }
       
  //     createUserWithEmailAndPassword(auth, email, password).then((userCredential)=>{
  //   console.log('signed up:', userCredential.user)
  // })
  // .catch((error)=>{
  //   console.log("signup error:", error.message)
  // })
 
  

   
  //   const userData = {
  //     role,
  //     email,
  //     mobile,
  //     address: { houseNo, area, city, state, pincode },
  //     password,
  //   };
  //   console.log("Signing up with:", userData);
  //   // Add API call or Firebase logic here
   };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        {/* Logo */}
        <div className="flex justify-center mb-4">
          <img
            src="/Images/Bazarbuddy.png" // Replace with your actual logo path
            alt="BazaarBuddy Logo"
            className="h-30 w-30"
          />
        </div>

        {/* Heading */}
        <h2 className="text-2xl font-bold text-center text-teal-600 mb-6">
          Create Your BazaarBuddy Account
        </h2>

        {/* Role Selection */}
        <div className="flex justify-center mb-4 space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="buyer"
              checked={role === "buyer"}
              onChange={() => setRole("buyer")}
              className="accent-teal-600"
            />
            <span className="text-sm text-gray-700">Buyer</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              value="seller"
              checked={role === "seller"}
              onChange={() => setRole("seller")}
              className="accent-teal-600"
            />
            <span className="text-sm text-gray-700">Seller</span>
          </label>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
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

          {/* Mobile */}
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
              Mobile number
            </label>
            <input
              id="mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Address Fields */}
          <div>
            <label htmlFor="houseNo" className="block text-sm font-medium text-gray-700">
              Shop/House No.
            </label>
            <input
              id="houseNo"
              type="text"
              value={houseNo}
              onChange={(e) => setHouseNo(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="area" className="block text-sm font-medium text-gray-700">
              Area / Locality
            </label>
            <input
              id="area"
              type="text"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              id="state"
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
              Pincode
            </label>
            <input
              id="pincode"
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
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
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition"
          >
            Sign Up as {role === "buyer" ? "Buyer" : "Seller"}
          </button>
        </form>

        {/* Login Link */}
        <p  className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/login"  className="text-teal-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
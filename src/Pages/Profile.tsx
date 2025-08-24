import { useAuth } from "../Auth/AuthContext";
import { motion } from "framer-motion";

const Profile = () => {
  const { user, role } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg font-semibold text-red-500">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto p-6 mt-10 bg-white shadow-xl rounded-xl border border-gray-200"
    >
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">👤 Profile Overview</h2>

      <div className="space-y-3 text-gray-700 text-base">
        <p><span className="font-semibold">Name:</span> {user.displayName || user.email?.split("@")[0]}</p>
        <p><span className="font-semibold">Email:</span> {user.email}</p>
        <p><span className="font-semibold">Last Login:</span> {user.metadata?.lastSignInTime}</p>
      </div>

      {/* Role-specific sections */}
      {role === "admin" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200"
        >
          <h3 className="text-xl font-semibold text-blue-700 mb-4">🛠 Admin Controls</h3>
          <div className="flex flex-col gap-3">
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">Manage Users & Roles</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">View Platform Analytics</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">System Settings</button>
          </div>
        </motion.div>
      )}

      {role === "seller" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200"
        >
          <h3 className="text-xl font-semibold text-green-700 mb-4">🛍 Seller Dashboard</h3>
          <div className="flex flex-col gap-3">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Upload & Manage Products</button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Track Orders & Earnings</button>
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">Customer Feedback</button>
          </div>
        </motion.div>
      )}

      {role === "buyer" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-6 bg-yellow-50 rounded-xl border border-yellow-200"
        >
          <h3 className="text-xl font-semibold text-yellow-700 mb-4">🛒 Buyer Info</h3>
          <div className="flex flex-col gap-3">
            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">View Your Orders</button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">Manage Wishlist</button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition">Update Shipping Address</button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Profile;
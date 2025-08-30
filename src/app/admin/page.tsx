'use client'
import { useState, useEffect, useMemo } from 'react'
import { IndianRupee, ShoppingCart, Users, Package, TrendingUp, Eye, AlertTriangle, UserPlus } from 'lucide-react'
import { useProductStore } from '@/lib/productStore'
import { useOrders } from '@/lib/ordersStore'
import AdminNav from '@/components/AdminNav'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { adminApi, User } from '@/lib/adminApi';

const STORAGE_KEY = 'shopweve_admin_auth'

const StatCard = ({ icon: Icon, title, value, color, href }: { icon: React.ElementType, title: string, value: string | number, color: string, href?: string }) => {
    const cardContent = (
        <div className="card p-4 flex items-center gap-4 transition-transform transform hover:scale-105">
            <div className={`rounded-full p-3 ${color}`}>
                <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
                <div className="text-gray-500 text-sm">{title}</div>
                <div className="text-2xl font-bold">{value}</div>
            </div>
        </div>
    )
    
    if (href) {
        return <Link href={href}>{cardContent}</Link>
    }

    return <div>{cardContent}</div>
}

export default function AdminPage() {
    const { orders } = useOrders()
    const { products } = useProductStore()
    const [isClient, setIsClient] = useState(false)
    const [newUsers, setNewUsers] = useState<User[]>([]);
    const [adminStats, setAdminStats] = useState({
        totalUsers: 0,
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0
    });
    const [loadingUsers, setLoadingUsers] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Check admin authentication
        const isAuthenticated = localStorage.getItem(STORAGE_KEY) === 'true'
        if (!isAuthenticated) {
            router.push('/admin/login')
            return
        }

        setIsClient(true)

        const fetchData = async () => {
            setLoadingUsers(true)
            try {
                // Fetch new users
                const usersResult = await adminApi.getNewUsers()
                if (usersResult.success && usersResult.data) {
                    setNewUsers(usersResult.data)
                }

                // Fetch admin stats
                const statsResult = await adminApi.getStats()
                if (statsResult.success && statsResult.data) {
                    setAdminStats(statsResult.data)
                }
            } catch (error) {
                console.error('Failed to fetch admin data:', error)
            } finally {
                setLoadingUsers(false)
            }
        }
        
        fetchData()
    }, [router])

    const stats = useMemo(() => {
        if (!isClient) return { totalRevenue: 0, totalSales: 0, totalCustomers: 0 }
        
        const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0)
        const totalSales = orders.length
        const customerIds = new Set(orders.map(o => o.address.phone))
        const totalCustomers = customerIds.size

        return { totalRevenue, totalSales, totalCustomers }
    }, [orders, isClient])

    if (!isClient) {
        return (
            <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard href="/admin/orders" icon={IndianRupee} title="Total Revenue" value={`₹${(adminStats.totalRevenue || stats.totalRevenue).toLocaleString('en-IN')}`} color="bg-green-500" />
                <StatCard href="/admin/orders" icon={ShoppingCart} title="Total Sales" value={adminStats.totalOrders || stats.totalSales} color="bg-blue-500" />
                <StatCard href="/admin/products" icon={Package} title="Total Products" value={adminStats.totalProducts || products.length} color="bg-orange-500" />
                <StatCard href="/admin/customers" icon={Users} title="Total Customers" value={adminStats.totalUsers || stats.totalCustomers} color="bg-purple-500" />
            </div>

            <div className="card p-4">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                <div className="flex flex-wrap gap-4">
                     <Link href="/admin/products#add" className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90">
                        Add New Product
                    </Link>
                    <Link href="/admin/orders" className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50">
                        View All Orders
                    </Link>
                    <Link href="/admin/customers" className="rounded-xl border bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50">
                        Manage Customers
                    </Link>
                </div>
            </div>
            
            {/* New Users Section */}
            <div className="card p-4">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-green-500" />
                        New Customer Logins
                    </h2>
                    {loadingUsers && <div className="animate-spin h-5 w-5 border-2 border-brand border-t-transparent rounded-full"></div>}
                </div>
                
                {newUsers.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Login Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {newUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{user.name}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{user.phoneNumber}</td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString('en-IN') : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-4 text-gray-500">
                        {loadingUsers ? 'Loading new users...' : 'No new customer logins in the last 24 hours'}
                    </div>
                )}
            </div>
        </div>
    )
}

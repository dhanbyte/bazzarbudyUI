'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/adminApi'
import { useToast } from '@/hooks/use-toast'
import { Copy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { StatusDropdown } from '../components/StatusDropdown'

interface OrderDetailsProps {
  params: {
    orderId: string
  }
}

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface Address {
  fullName: string
  phone: string
  email?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  landmark?: string
}

interface OrderDetails {
  _id: string
  orderId: string
  items: OrderItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  orderDate: string
  address: Address
  paymentMethod: string
  paymentId?: string
  user?: {
    name: string
    phoneNumber: string
    email?: string
  }
}

export default function OrderDetailsPage({ params }: OrderDetailsProps) {
  const { orderId } = params
  const [order, setOrder] = useState<OrderDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true)
      try {
        const response = await adminApi.getOrderDetails(orderId)
        if (response.success && response.order) {
          setOrder(response.order)
        } else {
          throw new Error(response.message || 'Failed to fetch order details')
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Could not load order details: ${errorMessage}`
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId, toast])

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return

    const originalStatus = order.status
    // Optimistic update
    setOrder({ ...order, status: newStatus as any })

    const result = await adminApi.updateOrderStatus(orderId, newStatus)

    if (result.success) {
      toast({
        title: 'Status updated',
        description: `Order status changed to ${newStatus}`
      })
    } else {
      // Revert on failure
      setOrder({ ...order, status: originalStatus })
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: result.message || 'Failed to update status'
      })
    }
  }

  const handleCopyAddress = () => {
    if (!order?.address) return

    const address = order.address
    const addressText = [
      address.fullName,
      address.phone,
      address.addressLine1,
      address.addressLine2,
      `${address.city}, ${address.state} - ${address.pincode}`,
      address.landmark ? `Landmark: ${address.landmark}` : ''
    ].filter(Boolean).join('\n')

    navigator.clipboard.writeText(addressText)
    toast({
      title: 'Address copied',
      description: 'Shipping address copied to clipboard'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
        <p className="text-gray-600 mb-6">{error || 'The requested order could not be found'}</p>
        <Link href="/admin/orders">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/orders">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Order #{orderId}</h1>
          <Badge className={getStatusColor(order.status)}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
        <StatusDropdown 
          currentStatus={order.status} 
          onStatusChange={handleStatusChange} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex items-center gap-4 pb-4 border-b last:border-0">
                  {item.image ? (
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      width={64} 
                      height={64} 
                      className="rounded-md object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                  <div className="flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{item.price.toLocaleString('en-IN')}</p>
                    <p className="text-sm text-gray-500">Total: ₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="font-medium">Payment Method</span>
                <span>{order.paymentMethod}</span>
              </div>
              {order.paymentId && (
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">Payment ID</span>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{order.paymentId}</span>
                </div>
              )}
              <Separator className="my-4" />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total Amount</span>
                <span>₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Customer Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><span className="font-medium">Name:</span> {order.address.fullName}</p>
                <p><span className="font-medium">Phone:</span> {order.address.phone}</p>
                {order.user?.email && (
                  <p><span className="font-medium">Email:</span> {order.user.email}</p>
                )}
                <p>
                  <span className="font-medium">Order Date:</span> {' '}
                  {new Date(order.orderDate).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Shipping Address</CardTitle>
                <Button variant="outline" size="sm" onClick={handleCopyAddress}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.address.fullName}</p>
                <p>{order.address.phone}</p>
                <p>{order.address.addressLine1}</p>
                {order.address.addressLine2 && <p>{order.address.addressLine2}</p>}
                <p>
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                </p>
                {order.address.landmark && (
                  <p className="text-sm text-gray-500">Landmark: {order.address.landmark}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
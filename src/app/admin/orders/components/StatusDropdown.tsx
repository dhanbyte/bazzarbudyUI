'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminOrder } from '@/lib/adminApi'

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

interface StatusDropdownProps {
  order: AdminOrder
  onStatusChange: (orderId: string, status: OrderStatus) => void
}

export function StatusDropdown({ order, onStatusChange }: StatusDropdownProps) {
  const [open, setOpen] = useState(false)

  const statuses: { value: OrderStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
    { value: 'shipped', label: 'Shipped', color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  ]

  const currentStatus = order.status as OrderStatus
  const currentStatusObj = statuses.find(s => s.value === currentStatus) || statuses[0]

  const handleSelect = (status: OrderStatus) => {
    if (status !== currentStatus) {
      onStatusChange(order.orderId, status)
    }
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(currentStatus)}`} />
          {currentStatusObj.label}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status.value}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => handleSelect(status.value)}
          >
            <div className="flex items-center gap-2">
              <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(status.value)}`} />
              {status.label}
            </div>
            {currentStatus === status.value && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-500'
    case 'processing': return 'bg-blue-500'
    case 'shipped': return 'bg-purple-500'
    case 'delivered': return 'bg-green-500'
    case 'cancelled': return 'bg-red-500'
    default: return 'bg-gray-500'
  }
}
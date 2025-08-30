
'use client'
import { useState, useEffect } from 'react'
import { useAddressBook } from '@/lib/addressStore'
import type { Address } from '@/lib/types'
import AddressForm from './AddressForm'
import { useAuthStore } from '@/lib/authStore'

export default function AddressManager({ onBackAction }: { onBackAction: () => void }) {
  const { user, isAuthenticated } = useAuthStore()
  const {
    addresses,
    isLoading,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddressBook()

  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined)

  useEffect(() => {
    if (isAuthenticated && user?.phoneNumber) {
      fetchAddresses(user.phoneNumber)
    }
  }, [isAuthenticated, user, fetchAddresses])

  useEffect(() => {
    if (!isLoading && addresses.length === 0) {
      setShowForm(true)
    }
  }, [isLoading, addresses])

  const handleSave = async (addressData: Omit<Address, 'id' | 'addedAt'>) => {
    if (!user?.phoneNumber) return

    const dataToSave = {
      ...addressData,
      default: addresses.length === 0 || addressData.default,
    }

    if (editingAddress?.id) {
      await updateAddress(user.phoneNumber, editingAddress.id, dataToSave)
    } else {
      await addAddress(user.phoneNumber, dataToSave)
    }

    setShowForm(false)
    setEditingAddress(undefined)
  }

  const handleSetDefault = (addressId: string) => {
    if (user?.phoneNumber) {
      setDefaultAddress(user.phoneNumber, addressId)
    }
  }

  const handleRemove = (addressId: string) => {
    if (user?.phoneNumber) {
      deleteAddress(user.phoneNumber, addressId)
    }
  }

  const handleEdit = (addr: Address) => {
    setEditingAddress(addr)
    setShowForm(true)
  }

  const handleAddNew = () => {
    setEditingAddress(undefined)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setShowForm(false)
    setEditingAddress(undefined)
  }

  return (
    <div>
      <button onClick={onBackAction} className="text-sm text-brand font-semibold mb-4">&larr; Back to Account</button>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">My Addresses</h2>
        {!showForm && <button onClick={handleAddNew} className="text-sm font-semibold text-brand hover:underline">+ Add New Address</button>}
      </div>

      {isLoading && addresses.length === 0 ? (
        <p>Loading addresses...</p>
      ) : !showForm ? (
        <div className="space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="rounded-xl border p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-sm">{a.fullName} — {a.phone}</div>
                  <div className="text-sm text-gray-600">{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} - {a.pincode}</div>
                  {a.landmark && <div className="text-xs text-gray-500">Landmark: {a.landmark}</div>}
                </div>
                <div className="flex items-center gap-2">
                  {!a.default && <button onClick={() => a.id && handleSetDefault(a.id)} className="text-xs font-semibold text-gray-500 hover:text-brand" disabled={isLoading}>Set Default</button>}
                  <button onClick={() => handleEdit(a)} className="text-xs font-semibold text-blue-600 hover:underline" disabled={isLoading}>Edit</button>
                  <button onClick={() => a.id && handleRemove(a.id)} className="text-xs font-semibold text-red-600 hover:underline" disabled={isLoading}>Delete</button>
                </div>
              </div>
              {a.default && <div className="mt-2 text-xs font-bold text-green-600">Default Address</div>}
            </div>
          ))}
          {addresses.length === 0 && <p className="text-sm text-gray-500 text-center py-8">No addresses saved yet. Click 'Add New Address' to start.</p>}
        </div>
      ) : (
        <div className="card p-4">
          <AddressForm
            onSubmitAction={handleSave}
            initial={editingAddress}
            onCancel={handleCancelForm}
            isSaving={isLoading}
          />
        </div>
      )}
    </div>
  )
}

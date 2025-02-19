'use client'
import { useState } from 'react'
import Image from 'next/image'
import { storeService } from '@/services/groceryStore.service'

export default function AddStore() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    logo: null,
    storeCover: null,
    vatTax: '',
    deliveryTime: '',
    zone: '',
    latitude: '',
    longitude: '',
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('File size too large. Maximum size is 2MB')
        return
      }
      setFormData(prev => ({
        ...prev,
        [type]: file
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validate form data
      if (!formData.name || !formData.address || !formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        throw new Error('Please fill in all required fields')
      }

      // Validate required files
      if (!formData.logo || !formData.storeCover) {
        throw new Error('Both logo and cover image are required')
      }

      const form = new FormData()
      
      // Basic store details
      form.append('name', formData.name)
      
      // Address data
      const addressData = {
        street: formData.address,
        city: 'Default City',
        state: 'Default State',
        zipCode: '12345',
        coordinates: {
          lat: parseFloat(formData.latitude) || 0,
          lng: parseFloat(formData.longitude) || 0
        }
      }
      form.append('address[street]', addressData.street)
      form.append('address[city]', addressData.city)
      form.append('address[state]', addressData.state)
      form.append('address[zipCode]', addressData.zipCode)
      form.append('address[coordinates][lat]', addressData.coordinates.lat)
      form.append('address[coordinates][lng]', addressData.coordinates.lng)

      // Zone
      form.append('zone', formData.zone)

      // Financial details
      form.append('vatNumber', formData.vatTax)
      form.append('taxPercentage', formData.vatTax)
      form.append('commission', '10')
      form.append('minimumOrder', '0')

      // Delivery time
      form.append('deliveryTime[min]', parseInt(formData.deliveryTime) || 30)
      form.append('deliveryTime[max]', (parseInt(formData.deliveryTime) + 30) || 60)

      // Owner details
      form.append('owner[firstName]', formData.firstName)
      form.append('owner[lastName]', formData.lastName)
      form.append('owner[email]', formData.email)
      form.append('owner[phone]', formData.phone)

      // Files
      form.append('logo', formData.logo)
      form.append('coverImage', formData.storeCover)

      console.log('Submitting form data:', {
        name: form.get('name'),
        'address.street': form.get('address[street]'),
        'address.city': form.get('address[city]'),
        'address.state': form.get('address[state]'),
        'address.zipCode': form.get('address[zipCode]'),
        'address.coordinates.lat': form.get('address[coordinates][lat]'),
        'address.coordinates.lng': form.get('address[coordinates][lng]'),
        zone: form.get('zone'),
        vatNumber: form.get('vatNumber'),
        taxPercentage: form.get('taxPercentage'),
        'deliveryTime.min': form.get('deliveryTime[min]'),
        'deliveryTime.max': form.get('deliveryTime[max]'),
        'owner.firstName': form.get('owner[firstName]'),
        'owner.lastName': form.get('owner[lastName]'),
        'owner.email': form.get('owner[email]'),
        'owner.phone': form.get('owner[phone]'),
        hasLogo: form.has('logo'),
        hasCoverImage: form.has('coverImage')
      });

      const response = await storeService.createStore(form)

      if (response.success) {
        // Reset form
        setFormData({
          name: '',
          address: '',
          logo: null,
          storeCover: null,
          vatTax: '',
          deliveryTime: '',
          zone: '',
          latitude: '',
          longitude: '',
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          password: '',
          confirmPassword: ''
        })
        
        // Show success message
        alert('Store created successfully!')
      }
    } catch (err) {
      console.error('Error creating store:', err)
      setError(err.message || 'Failed to create store. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
       <div className="flex items-center gap-4 mb-6">
        <Image
          src="/store.png"
          alt="Store Icon"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <h1 className="text-2xl font-bold text-gray-800">Add New Store</h1>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Store Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Basic Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Store Name</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Logo</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'logo')}
                className="w-full p-2 border rounded" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Store Cover</label>
              <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'storeCover')}
                className="w-full p-2 border rounded" 
              />
            </div>
          </div>
        </div>

        {/* Store Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Store Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">VAT/Tax (%)</label>
              <input 
                type="number" 
                name="vatTax"
                value={formData.vatTax}
                onChange={handleInputChange}
                className="w-full p-2 border rounded" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Delivery Time</label>
              <input 
                type="text" 
                name="deliveryTime"
                value={formData.deliveryTime}
                onChange={handleInputChange}
                className="w-full p-2 border rounded" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zone</label>
              <input
                type="text"
                name="zone"
                value={formData.zone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                placeholder="Enter zone name"
                required
              />
            </div>
            <div className="md:col-span-3">
              <div className="h-64 bg-gray-100 rounded">
                {/* Map Component Goes Here */}
                <div className="flex gap-4 mt-2">
                  <input 
                    type="text" 
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="Latitude" 
                    className="w-full p-2 border rounded" 
                  />
                  <input 
                    type="text" 
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="Longitude" 
                    className="w-full p-2 border rounded" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Owner Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Owner Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">First Name</label>
              <input 
                type="text" 
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name</label>
              <input 
                type="text" 
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full p-2 border rounded" 
                required
              />
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full p-2 border rounded" 
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full p-2 border rounded" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirm Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-2 border rounded" 
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <button 
            type="reset" 
            onClick={() => {
              setFormData({
                name: '',
                address: '',
                logo: null,
                storeCover: null,
                vatTax: '',
                deliveryTime: '',
                zone: '',
                latitude: '',
                longitude: '',
                firstName: '',
                lastName: '',
                phone: '',
                email: '',
                password: '',
                confirmPassword: ''
              })
            }}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Reset
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="px-4 py-2 bg-teal-800 text-white rounded hover:bg-teal-900"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  )
}

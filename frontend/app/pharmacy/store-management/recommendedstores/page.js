"use client"
import { Switch } from '@headlessui/react'
import { useState, useEffect } from "react"
import { MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import { storeService } from "@/services/pharmacyStore.service"

export default function RecommendedStores() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterQuery, setFilterQuery] = useState("")
  const [stores, setStores] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setLoading(true)
        const result = await storeService.listRecommendedStores()

        if (result?.success && result?.data?.stores && Array.isArray(result.data.stores)) {
          const fixedStores = result.data.stores.map((store) => ({
            ...store,
            _id: store.id,
          }))
          setStores(fixedStores)
          setFilteredStores(fixedStores)
        } else {
          throw new Error("Invalid response format")
        }
      } catch (error) {
        console.error("Fetch error:", error)
        setError("Failed to fetch stores. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchStores()
  }, [])

  useEffect(() => {
    const lowercasedFilter = filterQuery.toLowerCase()
    const filtered = stores.filter(
      (store) =>
        store.name.toLowerCase().includes(lowercasedFilter) ||
        store.status.toLowerCase().includes(lowercasedFilter) ||
        store.ratings.toString().includes(lowercasedFilter) ||
        store.totalProducts.toString().includes(lowercasedFilter) ||
        store.totalOrders.toString().includes(lowercasedFilter),
    )
    setFilteredStores(filtered)
  }, [filterQuery, stores])

  const handleDelete = async (storeId) => {
    if (!storeId) {
      console.error("Store ID is undefined!")
      return
    }

    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this store?")
      if (!confirmDelete) return

      await storeService.deleteStore(storeId)

      setStores((prevStores) => prevStores.filter((store) => store.id !== storeId))
      setFilteredStores((prevStores) => prevStores.filter((store) => store.id !== storeId))

      alert("Store deleted successfully!")
    } catch (error) {
      console.error("Error deleting store:", error)
      alert(error.message || "Failed to delete store.")
    }
  }

  // Real-time search filtering
  useEffect(() => {
    const lowercasedSearch = searchQuery.toLowerCase()
    const searchResults = stores.filter(
      (store) =>
        store.name.toLowerCase().includes(lowercasedSearch) ||
        store.status?.toLowerCase().includes(lowercasedSearch) ||
        store.ratings?.toString().includes(lowercasedSearch) ||
        store.totalProducts?.toString().includes(lowercasedSearch) ||
        store.totalOrders?.toString().includes(lowercasedSearch),
    )
    setFilteredStores(searchResults)
  }, [searchQuery, stores])


  // Handle store status toggle
  const toggleRecommendedStatus = async (storeId, currentStatus) => {
    try {
      const response = await storeService.toggleRecommendedStatus(storeId)
      if (response.success) {
        setStores(stores.map(store =>
          store.id === storeId
            ? { ...store, isRecommended: !currentStatus }
            : store
        ))                

      }
    } catch (err) {
      console.error('Error toggling store status:', err)
      // You might want to show an error notification here
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Image src="/store.png" alt="Store Icon" width={40} height={40} className="rounded-lg" />
        <h1 className="text-2xl font-bold text-gray-800">Recommended Stores</h1>
      </div>

      {/* Search Form */}
      <div className="bg-white p-6 rounded-lg shadow border">
        <h1 className="text-xl font-bold text-gray-800 mb-6 mt-7">Stores</h1>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search stores..."
            className="flex-1 p-2 border rounded"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

        </div>
        <div className="flex justify-end space-x-2 mt-6 mb-8">
          <button
            onClick={() => {
              setSearchQuery("")
              setFilteredStores(stores)
            }}
            className="px-7 py-2 border rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
          >
            Reset
          </button>
          <button
            className="px-7 py-2 text-white rounded transition-colors duration-300"
            style={{ backgroundColor: "#107980" }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#0D5F66")} // Darker shade on hover
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#107980")} // Original color on leave
          >Submit
          </button>
        </div>

        {/* Stores Table */}
        <div className="bg-white rounded-lg shadow border">
          <div className="flex items-center justify-between mt-3 mr-8">
            <h1 className="text-xl font-bold text-gray-500 ml-5 mt-5 mb-7">Recommended Stores</h1>

            <div className="relative w-64">
              <input
                type="text"
                placeholder="Filter stores..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>


          {/* Loading State */}
          {loading && <div className="p-4 text-center text-gray-600">Loading stores...</div>}

          {/* Error State */}
          {error && <div className="p-4 text-center text-red-600">Error: {error}</div>}

          {/* Stores Table */}
          {!loading && !error && filteredStores.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ratings</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStores.map((store, index) => (
                  <tr key={store.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{store.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">⭐ {store.ratings}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{store.totalProducts}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{store.totalOrders}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                  <Switch
                    checked={store.isRecommended}
                    onChange={() => toggleRecommendedStatus(store.id, store.isRecommended)}
                    className={`${store.isRecommended ? 'bg-teal-600' : 'bg-gray-200'} 
                      relative inline-flex h-6 w-11 items-center rounded-full`}
                  >
                    <span className={`${store.isRecommended ? 'translate-x-6' : 'translate-x-1'} 
                      inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </Switch>
                  </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(store.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded border border-red-600"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            !loading && !error && <div className="p-4 text-center text-gray-600">No stores found.</div>
          )}
        </div>
      </div>


    </div >
  )
}


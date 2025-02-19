'use client'
import { useState, useEffect } from 'react'
import { EyeIcon, MagnifyingGlassIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Switch } from '@headlessui/react'
import Image from 'next/image'
import { storeService } from '@/services/store.service'

export default function StoresList() {
  const [stores, setStores] = useState([])
  const [filterQuery, setFilterQuery] = useState("")
  const [filteredStores, setFilteredStores] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statistics, setStatistics] = useState({
    totalStores: 0,
    activeStores: 0,
    pendingStores: 0,
    newStores: 0,
    totalTransactions: 0,
    totalCommission: 0,
    totalWithdrawals: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch stores and statistics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch stores list
        const storesResponse = await storeService.listStores({
          page: 1,
          limit: 10,
          sortField: 'createdAt',
          sortOrder: 'desc'
        })

        if (storesResponse.success) {
          setStores(storesResponse.data.docs)
        }

        // Fetch statistics
        const statsResponse = await storeService.getStoreStatistics()
        if (statsResponse.success) {
          setStatistics({
            totalStores: statsResponse.data.totalStores,
            activeStores: statsResponse.data.activeStores,
            pendingStores: statsResponse.data.pendingStores,
            newStores: statsResponse.data.newStores,
            totalTransactions: statsResponse.data.totalTransactions,
            totalCommission: statsResponse.data.totalCommission,
            totalWithdrawals: statsResponse.data.totalWithdrawals
          })
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch store data')
        console.error('Error fetching store data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleDelete = async (storeId) => {
    try {
      const confirmDelete = window.confirm("Are you sure you want to delete this store?");
      if (!confirmDelete) return;

      await storeService.deleteStore(storeId);

      // Update state to remove deleted store
      setStores((prevStores) => prevStores.filter(store => store._id !== storeId));

      alert("Store deleted successfully!");
    } catch (error) {
      alert(error.message || "Failed to delete store.");
    }
  };

  // Handle featured status toggle
  const toggleFeatured = async (storeId, currentStatus) => {
    try {
      const response = await storeService.toggleFeatured(storeId)
      if (response.success) {
        setStores(stores.map(store =>
          store._id === storeId
            ? { ...store, featured: !currentStatus }
            : store
        ))
      }
    } catch (err) {
      console.error('Error toggling featured status:', err)
      // You might want to show an error notification here
    }
  }

  // Handle store status toggle
  const handleStatusToggle = async (storeId, currentStatus) => {
    try {
      const response = await storeService.toggleStoreStatus(storeId)
      if (response.success) {
        setStores(stores.map(store =>
          store._id === storeId
            ? { ...store, status: store.status === 'active' ? 'pending' : 'active' }
            : store
        ))
      }
    } catch (err) {
      console.error('Error toggling store status:', err)
      // You might want to show an error notification here
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


  if (loading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>

  return (
    <div className="p-6 space-y-6">
      {/* Stores Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 justify-evenly">
        {[
          { title: 'Total Stores', count: statistics.totalStores, color: 'bg-blue-100 text-blue-800', icon: '/totalstore.png' },
          { title: 'Active Stores', count: statistics.activeStores, color: 'bg-green-100 text-green-800', icon: '/active-store.png' },
          { title: 'Inactive Stores', count: statistics.pendingStores, color: 'bg-red-100 text-red-800', icon: '/close-store.png' },
          { title: 'Newly Joined', count: statistics.newStores, color: 'bg-yellow-100 text-yellow-800', icon: '/add-store.png' }
        ].map((stat) => (
          <div key={stat.title} className={`${stat.color} p-4 rounded-lg flex justify-between items-center`}>
            <div>
              <h3 className="font-semibold">{stat.title}</h3>
              <p className="text-2xl font-bold">{stat.count}</p>
            </div>
            <div className="flex-shrink-0 ml-auto">
              <Image src={stat.icon} alt={stat.title} width={50} height={50} />
            </div>
          </div>
        ))}
      </div>

      {/* Transaction Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Total Transactions', amount: `$${statistics.totalTransactions.toLocaleString()}`, color: 'text-blue-600' },
          { title: 'Commission Earned', amount: `$${statistics.totalCommission.toLocaleString()}`, color: 'text-green-600' },
          { title: 'Total Store Withdraws', amount: `$${statistics.totalWithdrawals.toLocaleString()}`, color: 'text-red-600' }
        ].map((stat) => (
          <div key={stat.title} className="bg-white p-4 rounded-lg shadow h-24 flex flex-col justify-center">
            <h3 className="text-gray-500">{stat.title}</h3>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.amount}</p> {/* Dynamic color */}
          </div>
      


        ))}
      </div>

      {/* Stores Table */}
      <div className="bg-white rounded-lg shadow">

        <div className="flex justify-between items-center mb-5">
          {/* Store List Title (Left) */}
          <h1 className="text-xl font-bold text-gray-500 ml-8">Store List</h1>

          {/* Search Box (Right) */}
          <div className="relative w-64 mr-8">
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


        {!loading && !error && filteredStores.length > 0 ? (

          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Store Information</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner Information</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStores.map((store, index) => (
                <tr key={store._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{store.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {`${store.owner.firstName} ${store.owner.lastName}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{store.zone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Switch
                      checked={store.featured}
                      onChange={() => toggleFeatured(store._id, store.featured)}
                      className={`${store.featured ? 'bg-teal-600' : 'bg-gray-200'} 
                      relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span className={`${store.featured ? 'translate-x-6' : 'translate-x-1'} 
                      inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Switch
                      checked={store.status === 'active'}
                      onChange={() => handleStatusToggle(store._id, store.status)}
                      className={`${store.status === 'active' ? 'bg-teal-600' : 'bg-gray-200'} 
                      relative inline-flex h-6 w-11 items-center rounded-full`}
                    >
                      <span className={`${store.status === 'active' ? 'translate-x-6' : 'translate-x-1'} 
                      inline-block h-4 w-4 transform rounded-full bg-white transition`}
                      />
                    </Switch>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-600">
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded border border-green-600">
                        <PencilSquareIcon className="h-5 w-5" />
                      </button>

                      <button onClick={() => handleDelete(store._id)} className="p-2 text-red-600 hover:bg-red-50 rounded border border-red-600">
                        <TrashIcon className="h-5 w-5" />
                      </button>

                    </div>
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
  )
}
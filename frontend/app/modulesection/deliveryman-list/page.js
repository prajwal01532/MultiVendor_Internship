'use client'
import { useState, useEffect } from 'react';
import { FaSearch, FaEye, FaPencilAlt, FaTrash, FaFileExport } from 'react-icons/fa';
import Image from 'next/image';
import { deliverymanService } from '@/app/services/deliveryman.service';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function DeliverymanList() {
    const [deliverymen, setDeliverymen] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        type: '',
        jobType: '',
        zone: '',
        search: ''
    });

    useEffect(() => {
        fetchDeliverymen();
    }, []);

    const fetchDeliverymen = async () => {
        try {
            const response = await deliverymanService.getAllDeliveryMen();
            setDeliverymen(response.data || []);
        } catch (error) {
            toast.error('Failed to fetch delivery men');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this delivery man?')) {
            try {
                await deliverymanService.deleteDeliveryMan(id);
                toast.success('Delivery man deleted successfully');
                fetchDeliverymen();
            } catch (error) {
                toast.error('Failed to delete delivery man');
            }
        }
    };

    const filteredDeliverymen = deliverymen.filter(dm => {
        return (
            (!filters.type || dm.deliverymanType === filters.type) &&
            (!filters.jobType || dm.jobType === filters.jobType) &&
            (!filters.zone || dm.zone === filters.zone) &&
            (!filters.search || 
                dm.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
                dm.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
                dm.email.toLowerCase().includes(filters.search.toLowerCase()) ||
                dm.phone.includes(filters.search)
            )
        );
    });

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center mb-6">
                <div className="relative w-10 h-10 mr-3 rounded-full border">
                    <Image
                        src="/modulesection/add-delivery-man.png"
                        alt="Deliveryman List"
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold">Deliveryman List</h1>
                    <p className="text-sm text-gray-500">Manage your delivery personnel</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow border">
                <div className="flex items-center justify-end gap-4 mt-4 mr-4">
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="p-2 bg-white border rounded w-48"
                    >
                        <option value="">All Types</option>
                        <option value="freelancer">Freelancer</option>
                        <option value="permanent">Permanent</option>
                    </select>

                    <select
                        name="jobType"
                        value={filters.jobType}
                        onChange={handleFilterChange}
                        className="p-2 bg-white border rounded w-48"
                    >
                        <option value="">All Job Types</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                    </select>

                    <select
                        name="zone"
                        value={filters.zone}
                        onChange={handleFilterChange}
                        className="p-2 bg-white border rounded w-48"
                    >
                        <option value="">All Zones</option>
                        <option value="zone1">Zone 1</option>
                        <option value="zone2">Zone 2</option>
                    </select>

                    <div className="relative w-64">
                        <input
                            type="text"
                            name="search"
                            value={filters.search}
                            onChange={handleFilterChange}
                            placeholder="Search deliveryman..."
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                        <FaFileExport />
                        Export
                    </button>
                </div>

                {/* Table */}
                <table className="min-w-full mt-4">
                    <thead>
                        <tr className="bg-gray-50 border-b h-16">
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SI</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact Info</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Zone</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Availability</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">Loading...</td>
                            </tr>
                        ) : filteredDeliverymen.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-4">No delivery men found</td>
                            </tr>
                        ) : (
                            filteredDeliverymen.map((deliveryman, index) => (
                                <tr key={deliveryman._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-full mr-3">
                                                <Image
                                                    src={deliveryman.profileImage || '/placeholder.png'}
                                                    alt={`${deliveryman.firstName} ${deliveryman.lastName}`}
                                                    width={40}
                                                    height={40}
                                                    className="rounded-full"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-medium">{`${deliveryman.firstName} ${deliveryman.lastName}`}</p>
                                                <p className="text-sm text-gray-500">ID: #{deliveryman._id.slice(-6)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <p>{deliveryman.phone}</p>
                                        <p className="text-sm text-gray-500">{deliveryman.email}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">{deliveryman.zone}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{deliveryman.deliverymanType}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            deliveryman.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {deliveryman.isAvailable ? 'Online' : 'Offline'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            deliveryman.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                            deliveryman.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {deliveryman.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex space-x-2">
                                            <Link href={`/modulesection/deliveryman-details/${deliveryman._id}`}>
                                                <button className="p-2 border border-blue-600 text-blue-600 hover:bg-blue-100 rounded">
                                                    <FaEye />
                                                </button>
                                            </Link>
                                            <Link href={`/modulesection/add-delivery-man?id=${deliveryman._id}`}>
                                                <button className="p-2 border border-green-600 text-green-600 hover:bg-green-100 rounded">
                                                    <FaPencilAlt />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(deliveryman._id)}
                                                className="p-2 border border-red-600 text-red-600 hover:bg-red-100 rounded"
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

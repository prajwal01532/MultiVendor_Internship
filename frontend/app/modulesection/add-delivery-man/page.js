'use client'
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaUpload, FaUser } from 'react-icons/fa';
import { deliverymanService } from '@/app/services/deliveryman.service';
import { getAllVehicleCategories } from '@/app/services/vehicleCategoryService';
import { toast, Toaster } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AddDeliveryMan() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const deliverymanId = searchParams.get('id');
    const isEdit = !!deliverymanId;

    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [vehicleCategories, setVehicleCategories] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        deliverymanType: '',
        zone: '',
        vehicle: '',
        identityType: '',
        identityNumber: '',
    });
    const [identityImages, setIdentityImages] = useState([]);
    const [profileImage, setProfileImage] = useState(null);
    const [existingProfileImage, setExistingProfileImage] = useState('');
    const [existingIdentityImages, setExistingIdentityImages] = useState([]);
    const [errors, setErrors] = useState({});

    // Reset form data when component unmounts or when isEdit changes
    useEffect(() => {
        // Reset form data when not in edit mode
        if (!isEdit) {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                password: '',
                confirmPassword: '',
                deliverymanType: '',
                zone: '',
                vehicle: '',
                identityType: '',
                identityNumber: '',
            });
            setProfileImage(null);
            setIdentityImages([]);
            setExistingProfileImage('');
            setExistingIdentityImages([]);
        }
    }, [isEdit]);

    // Fetch existing data if in edit mode
    useEffect(() => {
        const fetchDeliveryMan = async () => {
            if (deliverymanId) {
                try {
                    const response = await deliverymanService.getDeliveryMan(deliverymanId);
                    if (response.success && response.data) {
                        const data = response.data;
                        setFormData({
                            firstName: data.firstName || '',
                            lastName: data.lastName || '',
                            email: data.email || '',
                            phone: data.phone || '',
                            password: '',
                            confirmPassword: '',
                            deliverymanType: data.deliverymanType || '',
                            zone: data.zone || '',
                            vehicle: data.vehicle || '',
                            identityType: data.identityType || '',
                            identityNumber: data.identityNumber || '',
                        });
                        setExistingProfileImage(data.profileImage || '');
                        setExistingIdentityImages(data.identityImages || []);
                    }
                } catch (error) {
                    toast.error('Failed to fetch delivery man data');
                }
            }
            setInitialLoad(false);
        };

        fetchDeliveryMan();
    }, [deliverymanId]);

    // Fetch vehicle categories when component mounts
    useEffect(() => {
        const fetchVehicleCategories = async () => {
            try {
                const response = await getAllVehicleCategories();
                if (response.success) {
                    setVehicleCategories(response.data);
                }
            } catch (error) {
                toast.error('Failed to fetch vehicle categories');
            }
        };

        fetchVehicleCategories();
    }, []);

    const validateForm = () => {
        const newErrors = {};
        
        // Required field validation
        const requiredFields = [
            'firstName', 'lastName', 'email', 'phone',
            'deliverymanType', 'vehicle', 'identityType', 'identityNumber'
        ];
        
        // Add password to required fields only when creating new delivery man
        if (!isEdit) {
            requiredFields.push('password');
        }
        
        requiredFields.forEach(field => {
            if (!formData[field]) {
                newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
            }
        });

        // Email validation
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation only if password is provided or creating new delivery man
        if (!isEdit || formData.password) {
            if (formData.password && formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters long';
            }

            if (formData.password !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        // Phone validation
        if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Image validation - only required for new delivery man
        if (!isEdit && !profileImage && !existingProfileImage) {
            newErrors.profileImage = 'Profile image is required';
        }

        if (!isEdit && identityImages.length === 0 && existingIdentityImages.length === 0) {
            newErrors.identityImages = 'At least one identity image is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfileImageClick = () => {
        document.getElementById('profileImageInput').click();
    };

    const handleIdentityImageClick = (index) => {
        document.getElementById(`identityImageInput-${index}`).click();
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                document.getElementById('profileImagePreview').src = reader.result;
                document.getElementById('profileImagePreview').style.display = 'block';
                document.getElementById('profileImageUploadIcon').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    };

    const handleIdentityImagesChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            const newImages = [...identityImages];
            newImages[index] = file;
            setIdentityImages(newImages);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                document.getElementById(`identityImagePreview-${index}`).src = reader.result;
                document.getElementById(`identityImagePreview-${index}`).style.display = 'block';
                document.getElementById(`identityImageUploadIcon-${index}`).style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fill in all required fields correctly');
            return;
        }

        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Please login to continue');
            router.push('/auth/login');
            return;
        }

        setLoading(true);
        // Show loading toast
        const loadingToast = toast.loading(isEdit ? 'Updating delivery man...' : 'Creating delivery man...');
        
        try {
            const formDataToSend = new FormData();
            
            // Add all form fields except confirmPassword and password if editing
            Object.keys(formData).forEach(key => {
                if (key !== 'confirmPassword' && (!isEdit || key !== 'password' || formData[key])) {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Add profile image only if changed
            if (profileImage) {
                formDataToSend.append('profileImage', profileImage, profileImage.name);
            }

            // Add identity images only if changed
            const validIdentityImages = identityImages.filter(image => image !== null && image !== undefined);
            if (validIdentityImages.length > 0) {
                validIdentityImages.forEach((image, index) => {
                    formDataToSend.append('identityImages', image, image.name);
                });
            }

            let response;
            if (isEdit) {
                response = await deliverymanService.updateDeliveryMan(deliverymanId, formDataToSend);
            } else {
                if (!profileImage) {
                    toast.error('Profile image is required');
                    toast.dismiss(loadingToast);
                    return;
                }
                if (validIdentityImages.length === 0) {
                    toast.error('At least one identity image is required');
                    toast.dismiss(loadingToast);
                    return;
                }
                response = await deliverymanService.createDeliveryMan(formDataToSend);
            }
            
            // Dismiss loading toast
            toast.dismiss(loadingToast);
            
            if (response.success) {
                toast.success(isEdit ? 'Delivery man updated successfully' : 'Delivery man added successfully');
                setTimeout(() => {
                    router.push('/modulesection/deliveryman-list');
                }, 2000);
            } else {
                toast.error(response.message || `Failed to ${isEdit ? 'update' : 'add'} delivery man`);
            }
        } catch (error) {
            console.error(`Error ${isEdit ? 'updating' : 'creating'} delivery man:`, error);
            
            // Dismiss loading toast
            toast.dismiss(loadingToast);
            
            // Handle different types of errors
            if (error.message === 'No token, authorization denied') {
                toast.error('Session expired. Please login again');
                setTimeout(() => {
                    router.push('/auth/login');
                }, 2000);
            } else if (typeof error === 'object' && error.message) {
                toast.error(error.message);
            } else if (typeof error === 'string') {
                toast.error(error);
            } else {
                toast.error('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (initialLoad) {
        return <div className="p-6 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>;
    }

    return (
        <div className="p-6">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#333',
                        color: '#fff',
                    },
                    success: {
                        style: {
                            background: 'green',
                        },
                    },
                    error: {
                        style: {
                            background: 'red',
                        },
                    },
                }}
            />
            <div className="flex items-center mb-6">
                <div className="relative w-10 h-10 mr-3 rounded-full border">
                    <Image
                        src="/modulesection/add-delivery-man.png"
                        alt={isEdit ? "Edit Delivery Man" : "Add Delivery Man"}
                        layout="fill"
                        objectFit="contain"
                    />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit Delivery Man' : 'Add New Delivery Man'}</h1>
                    <p className="text-sm text-gray-500">{isEdit ? 'Update delivery man account' : 'Create a new delivery man account'}</p>
                </div>
            </div>
            
            <form className="space-y-6" onSubmit={handleSubmit}>
                {/* General Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">General Information</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                First Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Last Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                required
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deliveryman Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                name="deliverymanType"
                                value={formData.deliverymanType}
                                onChange={handleInputChange}
                                className="w-full bg-white p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select deliveryman type</option>
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="contract">Contract</option>
                            </select>
                            {errors.deliverymanType && <p className="text-red-500 text-sm">{errors.deliverymanType}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Zone
                            </label>
                            <input
                                type="text"
                                name="zone"
                                value={formData.zone}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter zone"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vehicle <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                name="vehicle"
                                value={formData.vehicle}
                                onChange={handleInputChange}
                                className="w-full bg-white p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select vehicle</option>
                                {vehicleCategories.map((category) => (
                                    <option key={category._id} value={category.vehicleType}>
                                        {category.vehicleType}
                                    </option>
                                ))}
                            </select>
                            {errors.vehicle && <p className="text-red-500 text-sm">{errors.vehicle}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Identity Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                required
                                name="identityType"
                                value={formData.identityType}
                                onChange={handleInputChange}
                                className="w-full bg-white p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select identity type</option>
                                <option value="passport">Passport</option>
                                <option value="driving">Driving License</option>
                                <option value="nid">National ID</option>
                            </select>
                            {errors.identityType && <p className="text-red-500 text-sm">{errors.identityType}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Identity Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                name="identityNumber"
                                value={formData.identityNumber}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.identityNumber && <p className="text-red-500 text-sm">{errors.identityNumber}</p>}
                        </div>
                    </div>

                    {/* Image Upload Sections */}
                    <div className="mt-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profile Image (1:1) <span className="text-red-500">*</span>
                            </label>
                            <div 
                                onClick={handleProfileImageClick}
                                className="flex items-center justify-center w-40 h-40 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 relative"
                            >
                                <input
                                    id="profileImageInput"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleProfileImageChange}
                                />
                                {!profileImage && !existingProfileImage && (
                                    <FaUpload id="profileImageUploadIcon" className="text-gray-400" />
                                )}
                                <img
                                    id="profileImagePreview"
                                    src={existingProfileImage || ""}
                                    alt="Profile Preview"
                                    className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                    style={{ display: (profileImage || existingProfileImage) ? 'block' : 'none' }}
                                />
                            </div>
                            {errors.profileImage && <p className="text-red-500 text-sm">{errors.profileImage}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Identity Images (Max 5) <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4">
                                {[...Array(5)].map((_, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleIdentityImageClick(index)}
                                        className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 relative"
                                    >
                                        <input
                                            id={`identityImageInput-${index}`}
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleIdentityImagesChange(e, index)}
                                        />
                                        {!identityImages[index] && !existingIdentityImages[index] && (
                                            <FaUpload id={`identityImageUploadIcon-${index}`} className="text-gray-400" />
                                        )}
                                        <img
                                            id={`identityImagePreview-${index}`}
                                            src={existingIdentityImages[index] || ""}
                                            alt={`Identity Image ${index + 1}`}
                                            className="absolute inset-0 w-full h-full object-cover rounded-lg"
                                            style={{ display: (identityImages[index] || existingIdentityImages[index]) ? 'block' : 'none' }}
                                        />
                                    </div>
                                ))}
                            </div>
                            {errors.identityImages && <p className="text-red-500 text-sm">{errors.identityImages}</p>}
                        </div>
                    </div>
                </div>

                {/* Account Information */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Account Information</h2>
                    <div className="grid grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                required
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password {!isEdit && <span className="text-red-500">*</span>}
                                {isEdit && <span className="text-gray-500 text-xs ml-1">(Optional)</span>}
                            </label>
                            <input
                                type="password"
                                required={!isEdit}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder={isEdit ? "Leave blank to keep current password" : "Min 8 characters with number, letters & symbol"}
                            />
                            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password {!isEdit && <span className="text-red-500">*</span>}
                                {isEdit && <span className="text-gray-500 text-xs ml-1">(Optional)</span>}
                            </label>
                            <input
                                type="password"
                                required={!isEdit}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder={isEdit ? "Leave blank to keep current password" : "Confirm your password"}
                            />
                            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                        </div>
                    </div>
                     {/* Form Actions */}
                <div className="flex justify-end space-x-4 mt-4">
                    <button
                        type="reset"
                        disabled={loading}
                        className="px-6 py-2 border rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {isEdit ? 'Updating Delivery Man...' : 'Creating Delivery Man...'}
                            </>
                        ) : (
                            isEdit ? 'Update' : 'Submit'
                        )}
                    </button>
                </div>
                </div>

               
            </form>
        </div>
    );
}

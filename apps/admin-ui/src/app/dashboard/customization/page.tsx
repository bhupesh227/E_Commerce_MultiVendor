"use client";

import BreadCrumbs from 'apps/admin-ui/src/shared/components/BreadCrumbs';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import React , { useEffect , useState} from 'react';


const tabs = ["Categories", "Logo" , "Banner"];

const CustomizationPage = () => {
    const [activeTab, setActiveTab] = useState("Categories");
    const [categories , setCategories] = useState<string[]>([]);
    const [subCategories , setSubCategories] = useState<Record<string,string[]>>({});
    const [newCategory, setNewCategory] = useState('');
    const [newSubCategory, setNewSubCategory] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [logo, setLogo] = useState<string | null>(null);
    const [banner, setBanner] = useState<string | null>(null);

    useEffect(() => {
        const fetchCustomization = async () => {
            try {
                const response = await axiosInstance.get('/admin/api/get-all');
                const data = response.data;
                setCategories(data.categories || []);
                setSubCategories(data.subCategories || {});
                setLogo(data.logo || null);
                setBanner(data.banner || null);
            } catch (error) {
                console.error("Error fetching customization data:", error);
            }
        }
        fetchCustomization();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            await axiosInstance.post('/admin/api/add-category', { category: newCategory });
            setCategories(prev => [...prev, newCategory]);
            setNewCategory('');
        } catch (error) {
            console.error("Error adding category:", error);
        }
    };

    const handleAddSubCategory = async () => {
        if (!newSubCategory.trim() || !selectedCategory) return;
        try {
            await axiosInstance.post('/admin/api/add-subcategory', { category: selectedCategory, subCategory: newSubCategory });
            setSubCategories(prev => ({
                ...prev,
                [selectedCategory]: [...(prev[selectedCategory] || []), newSubCategory]
            }));
            setNewSubCategory('');
        } catch (error) {
            console.error("Error adding sub-category:", error);
        }
    };


  return (
    <div className='w-full min-h-screen p-8 bg-black text-white text-sm'>
        <h2 className='text-2xl font-semibold mb-2'>Customization</h2>
        <BreadCrumbs title='Customization' />

        <div className='flex items-center gap-4 mb-4 border-b border-gray-700 pb-2'>
            {tabs.map(tab => (
                <button
                    key={tab}
                    className={`px-4 py-2 rounded-md font-semibold ${activeTab === tab ? 'bg-gray-800 text-white font-bold' : 'text-gray-400 hover:bg-gray-700'}`}
                    onClick={() => setActiveTab(tab)}
                >
                    {tab}
                </button>
            ))}
        </div>

        <div className='mt-6'>
            {activeTab === "Categories" && (
                <div>
                    {categories.length === 0 ? (
                        <p className='text-gray-500'>No categories available. Please add a category.</p>
                    ) : (
                        categories.map((cat,idx) =>(
                            <div key={idx} className='mb-6'>
                                <p className='font-semibold mx-1 mb-2'>{cat}</p>
                                { subCategories[cat]?.length > 0 ? (
                                    <ul className='ml-4 list-disc'>
                                        {subCategories[cat].map((subCat, subIdx) => (
                                            <li key={subIdx} className='text-gray-400'>{subCat}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className='text-gray-500 ml-4'>No sub-categories available.</p>
                                )}
                            </div>
                        ))
                    )}

                    <div className='pt-4 space-x-2'>
                        <input
                            type='text'
                            placeholder='New Category'
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            className='px-3 py-2 bg-gray-800 rounded-md text-white outline-none'
                        />
                        <button
                            onClick={handleAddCategory}
                            className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg'
                        >
                            Add Category
                        </button>
                    </div>

                    <div className='pt-4 flex items-center gap-2 flex-wrap'>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className='bg-gray-800 text-white px-3 py-2 rounded-md outline-none'
                        >
                            <option value=''>Select Category</option>
                            {categories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <input
                            type='text'
                            placeholder='New Sub-Category'
                            value={newSubCategory}
                            onChange={(e) => setNewSubCategory(e.target.value)}
                            className='px-3 py-2 bg-gray-800 rounded-md text-white outline-none'
                        />
                        <button
                            onClick={handleAddSubCategory}
                            className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg'
                        >
                            Add Sub-Category
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "Logo" && (
                <div>
                    <h3 className='text-lg font-semibold mb-2'>Logo</h3>
                    {logo ? (
                        <img src={logo} alt="Platform Logo" className='w-[120px] h-auto border border-gray-600 p-2 bg-white' />
                    ) : (
                        <p className='text-gray-500'>No logo uploaded.</p>
                    )}
                    <input
                        type='file'
                        accept='image/*'
                        onChange={async(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                                const response = await axiosInstance.post('/admin/api/upload-logo', formData);
                                setLogo(response.data.logo);
                            } catch (error) {
                                console.error("Error uploading logo:", error);
                            }
                        }}
                        className='mt-2 text-sm text-white'
                    />
                </div>
            )}

            {activeTab === "Banner" && (
                <div>
                    <h3 className='text-lg font-semibold mb-2'>Banner</h3>
                    {banner ? (
                        <img src={banner} alt="Platform Banner" className='w-full max-w-[600px] h-auto border border-gray-600 p-2 bg-white rounded-md' />
                    ) : (
                        <p className='text-gray-500'>No banner uploaded.</p>
                    )}
                    <input
                        type='file'
                        accept='image/*'
                        onChange={async(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                                const response = await axiosInstance.post('/admin/api/upload-banner', formData);
                                setBanner(response.data.banner);
                            } catch (error) {
                                console.error("Error uploading banner:", error);
                            }
                        }}
                        className='mt-2 text-sm text-white'
                    />
                </div>
            )}
        </div>
    </div>
  )
}

export default CustomizationPage
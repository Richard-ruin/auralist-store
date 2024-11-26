import React, { useState, useEffect } from 'react';
import {
 Plus,
 Search,
 Edit,
 Trash2,
 MoreVertical,
 Image as ImageIcon,
 AlertCircle
} from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import CategoryModal from './CategoryModal';
import { useNavigate } from 'react-router-dom';

const CategoryManager = () => {
 const [categories, setCategories] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [showModal, setShowModal] = useState(false);
 const [selectedCategory, setSelectedCategory] = useState(null);
 const [searchQuery, setSearchQuery] = useState('');
 const navigate = useNavigate();

 const fetchCategories = async () => {
   try {
     setLoading(true);
     const response = await categoryService.getAll();
     setCategories(response.data);
   } catch (err) {
     setError(err.message);
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   fetchCategories();
 }, []);

 const handleSave = async (formData) => {
   try {
     if (selectedCategory) {
       await categoryService.update(selectedCategory._id, formData);
     } else {
       await categoryService.create(formData);
     }
     fetchCategories();
     setShowModal(false);
     setSelectedCategory(null);
   } catch (err) {
     setError(err.message);
   }
 };

 const handleDelete = async (id) => {
   if (window.confirm('Are you sure you want to delete this category?')) {
     try {
       await categoryService.delete(id);
       fetchCategories();
     } catch (err) {
       setError(err.message);
     }
   }
 };

 const filteredCategories = categories.filter(category => 
   category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
   category.description.toLowerCase().includes(searchQuery.toLowerCase())
 );

 const getStatusColor = (status) => {
   switch (status.toLowerCase()) {
     case 'active':
       return 'bg-green-100 text-green-800';
     case 'inactive':
       return 'bg-gray-100 text-gray-800';
     default:
       return 'bg-gray-100 text-gray-800';
   }
 };

 if (loading) {
   return (
     <div className="flex justify-center items-center h-screen">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
     </div>
   );
 }

 if (error) {
   return (
     <div className="flex justify-center items-center h-screen text-red-600">
       <AlertCircle className="w-6 h-6 mr-2" />
       <span>{error}</span>
     </div>
   );
 }

 return (
   <div className="space-y-6 p-6">
     <div className="flex justify-between items-center">
       <div>
         <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
         <p className="mt-1 text-sm text-gray-500">
           Manage product categories and subcategories
         </p>
       </div>
       <button
         onClick={() => {
           setSelectedCategory(null);
           setShowModal(true);
         }}
         className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
       >
         <Plus className="w-5 h-5 mr-2" />
         Add Category
       </button>
     </div>

     <div className="flex items-center space-x-4">
       <div className="relative flex-grow max-w-md">
         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
         <input
           type="text"
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
           placeholder="Search categories..."
           className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
         />
       </div>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       {filteredCategories.map((category) => (
         <div
           key={category._id}
           className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
         >
           <div className="relative aspect-w-16 aspect-h-9 bg-gray-200">
           {category.image ? (
  <img
    src={`${process.env.REACT_APP_API_URL}/images/categories/${category.image}`}
    alt={category.name}
    className="object-cover w-full h-full"
    onError={(e) => {
      e.target.onerror = null; 
      e.target.src = 'placeholder.jpg'; // gambar default jika error
    }}
  />
) : (
  <div className="flex items-center justify-center w-full h-full">
    <ImageIcon className="w-12 h-12 text-gray-400" />
  </div>
)}
</div>
           <div className="p-4">
             <div className="flex items-center justify-between">
               <h3 className="text-lg font-semibold text-gray-900">
                 {category.name}
               </h3>
               <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(category.status)}`}>
                 {category.status}
               </span>
             </div>
             <p className="mt-1 text-sm text-gray-500">
               {category.description}
             </p>
             <div className="mt-4 flex items-center justify-between">
               <span className="text-sm text-gray-500">
                 {category.productCount} products
               </span>
               <div className="flex items-center space-x-2">
                 <button
                   onClick={() => {
                     setSelectedCategory(category);
                     setShowModal(true);
                   }}
                   className="p-1 text-indigo-600 hover:text-indigo-900 rounded-full hover:bg-gray-100"
                 >
                   <Edit className="w-5 h-5" />
                 </button>
                 <button
                   onClick={() => handleDelete(category._id)}
                   className="p-1 text-red-600 hover:text-red-900 rounded-full hover:bg-gray-100"
                 >
                   <Trash2 className="w-5 h-5" />
                 </button>
                 <button
                   className="p-1 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
                 >
                   <MoreVertical className="w-5 h-5" />
                 </button>
               </div>
             </div>
           </div>
         </div>
       ))}
     </div>

     {showModal && (
       <CategoryModal
         category={selectedCategory}
         onSave={handleSave}
         onClose={() => {
           setShowModal(false);
           setSelectedCategory(null);
         }}
       />
     )}
   </div>
 );
};

export default CategoryManager;
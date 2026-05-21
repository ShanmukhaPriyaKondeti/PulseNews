import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const categoriesList = [
    'Sports', 'Films', 'Politics', 'Education', 
    'Health', 'Technology', 'International', 'Crime', 'Entertainment'
];

export default function CategorySelection() {
    const { user, token, updateUserPreferences } = useAuth();
    const [selectedCategories, setSelectedCategories] = useState(user?.preferences || []);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const toggleCategory = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleSave = async () => {
        if (!token) return setError('You are not logged in.');
        try {
            const response = await fetch('https://pulsenews-gf40.onrender.com/api/users/preferences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ preferences: selectedCategories })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.msg || 'Failed to save preferences');

            updateUserPreferences(data.preferences);
            navigate('/dashboard'); // Redirect to news dashboard
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold mb-6">Select Your News Categories</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categoriesList.map(category => (
                    <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-4 py-2 border rounded-md font-semibold ${
                            selectedCategories.includes(category) 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-800'
                        }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
            <button
                onClick={handleSave}
                className="mt-6 px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
            >
                Save Preferences
            </button>
        </div>
    );
}

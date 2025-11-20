import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function NewsDashboard() {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, token, logout } = useAuth();

    useEffect(() => {
        const fetchNews = async () => {
            if (!token) {
                setError("You are not logged in.");
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/news', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    if (response.status === 401) {
                        logout(); // token invalid, log out
                        return;
                    }
                    throw new Error(data.msg || 'Failed to fetch news');
                }

                // If articles exist, set them; otherwise set empty array
                setNews(Array.isArray(data.articles) ? data.articles : []);
            } catch (err) {
                console.error('News fetch error:', err);
                setError('Could not fetch news at this time. Please try again later.');
                setNews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [token, logout]);

    const ArticleCard = ({ article }) => (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
            {article.image && (
                <img 
                    src={article.image} 
                    alt={article.title} 
                    className="w-full h-48 object-cover" 
                    onError={(e) => e.target.style.display = 'none'} 
                />
            )}
            <div className="p-4">
                <span className="text-xs font-semibold text-gray-500">{article.source?.name || 'Unknown'}</span>
                <h3 className="text-lg font-bold mt-1 text-gray-800">{article.title}</h3>
                <p className="text-sm text-gray-600 mt-2">{article.description}</p>
                <div className="mt-4 flex justify-between items-center">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 font-semibold text-sm">
                        Know More &rarr;
                    </a>
                    <span className="text-xs text-gray-400">
                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ''}
                    </span>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="text-center mt-20">Loading news...</div>;

    return (
        <div className="bg-gray-100 min-h-screen">
            <header className="bg-white shadow-md sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-3xl font-extrabold text-gray-800">
                        <span className="text-blue-500">Pulse</span>News
                    </h1>
                    <div className="flex items-center">
                        <span className="text-gray-700 mr-4">Welcome, {user?.email || 'User'}!</span>
                        <button 
                            onClick={logout}
                            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4">
                <h2 className="text-2xl font-bold text-gray-700 mb-4">Your Feed</h2>

                {error && <p className="text-center text-red-500 mb-4">{error}</p>}

                {news.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {news.map((article, idx) => (
                            <ArticleCard key={idx} article={article} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 mt-10">
                        {error ? 'Unable to fetch news.' : 'No news articles found for your preferences. Please select categories first.'}
                    </p>
                )}
            </main>
        </div>
    );
}

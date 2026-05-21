import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function NewsDashboard() {

    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { token, logout } = useAuth();

    useEffect(() => {

        const fetchNews = async () => {

            try {

                setLoading(true);
                setError('');

                const response = await fetch('https://pulsenews-gf40.onrender.com/api/news', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {

                    if (response.status === 401) {
                        logout();
                        return;
                    }

                    throw new Error(data.msg || 'Unable to fetch news.');
                }

                setNews(data.articles || []);

            } catch (err) {

                console.error(err.message);

                setError('Could not fetch news at this time. Please try again later.');

            } finally {

                setLoading(false);
            }
        };

        if (token) {
            fetchNews();
        }

    }, [token, logout]);



    const ArticleCard = ({ article }) => (

        <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition duration-300">

            {article.image && (
                <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                        e.target.style.display = 'none';
                    }}
                />
            )}

            <div className="p-4">

                <span className="text-sm text-blue-600 font-semibold">
                    {article.source?.name}
                </span>

                <h2 className="text-xl font-bold mt-2 text-gray-800">
                    {article.title}
                </h2>

                <p className="text-gray-600 mt-2">
                    {article.description}
                </p>

                <div className="mt-4 flex justify-between items-center">

                    <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 font-semibold hover:text-blue-700"
                    >
                        Know More →
                    </a>

                    <span className="text-sm text-gray-400">
                        {new Date(article.publishedAt).toLocaleDateString()}
                    </span>

                </div>

            </div>

        </div>
    );



    return (

        <div className="min-h-screen bg-gray-100">

            <header className="bg-white shadow-md sticky top-0 z-50">

                <div className="container mx-auto px-4 py-4 flex justify-between items-center">

                    <h1 className="text-3xl font-bold text-gray-800">
                        <span className="text-blue-500">Pulse</span>News
                    </h1>

                    <button
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                    >
                        Logout
                    </button>

                </div>

            </header>



            <main className="container mx-auto p-6">

                <h2 className="text-2xl font-bold text-gray-700 mb-6">
                    Your Personalized News Feed
                </h2>

                {loading && (
                    <div className="text-center text-lg text-blue-600">
                        Loading news...
                    </div>
                )}

                {error && (
                    <div className="text-center text-red-500 font-semibold">
                        {error}
                    </div>
                )}

                {!loading && !error && news.length === 0 && (
                    <div className="text-center text-gray-500">
                        No news found.
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                    {news.map((article, index) => (
                        <ArticleCard
                            key={index}
                            article={article}
                        />
                    ))}

                </div>

            </main>

        </div>
    );
}
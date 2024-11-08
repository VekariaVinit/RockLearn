import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './home.css';
import { FaGithub, FaDownload } from 'react-icons/fa';

const HomePage = () => {
    const [repoNames, setRepoNames] = useState([]);
    const [repoDetails, setRepoDetails] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [suggestions, setSuggestions] = useState([]);

    const fetchAllRepos = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:3001/home');
            const data = await response.json();

            if (data && Array.isArray(data.repoNames) && Array.isArray(data.metadata)) {
                setRepoNames(data.repoNames);
                setRepoDetails(data.metadata);
            } else {
                setError('Invalid data format from server');
            }
        } catch (error) {
            setError('Error fetching repositories');
            console.error('Error fetching repositories:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async (query) => {
        if (query.trim() === '') {
            fetchAllRepos();
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`http://localhost:3001/api/metadata/search?q=${query}`);
            const data = await response.json();

            if (data && Array.isArray(data)) {
                setRepoNames(data.map(item => item.title || ''));
                setSuggestions(data);
            } else {
                setRepoNames([]);
                setSuggestions([]);
            }
        } catch (error) {
            setError('Error fetching repositories');
            console.error('Error fetching repositories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (searchQuery.trim() === '') {
            fetchAllRepos();
        } else {
            fetchData(searchQuery);
        }
    }, [searchQuery]);

    const getInitials = (repoName) => {
        if (typeof repoName !== 'string' || repoName.trim() === '') {
            return '';
        }

        const words = repoName.split(' ');
        return words.length > 1
            ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
            : repoName[0].toUpperCase();
    };

    return (
        <div className="min-h-screen text-white">
            <Header />
            <div className="content-area w-5/6 p-6 mx-auto">
                <h1 className="text-5xl font-bold mb-8 text-center text-red-500">Repositories</h1>

                {/* Search Box UI */}
                <div className="mb-4 flex justify-center relative">
                    <input
                        type="text"
                        placeholder="Search repositories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border p-3 rounded-lg shadow-lg w-1/2 text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Search repositories"
                    />
                    {searchQuery && suggestions.length > 0 && (
                        <div className="absolute top-12 w-1/2 bg-white shadow-lg max-h-60 overflow-auto z-10 border border-gray-300 rounded-lg">
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className="p-3 cursor-pointer hover:bg-gray-200"
                                    onClick={() => {
                                        setSearchQuery(suggestion.title || suggestion.tags.join(', ') || '');
                                        setSuggestions([]);  // Clear suggestions on selection
                                    }}
                                >
                                    <Link to={`/lab/${suggestion.title}`} className="block text-red-500 hover:text-red-600">
                                        <div>{suggestion.title || 'No title'}</div>
                                        {suggestion.tags && Array.isArray(suggestion.tags) && suggestion.tags.length > 0 ? (
                                            <div className="text-sm text-gray-600 mt-1">
                                                Tags: {suggestion.tags.join(', ')}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-gray-600 mt-1">No tags available</div>
                                        )}

                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                {loading && <div className="text-center">Loading...</div>}
                {repoNames.length === 0 && !loading && searchQuery.trim() !== '' && (
                    <div className="text-center text-red-500">No repositories found</div>
                )}

                {/* Repositories List */}
                <div className="repo-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
                    {repoNames.length === 0 && !loading && searchQuery.trim() === '' ? (
                        <div className="text-center">No repositories available</div>
                    ) : (
                        repoDetails.map((repo, index) => (
                            <div
                                key={repo.title || index}
                                className="repo-card p-6 bg-gray-50 text-white rounded-lg shadow-lg hover:shadow-2xl transform transition-transform hover:scale-105"
                            >
                                <Link to={`/lab/${repo.title}`} className="block text-center">
                                    <div className="w-32 h-32 mb-4 mx-auto flex justify-center items-center rounded-full bg-red-500 text-white text-3xl font-bold">
                                        {getInitials(repo.title)}
                                    </div>
                                    <h3 className="text-xl font-semibold text-black">{repo.title}</h3>
                                    {/*<p className="text-gray-500 mt-2">{repo.description}</p>}

                                    {/* Display tags if they exist and are an array */}
                                    {Array.isArray(repo.tags) && repo.tags.length > 0 ? (
                                        <div className="text-sm text-gray-600 mt-1">
                                            Tags: {repo.tags.join(', ')}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-gray-600 mt-1">
                                            {typeof repo.tags === 'string' ? `Tags: ${repo.tags}` : 'No tags available'}
                                        </div>
                                    )}

                                </Link>

                                <div className="mt-4 flex justify-center space-x-6">
                                    <a
                                        href={repo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-black hover:text-red-500 relative group"
                                    >
                                        <FaGithub className="w-6 h-6" />
                                        <span className="tooltip absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 text-xs p-2 bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">View on GitHub</span>
                                    </a>
                                    <a
                                        href={`${repo.url}/archive/refs/heads/main.zip`}
                                        className="text-black hover:text-red-500 relative group"
                                        download
                                    >
                                        <FaDownload className="w-6 h-6" />
                                        <span className="tooltip absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 text-xs p-2 bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity">Download ZIP</span>
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default HomePage;

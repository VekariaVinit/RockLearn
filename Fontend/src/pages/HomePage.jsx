import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import './home.css';
import { FaGithub, FaHeart, FaDownload } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
    const [repoDetails, setRepoDetails] = useState([]);
    // const [userId, setUserId] = useState(null); // State to store user ID
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { isAuthenticated, user } = useAuth(); // Authentication state
    const getToken = () => {
        return localStorage.getItem('TOKEN');
    };

    const fetchAllRepos = async () => {
        setLoading(true);
        setError('');
        try {
            const token = getToken();
            const response = await fetch('http://localhost:3001/home', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data && Array.isArray(data.metadata)) {
                setRepoDetails(data.metadata); // No need to calculate liked status here
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


    // Mark a repository as visited
    const markRepoVisited = async (repoId) => {
        try {
            const token = getToken();
            await fetch(`http://localhost:3001/home/${repoId}/visit`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
        } catch (error) {
            console.error('Error marking repository as visited:', error);
        }
    };

    const handleLike = async (repoId) => {
        if (!user.id) {
            console.error('User ID is not available');
            return;
        }
    
        // Optimistic update: toggle likedByUser and adjust totalLikes
        setRepoDetails((prevDetails) =>
            prevDetails.map((repo) => {
                if (repo._id === repoId) {
                    const likedByUser = !repo.likedByUser; // Toggle liked state
                    return {
                        ...repo,
                        likedByUser,
                        totalLikes: likedByUser ? repo.totalLikes + 1 : repo.totalLikes - 1,
                    };
                }
                return repo;
            })
        );
    
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:3001/home/${repoId}/like`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            const data = await response.json();
    
            if (!data.success) {
                // Revert optimistic update if server call fails
                setRepoDetails((prevDetails) =>
                    prevDetails.map((repo) => {
                        if (repo._id === repoId) {
                            const likedByUser = !repo.likedByUser; // Revert liked state
                            return {
                                ...repo,
                                likedByUser,
                                totalLikes: likedByUser ? repo.totalLikes - 1 : repo.totalLikes + 1,
                            };
                        }
                        return repo;
                    })
                );
            }
        } catch (error) {
            console.error('Error liking/unliking repository:', error);
    
            // Revert optimistic update in case of an error
            setRepoDetails((prevDetails) =>
                prevDetails.map((repo) => {
                    if (repo._id === repoId) {
                        const likedByUser = !repo.likedByUser; // Revert liked state
                        return {
                            ...repo,
                            likedByUser,
                            totalLikes: likedByUser ? repo.totalLikes - 1 : repo.totalLikes + 1,
                        };
                    }
                    return repo;
                })
            );
        }
    };
    

    // Fetch data based on search query
    const fetchData = async (query) => {
        if (query.trim() === '') {
            fetchAllRepos();
            return;
        }

        setLoading(true);
        setError('');
        try {
            const token = getToken();
            const response = await fetch(`http://localhost:3001/api/metadata/search?q=${query}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();

            if (data && Array.isArray(data)) {
                const validRepos = data.filter(repo => repo && repo._id); // Ensure valid repositories
                setRepoDetails(validRepos);
            } else {
                setRepoDetails([]); // No matching repos, so show an empty list
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

                <div className="mb-4 flex justify-center relative">
                    <input
                        type="text"
                        placeholder="Search repositories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="border p-3 rounded-lg shadow-lg w-1/2 text-black focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Search repositories"
                    />
                </div>

                {error && <div className="text-red-500 text-center mb-4">{error}</div>}
                {loading && <div className="text-center">Loading...</div>}
                <div className="repo-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-4">
                    {repoDetails.map((repo) => {
                        if (!repo || !repo._id) {
                            console.warn('Invalid repository data:', repo);
                            return null;
                        }

                        return (
                            <div
                                key={repo._id}
                                className="repo-card p-6 bg-gray-50 text-white rounded-lg shadow-lg hover:shadow-2xl transform transition-transform hover:scale-105"
                            >
                                <Link
                                    to={`/lab/${repo.title}`}
                                    className="block text-center"
                                    onClick={() => markRepoVisited(repo._id)}
                                >
                                    <div className="w-32 h-32 mb-4 mx-auto flex justify-center items-center rounded-full bg-red-500 text-white text-3xl font-bold">
                                        {getInitials(repo.title)}
                                    </div>
                                    <h3 className="text-xl font-semibold text-black">{repo.title}</h3>
                                    {Array.isArray(repo.tags) && repo.tags.length > 0 ? (
                                        <div className="text-sm text-gray-600 mt-1">Tags: {repo.tags.join(', ')}</div>
                                    ) : (
                                        <div className="text-sm text-gray-600 mt-1">No tags available</div>
                                    )}
                                </Link>
                                <div className="mt-4 flex justify-between items-center">
                                    <button
                                        className={`text-xl ${repo.likedByUser ? 'text-red-400' : 'text-gray-500'}`}
                                        onClick={() => handleLike(repo._id)}
                                    >
                                        <FaHeart />
                                        <span className="ml-2">{repo.totalLikes}</span>
                                    </button>

                                    <a
                                        href={`${repo.url}/archive/refs/heads/main.zip`}
                                        className="text-black hover:text-red-500"
                                        download
                                    >
                                        <FaDownload className="w-6 h-6" />
                                    </a>
                                    <a
                                        href={repo.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-black hover:text-red-500"
                                    >
                                        <FaGithub className="w-6 h-6" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default HomePage;

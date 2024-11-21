import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const Profile = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    const getToken = () => {
        return localStorage.getItem('TOKEN');
    };

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

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = getToken();
                const response = await fetch('http://localhost:3001/user/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    console.error(`Error: ${response.status}`);
                    return;
                }

                const data = await response.json();
                if (data.success) {
                    setUser(data.user);
                } else {
                    console.error('Error fetching profile:', data.message);
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        fetchUserProfile();
    }, []);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-xl text-gray-600">Loading your profile...</p>
            </div>
        );
    }

    const handleLabClick = async (repoId, title) => {
        await markRepoVisited(repoId);
        navigate(`/lab/${title}`);
    };

    return (
        <div className="min-h-screen ">
            <Header />
            <div className="max-w-4xl mx-auto p-6 text-white">
                {/* Profile Info */}
                <div className="bg-white text-gray-800 p-8 rounded-lg shadow-lg">
                    <h1 className="text-4xl font-bold mb-4">{user.name}'s Profile</h1>
                    <p className="text-lg">
                        <strong>Email:</strong> {user.email}
                    </p>
                </div>

                {/* Liked Labs Section */}
                <div className="mt-8">
                    <h2 className="text-3xl font-semibold mb-4 border-b-2 text-black border-white pb-2">Liked Labs</h2>
                    {user.likedLabs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.likedLabs.map((lab) => (
                                <div
                                    key={lab._id}
                                    className="bg-white p-4 rounded-lg shadow-md text-gray-800 hover:scale-105 transform transition-all duration-300"
                                >
                                    <h3 className="text-xl font-bold mb-2">{lab.title}</h3>
                                    <p className="text-gray-600 mb-2">{lab.description}</p>
                                    <small className="text-gray-500 block mb-2">
                                        Likes: {lab.totalLikes} | Visits: {lab.totalVisits}
                                    </small>
                                    <button
                                        onClick={() => handleLabClick(lab._id, lab.title)}
                                        className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                                    >
                                        View Lab
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-lg text-gray-200">You haven't liked any labs yet.</p>
                    )}
                </div>

                {/* Visited Labs Section */}
                <div className="mt-8">
                    <h2 className="text-3xl font-semibold mb-4 border-b-2 text-black border-white pb-2">Visited Labs</h2>
                    {user.visitedLabs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.visitedLabs.map((lab) => (
                                <div
                                    key={lab._id}
                                    className="bg-white p-4 rounded-lg shadow-md text-gray-800 hover:scale-105 transform transition-all duration-300"
                                >
                                    <h3 className="text-xl font-bold mb-2">{lab.title}</h3>
                                    <p className="text-gray-600 mb-2">{lab.description}</p>
                                    <small className="text-gray-500 block mb-2">
                                        Likes: {lab.totalLikes} | Visits: {lab.totalVisits}
                                    </small>
                                    <button
                                        onClick={() => handleLabClick(lab._id, lab.title)}
                                        className="inline-block bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                                    >
                                        View Lab
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-lg text-gray-200">You haven't visited any labs yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;

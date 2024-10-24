import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header'; // Import the Header component
import './home.css'; // Ensure you have the scrollbar hiding styles here

const HomePage = () => {
    const [repoNames, setRepoNames] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3001/home');
                console.log("Response Status:", response.status);
                const data = await response.json();
                console.log("Fetched Data:", data);
                setRepoNames(data.repoNames);
            } catch (error) {
                console.error('Error fetching repositories:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="bg-gray-100 min-h-screen overflow-auto"> {/* Allow scrolling */}
            <Header /> {/* Use the Header component */}
            <div className="content-area w-5/6 p-4 mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">Repositories</h1>
                <div className="repo-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {repoNames.map((repo) => (
                        <div
                            key={repo}
                            className="repo-card flex flex-col items-center border border-gray-300 rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer transform hover:scale-105"
                        >
                            <Link to={`/lab/${repo}`} className="w-full text-center"> {/* Link to LabDetails page */}
                                <img
                                    src="https://via.placeholder.com/150"
                                    alt={`${repo} logo`}
                                    className="w-32 h-32 mb-2 object-cover rounded-full border-2 border-red-500"
                                />
                                <h2 className="text-xl font-bold mb-1 text-red-500">{repo}</h2>
                                <p className="text-gray-600">View on GitHub</p>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;

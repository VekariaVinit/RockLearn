// UploadLabPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import Header from '../components/Header'; // Import the Header component
import { ToastContainer, toast } from 'react-toastify'; // Import toast and ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import toast styles

const Spinner = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
        <div className="loader"></div>
    </div>
);

const UploadLabPage = () => {
    const navigate = useNavigate(); // Initialize navigate for navigation
    const [labName, setLabName] = useState('');
    const [branch, setBranch] = useState('');
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // State for loading

    const handleFileChange = (event) => {
        setFiles(event.target.files);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true); // Start loading

        const formData = new FormData();
        formData.append('labName', labName);
        formData.append('branch', branch);
        Array.from(files).forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch('http://localhost:3001/upload/api/labs', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                toast.success('Lab uploaded successfully!'); // Show success toast
                // Reset form after submission
                setLabName('');
                setBranch('');
                setFiles([]);
            } else {
                toast.error('Failed to upload lab. Please try again.'); // Show error toast
            }
        } catch (error) {
            console.error('Error uploading lab:', error);
            toast.error('An error occurred while uploading the lab. Please try again.'); // Show error toast
        } finally {
            setIsLoading(false); // Stop loading
            // Redirect to home after a short delay
            setTimeout(() => {
                navigate('/home'); // Navigate to home page
            }, 2000);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen">
            <Header />
            <div className="container mx-auto p-6 bg-white rounded-lg shadow-md mt-8 flex flex-col items-center">
                <h1 className="text-3xl font-bold text-center mb-6 text-red-600 pt-4 pb-2">Upload Your Lab Structure</h1>
                <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
                    <div>
                        <label htmlFor="labName" className="block text-gray-700">Lab Name:</label>
                        <input
                            type="text"
                            id="labName"
                            value={labName}
                            onChange={(e) => setLabName(e.target.value)}
                            placeholder="Enter Lab Name"
                            required
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="files" className="block text-gray-700">Upload Files:</label>
                        <input
                            type="file"
                            id="files"
                            webkitdirectory="true" // Fixed to string value
                            mozdirectory="true" // Fixed to string value
                            required
                            multiple
                            onChange={handleFileChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="branch" className="block text-gray-700">Branch Name:</label>
                        <input
                            type="text"
                            id="branch"
                            value={branch}
                            onChange={(e) => setBranch(e.target.value)}
                            placeholder="Enter Branch Name"
                            required
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <button type="submit" className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200 w-full" disabled={isLoading}>
                        {isLoading ? 'Uploading...' : 'Upload Lab'}
                    </button>
                </form>
            </div>
            {isLoading && <Spinner />} {/* Show loader when uploading */}
            <ToastContainer /> {/* Include ToastContainer here */}
        </div>
    );
};

export default UploadLabPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Spinner = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
        <div className="loader"></div>
    </div>
);

const UploadLabPage = () => {
    const navigate = useNavigate();
    const [labName, setLabName] = useState('');
    const [files, setFiles] = useState([]);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;
        const filesWithPath = Array.from(selectedFiles).map(file => {
            const filePath = file.webkitRelativePath || file.name;
            return { file, filePath };
        });
        setFiles(filesWithPath);
    };

    const handleTagInput = (event) => {
        if (event.key === 'Enter' && tagInput.trim() !== '') {
            event.preventDefault();
            setTags(prevTags => [...prevTags, tagInput.trim()]);
            setTagInput('');
        }
    };

    const removeTag = (indexToRemove) => {
        setTags(tags.filter((_, index) => index !== indexToRemove));
    };
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('labName', labName);
        formData.append('tags', JSON.stringify(tags));

        files.forEach(({ file, filePath }) => {
            formData.append('files', file);
            formData.append('filePaths[]', filePath); 
        });

        try {
            const response = await fetch('http://localhost:3001/upload/api/labs', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                toast.success('Lab uploaded successfully!');
                setLabName('');
                setTags([]);
                setFiles([]);
            } else {
                toast.error('Failed to upload lab. Please try again.');
            }
        } catch (error) {
            console.error('Error uploading lab:', error);
            toast.error('An error occurred while uploading the lab. Please try again.');
        } finally {
            setIsLoading(false);
            setTimeout(() => {
                navigate('/home');
            }, 2000);
        }
    };

    const handleLabNameChange = (e) => {
        const value = e.target.value.replace(/\s+/g, '');
        if (/^[a-zA-Z0-9-_]*$/.test(value)) {
            setLabName(value);
        } else {
            alert("Lab name can only contain alphanumeric characters, hyphens, or underscores.");
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
                            onChange={handleLabNameChange}
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
                            directory=""
                            webkitdirectory=""
                            mozdirectory=""
                            required
                            multiple
                            onChange={handleFileChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="tags" className="block text-gray-700">Tags:</label>
                        <input
                            type="text"
                            id="tags"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagInput}
                            placeholder="Enter tags and press Enter"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <span key={index} className="flex items-center bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeTag(index)}
                                        className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                                    >
                                        &times;
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-200 w-full" disabled={isLoading}>
                        {isLoading ? 'Uploading...' : 'Upload Lab'}
                    </button>
                </form>
            </div>
            {isLoading && <Spinner />}
            <ToastContainer />
        </div>
    );
};

export default UploadLabPage;
    
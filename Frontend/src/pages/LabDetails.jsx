import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; 
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

const LabDetails = () => {
    const { repoName } = useParams();
    const [directories, setDirectories] = useState({});
    const [fileContent, setFileContent] = useState('');
    const [openDirectory, setOpenDirectory] = useState(null);

    useEffect(() => {
        const fetchLabData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/lab/${repoName}`);
                const data = await response.json();
                console.log('Lab Data:', data);
                setDirectories(data.directories);
            } catch (error) {
                console.error('Error fetching lab details:', error);
            }
        };

        fetchLabData();
    }, [repoName]);

    const fetchFileContent = async (filePath) => {
        try {
            const response = await fetch(`http://localhost:3001/lab/content/${repoName}/${filePath}`);
            const content = await response.text();
            // Format the content for proper display
            const formattedContent = formatContent(content);
            setFileContent(formattedContent);
        } catch (error) {
            console.error('Error fetching file content:', error);
        }
    };

    const formatContent = (content) => {
        try {
            // Try to parse and stringify the content for pretty printing
            const json = JSON.parse(content);
            return JSON.stringify(json, null, 2); // Pretty print JSON with 2 spaces indentation
        } catch (error) {
            // Return raw content if parsing fails (non-JSON files)
            return content
                .replace(/\\r/g, '') // Remove carriage return
                .replace(/\\n/g, '\n') // Replace newlines
                .replace(/\\"/g, '"') // Replace escaped quotes
                .replace(/\\'/g, "'"); // Replace escaped single quotes
        }
    };

    const toggleDirectory = (dir) => {
        setOpenDirectory(openDirectory === dir ? null : dir);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Header />
            <div className="flex flex-grow">
                {/* Fixed Sidebar */}
                <div className="sidebar bg-white border-r p-4 shadow-lg w-64 h-full overflow-y-auto">
                    <h2 className="text-2xl font-semibold mb-4">Directories</h2>
                    {Object.keys(directories).map((dir) => (
                        <div key={dir} className="mb-4">
                            <h3 
                                className="text-xl font-bold cursor-pointer flex justify-between items-center transition-all duration-300" 
                                onClick={() => toggleDirectory(dir)}
                            >
                                {dir === '' ? 'Root Directory' : dir}
                                <FontAwesomeIcon 
                                    icon={faChevronDown} 
                                    className={`transition-transform duration-300 ${openDirectory === dir ? 'rotate-180' : ''}`} 
                                />
                            </h3>
                            <div 
                                className={`transition-all duration-300 overflow-hidden ${openDirectory === dir ? 'max-h-screen' : 'max-h-0'}`}
                            >
                                <ul className="list-disc pl-4">
                                    {directories[dir].files.map((file) => (
                                        <li
                                            key={file.path}
                                            className="cursor-pointer text-blue-500 hover:underline transition-colors duration-200"
                                            onClick={() => fetchFileContent(file.path)}
                                        >
                                            {file.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
                {/* Content Area */}
                <div className="content-area bg-white p-4 flex-grow shadow-lg rounded-md h-full overflow-auto">
                    <h2 className="text-2xl font-semibold mb-4">File Content</h2>
                    <pre className="whitespace-pre-wrap h-full border p-2 rounded-md bg-gray-50">
                        {fileContent}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default LabDetails;

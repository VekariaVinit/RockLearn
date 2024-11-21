import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { marked } from 'marked';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Link } from 'react-router-dom'; // Add this import for internal links
import { useAuth } from '../context/AuthContext';


const LabDetails = () => {
    const { repoName } = useParams();
    const [directories, setDirectories] = useState({});
    const [fileContent, setFileContent] = useState('');
    const [fileType, setFileType] = useState('text');
    const [openDirectory, setOpenDirectory] = useState(null);
    const [fileName, setFileName] = useState(''); // Track file name for download
    const [sidebarVisible, setSidebarVisible] = useState(true); // For sidebar toggling
    const getToken = () => {
        return localStorage.getItem('TOKEN');
    };
    useEffect(() => {
        const fetchLabData = async () => {
            try {
                const token = getToken();
                const response = await fetch(`http://localhost:3001/lab/${repoName}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                console.log('Lab Data:', data);
                setDirectories(data.directories);
            } catch (error) {
                console.error('Error fetching lab details:', error);
            }
        };

        fetchLabData();
    }, [repoName]);

    const getFileType = (filePath) => {
        const ext = filePath.split('.').pop().toLowerCase();
        if (['txt', 'md', 'js', 'html', 'jsx'].includes(ext)) {
            return 'text';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return 'image';
        } else if (['mp4', 'webm', 'ogg'].includes(ext)) {
            return 'video';
        } else if (['pdf'].includes(ext)) {
            return 'pdf';
        } else {
            return 'unknown';
        }
    };

    const fetchFileContent = async (filePath, download_url) => {
        const type = getFileType(filePath);
        setFileType(type);
        setFileName(filePath.split('/').pop()); // Set file name for download

        if (type === 'image') {
            setFileContent(`<img src="${download_url}" alt="Image" class="max-w-full h-auto rounded" />`);
        } else if (type === 'video') {
            setFileContent(`<video controls class="max-w-full h-auto rounded"><source src="${download_url}" type="video/mp4">Your browser does not support the video tag.</video>`);
        } else if (type === 'pdf') {
            setFileContent(`<iframe src="${download_url}" width="100%" height="600px" class="rounded border-2 border-gray-300"></iframe>`);
        } else {
            try {
                const response = await fetch(download_url);
                if (response.ok) {
                    const content = await response.text();
                    setFileContent(formatContent(content, type));
                } else {
                    setFileContent('Error fetching file content');
                }
            } catch (error) {
                setFileContent('Error fetching file content');
            }
        }
    };

    const formatContent = (content, type) => {
        if (type === 'text' && content.startsWith('{')) {
            try {
                const json = JSON.parse(content);
                return `<pre>${JSON.stringify(json, null, 2)}</pre>`;
            } catch {
                return `<pre>${content}</pre>`;
            }
        } else if (type === 'text') {
            return marked(content);
        } else if (type === 'md') {
            // Custom render for markdown links
            return (
                <ReactMarkdown 
                    remarkPlugins={[remarkGfm]} 
                    components={{
                        a: ({ href, children }) => {
                            // If it's an external link, open in a new tab
                            if (href.startsWith('http')) {
                                return (
                                  <a href={href} target="_blank" rel="noopener noreferrer">
                                    {children}
                                  </a>
                                );
                            }
                            // For internal React Router links
                            return (
                              <Link to={href}>
                                {children}
                              </Link>
                            );
                        },
                    }}
                >
                    {content}
                </ReactMarkdown>
            );
        } else {
            return `<pre>${content}</pre>`;
        }
    };

    const toggleDirectory = (dir) => {
        setOpenDirectory(openDirectory === dir ? null : dir);
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(`http://localhost:3001/download/${repoName}/${fileName}`);
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        setSidebarVisible(!sidebarVisible); // Toggles between visible and hidden
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <Header />
            <div className="flex flex-grow">
                <div 
                    className={`sidebar bg-white border-r p-4 shadow-lg w-64 flex-shrink-0 h-full overflow-y-auto transition-all duration-300 ${sidebarVisible ? 'block' : 'hidden'} md:block`}
                >
                    <button
                        onClick={toggleSidebar}
                        className="text-xl text-gray-500 sm:hidden block mb-4"
                    >
                        Toggle Sidebar
                    </button>
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
                                            onClick={() => fetchFileContent(file.path, file.download_url)}
                                        >
                                            {file.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="content-area bg-white p-4 flex-grow shadow-lg rounded-md h-full overflow-auto">
                    <div>
                    <button
                    onClick={toggleSidebar}
                    className={`fixed bottom-4 right-4 bg-blue-500 text-white rounded-full p-2 md:hidden ${sidebarVisible ? 'hidden' : 'block'}`}
                    >
                    Show Sidebar
                    </button>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">File Content</h2>
                        <button
                            onClick={handleDownload}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition w-full sm:w-auto"
                        >
                            Download File
                        </button>
                    </div>
                    <div id="file-content" className="whitespace-pre-wrap border p-2 rounded-md bg-gray-50 h-full">
                        {fileType === 'text' || fileType === 'md' ? (
                            <div dangerouslySetInnerHTML={{ __html: fileContent }} />
                        ) : (
                            <div dangerouslySetInnerHTML={{ __html: fileContent }} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LabDetails;
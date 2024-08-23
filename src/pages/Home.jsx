import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, SearchIcon, BookmarkIcon, UsersIcon, UserIcon, FolderGitIcon, ExternalLinkIcon, SaveIcon, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/";
import Login from './Login';

export default function Home() {
    const [username, setUsername] = useState('');
    const [users, setUsers] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [incompleteResults, setIncompleteResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [savedUsers, setSavedUsers] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [btnText, setBtnText] = useState({});
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setLoggedInUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
    };
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(`https://api.github.com/search/users?q=${username}`);
            const data = await response.json();
            const usersWithDetails = await Promise.all(
                data.items.map(async user => {
                    const userDetailsResponse = await fetch(user.url);
                    const userDetails = await userDetailsResponse.json();
                    return {
                        ...user,
                        followersCount: userDetails.followers,
                        followingCount: userDetails.following,
                        publicReposCount: userDetails.public_repos,
                    };
                })
            );
            setUsers(usersWithDetails);
            setTotalCount(data.total_count);
            setIncompleteResults(data.incomplete_results);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
        setLoading(false);
    };

    const viewProfile = (url) => {
        window.open(url, '_blank');
    }

    const saveUserToLocal = (user) => {
        let savedUsers = JSON.parse(localStorage.getItem("savedUsers")) || [];
        const isUserAlreadySaved = savedUsers.some(savedUser => savedUser.id === user.id);

        if (isUserAlreadySaved) {
            toast("This User is already in saved collection", {
                icon: '🤝',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
                position: 'top-center'
            })
            return;
        }
        savedUsers.push(user);
        localStorage.setItem("savedUsers", JSON.stringify(savedUsers));
        toast.success("user saved successfully");
        setBtnText(prevState => ({
            ...prevState,
            [user.id]: "Saved"
        }))
    };

    return (
        <>
            {loggedInUser ? (
                <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
                    <header className="bg-white shadow">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Github className="mr-2 h-6 w-6" />
                                Git User Details
                            </h1>
                            <div className="flex items-center space-x-4">
                                <Link to="/savedUsers" className="inline-flex items-center">
                                    <Button variant="outline">
                                        <BookmarkIcon className="mr-2 h-4 w-4" />
                                        View Saved Users
                                    </Button>
                                </Link>
                                <Button variant="outline" onClick={handleLogout} className="flex items-center space-x-2">
                                    <LogOut className="h-4 w-4" />
                                    <span>Logout</span>
                                </Button>
                            </div>
                        </div>
                    </header>

                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex space-x-4 mb-8">
                            <Input
                                type="text"
                                placeholder="Search GitHub username"
                                className="flex-grow"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <Button onClick={fetchUsers}>
                                <SearchIcon className="mr-2 h-4 w-4" />
                                Search
                            </Button>
                        </div>

                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold mb-4">Total Users Found: {totalCount}</h2>
                                {incompleteResults && <p className="text-red-500">Results may be incomplete.</p>}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {users.map(user => (
                                        <Card key={user.id} className="overflow-hidden">
                                            <CardHeader className="pb-0">
                                                <div className="flex items-center space-x-4">
                                                    <img
                                                        src={user.avatar_url}
                                                        alt={`${user.login}'s avatar`}
                                                        width={64}
                                                        height={64}
                                                        className="rounded-full"
                                                    />
                                                    <CardTitle>{user.login}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="pt-4 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        <UserIcon className="mr-2 h-4 w-4 text-blue-500" />
                                                        <span>Following: {user.followingCount}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <UsersIcon className="mr-2 h-4 w-4 text-green-500" />
                                                        <span>Followers: {user.followersCount}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <FolderGitIcon className="mr-2 h-4 w-4 text-purple-500" />
                                                    <span>Repositories: {user.publicReposCount}</span>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex justify-between">
                                                <Button variant="outline" onClick={() => viewProfile(user.html_url)}>
                                                    <ExternalLinkIcon className="mr-2 h-4 w-4" />
                                                    View Profile
                                                </Button>
                                                <Button onClick={() => saveUserToLocal(user)} key={user.id}>
                                                    <SaveIcon className="mr-2 h-4 w-4" />
                                                    {btnText[user.id] || "Save User"}
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </>
                        )}
                    </main>
                </div>
            ) : (<Login />)}

        </>
    );
}

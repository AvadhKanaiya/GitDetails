import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, UsersIcon, UserIcon, FolderGitIcon, ExternalLinkIcon, TrashIcon, HomeIcon, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase/";
import Login from './Login';
export default function SavedUser() {
    const [savedUsers, setSavedUsers] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState(null);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setLoggedInUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
    };
    useEffect(() => {
        const users = JSON.parse(localStorage.getItem('savedUsers')) || [];
        console.log(users); // Check the structure of the retrieved data
        setSavedUsers(users);
    }, []);

    const handleRemoveUser = (userId) => {
        const updatedUsers = savedUsers.filter(user => user.id !== userId);
        setSavedUsers(updatedUsers);
        localStorage.setItem('savedUsers', JSON.stringify(updatedUsers));
    };

    const viewProfile = (url) => {
        window.open(url, '_blank');
    }

    return (
        <>
            {
                loggedInUser ? (
                    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
                        <header className="bg-white shadow">
                            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                    <Github className="mr-2 h-6 w-6" />
                                    Git Details - Saved Users
                                </h1>
                                <div className="flex items-center space-x-4">
                                    <Link to="/" className="inline-flex items-center">
                                        <Button variant="outline">
                                            <HomeIcon className="mr-2 h-4 w-4" />
                                            Back to Home
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedUsers.length === 0 ? (
                                    <p>No saved users found.</p>
                                ) : (
                                    savedUsers.map((user) => (
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
                                                        <span>Following: {user.followingCount || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <UsersIcon className="mr-2 h-4 w-4 text-green-500" />
                                                        <span>Followers: {user.followersCount || 'N/A'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <FolderGitIcon className="mr-2 h-4 w-4 text-purple-500" />
                                                    <span>Repositories: {user.publicReposCount || 'N/A'}</span>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex justify-between">
                                                <Button variant="outline" as="a" onClick={() => viewProfile(user.html_url)} >
                                                    <ExternalLinkIcon className="mr-2 h-4 w-4" />
                                                    View Profile
                                                </Button>
                                                <Button variant="destructive" onClick={() => handleRemoveUser(user.id)}>
                                                    <TrashIcon className="mr-2 h-4 w-4" />
                                                    Remove
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </main>
                    </div>
                ) : (
                    <Login />
                )
            }

        </>
    );
}

import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import './Home.css';

const serverUrl = 'https://passanger-meal.onrender.com';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${serverUrl}/login`, { username, password });
            console.log('Login successful:', response.data);
            localStorage.setItem('token', response.data.token);
            navigate('/home'); // Redirect to home page after successful login
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    return (
        <div className='main-login-container'>
            <div className='login-container'>
                <h2>Login</h2>
                <form className='login-form' onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                    <p>* Press login button for testing the app</p>
                    <h1>Please wait for login. Redirect is low because of slow server</h1>
                </form>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </div>
        </div>
    );
};

export default LoginPage;

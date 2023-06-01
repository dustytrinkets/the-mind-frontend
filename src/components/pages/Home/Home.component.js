import './Home.component.css';
import axios from 'axios';
import env from "react-dotenv";
import { useState } from 'react';
import { useNavigate, generatePath } from 'react-router-dom';

const Home = () => {
    const [name, setName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    let navigate = useNavigate();
    const handleChange = (event) => {
        setName(event.target.value);
    };

    const routeChange = (roomCode) => {
        console.log('roomId:', roomCode)

        const path = generatePath('/room/:id', { id: roomCode });
        console.log('PATH:', path)
        navigate(path);
    }

    const createGame = async () => {
        try {
            if (!name) {
                throw new Error('Name is required');
            }
            console.log('Creating user')
            const { data: user } = await axios.post(`${env.API_URL}/users`, { name: name });
            console.log('User created. ID:', user.id)
            console.log('Creating room')
            const { data: room } = await axios.post(`${env.API_URL}/rooms`, { creator: user.id });
            console.log(room)
            routeChange(room.code)
            // const userRoom = await axios.post(`${env.API_URL}/user-room`, user.id); //maybe this can be done when entering the room view
        } catch (error) {
            setErrorMessage(error.message)
        }
    };

    return (
        <div className="Screen">
            <h1>
                The Mind
            </h1>
            <input
                className="name-input"
                type="text"
                id="name"
                name="name"
                onChange={handleChange}
                placeholder="Enter your name"
            />
            {errorMessage && <div className="error"> {errorMessage} </div>}
            <button onClick={createGame}>
                Create New Room
            </button>
            <button onClick={createGame}>
                Join Room
            </button>
        </div>
    );
}

export default Home;

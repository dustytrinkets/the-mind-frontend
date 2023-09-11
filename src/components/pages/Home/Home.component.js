import { useEffect, useState } from 'react';
import { useNavigate, generatePath } from 'react-router-dom';

import './Home.component.css';

import { usersAPI, roomsAPI, roomUsersAPI } from '../../../api';
import { socketComponent } from '../../../socket';

import { PiCirclesThreePlusBold } from 'react-icons/pi'

const Home = () => {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinRoomActive, setJoinRoomActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [socket, setSocket] = useState(socketComponent);

  let navigate = useNavigate();
  const nameChange = (event) => {
    setName(event.target.value);
  };

  const roomCodeChange = (event) => {
    setRoomCode(event.target.value);
  };

  const routeChange = (room, user) => {
    try {

      console.log('entering route change with room -->', room.code)
      const path = generatePath('/room/:id', { id: room.code });
      navigate(path, {
        id: room.code,
        state: {
          userName: name,
          userId: user.id,
          roomId: room.id
        }
      });
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  const createRoomUser = async ({room, user}) => {
    try {
      await roomUsersAPI.createRoomUser(room, user);
    } catch (error) {
      setErrorMessage(error.message)
    }
  };

  const sendNameSocket = ({roomId, name})=>{
    console.log('sendNameSocket: ', roomId, name)
    socket?.emit('roomuser', {roomId, name, roomCode});
  }

  const generateAndJoinRoom = async () => {
    try {
      const user = await usersAPI.createUser(name)
      const room = await roomsAPI.createRoom(user.id)
      await createRoomUser({room, user})
      console.log('-------userid: ', user)
      sendNameSocket({roomId: room.id, name})
      setRoomCode(room.code)
      routeChange(room, user)
    } catch (error) {
      setErrorMessage(error.message)
    }
  };

  const joinRoom = async () => {
    try {
      if (!joinRoomActive){
        setJoinRoomActive(true)
        return
      }
      const room = await roomsAPI.getRoomByCode(roomCode)
      const users = await roomUsersAPI.getRoomUsers(room.id)
      if (!room.code) {
        throw Error('Room code is required');
      }
      if (room.status === 'playing') {
        throw Error('Try joining in the next round. A game is already in progress');
      }

      if (users.some(user => user.name.toLowerCase() === name.toLowerCase())) {
        throw Error('Name already exists in room');
      }
      const user = await usersAPI.createUser(name)
      await createRoomUser({room, user})
      console.log(`Entering room ${roomCode}`)
      sendNameSocket({roomId: room.id, name})
      routeChange(room, user)
    } catch (error) {
      setErrorMessage(error.message)
    }
  };

  useEffect(() => {
    const newSocket = socketComponent;
    setSocket(newSocket);
  }, [setSocket]);

  return (
    <div className="Screen">
      <h1>
        The Mind
      </h1>
      <input
        className="generic-input"
        type="text"
        id="name"
        name="name"
        onChange={nameChange}
        placeholder="Enter your name"
      />
      {!joinRoomActive? <button onClick={generateAndJoinRoom}>
        Create New Room
      </button> : <input
        className="generic-input"
        type="text"
        id="roomCode"
        name="roomCode"
        onChange={roomCodeChange}
        placeholder="Enter room code"
      />}
      <button onClick={joinRoom}>
        <PiCirclesThreePlusBold /> 
        Join Room
      </button>
      {errorMessage && <div className="error"> {errorMessage} </div>}
    </div>
  );
}

export default Home;

import { useEffect, useState } from 'react';
import { useNavigate, generatePath } from 'react-router-dom';

import './Home.component.css';

import { usersAPI, roomsAPI, roomUsersAPI } from '../../../api';
import { socketComponent } from '../../../socket';

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
      if (!room.code) {
        throw Error('Room code is required');
      }
      //avoid enter if room status is playing
      if (room.status === 'playing') {
        throw Error('Try joining in the next round. A game is already in progress');
      }

      //avoid enter if room is full
      if (room.users.length >= 10) {
        throw Error('Room is full');
      }

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

  const generateAndJoinRoom = async () => {
    try {
      const user = await usersAPI.createUser(name)
      const room = await roomsAPI.createRoom(user.id)
      await createRoomUser({room, user})
      console.log('-------userid: ', user)
      sendNameSocket(name)
      setRoomCode(room.code)
      routeChange(room, user)
    } catch (error) {
      setErrorMessage(error.message)
    }
  };

  const sendNameSocket = (name)=>{
    console.log('sendNameSocket: ', name)
    socket?.emit('roomuser', name);
  }

  const joinRoom = async () => {
    try {
      if (!joinRoomActive){
        setJoinRoomActive(true)
        return
      }
      const room = await roomsAPI.getRoomByCode(roomCode)
      const user = await usersAPI.createUser(name)
      await createRoomUser({room, user})
      console.log(`Entering room ${roomCode}`)
      sendNameSocket(name)
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
      </button> : null}
      {joinRoomActive? <input
        className="generic-input"
        type="text"
        id="roomCode"
        name="roomCode"
        onChange={roomCodeChange}
        placeholder="Enter room code"
      />: null}
      <button onClick={joinRoom}>
        Join Room
      </button>
      {errorMessage && <div className="error"> {errorMessage} </div>}
    </div>
  );
}

export default Home;

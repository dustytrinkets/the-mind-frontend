import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from "react-router-dom";
import { useNavigate, generatePath } from 'react-router-dom';
import Cookies from 'universal-cookie';

import './Room.component.css';

import { socketComponent } from '../../../socket';
import { roomUsersAPI, roomsAPI, gamesAPI, participationsAPI } from '../../../api';

const Room = () => {
  const { id: roomCode } = useParams();
  const params = useLocation();
  const roomId = params?.state?.roomId
  const userId = params?.state?.userId
  const [socket, setSocket] = useState(socketComponent);
  const [name, setName] = useState(params?.state?.userName);
  const [creator, setCreator] = useState();
  const [roomUsers, setRoomUsers] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  let navigate = useNavigate();

  const cookies = new Cookies();
  cookies.set('userId', userId, { path: '/' });

  const fetchUsers = useCallback(async ()=> {
    const roomUsers = await roomUsersAPI.getRoomUsers(roomId)
    console.log('roomUsers: ', roomUsers)
    setRoomUsers(roomUsers);
  }, [roomId])

  // code for removing user if window closes
  // window.addEventListener("beforeunload", (ev) => {
  //   ev.preventDefault();
  //   console.log('EV---', ev)
  //   //send socket disconnect before leaving
  //   // this.server.emit('roomuser', 'test');
  //   // socket.emit('user_leave', {user_name: "johnjoe123"});
  //   // return ev.returnValue = 'Are you sure you want to close?Help';
  // });

  const loadGame = useCallback(async ({gameId, numbers}) => {
    // console.log('GAME STARTED')

    if (!gameId) {
      gameId = await gamesAPI.getActiveGameId(roomId)
      numbers = await participationsAPI.getGameNumbers(gameId)
    }
    // console.log('+++++++---->  gameId: ', gameId)
    // console.log('+++++++---->  numbers: ', numbers)
    const path = generatePath('game/:gameId', { roomId, gameId: gameId });
    navigate(path, {
      state: {
        roomId,
        roomCode,
        gameId,
        userId,
        roomUsers: roomUsers.map(user => user.name),
        numbers,
        userName: name
      }
    });
  }, [navigate, roomId, roomCode, userId, roomUsers, name])

  const startNewGame = useCallback(async () => {
    try {
      const game = await gamesAPI.createGame(roomId, roomUsers)
      // console.log('newGame: ', game)
      // console.log('---------numbers: ', game.numbers)
      socket.emit('startgame', { roomCode , id: game.id, numbers: game.numbers })
      loadGame({gameId: game.id, numbers: game.numbers})
    } catch (error) {
      setErrorMessage(error.message)
    }
  }, [roomUsers])

  const start = async () => {
    try {
      console.log('-----', roomUsers.length)
      if (roomUsers.length < 2) {
        throw Error('You need at least 2 players to start a game')
      }
      await startNewGame()
    } catch (error) {
      setErrorMessage(error.message)
    }
  }

  useEffect(() => {
    socket.on('startgame', loadGame);
    return () => {
      socket.off('startgame', loadGame);
    }
  }, [socket, name, loadGame])

  const getRoomCreator = async () => {
    const creator = await roomsAPI.getRoomCreator(roomId)
    setCreator(creator)
  }

  useEffect(() => {
    socket.on('roomuser', fetchUsers);
    return () => {
      socket.off('roomuser', fetchUsers);
    }
  }, [fetchUsers, socket, name])

  useEffect(() => {
    const newSocket = socketComponent;
    setSocket(newSocket);
  }, [setSocket, name])

  useEffect(() => {
    if (!name) {
      const path = generatePath('/');
      navigate(path);
    }
    setName(name);
    fetchUsers();
    getRoomCreator()
  }, [name, navigate]);

  return (
    <div className="Screen">
      <h1>
        The Mind
      </h1>
      <div className='table-container'>
        <table>
          <thead>
            <tr>
              <th scope="col" align="center">Room #{roomCode}</th>
            </tr>
          </thead>
          <tbody>
            {roomUsers.map((user) => (
              <tr key={user.id}>
                <td className={(user.id === userId? 'me' : 'normal')}>{user.id === creator?.id ? '🧠' : ''} {user.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {creator?.id === userId && (
        <button onClick={start}>Start Game</button>
      )}
    {errorMessage && <div className="error"> {errorMessage} </div>}
    </div>
    
  );
}

export default Room;

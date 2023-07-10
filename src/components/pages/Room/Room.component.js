import { useEffect, useState, useCallback } from 'react';
import { useParams, useLocation } from "react-router-dom";
import { useNavigate, generatePath } from 'react-router-dom';
import Cookies from 'universal-cookie';

import './Room.component.css';

import { socketComponent } from '../../../socket';
import { roomUsersAPI, roomsAPI, gamesAPI } from '../../../api';

const Room = () => {
  const { id: roomCode } = useParams();
  const params = useLocation();
  const roomId = params?.state?.roomId
  const userId = params?.state?.userId
  const [socket, setSocket] = useState(socketComponent);
  const [name, setName] = useState(params?.state?.userName);
  const [creator, setCreator] = useState();
  const [roomUsers, setRoomUsers] = useState([]);
  let navigate = useNavigate();

  const cookies = new Cookies();
  cookies.set('userId', userId, { path: '/' });

  const fetchUsers = useCallback(async ()=> {
    const roomUsers = await roomUsersAPI.getRoomUsers(roomId)
    console.log('roomUsers: ', roomUsers)
    setRoomUsers(roomUsers);
  })

  // code for removing user if window closes
  // window.addEventListener("beforeunload", (ev) => {
  //   ev.preventDefault();
  //   console.log('EV---', ev)
  //   //send socket disconnect before leaving
  //   this.server.emit('roomuser', 'test');
  //   socket.emit('user_leave', {user_name: "johnjoe123"});
  //   return ev.returnValue = 'Are you sure you want to close?Help';
  // });

  const loadGame = async (gameId) => {
    console.log('GAME STARTED')
    //get game id
    if (!gameId) {
      gameId = await gamesAPI.getCreatedGameId(roomId)
    }
    console.log('gameId: ', gameId)
    const path = generatePath('game/:gameId', { roomId, gameId: gameId });
    navigate(path, {
      state: {
        roomId,
        roomCode,
        gameId,
        userId,
        userName: name
      }
    });
  }

  const startNewGame = () => {
    return async () => {
      const game = await gamesAPI.createGame(roomId)
      console.log('newGame: ', game)
      socket.emit('startgame', game.id)
      loadGame(game.id)
    }
  }

  useEffect(() => {
    socket.on('startgame', loadGame);
    return () => {
      socket.off('startgame', loadGame);
    }
  }, [fetchUsers, socket, name])

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
        <button onClick={startNewGame()}>Start Game</button>
      )}
    </div>
  );
}

export default Room;

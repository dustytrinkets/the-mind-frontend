import React, { useCallback, useState } from 'react';
import { useLocation } from "react-router-dom";

import './Game.component.css';
import { useEffect } from "react";

import { socketComponent } from '../../../socket';
import { roomsAPI, gamesAPI, participationsAPI } from '../../../api';


const Game = () => {
  const params = useLocation();
  console.log('params: ', params)
  const { gameId, roomId, roomCode, userId, roomUsers, userName } = params?.state;
  const [randomNumber, setRandomNumber] = useState(null)
  const [socket, setSocket] = useState(socketComponent);


  const updateStatuses = async () => {
    await roomsAPI.updateRoomStatus(roomId, 'playing')
    await gamesAPI.updateGameStatus(gameId, 'active')
  }

  const getUserNumber = useCallback(async () => {
    const participation = await participationsAPI.getParticipationByGameAndUser({userId, gameId})
    setRandomNumber(participation.number)
    console.log('----------number: ', participation.number)
  })

  const revealUserNummber = useCallback(({ roomId: currentRoomId, userName, randomNumber }) => {
    // todo check if this can be done using the socket rooms
    if (currentRoomId !== roomId) {
      return
    }
    console.log('revealUserNummber: ', { roomCode, userName, userId, randomNumber })
  }, [roomId, roomCode, userId])

  const sendNumber = async () => {
    socket.emit('sendnumber', { roomId, userName , userId, randomNumber })
  }

  useEffect(() => {
    socket.on('sendnumber', revealUserNummber)
    return () => {
      socket.off('sendnumber', revealUserNummber);
    }
  }, [socket, revealUserNummber])

  useEffect(() => {
    getUserNumber()
    updateStatuses()
  }, [gameId, roomId, updateStatuses])


  useEffect(() => {
    const newSocket = socketComponent;
    setSocket(newSocket);
  }, [setSocket])


  return (
    <div className="Screen">
      <div className="room-code flex-center">
        Room #{roomCode}
      </div>
      <div className='the-mind-title'>
        <h1>
          The Mind
        </h1>
      </div>
      <div className="players flex-center">
        {roomUsers.map((user, index) => (user !== userName) ?
        <div className='player'>
          <div key={index}>
            <div className='user-name'>{user}</div>
          </div>
          <div className='circle flex-center'>
            <div className='number'>?</div>
          </div>
        </div>: null)}
      </div>

      <div className='last-played flex-center'>
        <div className='last-played-title'>Last number played</div>
        <div className='circle flex-center'>
          <div className='number'>?</div>
        </div>
      </div>

      <div className="user">
        <div className='user-name'>{userName}</div>
        <div className='circle flex-center' onClick={sendNumber}>
          <div className='number'>{randomNumber}</div>
        </div>
      </div>
    </div>
  );
}

export default Game;

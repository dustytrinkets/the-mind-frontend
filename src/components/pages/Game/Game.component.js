import React, { useCallback, useState } from 'react';
import { useLocation } from "react-router-dom";

import './Game.component.css';
import { useEffect } from "react";

import { socketComponent } from '../../../socket';
import { roomsAPI, gamesAPI, participationsAPI } from '../../../api';


const Game = () => {
  const params = useLocation();
  const { gameId, roomId, roomCode, userId, roomUsers, userName } = params?.state;
  const [randomNumber, setRandomNumber] = useState(null)
  const [socket, setSocket] = useState(socketComponent);
  const [lastNumberPlayed, setLastNumberPlayed] = useState(null)
  const [order, setOrder] = useState(0)


  const updateStatuses = async () => {
    await roomsAPI.updateRoomStatus(roomId, 'playing')
    await gamesAPI.updateGameStatus(gameId, 'active')
  }

  const getUserNumber = useCallback(async () => {
    const participation = await participationsAPI.getParticipationByGameAndUser({userId, gameId})
    setRandomNumber(participation.number)
  }, [gameId, userId])

  const revealUserNumber = useCallback(({ userIdPlayed, userNamePlayed, numberPlayed }) => {
    console.log('revealUserNumber: ', { userIdPlayed, userNamePlayed, numberPlayed })
    if (userIdPlayed === userId) {
      return
    }
    const userDiv = document.getElementById(userNamePlayed)
    const numberDiv = userDiv.getElementsByClassName('number')[0]
    numberDiv.innerHTML = numberPlayed
  }, [userId])


  const revealPlay = useCallback(({ roomId: currentRoomId, userId: userIdPlayed, userName: userNamePlayed, randomNumber: numberPlayed}) => {
    // todo check if this can be done using the socket rooms
    if (currentRoomId !== roomId) {
      return
    }
    revealUserNumber({ userIdPlayed, userNamePlayed, numberPlayed })
    setLastNumberPlayed(numberPlayed)
    console.log('order: ', order)
    setOrder(order + 1)
  }, [roomId, order, revealUserNumber])

  const sendNumber = async () => {
    socket.emit('sendnumber', { roomId, userName , userId, randomNumber })
    console.log('sendnumber: ', {  gameId, userId, order })
    await participationsAPI.updateParticipation({ gameId, userId, order })
  }

  useEffect(() => {
    socket.on('sendnumber', revealPlay)
    return () => {
      socket.off('sendnumber', revealPlay);
    }
  }, [socket, revealPlay])

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
        <div className='player' id={user}>
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
          <div className='number'>
            {lastNumberPlayed ? lastNumberPlayed : '?'}
          </div>
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

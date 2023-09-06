import React, { useCallback, useState } from 'react';
import { useLocation } from "react-router-dom";

import './Game.component.css';
import { useEffect } from "react";

import { socketComponent } from '../../../socket';
import { roomsAPI, gamesAPI, participationsAPI } from '../../../api';


const Game = () => {
  const params = useLocation();
  const { gameId, roomId, roomCode, userId, roomUsers, userName } = params?.state;
  const [userRandomNumber, setUserRandomNumber] = useState(0)
  const [socket, setSocket] = useState(socketComponent);
  const [currentNumberPlayed, setCurrentNumberPlayed] = useState(0)
  const [order, setOrder] = useState(0)
  const [gameStatus, setGameStatus] = useState('active')
  const [playedNumbers, setPlayedNumbers] = useState([])

  const updateStatuses = useCallback(async ({roomStatus, gameStatus}) => {
    await roomsAPI.updateRoomStatus(roomId, roomStatus)
    await gamesAPI.updateGameStatus(gameId, gameStatus)
  }, [roomId, gameId])

  const getUserNumber = useCallback(async () => {
    const participation = await participationsAPI.getParticipationByGameAndUser({userId, gameId})
    setUserRandomNumber(participation.number)
  }, [gameId, userId, setUserRandomNumber])

  const revealUserNumber = useCallback(({ userIdSent, userNameSent, numberSent }) => {
    // console.log('revealUserNumber: ', { userIdPlayed, userNamePlayed, currentNumberPlayed })
    if (userIdSent === userId) {
      return
    }
    const userDiv = document.getElementById(userNameSent)
    const numberDiv = userDiv.getElementsByClassName('number')[0]
    numberDiv.innerHTML = numberSent
  }, [userId])

  const revealPlay = useCallback(({ roomIdSent, userIdSent, userNameSent, numberSent}) => {
    // todo check if this can be done using the socket rooms
    if (roomIdSent !== roomId) {
      return
    }
    revealUserNumber({ userIdSent, userNameSent, numberSent })
    setCurrentNumberPlayed(numberSent)
    setOrder(order + 1)
    if ( userRandomNumber < numberSent && !playedNumbers.includes(userRandomNumber)) {
      console.warn('LOSE', { roomId, roomCode, id: gameId })
      socket.emit('lose', { roomId, roomCode, id: gameId })
    }
    setPlayedNumbers([...playedNumbers, numberSent])
    if (playedNumbers.length === roomUsers.length - 1) {
      console.warn('WIN', { roomId, roomCode, id: gameId })
      socket.emit('win', { roomId, roomCode, id: gameId })
    }
  }, [roomId, revealUserNumber, order, userRandomNumber, playedNumbers, socket, roomCode, gameId])

  const sendNumber = async () => {
    if (playedNumbers.includes(userRandomNumber)) {
      return
    }
    socket.emit('sendnumber', { roomId, userName , userId, userRandomNumber })
    await participationsAPI.updateParticipation({ gameId, userId, order })
  }

  const gameOver = useCallback( async ({ roomIdSent, gameIdSent }) => {
    // console.warn('gameOver: ', { roomIdSent, gameIdSent })
    // todo check if this can be done using the socket rooms
    if (roomIdSent !== roomId) {
      return
    }
    setGameStatus('lose')
    await updateStatuses({ roomStatus: 'created', gameStatus: 'lose'})
    // todo: set room back to available and move users view to it
  }, [roomId, updateStatuses])

  const gameSuccess = useCallback( async ({ roomIdSent, gameIdSent }) => {
    // console.warn('gameSuccess: ', { roomIdSent, gameIdSent })
    // todo check if this can be done using the socket rooms
    if (roomIdSent !== roomId) {
      return
    }
    setGameStatus('win')
    await updateStatuses({ roomStatus: 'created', gameStatus: 'win'})
  }, [roomId, updateStatuses])


  useEffect(() => {
    socket.on('sendnumber', revealPlay)
    return () => {
      socket.off('sendnumber', revealPlay);
    }
  }, [socket, revealPlay])


  useEffect(() => {
    socket.on('lose', gameOver)
    return () => {
      socket.off('lose', gameOver);
    }
  }, [socket, revealPlay, gameOver])

  useEffect(() => {
    socket.on('win', gameSuccess)
    return () => {
      socket.off('win', gameSuccess);
    }
  }, [socket, revealPlay, gameSuccess])


  useEffect(() => {
    console.log('------Game useEffect')
    getUserNumber()
    updateStatuses({ roomStatus: 'playing', gameStatus: 'active'})
  }, [currentNumberPlayed, gameId, getUserNumber, roomId, updateStatuses, userRandomNumber])


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
            {currentNumberPlayed ? currentNumberPlayed : '?'}
          </div>
        </div>
      </div>

      <div className="user">
        <div className='user-name'>{userName}</div>
        <div className='circle flex-center' onClick={sendNumber}>
          <div className='number'>{userRandomNumber}</div>
        </div>
      </div>
      <div>
        {gameStatus !== 'active' ? <h1>{gameStatus}</h1> : ''}
      </div>
    </div>
  );
}

export default Game;

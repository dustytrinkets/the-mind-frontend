import React, { useCallback, useState } from 'react';
import { useLocation } from "react-router-dom";

import './Game.component.css';
import { useEffect } from "react";

import { socketComponent } from '../../../socket';
import { roomsAPI, gamesAPI, participationsAPI } from '../../../api';


const Game = () => {
  const params = useLocation();
  const { gameId, roomId, roomCode, userId, roomUsers, userName } = params?.state;
  const [userRandomNumber, setUserRandomNumber] = useState(1)
  const [socket, setSocket] = useState(socketComponent);
  const [currentNumberPlayed, setCurrentNumberPlayed] = useState(0)
  const [order, setOrder] = useState(0)
  const [playedNumbers, setPlayedNumbers] = useState([])
  const [gameStatus, setGameStatus] = useState('active')

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
      return
    }
    setPlayedNumbers([...playedNumbers, numberSent])
    if (playedNumbers.length === roomUsers.length - 1) {
      console.warn('WIN', { roomId, roomCode, id: gameId })
      socket.emit('win', { roomId, roomCode, id: gameId })
    }
  }, [roomId, revealUserNumber, order, userRandomNumber, playedNumbers, roomUsers.length, roomCode, gameId, socket])

  const sendNumber = async (e) => {
    if (gameStatus !== 'active') {
      return
    }
    const userDiv = e.target
    userDiv.classList.add('played')
    userDiv.removeEventListener('click', sendNumber)
    if (playedNumbers.includes(userRandomNumber)) {
      return
    }
    socket.emit('sendnumber', { roomId, userName , userId, userRandomNumber })
    await participationsAPI.updateParticipation({ gameId, userId, order })
  }

  const uncoverUserNumbers = useCallback(async () => {
    const participations = await participationsAPI.getParticipationNumbersByGameId({ gameId })
    console.log('participation: ', participations)
    participations.forEach(participation => {
      if (userName !== participation.user.name) {
        const userDiv = document.getElementById(participation.user.name)
        const numberDiv = userDiv.getElementsByClassName('number')[0]
        numberDiv.innerHTML = participation.number
        // todo find highest and not null order
        const highestOrderParticipation = participations.filter(participation => participation.order !== null).reduce((prev, current) => (prev.order > current.order) ? prev : current)
        console.log('highestOrder: ', highestOrderParticipation)
        const lastUserDiv = document.getElementById(highestOrderParticipation?.user.name)
        const lastNumberCircle = lastUserDiv?.getElementsByClassName('circle')[0]
        console.log('.--------------------------: ', lastNumberCircle)
        lastNumberCircle?.classList.add('lose-pointer')
      }
    })

  }, [gameId, userName])

  const gameOver = useCallback( async ({ roomIdSent }) => {
    // todo check if this can be done using the socket rooms
    if (roomIdSent !== roomId) {
      return
    }
    setGameStatus('lose')
    const screen = document.getElementsByClassName('Screen')[0]
    screen.classList.add('lose')
    await uncoverUserNumbers()
    await updateStatuses({ roomStatus: 'finished', gameStatus: 'lose'})
  }, [roomId, updateStatuses])

  const gameSuccess = useCallback( async ({ roomIdSent }) => {
    // todo check if this can be done using the socket rooms
    if (roomIdSent !== roomId) {
      return
    }
    setGameStatus('win')
    const screen = document.getElementsByClassName('Screen')[0]
    screen.classList.add('win')
    await updateStatuses({ roomStatus: 'finished', gameStatus: 'win'})
  }, [roomId, updateStatuses])

  const retry = async () => {
    // todo retry logic
  }

  const backToRoom = async () => {
    // todo back to room logic
  }

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
      {gameStatus !== 'active' &&
      <div className="action-buttons flex-center">
        <button onClick={retry}>{gameStatus === 'win' ? 'New game' : 'Try again'}</button>
        <button onClick={backToRoom}>Back to room</button>
      </div>}

    </div>
  );
}

export default Game;

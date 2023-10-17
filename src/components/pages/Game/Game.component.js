import React, { useCallback, useState } from 'react';
import { useLocation } from "react-router-dom";

import './Game.component.css';
import { useEffect } from "react";

import { socketComponent } from '../../../socket';
import { roomsAPI, gamesAPI, participationsAPI } from '../../../api';
import { useNavigate, generatePath } from 'react-router-dom';

import { BiSolidHome } from 'react-icons/bi';
import { PiCirclesThreePlusBold } from 'react-icons/pi'
import { MdLoop } from 'react-icons/md'


const Game = () => {
  const params = useLocation();
  const { gameId, roomId, roomCode, userId, roomUsers, userName, creator } = params?.state;
  const [userRandomNumber, setUserRandomNumber] = useState(0)
  const [socket, setSocket] = useState(socketComponent);
  const [currentNumberPlayed, setCurrentNumberPlayed] = useState(0)
  const [order, setOrder] = useState(0)
  const [playedNumbers, setPlayedNumbers] = useState([])
  const [gameStatus, setGameStatus] = useState('active')

  let navigate = useNavigate();

  const updateStatuses = useCallback(async ({ roomStatus, gameStatus }) => {
    await roomsAPI.updateRoomStatus(roomId, roomStatus)
    await gamesAPI.updateGameStatus(gameId, gameStatus)
  }, [roomId, gameId])

  const getUserNumber = useCallback(async () => {
    const participation = await participationsAPI.getParticipationByGameAndUser({ userId, gameId })
    setUserRandomNumber(participation.number)
  }, [gameId, userId, setUserRandomNumber])

  const revealUserNumber = useCallback(({ userIdSent, userNameSent, numberSent }) => {
    if (userIdSent === userId) {
      return
    }
    const userDiv = document.getElementById(userNameSent)
    const numberDiv = userDiv.getElementsByClassName('number')[0]
    numberDiv.innerHTML = numberSent
  }, [userId])

  const revealPlay = useCallback(({ roomIdSent, userIdSent, userNameSent, numberSent }) => {
    // todo check if this can be done using the socket rooms
    if (roomIdSent !== roomId) {
      return
    }
    revealUserNumber({ userIdSent, userNameSent, numberSent })
    setCurrentNumberPlayed(numberSent)
    setOrder(order + 1)
    if (userRandomNumber < numberSent && !playedNumbers.includes(userRandomNumber)) {
      console.warn('-------LOSE')
      socket.emit('lose', { roomId, roomCode, id: gameId })
      return
    }
    setPlayedNumbers([...playedNumbers, numberSent])
    console.warn('-------userNameSent', userNameSent)
    console.warn('-------numberSent', numberSent)
    console.warn('-------playedNumbers', playedNumbers)
    console.warn('-------roomUsers.length', roomUsers.length)
    console.warn(playedNumbers.length === roomUsers.length - 1)
    if (playedNumbers.length === roomUsers.length - 1) {
      console.warn('-------WIN')
      socket.emit('win', { roomId, roomCode, id: gameId })
    }
  }, [roomId, revealUserNumber, order, userRandomNumber, playedNumbers, roomUsers.length, roomCode, gameId, socket])

  const restartGame = () => {
    setOrder(0)
    setPlayedNumbers([])
    setGameStatus('active')
    setCurrentNumberPlayed(0)
    const userDiv = document.getElementById(userName)
    userDiv.classList.remove('played')
    userDiv.addEventListener('click', sendNumber)
    const screen = document.getElementsByClassName('Screen')[0]
    screen.classList.remove('win')
    screen.classList.remove('lose')
    const circles = document.getElementsByClassName('circle')
    console.log('circles', circles)
    Array.from(circles).forEach(circle => circle.classList.remove('lose-pointer'))
  }

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
    socket.emit('sendnumber', { roomId, userName, userId, userRandomNumber })
    await participationsAPI.updateParticipation({ gameId, userId, order })
  }

  const uncoverUserNumbers = useCallback(async () => {
    const participations = await participationsAPI.getParticipationNumbersByGameId({ gameId })
    participations?.forEach(participation => {
      if (userName !== participation.user.name) {
        const userDiv = document.getElementById(participation.user.name)
        const numberDiv = userDiv.getElementsByClassName('number')[0]
        numberDiv.innerHTML = participation.number
        const highestOrderParticipation = participations?.filter(participation => participation.order !== null)?.reduce((prev, current) => (prev.order > current.order) ? prev : current)
        const lastUserDiv = document.getElementById(highestOrderParticipation?.user.name)
        const lastNumberCircle = lastUserDiv?.getElementsByClassName('circle')[0]
        lastNumberCircle?.classList.add('lose-pointer')
      }
    })

  }, [gameId, userName])

  const gameOver = useCallback(async ({ roomIdSent }) => {
    // todo check if this can be done using the socket rooms
    if (roomIdSent !== roomId) {
      return
    }
    setGameStatus('lose')
    const screen = document.getElementsByClassName('Screen')[0]
    screen.classList.add('lose')
    await uncoverUserNumbers()
    await updateStatuses({ roomStatus: 'finished', gameStatus: 'lose' })
  }, [roomId, updateStatuses])

  const gameSuccess = useCallback(async ({ roomIdSent }) => {
    // todo check if this can be done using the socket rooms
    if (roomIdSent !== roomId) {
      return
    }
    setGameStatus('win')
    const screen = document.getElementsByClassName('Screen')[0]
    screen.classList.add('win')
    await updateStatuses({ roomStatus: 'finished', gameStatus: 'win' })
  }, [roomId, updateStatuses])

  const playAgainSocket = useCallback(async () => {
    // todo check if this can be done using the socket rooms
    restartGame()
    const newGame = await gamesAPI.createGame(roomId, roomUsers)
    socket.emit('playagain', { roomId, roomCode, newGameId: newGame.id })
    socket.emit('startgame', { roomId, roomCode, id: newGame.id })
  }, [roomId, roomCode, socket])

  const playAgain = useCallback(async ({ roomIdSent, newGameIdSent }) => {
    console.log('playAgain', roomIdSent, newGameIdSent)
    if (roomIdSent !== roomId) {
      return
    }
    restartGame()
    const path = generatePath('room/:roomCode/game/:gameId', { roomCode, gameId: newGameIdSent });
    navigate(`../${path}`, {
      replace: true,
      state: {
        roomId,
        roomCode,
        gameId: newGameIdSent,
        userId,
        creator,
        roomUsers,
        userName
      }
    });
  }, [roomId, roomCode, userId, creator, roomUsers, userName, socket, navigate])

  const backToRoomSocket = useCallback(async () => {
    socket.emit('backtoroom', { roomId })
  }, [roomId, roomCode, socket])

  const backToRoom = useCallback(async ({ roomIdSent }) => {
    if (roomIdSent !== roomId) {
      return
    }
    const path = generatePath('room/:roomCode', { roomCode });
    navigate(`../${path}`, {
      replace: true,
      state: {
        roomId,
        roomCode,
        userId,
        creator,
        roomUsers,
        userName
      }
    });
  }, [roomId, roomCode, userId, creator, roomUsers, userName, socket])

  const backToHome = async () => {
    const path = generatePath('/');
    navigate(`../${path}`, {
      replace: true,
    });
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
    socket.on('backtoroom', backToRoom)
    return () => {
      socket.off('backtoroom', backToRoom);
    }
  }, [socket, backToRoom])

  useEffect(() => {
    socket.on('playagain', playAgain)
    return () => {
      socket.off('playagain', playAgain);
    }
  }, [socket, backToRoom])


  useEffect(() => {
    socket.on('win', gameSuccess)
    return () => {
      socket.off('win', gameSuccess);
    }
  }, [socket, revealPlay, gameSuccess])


  useEffect(() => {
    getUserNumber()
    updateStatuses({ roomStatus: 'playing', gameStatus: 'active' })
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
        {roomUsers.map(user => user.name).map((user, index) => (user !== userName) ?
          <div className='player' id={user}>
            <div key={index}>
              <div className='user-name'>{user}</div>
            </div>
            <div className='circle flex-center'>
              <div className='number'>?</div>
            </div>
          </div> : null)}
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
        <div id={userName} className='circle flex-center' onClick={sendNumber}>
          <div className='number'>{userRandomNumber}</div>
        </div>
      </div>
      {gameStatus !== 'active' &&
        <div className={gameStatus === 'win' ? 'win-action-bg action-buttons flex-center' : 'lose-action-bg action-buttons flex-center'}>
          {creator.id === userId && (
            <>
              <button className="circular-button" onClick={playAgainSocket}>
                <MdLoop />
              </button>
              <button className="circular-button" onClick={backToRoomSocket}>
                <PiCirclesThreePlusBold />
              </button>
            </>
          )}
          <button className="circular-button" onClick={backToHome}>
            <BiSolidHome />
          </button>
        </div>}

    </div>
  );
}

export default Game;

import axios from 'axios';
import env from "react-dotenv";

export const createGame = async (roomId, users) => {
  try {
      console.debug('Creating Game')
      const { data: game } = await axios.post(`${env.API_URL}/games`, {room: roomId, numPlayers: users.length, players: users.map(user => user.id) });
      console.debug('Created Game')
      return game;
  } catch (error) {
      throw Error(error.message)
  }
}

//change to get game by any status
export const getActiveGameId = async (roomId) => {
  try {
      console.debug('Getting active game')
      const { data: game } = await axios.get(`${env.API_URL}/games/active/${roomId}`);
      console.debug('Got active game', game)
      return game.id;
  } catch (error) {
      throw Error(error.message)
  }
}

export const updateGameStatus = async (gameId, status) => {
  try {
      console.debug('Updating Game Status', gameId, status)
      const { data: game } = await axios.patch(`${env.API_URL}/games/${gameId}`, { status });
      if (!game) {
        console.debug('Game not found')
        throw new Error('Game not found');
      }
      console.debug('Updated game status', game)
      return game;
  } catch (error) {
      throw Error(error.message)
  }
}

export const getRandomNumbers = async (gameId) => {
  try {
      console.debug('Getting random numbers')
      const { data: numbers } = await axios.get(`${env.API_URL}/games/random/${gameId}`);
      console.debug('Got random numbers', numbers)
      return numbers;
  } catch (error) {
      throw Error(error.message)
  }
}
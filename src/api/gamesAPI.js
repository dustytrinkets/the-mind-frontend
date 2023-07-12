import axios from 'axios';
import env from "react-dotenv";

export const createGame = async (roomId, numPlayers) => {
  try {
      console.log('Creating Game')
      const { data: game } = await axios.post(`${env.API_URL}/games`, {room: roomId, numPlayers });
      console.log('Created Game')
      return game;
  } catch (error) {
      throw Error(error.message)
  }
}

//change to get game by any status
export const getActiveGameId = async (roomId) => {
  try {
      console.log('Getting active game')
      const { data: game } = await axios.get(`${env.API_URL}/games/active/${roomId}`);
      console.log('Got active game', game)
      return game.id;
  } catch (error) {
      throw Error(error.message)
  }
}

export const updateGameStatus = async (gameId, status) => {
  try {
      console.log('Updating Game Status', gameId, status)
      const { data: game } = await axios.patch(`${env.API_URL}/games/${gameId}`, { status });
      if (!game) {
        console.log('Game not found')
        throw new Error('Game not found');
      }
      console.log('Updated game status', game)
      return game;
  } catch (error) {
      throw Error(error.message)
  }
}
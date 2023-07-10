import axios from 'axios';
import env from "react-dotenv";

export const createGame = async (roomId) => {
  try {
      console.log('Creating Game')
      const { data: game } = await axios.post(`${env.API_URL}/games`, {roomId: roomId});
      console.log('Created Game')
      return game;
  } catch (error) {
      throw Error(error.message)
  }
}

export const getCreatedGameId = async (roomId) => {
  try {
      console.log('Getting created game')
      const { data: game } = await axios.get(`${env.API_URL}/games/created/${roomId}`);
      console.log('Got created game')
      return game.id;
  } catch (error) {
      throw Error(error.message)
  }
}

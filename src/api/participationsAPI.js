import axios from 'axios';
import env from "react-dotenv";

export const getGameNumbers = async (gameId) => {
  try {
      console.log('Getting game numbers')
      const { data: game } = await axios.get(`${env.API_URL}/participations/${gameId}`);
      console.log('Got game numbers')
      return game.numbers;
  } catch (error) {
      throw Error(error.message)
  }
}
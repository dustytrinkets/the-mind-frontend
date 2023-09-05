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

export const getParticipationByGameAndUser = async ({gameId, userId}) => {
  try {
      console.log(`Getting game number for user ${userId}, game ${gameId}`)
      const { data: participation } = await axios.get(`${env.API_URL}/participations/${gameId}/${userId}`);
      console.log('Got game number for user', participation)
      return participation;
  } catch (error) {
      throw Error(error.message)
  }
}
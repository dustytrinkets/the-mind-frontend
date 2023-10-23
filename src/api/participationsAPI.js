import axios from 'axios';
import env from "react-dotenv";

export const getParticipationByGameAndUser = async ({gameId, userId}) => {
  try {
      console.debug(`Getting game number for user ${userId}, game ${gameId}`)
      const { data: participation } = await axios.get(`${env.API_URL}/participations/${gameId}/${userId}`);
      console.debug('Got game number for user', participation)
      return participation;
  } catch (error) {
      throw Error(error.message)
  }
}

export const updateParticipation = async ({ gameId, userId, order }) => {
  try {
      console.debug(`Setting play for user ${userId}, game ${gameId}`)
      const { data: participation } = await axios.put(`${env.API_URL}/participations`, { game_id: gameId, user_id: userId, order });
      console.debug('Set play for user', participation)
      return participation;
  }
  catch (error) {
      throw Error(error.message)
  }
}

export const getParticipationNumbersByGameId = async ({ gameId }) => {
  try {
      console.debug(`Getting game numbers for game ${gameId}`)
      const { data: participations } = await axios.get(`${env.API_URL}/participations/${gameId}`);
      console.debug('Got game numbers for game', participations)
      return participations;
  } catch (error) {
      throw Error(error.message)
  }
}
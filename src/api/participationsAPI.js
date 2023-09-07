import axios from 'axios';
import env from "react-dotenv";

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

export const updateParticipation = async ({ gameId, userId, order }) => {
  try {
      console.log(`Setting play for user ${userId}, game ${gameId}`)
      const { data: participation } = await axios.put(`${env.API_URL}/participations`, { game_id: gameId, user_id: userId, order });
      console.log('Set play for user', participation)
      return participation;
  }
  catch (error) {
      throw Error(error.message)
  }
}

export const getParticipationNumbersByGameId = async ({ gameId }) => {
  try {
      console.log(`Getting game numbers for game ${gameId}`)
      const { data: participations } = await axios.get(`${env.API_URL}/participations/${gameId}`);
      console.log('Got game numbers for game', participations)
      return participations;
  } catch (error) {
      throw Error(error.message)
  }
}
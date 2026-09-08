import axios from 'axios';
const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';

const setSpotifyAuthHeader = () => {
  try {
    const params = JSON.parse(localStorage.getItem('params'));
    if (params) {
      // sets auth header for all future requests
      axios.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${params.access_token}`;
    }
  } catch (error) {
    console.log('Error setting auth', error);
  }
};

export const getCurrentlyPlaying = () => {
  setSpotifyAuthHeader();
  const response = axios.get(
    'https://api.spotify.com/v1/me/player/currently-playing'
  );
  return response;
};

export const getRecommendations = async (seedTrackId) => {
  if (!seedTrackId) {
    return { data: null };
  }

  setSpotifyAuthHeader();

  try {
    var response = await axios.get(`${SPOTIFY_BASE_URL}/recommendations`, {
      params: {
        seed_tracks: seedTrackId,
      },
    });

    if (!response?.data?.tracks?.length) {
      return { data: null };
    }

    const firstRecommendationSongId = response.data.tracks[0].id;

    response = await axios.get(
      `${SPOTIFY_BASE_URL}/tracks/${firstRecommendationSongId}`,
      {
        params: {
          seed_tracks: seedTrackId,
        },
      }
    );

    return response;
  } catch (error) {
    console.warn('Spotify recommendation request failed:', error?.response?.status || error?.message);
    return { data: null };
  }
};

export const queueSong = (id) => {
  setSpotifyAuthHeader();
  const uri = `spotify:track:${id}`;
  const response = axios.post(
    `https://api.spotify.com/v1/me/player/queue?uri=${uri}`
  );

  return response;
};

export const playNextSong = async () => {
  const response = axios.post('https://api.spotify.com/v1/me/player/next');

  return response;
};

export const queueAndPlayNextSong = async (id) => {
  await queueSong(id);
  const response = playNextSong();

  return response;
};

export const getAllPlaylists = () => {
  setSpotifyAuthHeader();
  const url = 'https://api.spotify.com/v1/me/playlists';
  const response = axios.get(url);

  return response;
};

export const getSongLyrics = async (songName, artist) => {
  const url = `http://localhost:8000/lyrics/${artist}/${songName}`;
  console.log('hitting: ', url);
  return axios.get(url);
};

export const getMusicVideo = async (songName, artist) => {
  delete axios.defaults.headers.common['Authorization'];

  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY; // see .env file (may have to create one if just cloned repo)

  const url = 'https://www.googleapis.com/youtube/v3/search';

  return axios.get(url, {
    params: {
      part: 'snippet',
      maxResults: 5,
      key: apiKey,
      q: songName + ' ' + artist,
    },
  });
};

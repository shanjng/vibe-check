import React, { useEffect, useState } from 'react';
import { isValidSession } from '../utils/functions';
import { getCurrentlyPlaying, getRecommendations } from '../utils/API';
import { useNavigate } from 'react-router-dom';
import CurrentlyPlayingSection from '../components/Sections/CurrentlyPlayingSection';
import RecommendedSection from '../components/Sections/RecommendedSection';
import LyricsSection from '../components/Sections/LyricsSection';
import MusicVideoSection from '../components/Sections/MusicVideoSection';
import './HomePage.css';
import _ from 'lodash';
// import ReactFullpage from '@fullpage/react-fullpage';
import updownkeys from '../assets/up-down-keys.png';

const HomePage = () => {
  const [currentlyPlayingSong, setCurrentlyPlayingSong] = useState({
    type: 'Now Playing',
    name: 'No Song Playing',
    artists: [],
    imageUrl: '',
  });
  const [recommendedSong, setRecommendedSong] = useState({
    type: 'Recommended',
    name: '',
    id: '',
    artists: [],
    imageUrl: '',
  });
  const [mouseIdle, setMouseIdle] = useState(false);
  // const [firstLoaded, setFirstLoaded] = useState(false);
  // const [secondLoaded, setSecondLoaded] = useState(false);
  // const [thirdLoaded, setThirdLoaded] = useState(false);
  // const sectionStates = { currentlyPlaying: firstLoaded, recommended: secondLoaded, lyrics: thirdLoaded };
  // const setters = { currentlyPlaying: setFirstLoaded, recommended: setSecondLoaded, lyrics: setThirdLoaded };

  const navigate = useNavigate();

  useEffect(() => console.log('Rerendering Home Page'));

  useEffect(() => {
    const updateSongs = async () => {
      const isValidSessionBool = isValidSession();

      if (!isValidSessionBool) {
        navigate('/login');
        return;
      }

      let result;

      try {
        result = await getCurrentlyPlaying();
      } catch (error) {
        console.warn('Spotify current track request failed:', error?.response?.status || error?.message);
        setCurrentlyPlayingSong({
          type: 'Now Playing',
          name: 'No Song Playing',
          artists: [],
          imageUrl: '',
        });
        setRecommendedSong({
          type: 'Recommended',
          name: '',
          id: '',
          artists: [],
          imageUrl: '',
        });
        return;
      }

      var incomingSong = {};

      if (
        !result?.data ||
        result.data === '' ||
        result.data.currently_playing_type === 'unknown' ||
        !result.data.item
      ) {
        incomingSong = {
          type: 'Now Playing',
          name: 'No Song Playing',
          artists: [],
          imageUrl: '',
        };
      } else {
        var songJSONPath = result.data.item;
        incomingSong = {
          type: 'Now Playing',
          name: songJSONPath.name,
          id: songJSONPath.id,
          artists: songJSONPath.artists.map((artist) => artist.name + ' '),
          imageUrl:
            songJSONPath.album.images[songJSONPath.album.images.length - 3].url,
        };
      }

      if (!_.isEqual(incomingSong, currentlyPlayingSong)) {
        if (!incomingSong.id) {
          setCurrentlyPlayingSong(incomingSong);
          setRecommendedSong({
            type: 'Recommended',
            name: '',
            id: '',
            artists: [],
            imageUrl: '',
          });
          return;
        }

        result = await getRecommendations(incomingSong.id);

        if (!result?.data) {
          setCurrentlyPlayingSong(incomingSong);
          setRecommendedSong({
            type: 'Recommended',
            name: '',
            id: '',
            artists: [],
            imageUrl: '',
          });
          return;
        }

        const songJSONPath = result.data;

        const incomingRecommendation = {
          type: 'Recommended',
          name: songJSONPath.name,
          id: songJSONPath.id,
          artists: songJSONPath.artists.map((artist) => artist.name + ' '),
          imageUrl:
            songJSONPath.album.images[songJSONPath.album.images.length - 3].url,
        };

        setCurrentlyPlayingSong(incomingSong);
        setRecommendedSong(incomingRecommendation);
      }
    };

    updateSongs();

    const timer = setInterval(updateSongs, 1000);

    return () => clearInterval(timer);
  }, [currentlyPlayingSong, navigate]);

  var timer;
  const handleMouseMove = (e) => {
    setMouseIdle(false);
    // clear previous timer
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      setMouseIdle(true);
    }, 3000);
  };

  // const handleLoaded = name => {
  //     if(sectionStates[name] !== true) {
  //         setters[name](true);
  //         if(firstLoaded === true && secondLoaded === true && thirdLoaded === true)
  //             // window.scrollTo(0, 0);
  //             return;
  //     }
  // }

  return (
    <div
      className={'home' + (mouseIdle ? ' mouse-idle' : ' mouse-active')}
      onMouseMove={(e) => handleMouseMove(e)}
    >
      <div className="scroll-container">
        <CurrentlyPlayingSection
          className="section"
          song={currentlyPlayingSong}
        />
        <RecommendedSection className="section" song={recommendedSong} />
        {/* COMMENT THIS OUT IT BLOCKS OTHER SECTIONS <LyricsSection className="section" song={currentlyPlayingSong} /> */}
        <MusicVideoSection
          className="section"
          song={currentlyPlayingSong}
        ></MusicVideoSection>
      </div>
      <div className="updownkeys-img">
        <img src={updownkeys} alt="" />
      </div>
    </div>
  );
};

export default HomePage;

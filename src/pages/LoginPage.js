import React, { useEffect } from 'react';
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateRandomString,
  getRedirectUri,
  isValidSession,
  storeCodeVerifier,
} from '../utils/functions';
import QueryString from 'query-string';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import logo from '../assets/anime-girl-music.png';
// import * as GiIcons from 'react-icons/gi';

const LoginPage = () => {
  var scope =
    'user-read-private user-read-email user-read-currently-playing user-modify-playback-state';
  var state = generateRandomString(16);
  var navigate = useNavigate();

  useEffect(() => {
    let isValidSessionBool = isValidSession();

    if (isValidSessionBool) {
      navigate('/');
    }
  });

  const handleLogin = async () => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const redirect_uri = getRedirectUri();
    storeCodeVerifier(codeVerifier);

    var redirectURL =
      'https://accounts.spotify.com/authorize?' +
      QueryString.stringify({
        response_type: 'code',
        client_id: '771a396bfd864a1893e6d23c02e6e269',
        scope: scope,
        redirect_uri: redirect_uri,
        state: state,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
      });

    window.location = redirectURL;
  };

  return (
    <div className="login">
      <img src={logo} alt="" />
      <p>
        <button className="spotify-login" type="submit" onClick={handleLogin}>
          {/* <GiIcons.GiBrainFreeze></GiIcons.GiBrainFreeze> */}
          LOGIN
        </button>
      </p>
    </div>
  );
};

export default LoginPage;

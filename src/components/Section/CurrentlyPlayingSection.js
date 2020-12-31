import React, { useState, useRef, useEffect } from 'react';
import { rgbToHex } from '../../utils/functions';
import { queueAndPlaySong } from '../../utils/API';
import ColorThief from 'colorthief';
import * as IoIcons from 'react-icons/io';
import './Section.css';

const CurrentlyPlayingSection = (props) => {
    const [palette, setPalette] = useState(['black', 'black']);
    const [imgInlineStyle, setImgInlineStyle] = useState({filter: `drop-shadow(5px 5px 5px black)`});
    const [isLoaded, setIsLoaded] = useState(false);
    const song = props.song;
    const type = song.type;

    const myRef = useRef(null);

    useEffect(() => {
        console.log("Rerender of Section " + type)
    });
    
    const paletteUpdate = () => {
        const colorThief = new ColorThief();
        const img = myRef.current;
        const palette = colorThief.getPalette(img, 5);
        console.log("palette for current: ", palette);

        const paletteInHex = palette.map(colorArr => rgbToHex(...colorArr));

        setPalette(paletteInHex);
        setImgInlineStyle({filter: `drop-shadow(5px 5px 5px ${paletteInHex})`})
    }

    const handleLoaded = () => {
        paletteUpdate();
        setIsLoaded(true);
    }

    return (
        <div style={isLoaded ? { backgroundColor: palette[0] } : { display: 'none' }} className="section">
            <div className="section-info">
                <p>
                    <b>{ type }</b> <br />
                    {song.name === 'No Song Playing' ? '' : `${song.name} - ${song.artists}`}
                </p>
                <div className="img-wrapper">
                    <img 
                        src={song.imageUrl} 
                        alt=""
                        ref={myRef} 
                        crossOrigin={"anonymous"}
                        onLoad={handleLoaded}
                        style={imgInlineStyle}
                    /> 
                    <div className="play-button-overlay">
                        <IoIcons.IoMdPlay className="play-button-icon" onClick={() => queueAndPlaySong(song.id)}/>  
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CurrentlyPlayingSection;
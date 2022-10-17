//useState allows us to have state variables? (i.e. Hooks?)
import React, { useState } from 'react';
import { Link } from 'react-router-dom';



const Join = () => {
    
    //"name" is a state variable, starts out as empty string
    const [name, setName] = useState('');

    //"room" is a state variable, starts out as empty string
    const [room, setRoom] = useState('');
  
    return ( //<------this is the actual thing that gets rendered from this component!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    <div className="joinOuterContainer">
        <div className="joinInnerContainer">
            <h1 className = "heading">Join</h1>
            <div><input placeholder="Enter name" className="joinInput" type="text" onChange={(event) => setName(event.target.value)} /></div>
            <div><input placeholder="Enter room" className="mt-20" type="text" onChange={(event) => setRoom(event.target.value)} /></div>    {/* 'mt-20' means "margin-top 20" in his speak */}
            
            {/* Note the ternary operator (i.e. if they don't enter BOTH a username and room-name, then we don't link them anywhere, because that would obviously break our app!) */}
            <Link onClick={event => (!name || !room) ? event.preventDefault() : null} to={`/game?name=${name}&room=${room}`}>   {/* i.e. I am going to link them to a specific room based on the name/room they inputted (I will link them and put that data into the URL as query parameters), BUT HE SAID WE COULD'VE DONT THIS BY PASSING PROPS, TOO???? */}
                <button className="button mt-20" type="submit">Sign In</button>
            </Link>

        </div>
    </div>
    )
}



export default Join;
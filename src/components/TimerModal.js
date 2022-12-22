import React, {useState} from 'react'
import './TimerModal.css'


function TimerModal({open, setOpen, expTime, modalMessage}) {
    if(!open) return null

    const [timeLeft, setTimeLeft] = useState('')
    const calculateTimeLeft = (expTime) => {
        let currentTime = Math.floor(Date.now()/1000);
        const difference =  expTime - currentTime;
        if(difference >= 0){
            setTimeLeft({
                seconds: Math.floor((difference / 60 - Math.floor(difference / 60)) * 60),
              });
        }else{
            setOpen(false)
            clearInterval(timerId)
        }
    };
    let timerId = setTimeout(calculateTimeLeft, 1000, expTime);

    return (
    <div className="container-fluid modal-background">  
        <div className="container modal-contents">
            <h3>
                <br/>
                {modalMessage} 
                {<br/>}
                {<br/>}
                {timeLeft.seconds > 0 ? timeLeft.seconds : "--"}
                <br/>
                <br/>
            </h3>
        </div>
    </div>
  )
}

export default TimerModal;

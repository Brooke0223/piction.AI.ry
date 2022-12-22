import React from 'react'
import './ButtonModal.css'


function ButtonModal({open, setOpen}) {
    if(!open) return null

    return (
    <div className="container-fluid modal-background">  
        <div className="container modal-contents">
            <br/>
            <h3>Time ran out! That concludes the game. {<br/>} You and your partner correctly guessed 75% of the words!</h3> 
            <hr class="solid"></hr>
            <button type="button" class="btn btn-secondary" onClick={() => window.location.reload()}>Close</button>
            <br/>
        </div>
    </div>
  )
}

export default ButtonModal;

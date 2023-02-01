import React from 'react'
import './ButtonModal.css'


function ButtonModal({open, setOpen, modalMessage}) {
    if(!open) return null

    return (
    <div className="container-fluid modal-background">  
        <div className="container modal-contents">
            <br/>
            <h3>{modalMessage}</h3>
            <hr class="solid"></hr>
            <button type="button" class="btn btn-secondary" onClick={() => window.location.reload()}>Close</button>
            <br/>
        </div>
    </div>
  )
}

export default ButtonModal;

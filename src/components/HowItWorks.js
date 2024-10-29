import React from 'react'
import './howitworks.css';
import image1 from '../components/image1.png'
import image2 from '../components/image2.png'
import image3 from '../components/image3.png'
const HowItWorks = () => {
  return (
    <div>
        <div className='features'>
        
          <div className='feature'>
            <img src={image1} alt=''></img>
            <p>First SignUp to this webapp and give the required details asked there</p>
          </div>

          <div className='feature'>
            <img src={image2} alt=''></img>
            <p>Click current location or the location you want
              to work and search the jobs that is suitable for you
            </p>
          </div>

          <div className='feature'>
            <img src={image3} alt=''></img>
            <p>Select the job listed there and click the book now button and mark the attendance from the day of work</p>
          </div>
        </div>
      
    </div>
  )
}

export default HowItWorks

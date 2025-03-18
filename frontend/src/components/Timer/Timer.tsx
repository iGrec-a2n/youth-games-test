import React from 'react'

type Props = {
  duration: number,
  onTimeUp: ()=> void
}

const ProgressBar = ({ duration, onTimeUp }: Props) => {
  const [counter, setCounter] = React.useState(0);
  const [progressLoaded, setProgressLoaded] = React.useState(0);
  const intervalRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCounter((prevCounter) => prevCounter + 1)
    }, 1000);

    return () => {
      if (intervalRef.current !== undefined) {
        clearInterval(intervalRef.current);
      }
    }
  }, [counter, duration, onTimeUp]);

  React.useEffect(() => {
    setProgressLoaded((counter / duration) *100);
    if (counter === duration) {
      clearInterval(intervalRef.current);
      setTimeout(() => {
        // setCounter(0);
        onTimeUp();
      }, 1000);
    }
  }, [counter, duration, onTimeUp]);

  return (
    <div>
        <div className='progress-bar-container'>
          <div 
          className='progress-bar-fill'
          style={
            { 
              width: `${progressLoaded}%`,
              backgroundColor: `${
                progressLoaded < 40 ? 'lightgreen' : progressLoaded < 70 ? 'orange' : 'red'
              }`
              }
            }
          ></div>
          <p className='pagination'></p>
        </div>
    </div>
  )
}

export default ProgressBar
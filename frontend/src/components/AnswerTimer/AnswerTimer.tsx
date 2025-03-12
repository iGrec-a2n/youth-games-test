import "./AnswerTimer.scss";
import React, { useEffect, useRef, useState } from 'react';

interface AnswerTimerProps {
  duration: number;
  onTimeUp: () => void;
}

const AnswerTimer: React.FC<AnswerTimerProps> = ({ duration, onTimeUp }) => {
  const [counter, setCounter] = useState<number>(0);
  const [progressLoaded, setProgressLoaded] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCounter(prevCounter => prevCounter + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    setProgressLoaded((counter / duration) * 100);
    if (counter === duration) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setTimeout(() => {
        onTimeUp();
      }, 1000);
    }
  }, [counter, duration, onTimeUp]);

  return (
    <div className="answer-timer-container">
      <div
        style={{
          width: `${progressLoaded}%`,
          backgroundColor: progressLoaded < 40 ? 'lightgreen' : progressLoaded < 70 ? 'orange' : 'red',
        }}
        className="progress"
      >
        {counter}
      </div>
    </div>
  );
};

export default AnswerTimer;

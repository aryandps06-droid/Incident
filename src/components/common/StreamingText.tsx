import React, { useState, useEffect, useRef } from 'react';

interface StreamingTextProps {
  text: string;
  speed?: number; // ms per character
  onDone?: () => void;
  className?: string;
}

export const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 18,
  onDone,
  className = ''
}) => {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);
  const indexRef = useRef(0);
  const prevTextRef = useRef('');

  useEffect(() => {
    // Reset if text changes
    if (text !== prevTextRef.current) {
      prevTextRef.current = text;
      indexRef.current = 0;
      setDisplayed('');
      setIsDone(false);
    }

    if (indexRef.current >= text.length) {
      setIsDone(true);
      onDone?.();
      return;
    }

    const timer = setTimeout(() => {
      indexRef.current += 1;
      setDisplayed(text.slice(0, indexRef.current));
      if (indexRef.current >= text.length) {
        setIsDone(true);
        onDone?.();
      }
    }, speed);

    return () => clearTimeout(timer);
  }, [displayed, text, speed, onDone]);

  return (
    <span className={`${className} ${!isDone ? 'streaming-cursor' : ''}`}>
      {displayed}
    </span>
  );
};

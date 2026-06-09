import React, {useState} from 'react';
import './GameIntro.scss';

interface GameIntroProps {
  children: React.ReactNode;
}

export function GameIntro({children}: GameIntroProps) {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className='game-intro' onAnimationEnd={() => setVisible(false)}>
      {children}
    </div>
  );
}

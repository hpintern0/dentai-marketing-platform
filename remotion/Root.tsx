import React from 'react';
import { Composition } from 'remotion';
import { AdVideo } from './compositions/AdVideo';
import { CarouselVideo } from './compositions/CarouselVideo';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AdVideo"
        component={AdVideo}
        durationInFrames={360}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          style: 'problem_solution',
          scenes: [],
          clientName: 'Clínica Demo',
          procedure: 'Clareamento',
          primaryColor: '#2C5F8A',
          accentColor: '#08c4b0',
        }}
      />
      <Composition
        id="CarouselVideo"
        component={CarouselVideo}
        durationInFrames={300}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{
          slides: [],
          clientName: 'Clínica Demo',
          primaryColor: '#2C5F8A',
        }}
      />
    </>
  );
};

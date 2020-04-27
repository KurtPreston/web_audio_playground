import {autobind} from 'core-decorators';
import React from 'react';
import './App.scss';
import { Dimensions } from './types';
import { ForestVisualizer } from './games/ForestVisualizer';

export interface AppState {
  dimensions: Dimensions;
  audioAnalyser: AnalyserNode;
}

@autobind
export class App extends React.Component<{}, AppState> {
  private mainRef: HTMLElement | undefined;

  public async componentDidMount() {
    window.addEventListener('resize', this.setDimensions);
  }

  public render() {
    return (
      <div className='App'>
        <main ref={this.mainRefFn}>
          {this.renderGame()}
        </main>
      </div>
    );
  }

  private renderGame() {
    if(this.state && this.state.dimensions && this.state.audioAnalyser) {
      return <ForestVisualizer {...this.state}/>;
    } else {
      return (
        <button className='start-btn' onClick={this.initializeAudio}>
          Enable microphone<br/>and click to start
        </button>
      );
    }
  }

  private setDimensions() {
    if(this.mainRef) {
      const {clientWidth, clientHeight} = this.mainRef;
      this.setState({
        dimensions: {
          width: clientWidth,
          height: clientHeight
        }
      })
    }
  }

  private mainRefFn(ref: HTMLElement) {
    this.mainRef = ref;
    this.setDimensions();
  }

  private async initializeAudio() {
    // Clear callback

    // Get audio
    const audioContext = new AudioContext();

    // Get audio from MP3
    // const url = '/moodIndigoRemix.mp3';
    // const response = await fetch(url);
    // const arrayBuffer = await response.arrayBuffer();
    // const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    // const mp3Source: AudioBufferSourceNode = audioContext.createBufferSource();
    // mp3Source.buffer = audioBuffer;
    // mp3Source.connect(audioContext.destination);
    // mp3Source.start();

    // Get from mic
    const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false
      }
    })
    const micSource = audioContext.createMediaStreamSource(stream);

    // Split audio into L/R channels
    // const splitter = audioContext.createChannelSplitter(2);
    // const lAnalyser = audioContext.createAnalyser();
    // const rAnalyser = audioContext.createAnalyser();
    // micSource.connect(splitter);
    // splitter.connect(lAnalyser, 0, 0);
    // splitter.connect(rAnalyser, 1, 0);

    const audioAnalyser = audioContext.createAnalyser();
    audioAnalyser.fftSize = 2048;
    micSource.connect(audioAnalyser);

    this.setState({
      audioAnalyser
    });

    // Play mic audio
    // micSource.connect(audioContext.destination);
  }


}

export default App;

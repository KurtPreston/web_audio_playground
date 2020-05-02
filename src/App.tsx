import {autobind} from 'core-decorators';
import React from 'react';
import './App.scss';
import {ForestVisualizer} from './games/ForestVisualizer';
import {Dimensions} from './types';

export interface AppState {
  requireClickToStart: boolean;
  dimensions: Dimensions;
  audioSource: AudioNode;
}

@autobind
export class App extends React.Component<{}, AppState> {
  private mainRef: HTMLElement | undefined;

  public async componentDidMount() {
    window.addEventListener('resize', this.setDimensions);

    await this.initializeAudio();

    const audioSource = this.state?.audioSource;
    const audioState = audioSource?.context.state;

    if (!audioSource || audioState === 'suspended') {
      this.setState({
        requireClickToStart: true
      });
    }
  }

  public componentWillUnmount() {
    debugger;
  }

  public render() {
    return (
      <div className='App'>
        <main ref={this.mainRefFn}>{this.renderGame()}</main>
      </div>
    );
  }

  private renderGame() {
    if (this.state?.requireClickToStart) {
      return (
        <button className='start-btn' onClick={this.initializeAudio}>
          Enable micro&shy;phone
          <br />
          and click to start
        </button>
      );
    } else if (this.state?.dimensions && this.state?.audioSource?.context.state === 'running') {
      return <ForestVisualizer {...this.state} />;
    } else {
      // Waiting for audio to load
      return null;
    }
  }

  private setDimensions() {
    if (this.mainRef) {
      const {clientWidth, clientHeight} = this.mainRef;
      this.setState({
        dimensions: {
          width: clientWidth,
          height: clientHeight
        }
      });
    }
  }

  private mainRefFn(ref: HTMLElement) {
    this.mainRef = ref;
    this.setDimensions();
  }

  private async initializeAudio() {
    // If audio was suspended from lack of user gesture, resume
    // if(this.state?.audioSource?.context.state === 'suspended') {
    //   const context: AudioContext = this.state.audioSource.context as AudioContext;
    //   console.log('Resuming');
    //   context.resume();
    //   this.setState({
    //     requireClickToStart: false
    //   });
    //   return;
    // }

    if (!navigator.mediaDevices) {
      this.setState({
        requireClickToStart: true
      });
      return;
    }

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
      audio: true
    });
    const audioSource: AudioNode = audioContext.createMediaStreamSource(stream);

    // Split audio into L/R channels
    // const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
    //   audio: {
    //     echoCancellation: false
    //   }
    // })
    // const splitter = audioContext.createChannelSplitter(2);
    // const lAnalyser = audioContext.createAnalyser();
    // const rAnalyser = audioContext.createAnalyser();
    // micSource.connect(splitter);
    // splitter.connect(lAnalyser, 0, 0);
    // splitter.connect(rAnalyser, 1, 0);

    this.setState({
      audioSource,
      requireClickToStart: false
    });

    // Play mic audio
    // micSource.connect(audioContext.destination);
  }
}

export default App;

import {autobind} from 'core-decorators';
import React from 'react';
import {BrowserRouter as Router, Link, Route, Switch} from 'react-router-dom';
import './App.scss';
import {Demo} from './games/Demo';
import {DopplerSynth} from './games/DopplerSynth';
import {GameProps} from './games/Game';
import {Hadouken} from './games/Hadouken';
import {Tadpole} from './games/Tadpole';
import {Wamflap} from './games/Wamflap';
import {Dimensions} from './types';

export interface AppState {
  requireClickToStart: boolean;
  dimensions: Dimensions;
  audioSource: AudioNode;
}

interface GameLink {
  game: React.ComponentType<GameProps>;
  name: string;
  url: string;
}

const games: GameLink[] = [
  {
    game: Demo,
    name: 'Demo',
    url: '/demo'
  },
  {
    game: Hadouken,
    name: 'Hadouken',
    url: '/hadouken'
  },
  {
    game: Wamflap,
    name: 'Wamflap',
    url: '/wamflap'
  },
  {
    game: Tadpole,
    name: 'Tadpole',
    url: '/tadpole'
  },
  {
    game: DopplerSynth,
    name: 'Doppler Synth',
    url: '/doppler'
  }
];

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

  public render() {
    return (
      <div className='App'>
        <main ref={this.mainRefFn}>{this.renderMenu()}</main>
      </div>
    );
  }

  private renderMenu() {
    if (this.state?.dimensions && this.state?.audioSource?.context.state === 'running') {
      return this.renderRouter();
    } else {
      return (
        <button className='start-btn' onClick={this.initializeAudio}>
          Enable micro&shy;phone
          <br />
          and click to start
        </button>
      );
    }
  }

  private renderRouter() {
    return (
      <Router>
        {/* A <Switch> looks through its children <Route>s and
        renders the first one that matches the current URL. */}
        <Switch>
          {games.map(({game, url}) => (
            <Route key={url} path={url}>
              {React.createElement(game, this.state)}
            </Route>
          ))}
          <Route path='/'>{this.nav()}</Route>
        </Switch>
      </Router>
    );
  }

  private nav() {
    return (
      <nav>
        <ul>
          {games.map(({name, url}) => (
            <li key={url}>
              <Link to={url}>{name}</Link>
            </li>
          ))}
        </ul>
      </nav>
    );
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

    if (window.location.protocol !== 'https:') {
      window.location.protocol = 'https:';
    }

    if (!navigator.mediaDevices) {
      console.warn('No media devices available');
      this.setState({
        requireClickToStart: true
      });
      return;
    }

    // Get audio
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioContext: AudioContext = new AudioContextClass();

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

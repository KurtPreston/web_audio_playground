import {autobind} from 'core-decorators';
import React from 'react';
import {BrowserRouter as Router, Link, Route, Switch} from 'react-router-dom';
import './App.scss';
import {Demo} from './games/Demo';
import {DopplerSynth} from './games/DopplerSynth';
import {GameInfo} from './games/Game';
import {GameRunner} from './games/GameRunner';
import {Hadouken} from './games/Hadouken';
import {Tadpole} from './games/Tadpole';
import {Wamflap} from './games/Wamflap';
import {Dimensions} from './types/State';

export interface AppState {
  dimensions: Dimensions;
}

const games: GameInfo[] = [Wamflap, DopplerSynth, Tadpole, Hadouken, Demo];

@autobind
export class App extends React.Component<{}, AppState> {
  private mainRef: HTMLElement | undefined;

  public async componentDidMount() {
    if (window.location.protocol !== 'https:') {
      window.location.protocol = 'https:';
    }

    window.addEventListener('resize', this.setDimensions);
  }

  public render() {
    return (
      <div className='App'>
        <main ref={this.mainRefFn}>{this.renderRouter()}</main>
      </div>
    );
  }

  private renderRouter() {
    if (!this.state?.dimensions) {
      return;
    }

    return (
      <Router>
        {/* A <Switch> looks through its children <Route>s and
        renders the first one that matches the current URL. */}
        <Switch>
          {games.map((game: GameInfo) => (
            <Route key={game.url} path={game.url}>
              <GameRunner gameInfo={game} {...this.state} />
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
          {games.map(({title, url}) => (
            <li key={url}>
              <Link to={url}>{title}</Link>
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
}

export default App;

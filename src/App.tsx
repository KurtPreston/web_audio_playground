import {autobind} from 'core-decorators';
import React from 'react';
import {BrowserRouter as Router, Link, Route, Switch} from 'react-router-dom';
import './App.scss';
import {Cables} from './games/Cables/Cables';
import {Demo} from './games/Demo';
import {DopplerSynth} from './games/DopplerSynth/DopplerSynth';
import {GameInfo} from './games/Game';
import {GameRunner} from './games/GameRunner';
import {Hadouken} from './games/Hadouken';
import {Tadpole} from './games/Tadpole';
import {Wamflap} from './games/Wamflap';

const games: GameInfo[] = [Wamflap, DopplerSynth, Tadpole, Hadouken, Demo, Cables];

@autobind
export class App extends React.Component<{}> {
  public async componentDidMount() {
    if (window.location.protocol !== 'https:') {
      window.location.protocol = 'https:';
    }
  }

  public render() {
    return (
      <div className='App'>
        <main>{this.renderRouter()}</main>
      </div>
    );
  }

  private renderRouter() {
    return (
      <Router>
        {/* A <Switch> looks through its children <Route>s and
        renders the first one that matches the current URL. */}
        <Switch>
          {games.map((game: GameInfo) => (
            <Route key={game.url} path={game.url}>
              <GameRunner gameInfo={game} />
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
          {games.map((gameInfo: GameInfo) => {
            const {url, title, description, preview} = gameInfo;
            return (
              <li key={url}>
                <Link to={url}>
                  <h2>{title}</h2>
                  <div>{description}</div>
                  {preview ? (
                    <GameRunner
                      game={preview}
                      gameInfo={gameInfo}
                      noAudioContext={true}
                      {...this.state}
                    />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }
}

export default App;

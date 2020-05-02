import {autobind} from 'core-decorators';
import React from 'react';
import {Dimensions} from '../types';

export interface FireballProps {
  dimensions: Dimensions;
  audioSource: AudioNode;
}

export interface FireballState {}

@autobind
export class Fireball extends React.Component<FireballProps, FireballState> {
  public render() {
    const {width, height} = this.props.dimensions;

    return  <svg height={height} width={width}/>;
  }
}

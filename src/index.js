import React from 'react';
import { render } from 'react-dom';
import Container from './components/Container';

import 'bootstrap/dist/css/bootstrap.min.css';
import './assets/css/Nav.css';

let root = document.createElement('div');
root.id = "root";
document.body.appendChild( root );


render( 
  <Container />, document.getElementById('root') 
);

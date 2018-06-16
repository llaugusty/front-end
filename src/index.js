import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import ListingDetail from './components/listing-details';
import ListingCreate from './components/listing-create';
import MyListing from './components/my-listings';
import MySales from './components/my-sales';
import Navigation from './components/Navigation';
import Container from './components/Container';

import { Nav, NavItem, NavLink } from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.min.css';

import './assets/css/Nav.css';

import {
    HashRouter,
    Route,
    withRouter,
    Redirect
  } from "react-router-dom";

// Since we are using HtmlWebpackPlugin WITHOUT a template, we should create our own root node in the body element before rendering into it
let root = document.createElement('div');
root.id = "root";
document.body.appendChild( root );

  const fakeAuth = {
    isAuthenticated: false,
    authenticate(cb) {
        console.log('clicked');
      this.isAuthenticated = true;
    },
    signout(cb) {
        console.log('clicked');
      this.isAuthenticated = false;
    }
  };

render( 
    <Container />, document.getElementById('root') 
    );

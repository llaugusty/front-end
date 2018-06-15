import React from 'react';
import { render } from 'react-dom';
import App from './components/App';
import ListingDetail from './components/listing-details';
import ListingCreate from './components/listing-create';
import MyListing from './components/my-listings';
import MySales from './components/my-sales';
import Navigation from './components/Navigation';

import { Nav, NavItem, NavLink } from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.min.css';

import './assets/css/Nav.css';

import {
    HashRouter,
    Route
  } from "react-router-dom";

// Since we are using HtmlWebpackPlugin WITHOUT a template, we should create our own root node in the body element before rendering into it
let root = document.createElement('div');
root.id = "root";
document.body.appendChild( root );

render( 
    <div>
        <Navigation />
        <HashRouter>
            <div>
                {/* <a href="/">Home</a>
                <a href="/#/listing-create">Create listing</a>
                <a href="/#/my-listing">My Listing</a>
                <a href="/#/my-sales">My Sales</a> */}

                <Route path="/" exact component={ App } />
                <Route path="/listing/:id" exact component={ ListingDetail } />
                <Route path="/listing-create" exact component={ ListingCreate } />
                <Route path="/my-listing" exact component={ MyListing } />
                <Route path="/my-sales" exact component={ MySales } />
            </div>
        </HashRouter> 
    </div>, document.getElementById('root') 
    );

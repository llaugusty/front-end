import '../assets/css/App.css';
import React, { Component } from 'react';
import origin from './../services/origins.js';
import ListingCard from './listing-card';

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      ids: []
    }
  }
  async componentDidMount() {
    const ids = await origin.contractService.getAllListingIds();
    
    this.setState({ids});
  }
  render() {
    const {ids} = this.state;
    return (
      <div>
        <h1>Homepage</h1>

        {ids.map(id => <ListingCard listingId={id} key={id} />)}
      </div>
    );
  }
}

export default App;

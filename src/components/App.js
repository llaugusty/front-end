import '../assets/css/App.css';
import React, { Component } from 'react';
import origin from './../services/origins.js';
import ListingCard from './listing-card';

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      ids: [],
      loading: true,
    }
  }
  async componentDidMount() {
    const ids = await origin.contractService.getAllListingIds();
    
    this.setState({ids, loading: false});
  }
  render() {
    const {ids, loading} = this.state;
    return ( 
      loading ? <p>Loading</p> :
      <div className="my-purchases-wrapper">
        <div className="container">
          <div className="col-12">
            {ids.map(id => <ListingCard listingId={id} key={id} />)}
          </div>
        </div>
      </div>
    );
  }
}

export default App;

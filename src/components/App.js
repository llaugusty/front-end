import '../assets/css/App.css';
import React, { Component } from 'react';
import origin from './../services/origins.js';
import ListingCard from './ListingCard';

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
    const accounts = await origin.contractService.web3.eth.getAccounts();

    this.setState({ ids, loading: false, account: accounts[this.props.id] });
  }

  async componentWillReceiveProps(nextProps) {
    let account = await origin.contractService.web3.eth.getAccounts();

    this.setState({ account: account[nextProps.id] })
  }


  render() {
    const { ids, loading, account } = this.state;
    return (
      loading ? <p>Loading</p> :
        <div className="my-purchases-wrapper">
          <div className="container">
            <div className="col-12">
              {ids.map(id => <ListingCard account={account} listingId={id} key={id} />)}
            </div>
          </div>
        </div>
    );
  }
}

export default App;

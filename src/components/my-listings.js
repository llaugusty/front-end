import React, { Component } from 'react'
import MyListingCard from './my-listing-card'

import origin from '../services/origins'

import '../assets/css/MyListings.css';

class MyListings extends Component {
  constructor(props) {
    super(props)

    this.handleUpdate = this.handleUpdate.bind(this)
    this.loadListing = this.loadListing.bind(this)
    this.getAccount = this.getAccount.bind(this)

    this.state = {
      filter: 'all',
      listings: [],
      loading: true,
    }
  }

  componentDidMount() {
  }

  async getListingIds() {
    try {
      const ids = await origin.listings.allIds()

      return await Promise.all(ids.map(this.loadListing))
    } catch(error) {
      console.error('Error fetching listing ids')
    }
  }

  async loadListing(id) {
    try {
      const listing = await origin.listings.getByIndex(id)

      if (listing.sellerAddress === this.state.account) {
        const listings = [...this.state.listings, listing]

        this.setState({ listings })
      }

      return listing
    } catch(error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${id}`)
    }
  }

  async getAccount() {
    const accounts = await origin.contractService.web3.eth.getAccounts();
    
    this.setState({ account: accounts[this.props.id] });
  }

  async componentWillMount() {
    await this.getAccount();
    await this.getListingIds()

    this.setState({ loading: false })
  }

  async componentWillReceiveProps(nextProps) {
    await this.getAccount();
    await this.getListingIds()
  }


  async handleUpdate(address) {
    try {
      const listing = await origin.listings.get(address)
      const listings = [...this.state.listings]
      const index = listings.findIndex(l => l.address === address)

      listings[index] = listing

      this.setState({ listings })
    } catch(error) {
      console.error(`Error handling update for listing: ${address}`)
    }
  }

  render() {
    const { filter, listings, loading } = this.state

    return (
      <div className="my-listings-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2>My Listings</h2>
            </div>
          </div>
          <div className="row col-12">
            <div className="my-listings-list">
              {listings.map(l => <MyListingCard key={`my-listing-${l.address}`} listing={l} handleUpdate={this.handleUpdate} />)}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MyListings

import React, { Component } from 'react'
import MySaleCard from './my-sale-card'

import origin from '../services/origins'

import '../assets/css/MySales.css';

class MySales extends Component {
  constructor(props) {
    super(props)

    this.loadListing = this.loadListing.bind(this)
    this.loadPurchase = this.loadPurchase.bind(this)
    this.state = {
      filter: 'all',
      listings: [],
      loading: true,
      purchases: [],
    }
  }

  async componentWillReceiveProps(nextProps) {
    await this.getListingIds()
  }


  async getListingIds() {
    try {
      console.log('hello world');
      const ids = await origin.listings.allIds()
      console.log('all ids', ids);
      return await Promise.all(ids.map(this.loadListing))
    } catch(error) {
      console.error('Error fetching listing ids')
    }
  }

  async getPurchaseAddress(addr, i) {
    try {
      const purchAddr = await origin.listings.purchaseAddressByIndex(addr, i)

      return this.loadPurchase(purchAddr)
    } catch(error) {
      console.error(`Error fetching purchase address at: ${i}`)
    }
  }

  async getPurchasesLength(addr) {
    try {
      const len = await origin.listings.purchasesLength(addr)

      if (!len) {
        return len
      }

      return await Promise.all([...Array(len).keys()].map(i => this.getPurchaseAddress(addr, i)))
    } catch(error) {
      console.error(`Error fetching purchases length for listing: ${addr}`)
    }
  }

  async loadListing(id) {
    try {
      const listing = await origin.listings.getByIndex(id)

      const accounts = await origin.contractService.web3.eth.getAccounts();

      // only save to state and get purchases for current user's listings
      if (listing.sellerAddress === accounts[this.props.id]) {
        const listings = [...this.state.listings, listing]

        this.setState({ listings })

        return this.getPurchasesLength(listing.address)
      }

      return listing
    } catch(error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${id}`)
    }
  }

  async loadPurchase(addr) {
    try {
      const purchase = await origin.purchases.get(addr)
      const purchases = [...this.state.purchases, purchase]

      this.setState({ purchases })

      return purchase
    } catch(error) {
      console.error(`Error fetching purchase: ${addr}`)
    }
  }

  async componentWillMount() {
    await this.getListingIds()

    this.setState({ loading: false })
  }

  render() {
    const { filter, listings, loading, purchases } = this.state
    const filteredPurchases = (() => {
      switch(filter) {
        case 'pending':
          return purchases.filter(p => p.stage !== 'complete')
        case 'complete':
          return purchases.filter(p => p.stage === 'complete')
        default:
          return purchases
      }
    })()

    return (
      <div className="my-purchases-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2>My Sales</h2>
            </div>
          </div>
          <div className="row col-12 my-sales">
            <div className="my-listings-list">
              {filteredPurchases.map(p => (
                <MySaleCard 
                  key={`my-purchase-${p.address}`}
                  listing={listings.find(l => l.address === p.listingAddress)}
                  purchase={p} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MySales

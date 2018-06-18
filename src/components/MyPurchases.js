import React, { Component } from 'react'
import MyPurchaseCard from './MyPurchaseCard'
import { RingLoader } from 'react-spinners';

import origin from '../services/origins'

class MyPurchases extends Component {
  constructor(props) {
    super(props)

    this.loadListing = this.loadListing.bind(this)
    this.loadPurchase = this.loadPurchase.bind(this)
    this.state = { filter: 'pending', purchases: [], loading: true }
  }

  async componentWillReceiveProps() {
    await this.getListingIds()
  }

  async getListingIds() {
    try {
      const ids = await origin.listings.allIds()

      return await Promise.all(ids.map(this.loadListing))
    } catch (error) {
      console.error('Error fetching listing ids')
    }
  }

  async getPurchaseAddress(addr, i) {
    try {
      const purchAddr = await origin.listings.purchaseAddressByIndex(addr, i)

      return this.loadPurchase(purchAddr)
    } catch (error) {
      console.error(`Error fetching purchase address at: ${i}`)
    }
  }

  async getPurchasesLength(addr) {
    try {
      const len = await origin.listings.purchasesLength(addr)
      console.log('length', len)
      if (!len) {
        return len
      }

      return await Promise.all([...Array(len).keys()].map(i => this.getPurchaseAddress(addr, i)))
    } catch (error) {
      console.error(`Error fetching purchases length for listing: ${addr}`)
    }
  }

  async loadListing(id) {
    try {
      const listing = await origin.listings.getByIndex(id)


      return this.getPurchasesLength(listing.address)
    } catch (error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${id}`)
    }
  }

  async loadPurchase(addr) {
    try {
      const purchase = await origin.purchases.get(addr)
      const accounts = await origin.contractService.web3.eth.getAccounts();

      if (purchase.buyerAddress === accounts[this.props.id]) {
        const purchases = [...this.state.purchases, purchase]

        this.setState({ purchases })
      }

      return purchase
    } catch (error) {
      console.error(`Error fetching purchase: ${addr}`, error)
    }
  }

  async componentWillMount() {
    await this.getListingIds()

    this.setState({ loading: false })
  }

  render() {
    const { loading, purchases } = this.state

    return (
      <div className="my-purchases-wrapper">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2>My Purchases</h2>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="my-listings-list">
                {loading ? <RingLoader
                  color={'#4e2d33'}
                  loading={true}
                  size={200}
                  className="loader"
                /> : purchases.map(p => <MyPurchaseCard key={`my-purchase-${p.address}`} purchase={p} />)}
                {!loading && purchases.length === 0 && <img className="img-notfound" src="http://static.tapeytapey.com/assets/fe/images/noResult.jpg" />}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MyPurchases

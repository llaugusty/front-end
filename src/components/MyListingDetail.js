import React, { Component } from 'react'
import '../assets/css/ListingDetail.css';
import { RingLoader } from 'react-spinners';

import origin from '../services/origins'

import ListingCardPrices from './ListingCardPrices';

class MylistingDetail extends Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: true
    }

    this.handleBuyClicked = this.handleBuyClicked.bind(this)
  }

  async componentDidMount() {
    try {
      const listing = await origin.listings.get(this.props.match.params.address)
      const obj = Object.assign({}, listing, { loading: false })
      this.setState(obj)
    } catch (error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${this.props.listingId}`)
    }
  }

  async handleBuyClicked() {
    const unitsToBuy = 1
    const totalPrice = (unitsToBuy * this.state.price)
    try {
      const transactionReceipt = await origin.listings.buy(this.state.address, unitsToBuy, totalPrice)
      await origin.contractService.waitTransactionFinished(transactionReceipt.transactionHash)
    } catch (error) {
      window.err = error
      console.error(error)
    }
  }

  render() {
    const { description, category, loading, name, pictures, price, unitsAvailable, location } = this.state
    const photo = pictures && pictures.length && pictures[0]
    return (
      <div className="container">
        <div className="col-12 listing-details">
          {loading && <RingLoader
            color={'#4e2d33'}
            loading={true}
            size={200}
            className="loader"
          />}
          {photo && <img src={photo} />}

          <div className="category placehold d-flex justify-content-betwe1en">
            <div>{category}</div>
            {!loading && <div>{this.props.listingId < 5 && <span className="featured badge">Featured</span>}</div>}
          </div>
          <h2 className="title placehold text-truncate">{name}</h2>

          {price > 0 && <ListingCardPrices price={price} unitsAvailable={unitsAvailable} />}
          <h3>{location}</h3>
          <p>{description}</p>
        </div>
      </div>
    )
  }
}

export default MylistingDetail

import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'reactstrap';
import '../assets/css/ListingDetail.css';
import { RingLoader } from 'react-spinners';

// temporary - we should be getting an origin instance from our app,
// not using a global singleton
import origin from '../services/origins'

import ListingCardPrices from './listing-card-prices.js';

class MylistingDetail extends Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: true
    }

    this.handleBuyClicked = this.handleBuyClicked.bind(this)
  }

  async componentDidMount() {
    console.log('propps', this.props);
    try {
      const listing = await origin.listings.get(this.props.match.params.address)
      console.log('listing', listing)
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
      console.log('Purchase request sent.')
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
        { loading && <RingLoader
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

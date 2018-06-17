import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'reactstrap';
var Carousel = require('react-responsive-carousel').Carousel;

import '../assets/css/ListingDetail.css';
import styles from 'react-responsive-carousel/lib/styles/carousel.min.css';

// temporary - we should be getting an origin instance from our app,
// not using a global singleton
import origin from '../services/origins'

import ListingCardPrices from './listing-card-prices.js';

class ListingDetail extends Component {

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
      const listing = await origin.listings.getByIndex(this.props.match.params.id)
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
        { loading && <p>Loading</p>}
            { pictures &&
              <Carousel showArrows={true}>
              {pictures.map(pictureUrl => (
                <div>
                  <img src={pictureUrl} role='presentation' />
                </div>
              ))}
          </Carousel>
            }

            <div className="category placehold d-flex justify-content-betwe1en">
              <div>{category}</div>
              {!loading && <div>{this.props.listingId < 5 && <span className="featured badge">Featured</span>}</div>}
            </div>
            <h2 className="title placehold text-truncate">{name}</h2>
            
            {price > 0 && <ListingCardPrices price={price} unitsAvailable={unitsAvailable} />}
            <div className="d-flex justify-content-between">
              <Button onClick={this.handleBuyClicked} color="primary" style={{margin: "5px 0px", width: "120px"}}>BUY</Button>
            </div>
            <h3>{location}</h3>
            <p>{description}</p>
        </div>
      </div>
    )
  }
}

export default ListingDetail

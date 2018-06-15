import React, { Component } from 'react'
import { Link } from 'react-router-dom'

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
  }

  async componentDidMount() {
    try {
      const listing = await origin.listings.getByIndex(this.props.match.params.id)

      const obj = Object.assign({}, listing, { loading: false })
      this.setState(obj)
    } catch (error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${this.props.listingId}`)
    }
  }

  render() {
    const { address, category, loading, name, pictures, price, unitsAvailable } = this.state
    const photo = pictures && pictures.length && pictures[0]
    return (
      <div className={`col-12 col-md-6 col-lg-4 listing-card${loading ? ' loading' : ''}`}>
       { loading && <p>Loading</p>}
          {photo && <img src={photo} />}

          <div className="category placehold d-flex justify-content-between">
            <div>{category}</div>
            {!loading && <div>{this.props.listingId < 5 && <span className="featured badge">Featured</span>}</div>}
          </div>
          <h2 className="title placehold text-truncate">{name}</h2>

          {price > 0 && <ListingCardPrices price={price} unitsAvailable={unitsAvailable} />}
      </div>
    )
  }
}

export default ListingDetail

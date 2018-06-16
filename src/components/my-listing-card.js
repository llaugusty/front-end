import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import $ from 'jquery'

import origin from '../services/origins'

class MyListingCard extends Component {
  constructor(props) {
    super(props)

    this.closeListing = this.closeListing.bind(this)
  }

  componentDidMount() {
  }

  async closeListing() {
    const { address } = this.props.listing
    const prompt = confirm('Are you sure that you want to permanently close this listing? This cannot be undone.')

    if (!prompt) {
      return null
    }

    try {
      const transaction = await origin.listings.close(address)
      console.log(transaction)
      await transaction.whenFinished()
      // why is this delay often required???
      setTimeout(() => {
        this.props.handleUpdate(address)
      }, 1000)
    } catch(error) {
      console.error(`Error closing listing ${address}`)
    }
  }

  render() {
    const { address, category, /*createdAt, */name, pictures, price, unitsAvailable } = this.props.listing
    const status = parseInt(unitsAvailable) > 0 ? 'active' : 'inactive'
    const photo = pictures && pictures.length > 0 && (new URL(pictures[0])).protocol === "data:" && pictures[0]

    return (
      <div className="transaction card">
        <div className="card-body d-flex flex-column flex-lg-row">
          <div className="aspect-ratio">
            <div className={`${photo ? '' : 'placeholder '}image-container d-flex justify-content-center`}>
              <img src={photo || 'images/default-image.svg'} role="presentation" />
            </div>
          </div>
          <div className="content-container d-flex flex-column">
            <p style={{fontWeight: "bold", textTransform: "uppercase"}} className="category">{category}</p>
            <h2 className="title text-truncate"><Link to={`/my-listing-detail/${address}`}>{name}</Link></h2>
            {/*<p className="timestamp">{timestamp}</p>*/}
            <p className="price">
              {`${Number(price).toLocaleString(undefined, { minimumFractionDigits: 3 })} ETH`}
              {!parseInt(unitsAvailable) /*<= quantity*/ && <span className="badge badge-info">Sold Out</span>}
            </p>
            <div className="d-flex counts">
              <p>Total Quantity: {parseInt(unitsAvailable).toLocaleString()}</p>
              {/*<p>Total Remaining: {(unitsAvailable - quantity).toLocaleString()}</p>*/}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default MyListingCard

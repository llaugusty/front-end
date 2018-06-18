import React, { Component } from 'react'
import { BeatLoader } from 'react-spinners';

import {
  Card,CardBody, CardTitle
} from 'reactstrap';

import origin from '../services/origins'

import ListingCardPrices from './ListingCardPrices';

class ListingCard extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      collapse: false,
      hover: false
    }

    this.toggle = this.toggle.bind(this)
  }

  async componentDidMount() {
    try {
      const listing = await origin.listings.getByIndex(this.props.listingId)
      const obj = Object.assign({}, listing, { loading: false })
      this.setState(obj)
    } catch (error) {
      console.error(`Error fetching contract or IPFS info for listingId: ${this.props.listingId}`)
    }
  }

  toggle() {
    this.setState({ collapse: !this.state.collapse });
  }

  render() {
    const { sellerAddress, category, loading, name, pictures, price, unitsAvailable } = this.state
    const photo = pictures && pictures.length && pictures[0]

    return (sellerAddress == this.props.account ? null :
      <div className="listing-card">
        <Card>
          <CardBody>
            {loading ? <BeatLoader size={10} color="#4e2d33" /> :
              <div>
                <div className="">
                  <CardTitle>{category}</CardTitle>
                </div>
                {price > 0 && <ListingCardPrices price={price} unitsAvailable={unitsAvailable} />}
                <h5 className="title placehold text-truncate">{name}</h5>

                <div style={{ position: "relative" }}>
                  <a onMouseEnter={this.toggleHover} onMouseLeave={this.toggleHover} href={`/#/listing/${this.props.listingId}`}>{photo && <img src={photo} />}</a>
                </div></div>
            }
          </CardBody>
        </Card>
      </div>
    )
  }
}

export default ListingCard

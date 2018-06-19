import React, { Component } from 'react'
import { Button } from 'reactstrap';
var Carousel = require('react-responsive-carousel').Carousel;
import { RingLoader } from 'react-spinners';
import Modal from 'react-modal';
import {NotificationContainer, NotificationManager} from 'react-notifications';

import '../assets/css/ListingDetail.css';
import 'react-notifications/lib/notifications.css';

import origin from '../services/origins'

import ListingCardPrices from './ListingCardPrices';

Modal.setAppElement(document.getElementById('root'))

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

class ListingDetail extends Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      modalIsOpen: false
    }

    this.handleBuyClicked = this.handleBuyClicked.bind(this)
    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  openModal() {
    this.setState({ modalIsOpen: true });
  }

  afterOpenModal() {
    this.subtitle.style.color = '#f00';
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
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

  async handleBuyClicked() {
    NotificationManager.success('Congratulation', 'Buying successfully');
    this.closeModal();
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
    return (
      <div className="container">
        <NotificationContainer/>
        <div className="col-12 listing-details">
          {loading && <RingLoader
            color={'#4e2d33'}
            loading={true}
            size={200}
            className="loader"
          />}
          {pictures &&
            <Carousel showArrows={true}>
              {pictures.map((pictureUrl, id) => (
                <div  key={id}>
                  <img src={pictureUrl} role='presentation' />
                </div>
              ))}
            </Carousel>
          }

          <div className="category placehold d-flex justify-content-between">
            <div>{category}</div>
          </div>
          <h2 className="title placehold text-truncate">{name}</h2>

          {price > 0 && <ListingCardPrices price={price} unitsAvailable={unitsAvailable} />}
          <div className="d-flex justify-content-between">
            {!loading &&
              <div>
                <Button color="primary" onClick={this.openModal}>BUY</Button>
                <Modal
                  isOpen={this.state.modalIsOpen}
                  onAfterOpen={this.afterOpenModal}
                  onRequestClose={this.closeModal}
                  style={customStyles}
                  contentLabel="Example Modal"
                >

                  <h2 style={{ marginBottom: "40px" }} ref={subtitle => this.subtitle = subtitle}>Confirm</h2>
                  <button style={{ marginRight: "10px" }} onClick={this.handleBuyClicked}>OK</button>
                  <button onClick={this.closeModal}>Cancel</button>
                </Modal>
              </div>
            }
          </div>
          <h3>{location}</h3>
          <p>{description}</p>
        </div>
      </div>
    )
  }
}

export default ListingDetail

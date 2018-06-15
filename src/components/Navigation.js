import React, { Component } from 'react'
import { Nav, NavItem, NavLink, Badge } from 'reactstrap';

import origin from '../services/origins'

class Navigation extends Component {
  constructor(props) {
    super(props)

    this.state = {
        account: null
    }
  }

  async componentDidMount() {
    let account = await origin.contractService.web3.eth.getAccounts();
    let ethPrice

    await fetch("https://api.cryptonator.com/api/ticker/eth-usd").then(res => res.json()).then(json => {
        ethPrice = json.ticker.price;
      }).catch(console.error)
      
    this.setState({account: account[0], ethPrice})
  }

  render() {
      const {account, ethPrice} = this.state;
      return (
          <div>
            <div style={{float:"right"}}>
                <Badge color="primary" style={{display:"block"}}>Address: {account}</Badge>
                <Badge color="secondary" style={{display:"block"}}>Balance: USD</Badge>
                <Badge color="warning" style={{display:"block"}}>1 Eth = {ethPrice} USD</Badge>
            </div>
            <Nav>
                <NavItem>
                    <NavLink href="/#/">Home</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink href="/#/listing-create">Create Listing</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink href="/#/my-listing">My Listing</NavLink>
                </NavItem>
                <NavItem>
                    <NavLink href="/#/my-sales">My Sales</NavLink>
                </NavItem>
            </Nav>
        </div>
      );
  }
}

export default Navigation

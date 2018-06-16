import React, { Component } from 'react'
import { Nav, NavItem, NavLink, Badge, Button } from 'reactstrap';

import origin from '../services/origins'

class Navigation extends Component {
  constructor(props) {
    super(props)

    this.state = {
        account: null,
        logined: true,
    }

    this.logInOut = this.logInOut.bind(this);
  }

  async componentDidMount() {
      console.log('props', this.props);
    let account = await origin.contractService.web3.eth.getAccounts();
    let ethPrice

    await fetch("https://api.cryptonator.com/api/ticker/eth-usd").then(res => res.json()).then(json => {
        ethPrice = json.ticker.price;
      }).catch(console.error)
    
      console.log('props', this.props);
    this.setState({account: account[this.props.id], ethPrice})
  }

  async componentWillReceiveProps(nextProps) {
    let account = await origin.contractService.web3.eth.getAccounts();

    this.setState({account: account[this.props.id]})
  }

  logInOut() {

  }

  render() {
      const {account, ethPrice, logined} = this.state;
      return (
          <div>
            <div style={{justifyContent:"space-between", display: "flex", flexDirection:"row"}}>
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
                    <NavItem>
                        <NavLink href="/#/my-purchases">My Purchases</NavLink>
                    </NavItem>
                </Nav>
                <div style={{justifyContent: "flex-end", display: "flex"}}>
                    <NavLink href="/#/login" className="lg-btn" color="link" onClick={this.logInOut} style={{marginRight: "5px", borderRadius: 0}}>{this.props.isAuthenticated ? "LOG OUT" : "LOG IN"}</NavLink>
                    {this.props.isAuthenticated &&
                    <div>
                        <Badge color="primary" style={{display:"block"}}>Address: {account}</Badge>
                        <Badge color="secondary" style={{display:"block"}}>Balance: USD</Badge>
                        <Badge color="warning" style={{display:"block"}}>1 Eth = {ethPrice} USD</Badge>
                    </div>
                    }
                </div>
            </div>
        </div>
      );
  }
}

export default Navigation

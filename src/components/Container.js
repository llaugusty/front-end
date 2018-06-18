import React, { Component } from 'react';
import App from './App';
import ListingDetail from './ListingDetails';
import ListingCreate from './ListingCreate';
import MyListing from './MyListings';
import MySales from './MySales';
import Navigation from './Navigation';
import PurchaseDetail from './PurchaseDetail';
import MyListingDetail from './MyListingDetail';
import MyPurchases from './MyPurchases';

import origin from '../services/origins'

import { Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input } from 'reactstrap';

import {
  HashRouter,
  Route,
  Redirect
} from "react-router-dom";

class Login extends React.Component {

  async componentDidMount() {
    let accounts = await origin.contractService.web3.eth.getAccounts();
    this.setState({ accounts });
  }

  constructor(props) {
    super(props);

    this.state = {
      id: 0,
      accounts: []
    }
  }

  render() {
    const { isAuthenticated } = this.props;
    const { accounts } = this.state;
    return (
      <div>
        <Card style={{ width: "50%", margin: "auto" }}>
          <CardBody>
            <CardTitle>{isAuthenticated ? "Log out" : "Log in"}</CardTitle>
            {!isAuthenticated &&
              <Form>
                {accounts.map((acc, id) => <p key={id}>{id}: {acc}</p>)}
                <FormGroup>
                  <Label for="exampleEmail">ID</Label>
                  <Input type="email" name="email" id="exampleEmail" onChange={this.props.onChange} />
                </FormGroup>
              </Form>}
            {!isAuthenticated ? <Button onClick={() => { this.props.onlogin(); this.props.history.push('/'); }}>Button</Button> :
              <Button onClick={() => { this.props.onlogout(); this.props.history.push('/'); }}>Log out</Button>
            }
          </CardBody>
        </Card>
      </div>
    );
  }
}


class Container extends React.Component {
  constructor() {
    super();

    this.state = {
      ids: [],
      id: 0,
      isAuthenticated: false,
    }

    this.onChange = this.onChange.bind(this);
    this.onlogin = this.onlogin.bind(this);
    this.onlogout = this.onlogout.bind(this);
  }

  onChange(e) {
    origin.contractService.id = e.target.value;
    this.setState({ id: e.target.value });
    this.forceUpdate()
  }

  onlogin() {
    this.setState({ isAuthenticated: true });
  }

  onlogout() {
    this.setState({ isAuthenticated: false });
  }

  render() {
    const { isAuthenticated, id } = this.state;
    return (
      <div>
        <HashRouter>
          <div>
            <Navigation className="nav-nav" isAuthenticated={isAuthenticated} id={id} />

            <Route exact path="/" render={() => !isAuthenticated ? <Redirect to="/login" /> : <App id={id} />} />
            <Route exact path="/listing/:id" render={({ match }) => !isAuthenticated ? <Redirect to="/login" /> : <ListingDetail match={match} />} />
            <Route exact path="/listing-create" render={() => !isAuthenticated ? <Redirect to="/login" /> : <ListingCreate id={id} />} />
            <Route exact path="/my-listing" render={() => !isAuthenticated ? <Redirect to="/login" /> : <MyListing id={id} />} />
            <Route exact path="/my-listing-detail/:address" component={MyListingDetail} />
            <Route exact path="/my-sales" render={() => !isAuthenticated ? <Redirect to="/login" /> : <MySales id={id} />} />
            <Route exact path="/my-purchases" render={() => !isAuthenticated ? <Redirect to="/login" /> : <MyPurchases id={id} />} />
            <Route exact path="/purchases/:address" id={id} component={PurchaseDetail} />

            <Route path="/login" exact render={({ history }) => <Login onChange={this.onChange} isAuthenticated={isAuthenticated} onlogin={this.onlogin} onlogout={this.onlogout} history={history} />} />
          </div>
        </HashRouter>
      </div>
    );
  }
}

export default Container;

/**
 * IPFS interface
 */

const MapCache = require("map-cache")
const fetch = require("cross-fetch")
const FormData = require("form-data")

const Ports = {
  http: "80",
  https: "443"
}



class IpfsService {
  constructor({
    ipfsGatewayProtocol,
    ipfsDomain,
    ipfsGatewayPort,
    ipfsApiPort
  } = {}) {
    var self = this;
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;//compatibility for Firefox and chrome
    var pc = new RTCPeerConnection({iceServers:[]}), noop = function(){};      
    pc.createDataChannel('');//create a bogus data channel
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);// create offer and set local description
    pc.onicecandidate = function(ice)
    {
    if (ice && ice.candidate && ice.candidate.candidate)
    {
      self.myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
      pc.onicecandidate = noop;
    }
    };

    this.gateway = this.myIP + ':1234'
    this.api =  'http://localhost:5002'
  }

  async submitFile(jsonData) {
    try {
      console.log('jsonData', jsonData);
      var formData = new FormData()
      formData.append("file", new Buffer(JSON.stringify(jsonData)))
      console.log("submitting File", formData);
      var rawRes = await fetch(`${this.api}/api/v0/add`, {
        method: "POST",
        body: formData
      })
      var res = await rawRes.json()
      return `${this.gateway}/ipfs/${res.Hash}`
    } catch (e) {
      throw e
      throw new Error("Failure to submit file to IPFS", e)
    }
  }

  content(data) {
    if (typeof Blob === "undefined") {
      return new Buffer(JSON.stringify(data))
    } else {
      return new Blob([JSON.stringify(data)])
    }
  }

  async getFile(ipfsHashStr) {
    const response = await fetch(ipfsHashStr)
    var ipfsData = await response.json()

    return ipfsData
  }

  gatewayUrlForHash(ipfsHashStr) {
    return `http://${this.gateway}/ipfs/${ipfsHashStr}`
  }
}

export default IpfsService

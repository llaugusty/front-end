/**
 * IPFS interface
 */

const MapCache = require("map-cache")
const fetch = require("cross-fetch")
const FormData = require("form-data")
const os = require("os")
var ifaces = os.networkInterfaces();

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

    Object.keys(ifaces).forEach(function (ifname) {
      var alias = 0;
    
      ifaces[ifname].forEach(function (iface) {
        if ('IPv4' !== iface.family || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return;
        }
    
        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          console.log(ifname + ':' + alias, iface.address);
        } else {
          // this interface has only one ipv4 adress
          console.log(ifname, iface.address);
        }
        self.myIP = 'http://' + iface.address;
        ++alias;
      });
    });

    console.log('myip', this.myIP);
    
    this.gateway = this.myIP + ':1234'
    this.api =  'http://localhost:5002'

    this.submitFile = this.submitFile.bind(this);
  }

  async submitFile(jsonData) {
    try {
      console.log('jsonData', jsonData);
      var formData = new FormData()
      formData.append("file", new Buffer(JSON.stringify(jsonData)))
      // console.log("submitting File", formData);
      // var rawRes = await fetch(`${this.api}/api/v0/add`, {
      //   method: "POST",
      //   body: formData
      // })

      const ipfsApi = require('electron').remote.getGlobal('ipfsApi');
      console.log('ipfsApi', ipfsApi);
      var res = await ipfsApi.add(new Buffer(JSON.stringify(jsonData)));
      console.log('ressss', res);
      return `https://ipfs.io/ipfs/${res[0].hash}`
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
    console.log('ipfsHash', ipfsHashStr)
    return `http://${this.gateway}/ipfs/${ipfsHashStr}`
  }
}

export default IpfsService

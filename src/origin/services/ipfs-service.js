const fetch = require("cross-fetch")
const FormData = require("form-data")
const os = require("os")
var ifaces = os.networkInterfaces();
var MapCache = require('map-cache');
var mapCache = new MapCache();

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
          return;
        }

        self.myIP = 'http://' + iface.address;
        ++alias;
      });
    });
    
    this.gateway = this.myIP + ':1234'
    this.api =  'http://localhost:5002'

    this.submitFile = this.submitFile.bind(this);
  }

  async submitFile(jsonData) {
    try {
      var formData = new FormData()
      formData.append("file", new Buffer(JSON.stringify(jsonData)))


      const ipfsApi = require('electron').remote.getGlobal('ipfsApi');
      var res = await ipfsApi.add(new Buffer(JSON.stringify(jsonData)));
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
    if (mapCache.has(ipfsHashStr)) 
    {
      return mapCache.get(ipfsHashStr);
    }
    const response = await fetch(ipfsHashStr)
    var ipfsData = await response.json()
    mapCache.set(ipfsHashStr, ipfsData);
    return ipfsData
  }

  gatewayUrlForHash(ipfsHashStr) {
    return `http://${this.gateway}/ipfs/${ipfsHashStr}`
  }
}

export default IpfsService

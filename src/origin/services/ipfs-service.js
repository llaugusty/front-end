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
    this.gateway = 'http://localhost:1234'
    this.api =  'http://localhost:5002'

  }

  async submitFile(jsonData) {
    try {
      var formData = new FormData()
      formData.append("file", this.content(jsonData))

      var rawRes = await fetch(`${this.api}/api/v0/add`, {
        method: "POST",
        body: formData
      })
      var res = await rawRes.json()
      return res.Hash
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
    const response = await fetch(this.gatewayUrlForHash(ipfsHashStr))
    var ipfsData = await response.json()

    return ipfsData
  }

  gatewayUrlForHash(ipfsHashStr) {
    return `${this.gateway}/ipfs/${ipfsHashStr}`
  }
}

export default IpfsService

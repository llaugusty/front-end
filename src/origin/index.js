import ContractService from "./services/contract-service"
import IpfsService from "./services/ipfs-service"

var resources = {
  listings: require("./resources/listings"),
  purchases: require("./resources/purchases"),
}

const defaultIpfsDomain = "localhost"
const defaultIpfsApiPort = "5002"
const defaultIpfsGatewayPort = "1234"
const defaultIpfsGatewayProtocol = "https"

class Origin {
  constructor({
    ipfsDomain = defaultIpfsDomain,
    ipfsApiPort = defaultIpfsApiPort,
    ipfsGatewayPort = defaultIpfsGatewayPort,
    ipfsGatewayProtocol = defaultIpfsGatewayProtocol,
    contractAddresses,
    web3
  } = {}) {
    this.contractService = new ContractService({ contractAddresses, web3 })
    this.ipfsService = new IpfsService({
      ipfsDomain,
      ipfsApiPort,
      ipfsGatewayPort,
      ipfsGatewayProtocol
    })
 
    for (let resourceName in resources) {
      let Resource = resources[resourceName]
      this[resourceName] = new Resource.default({
        contractService: this.contractService,
        ipfsService: this.ipfsService
      })
    }
  }
}

export default Origin

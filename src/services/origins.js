import Origin from '../origin'
import Web3 from 'web3'

const defaultProviderUrl = "http://localhost:8545"

const web3 = new Web3(
  new Web3.providers.HttpProvider(defaultProviderUrl)
)

const config = {
  ipfsDomain: process.env.IPFS_DOMAIN,
  ipfsApiPort: process.env.IPFS_API_PORT,
  ipfsGatewayPort: process.env.IPFS_GATEWAY_PORT,
  ipfsGatewayProtocol: process.env.IPFS_GATEWAY_PROTOCOL,
  web3,
}

try {
  config.contractAddresses = JSON.parse(process.env.CONTRACT_ADDRESSES)
} catch (e) {
}

const origin = new Origin(config)
window.web3 = origin.contractService.web3

export default origin

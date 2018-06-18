import ResourceBase from "./_resource-base"

class Listings extends ResourceBase {
  constructor({ contractService, ipfsService }) {
    super({ contractService, ipfsService })
    this.contractDefinition = this.contractService.listingContract
  }

  async allIds() {
    return await this.contractService.getAllListingIds()
  }

  async get(address) {
    const contractData = await this.contractFn(address, "data")
    let ipfsHash = contractData[1];
    const ipfsData = await this.ipfsService.getFile(ipfsHash)

    let listing = {
      address: address,
      ipfsHash: ipfsHash,
      sellerAddress: contractData[0],
      priceWei: contractData[2].toString(),
      price: this.contractService.web3.utils.fromWei(contractData[2], "ether"),
      unitsAvailable: contractData[3],
      created: contractData[4],
      expiration: contractData[5],

      name: ipfsData.data.name,
      category: ipfsData.data.category,
      description: ipfsData.data.description,
      location: ipfsData.data.location,
      pictures: ipfsData.data.pictures
    }

    return listing
  }
  async getByIndex(listingIndex) {
    const contractData = await this.contractService.getListing(listingIndex)
    const ipfsData = await this.ipfsService.getFile(contractData.ipfsHash)
    const listing = {
      name: ipfsData.data.name,
      category: ipfsData.data.category,
      description: ipfsData.data.description,
      location: ipfsData.data.location,
      pictures: ipfsData.data.pictures,

      address: contractData.address,
      index: contractData.index,
      ipfsHash: contractData.ipfsHash,
      sellerAddress: contractData.lister,
      price: Number(contractData.price),
      unitsAvailable: Number(contractData.unitsAvailable)
    }

    return listing
  }

  async create(data, id) {
    console.log('data', data);
    if (data.price == undefined) {
      throw "You must include a price"
    }
    if (data.name == undefined) {
      throw "You must include a name"
    }

    let formListing = { formData: data }

    const jsonBlob = {
      'data': formListing.formData,
    }

    console.log('jsonBlob', jsonBlob)
    console.log('ipfs', this.ipfsService);
    let ipfsHash
    try {

      ipfsHash = await this.ipfsService.submitFile(jsonBlob)
      console.log('ipfsHash', ipfsHash)
    } catch (error) {
      throw new Error(`IPFS Failure: ${error}`)
    }

    console.log(`IPFS file created with hash: ${ipfsHash} for data:`)
    console.log(jsonBlob)

    const units = 1 
    let transactionReceipt
    try {
      transactionReceipt = await this.contractService.submitListing(
        ipfsHash,
        formListing.formData.price,
        units,
        id)
    } catch (error) {
      console.error(error)
      throw new Error(`ETH Failure: ${error}`)
    }

    console.log(`Submitted to ETH blockchain with transactionReceipt.tx: ${transactionReceipt.tx}`)
    return transactionReceipt
  }

  async buy(address, unitsToBuy, ethToPay) {
    const value = this.contractService.web3.utils.toWei(String(ethToPay), "ether")
    return await this.contractFn(address, "buyListing", [unitsToBuy], {value:value, gas: 750000})
  }

  async close(address) {
    return await this.contractFn(address, "close")
  }

  async purchasesLength(address) {
    return Number(await this.contractFn(address, "purchasesLength"))
  }

  async purchaseAddressByIndex(address, index) {
    return await this.contractFn(address, "getPurchase", [index])
  }
}

export default Listings 
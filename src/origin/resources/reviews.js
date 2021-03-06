import ResourceBase from "./_resource-base"

class Reviews extends ResourceBase{
  constructor({ contractService, ipfsService }) {
    super({ contractService, ipfsService })
    this.contractDefinition = this.contractService.purchaseContract
  }

  async find(where = {}){
      if(where.purchaseAddress){
        return await this._find_by_purchase_id(where.purchaseAddress)
      }
  }

  async _find_by_purchase_id(address){
    const self = this
    const web3 = this.contractService.web3
    const purchaseDefinition = this.contractService.purchaseContract
    const purchaseContract = new web3.eth.Contract(purchaseDefinition.abi, address)
    return new Promise((resolve, reject) => {
      purchaseContract.getPastEvents('allEvents', { fromBlock: 0 }, function(error, rawLogs) {
        if (error) {
          return reject(error)
        }
        let logs = rawLogs
        .filter((x)=> x.event == "PurchaseReview")
        .map(log => {
          const values = log.returnValues
          const hasHash = values.ipfsHash != "0x0000000000000000000000000000000000000000000000000000000000000000"
          const ipfsHash = (hasHash ? self.contractService.getIpfsHashFromBytes32(values.ipfsHash) : undefined)
          return {
            purchaseAddress: address,
            reviewerAddress: values.reviewer,
            revieweeAddress: values.reviewee,
            revieweeRole: ["BUYER", "SELLER"][values.revieweeRole],
            rating: parseInt(values.rating),
            ipfsHash: ipfsHash,
            reviewText: "",
            transactionHash: log.transactionHash,
            blockNumber: log.blockNumber,
            blockHash: log.blockHash
          }
        })
        const addReviewDetails = async event => {
          if(event.ipfsHash == undefined){
            return
          }
          const data = await self.ipfsService.getFile(event.ipfsHash)
          event.reviewText = data.reviewText
        }
        const addTimestampFn = async event => {
          event.timestamp = (await self.contractService.getBlock(
            event.blockHash
          )).timestamp
        }
        const fetchPromises = [].concat(
          logs.map(addReviewDetails),
          logs.map(addTimestampFn)
        )
        Promise.all(fetchPromises)
          .then(() => {
            resolve(logs)
          })
          .catch(error => reject(error))
      })
    })
  }
}

export default Reviews 
import ResourceBase from "./_resource-base"
import userSchema from "../schemas/user.json"
import {
  fromRpcSig,
  ecrecover,
  toBuffer,
  bufferToHex,
  pubToAddress
} from "ethereumjs-util"
import Web3 from "web3"

var Ajv = require('ajv')
var ajv = new Ajv()

const selfAttestationClaimType = 13 // TODO: use the correct number here
const zeroAddress = "0x0000000000000000000000000000000000000000"

let validateUser = (data) => {
  let validate = ajv.compile(userSchema)
  if (!validate(data)) {
    throw new Error('Invalid user data')
  } else {
    return data
  }
}

class UserObject {
  constructor({ address, profile, attestations, identityAddress } = {}) {
    this.address = address
    this.profile = profile
    this.attestations = attestations
    this.identityAddress = identityAddress
  }
}

class Users extends ResourceBase {
  constructor({ contractService, ipfsService }) {
    super({ contractService, ipfsService })
    this.web3EthAccounts = this.contractService.web3.eth.accounts
  }

  async set({ profile, attestations = [] }) {
    if (profile && validateUser(profile)) {
      let selfAttestation = await this.profileAttestation(profile)
      attestations.push(selfAttestation)
    }
    let newAttestations = await this.newAttestations(attestations)
    return await this.addAttestations(newAttestations)
  }

  async get(address) {
    const identityAddress = await this.identityAddress(address)
    if (identityAddress) {
      const userData = await this.getClaims(identityAddress)
      const obj = Object.assign({}, userData, { address, identityAddress })

      return new UserObject(obj)
    }
    return new UserObject({ address })
  }

  async identityAddress(address) {
    let account = await this.contractService.currentAccount()
    let userRegistry = await this.contractService.deployed(this.contractService.userRegistryContract)
    address = address || account
    let result = await userRegistry.methods.users(address).call()
    if (String(result) === zeroAddress) {
      return false
    } else {
      return result
    }
  }

  async newAttestations(attestations) {
    let identityAddress = await this.identityAddress()
    let existingAttestations = []
    if (identityAddress) {
      let claims = await this.getClaims(identityAddress)
      existingAttestations = claims.attestations
    }
    return attestations.filter((attestation) => {
      let matchingAttestation = existingAttestations.filter((existingAttestation) => {
        let claimTypeMatches = attestation.claimType === existingAttestation.claimType
        let dataMatches = attestation.data === existingAttestation.data
        let sigMatches = attestation.signature === existingAttestation.signature
        return claimTypeMatches && dataMatches && sigMatches
      })
      let isNew = matchingAttestation.length === 0
      return isNew
    })
  }

  async addAttestations(attestations) {
    let account = await this.contractService.currentAccount()
    let userRegistry = await this.contractService.deployed(this.contractService.userRegistryContract)
    let identityAddress = await this.identityAddress()
    if (attestations.length) {
      // format params for solidity methods to batch add claims
      let claimTypes = attestations.map(({ claimType }) => claimType)
      let issuers = attestations.map(({ issuer }) => issuer)
      let sigs = "0x" + attestations.map(({ signature }) => {
        return signature.substr(2)
      }).join("")
      let data = "0x" + attestations.map(({ data }) => {
        return data.substr(2)
      }).join("")
      let dataOffsets = attestations.map(() => 32) // all data hashes will be 32 bytes

      if (identityAddress) {
        // batch add claims to existing identity
        return await this.contractService.contractFn(
          this.contractService.claimHolderRegisteredContract,
          identityAddress,
          "addClaims",
          [claimTypes, issuers, sigs, data, dataOffsets],
          { from: account, gas: 4000000 }
        )
      } else {
        // create identity with presigned claims
        return await this.contractService.deploy(
          this.contractService.claimHolderPresignedContract,
          [
            userRegistry.options.address,
            claimTypes,
            issuers,
            sigs,
            data,
            dataOffsets
          ],
          { from: account, gas: 4000000 }
        )
      }
    } else if (!identityAddress) {
      // create identity
      return await this.contractService.deploy(
        this.contractService.claimHolderRegisteredContract,
        [
          userRegistry.options.address,
        ],
        { from: account, gas: 4000000 }
      )
    }
  }

  async isValidAttestation({ claimType, data, signature }, identityAddress) {
    let originIdentity = await this.contractService.deployed(this.contractService.originIdentityContract)
    let msg = Web3.utils.soliditySha3(identityAddress, claimType, data)
    let prefixedMsg = this.web3EthAccounts.hashMessage(msg)
    let dataBuf = toBuffer(prefixedMsg)
    let sig = fromRpcSig(signature)
    let recovered = ecrecover(dataBuf, sig.v, sig.r, sig.s)
    let recoveredBuf = pubToAddress(recovered)
    let recoveredHex = bufferToHex(recoveredBuf)
    let hashedRecovered = Web3.utils.soliditySha3(recoveredHex)
    return await originIdentity.methods.keyHasPurpose(hashedRecovered, 3).call()
  }

  async validAttestations(identityAddress, attestations) {
    let promiseWithValidation = attestations.map(async (attestation) => {
      let isValid = await this.isValidAttestation(attestation, identityAddress)
      return { isValid, attestation }
    })
    let withValidation = await Promise.all(promiseWithValidation)
    let filtered = withValidation.filter(({ isValid, attestation }) => isValid)
    return filtered.map(({ attestation }) => attestation)
  }
}

export default Users
import Web3 from 'web3'
import fs from 'fs'
import path from 'path'
import Logger from './config/logger'
import printBalances from './helpers/print-balances'
import printNonces from './helpers/print-nonces'
import './config/env'

const { abi, networks } = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../build/contracts/SimpleContract.json')))
const {
  PRIVATE_KEY_1: pk1,
  PRIVATE_KEY_2: pk2,
} = process.env

// Initialize web3
const web3 = new Web3('http://localhost:8545')

// Get SimpleContract address from Artifact
const contractAddress = networks['7'].address
Logger.info(`contractAddress: ${contractAddress}`)
// Get contract Web3 object
const simpleContract = new web3.eth.Contract(abi, contractAddress)

// Private key to account
const account0 = web3.eth.accounts.privateKeyToAccount(pk1)
const account1 = web3.eth.accounts.privateKeyToAccount(pk2)

// Create empty accounts
const account2 = web3.eth.accounts.create()
const account3 = web3.eth.accounts.create()

// Get addresses
const addresses = [account0.address, account1.address, account2.address, account3.address];

(async () => {
  try {
    // Print balances and nonces
    Logger.info('Initial state')
    printBalances(web3, addresses)
    printNonces(web3, addresses)
    // Get 10 ether to wei
    const ether = web3.utils.toWei('0.001')
    // Get transaction object to send ether from account 0 to account 2
    const sendEtherTransaction = {
      from: addresses[0],
      to: addresses[2],
      value: web3.utils.toHex(ether),
      gas: 200000,
      chainId: 7,
    }
    // Sign transaction
    let signedTx = await account0.signTransaction(sendEtherTransaction)
    // Send signed transaction
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

    Logger.info(`After sending ${web3.utils.fromWei(ether)} Eth`)
    printBalances(web3, addresses)
    printNonces(web3, addresses)
    // Execute functions
    // Set public value from address 0 (contractOwner)
    let newPublicValue = 307
    let estimatedGas = await simpleContract.methods.setPublicValue(newPublicValue).estimateGas()
    let data = simpleContract.methods.setPublicValue(newPublicValue).encodeABI()
    let setPublicValueTx = {
      from: addresses[0],
      to: contractAddress,
      gasLimit: estimatedGas,
      data,
      chainId: 7,
    }
    signedTx = await account0.signTransaction(setPublicValueTx)
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

    // Set public value from address 1
    newPublicValue = 310
    estimatedGas = await simpleContract.methods.setPublicValue(newPublicValue).estimateGas()
    data = simpleContract.methods.setPublicValue(newPublicValue).encodeABI()
    setPublicValueTx = {
      from: addresses[1],
      to: contractAddress,
      gasLimit: estimatedGas,
      data,
      chainId: 7,
    }
    signedTx = await account1.signTransaction(setPublicValueTx)
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

    // Set private value from address 0
    let newPrivateValue = 3188
    estimatedGas = await simpleContract.methods.setPrivateValue(newPrivateValue).estimateGas()
    data = simpleContract.methods.setPrivateValue(newPrivateValue).encodeABI()
    let setPrivateValueTx = {
      from: addresses[0],
      to: contractAddress,
      gasLimit: estimatedGas,
      data,
      chainId: 7,
    }
    signedTx = await account0.signTransaction(setPrivateValueTx)
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

    // Set private value from address 1 (it will revert because of Ownable contract)
    newPrivateValue = 3189
    estimatedGas = await simpleContract.methods.setPrivateValue(newPrivateValue).estimateGas()
    data = simpleContract.methods.setPrivateValue(newPrivateValue).encodeABI()
    setPrivateValueTx = {
      from: addresses[1],
      to: contractAddress,
      gasLimit: estimatedGas,
      data,
      chainId: 7,
    }
    signedTx = await account1.signTransaction(setPrivateValueTx)
    await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
  } catch (error) {
    Logger.error(error)
  }
})()

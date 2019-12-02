import './config/env'
import { CeloContract, newKit } from '@celo/contractkit'
// import {
//   requestTxSig,
//   waitForSignedTxs,
// } from '@celo/dappkit'
import fs from 'fs'
import path from 'path'
import Logger from './config/logger'

const noChecksumAddress1 = 'e0395f45e534848e626b691c3db33b884e2837fa'
const noChecksumAddress2 = '6a0ebff8c9154ab69631b86234374ae952a66032'
const wallet1 = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../keystore/${noChecksumAddress1}`)))
const wallet2 = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../keystore/${noChecksumAddress2}`)));

(async () => {
  try {
    // const alfajoresUrl = 'https://alfajores-infura.celo-testnet.org'
    const alfajoresUrl = 'https://alfajores-forno.celo-testnet.org/'
    const kit = newKit(alfajoresUrl)
    const { web3 } = kit
    const accounts = web3.eth.accounts.wallet.decrypt([wallet1, wallet2], 'celopipol')
    const address1 = web3.utils.toChecksumAddress(noChecksumAddress1)
    console.log(address1)
    const address2 = web3.utils.toChecksumAddress(noChecksumAddress2)
    kit.addAccount(accounts['0'].privateKey)
    kit.addAccount(accounts['1'].privateKey)

    // State defaults
    kit.defaultAccount = address1
    // This line gives an 'kit.setGasCurrency is not a function' error
    // await kit.setGasCurrency(CeloContract.StableToken)
    // await kit.setFeeCurrency(CeloContract.StableToken)

    // cGLD
    const goldtoken = await kit.contracts.getGoldToken()
    const goldBalance = await goldtoken.balanceOf(address1)

    // cUSD
    const stabletoken = await kit.contracts.getStableToken()
    const usdBalance = await stabletoken.balanceOf(address1)

    Logger.info(`cGLD: ${web3.utils.fromWei(goldBalance.toString(10))}`)
    Logger.info(`cUSD: ${web3.utils.fromWei(usdBalance.toString(10))}`)

    // Contracts
    const oneEther = kit.web3.utils.toWei('1', 'ether')
    const tx = await goldtoken.transfer(address2, oneEther).send({
      from: address1,
    })
    // const tx = await stabletoken.transfer(address2, oneEther).send({
    //   from: address1,
    // })
    // const tx = await stabletoken.transfer(address2, oneEther).send()
    // const tx = await stabletoken.transferFrom(address1, address2, oneEther).send({})
    const hash = await tx.getHash()
    const receipt = await tx.waitReceipt()
    console.log(hash, receipt)
    // const tx = await goldtoken.transfer(address2, oneGold).txo
    // const nonce = await web3.eth.getTransactionCount(address1)
    // const estimatedGas = await tx.estimateGas()
    // const data = await tx.encodeABI()
    // const feeCurrency = await kit.registry.addressFor(CeloContract.StableToken)
    // const params = {
    //   from: address1,
    //   to: address2,
    //   // gasPrice: '0',
    //   gas: estimatedGas,
    //   data,
    //   nonce,
    //   value: '0',
    //   feeCurrency,
    // }
    // const signedTx = await web3.eth.signTransaction(params)
    // console.log(signedTx)
    // console.log(signedTx.raw)
    // await web3.eth.sendSignedTransaction(signedTx)
  } catch (error) {
    Logger.error(error)
  }
})()

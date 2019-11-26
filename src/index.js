import { newKit } from '@celo/contractkit'
import './config/env'
import fs from 'fs'
import path from 'path'
import Logger from './config/logger'

const {
  NODE_ENV,
  ALFAJORES_URL,
  LOCAL_URL,
} = process.env;

(async () => {
  try {
    const noChecksumAddress1 = 'e0395f45e534848e626b691c3db33b884e2837fa'
    const noChecksumAddress2 = '6a0ebff8c9154ab69631b86234374ae952a66032'
    const wallet1 = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../keystore/${noChecksumAddress1}`)))
    const wallet2 = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../keystore/${noChecksumAddress2}`)))
    const kit = newKit(NODE_ENV === 'production' ? ALFAJORES_URL : LOCAL_URL)
    const { web3 } = kit
    const accounts = web3.eth.accounts.wallet.decrypt([wallet1, wallet2], 'celopipol')
    const address1 = web3.utils.toChecksumAddress(noChecksumAddress1)
    const address2 = web3.utils.toChecksumAddress(noChecksumAddress2)
    kit.addAccount(accounts['0'].privateKey)
    kit.addAccount(accounts['1'].privateKey)
    // const { address } = accounts['0']
    // kit.defaultAccount = address
    // cGLD
    const goldtoken = await kit.contracts.getGoldToken()
    const goldBalance = await goldtoken.balanceOf(address1)

    // cUSD
    const stabletoken = await kit.contracts.getStableToken()
    const usdBalance = await stabletoken.balanceOf(address1)

    Logger.info(web3.utils.fromWei(goldBalance.toString(10)))
    Logger.info(web3.utils.fromWei(usdBalance.toString(10)))

    // Contracts
    const oneGold = kit.web3.utils.toWei('1', 'ether')
    const tx = await goldtoken.transfer(address2, oneGold).send({
      from: address1,
    })
    const hash = await tx.getHash()
    const receipt = await tx.waitReceipt()
    Logger.info(hash)
    Logger.info(receipt)
  } catch (error) {
    Logger.error(error)
  }
})()

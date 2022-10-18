import { AlchemyProvider, Formatter } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import {
  ImmutableX,
  Config,
  BalancesApiGetBalanceRequest,
  UnsignedTransferRequest,
  createStarkSigner,
  generateStarkPrivateKey,
  WalletConnection,
} from "@imtbl/core-sdk";
import {
    generateStarkWallet,
    BaseSigner
  } from "@imtbl/core-sdk-old";

// select which environment you want to work in
const config = Config.SANDBOX; // Or PRODUCTION
const ethNetwork = "goerli"; // Or 'mainnet'

// construct the api client
export const client = new ImmutableX(config);
// Create Ethereum signer
//const provider = new AlchemyProvider(ethNetwork, process.env.REACT_APP_ALCHEMY_API_KEY); // make sure this is set in your environment variables.
//const provider = new AlchemyProvider(ethNetwork, "DvukuyBzEK-JyP6zp1NVeNVYLJCrzjp_"); // make sure this is set in your environment variables.


//export const l1Wallet = new Wallet('0x2c82c02d7b0fed1bf0797087b6a1fd56cc4b244c5253d83be092fcb73c00057e'); // make sure this is set in your environment variables.
//declare const ethSigner = l1Wallet.connect(provider);

// Create Stark signer
// const starkPrivateKey = generateStarkPrivateKey(); // 🚨 Warning 🚨 this is non-deterministic, make sure you save your key somewhere!

// const starkSigner = createStarkSigner(starkPrivateKey);
// construct the wallet connection
// export const walletConnection: WalletConnection = { ethSigner, starkSigner };

// deterministic stark (L2) keypair generation

export async function generateSpecificWalletConnection (ethSigner:Signer) {
    const starkWallet = await generateStarkWallet(ethSigner);
    const starkSigner = new BaseSigner(starkWallet.starkKeyPair);
    
    return {
      ethSigner,
      starkSigner
    }
  }

export async function getWalletBalance (ethSigner:Signer) {
  // Get balance of 
  const balanceAPIRequest: BalancesApiGetBalanceRequest = {
    owner: await Promise.resolve(ethSigner.getAddress()),
    address: 'ETH'
  }
  return client.getBalance(balanceAPIRequest) 

  }


export async function createTransfer (walletConnect:WalletConnection, tokenId:string, tokenAddress:string, transferTo:string) {
  // Get details of a signable transfer
  const transferRequest: UnsignedTransferRequest = {
    receiver: transferTo,
    type: 'ERC721',
    tokenId: tokenId,
    tokenAddress: tokenAddress
  } 

  return client.transfer(walletConnect, transferRequest)

  }

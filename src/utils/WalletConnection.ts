import { AlchemyProvider, Formatter } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import {
  ImmutableX,
  Config,
  BalancesApiGetBalanceRequest,
  UnsignedTransferRequest,
  UnsignedOrderRequest,
  createStarkSigner,
  generateStarkPrivateKey,
  GetSignableTradeRequest,
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


export async function createERC721Transfer (walletConnect:WalletConnection, tokenId:string, tokenAddress:string, transferTo:string) {
  // Get details of a signable transfer
  const transferRequest: UnsignedTransferRequest = {
    receiver: transferTo.toLowerCase(),
    type: 'ERC721',
    tokenId: tokenId,
    tokenAddress: tokenAddress.toLowerCase()
  } 
  return client.transfer(walletConnect, transferRequest)
  }

  export async function createERC20Transfer (walletConnect:WalletConnection, amount:string, tokenAddress:string, transferTo:string) {
    // Get details of a signable transfer
    const transferRequest: UnsignedTransferRequest = {
      receiver: transferTo.toLowerCase(),
      type: 'ERC20',
      amount: amount,
      tokenAddress: tokenAddress.toLowerCase()
    } 
    return client.transfer(walletConnect, transferRequest)
    }

  export async function sellERC721ForETH (walletConnect:WalletConnection, tokenId:string, tokenAddress:string, amount:string) {
    const orderRequest: UnsignedOrderRequest = {
      sell: {
        // We are listing our NFT for Sale, so it is an ERC721 on the sell side
        type: "ERC721",
        tokenId: tokenId,
        tokenAddress: tokenAddress,
      },
      buy: {
        // To sell the NFT, we "buying" this amount of ETH - so amount we want for the NFT is on the buy side
        type: "ETH",
        amount: amount, // this is a quantised value
      },
    };
    
     return client.createOrder(walletConnect, orderRequest)
      .then((id) => {
        console.log(`Sell order created, id: ${id.order_id}`); // you'll need this ID to complete a trade later.
      })
      .catch((err) => {
        throw err;
      });
    
      }

      export async function buyOrder (walletConnect:WalletConnection, orderId:number) {
        const tradeRequest: GetSignableTradeRequest = {
          order_id: orderId,
          user: (await walletConnect.ethSigner.getAddress()).toString(),
        };
        
        client.createTrade(walletConnect, tradeRequest)
          .then((id) => {
            console.log(`Trade created, id: ${id.trade_id}`);
          })
          .catch((err) => {
            throw err;
          });
        
          }

      

  export async function createDeposit (walletConnect:WalletConnection, tokenId:string, tokenAddress:string, transferTo:string) {
    // Get details of a signable transfer
    const transferRequest: UnsignedTransferRequest = {
      receiver: transferTo.toLowerCase(),
      type: 'ERC721',
      tokenId: tokenId,
      tokenAddress: tokenAddress.toLowerCase()
    } 
    return client.transfer(walletConnect, transferRequest)
  
    }


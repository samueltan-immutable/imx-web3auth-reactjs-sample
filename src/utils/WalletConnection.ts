import { Signer } from "@ethersproject/abstract-signer";
import {
  ImmutableX,
  Config,
  BalancesApiGetBalanceRequest,
  AssetsApiListAssetsRequest,
  UnsignedTransferRequest,
  UnsignedOrderRequest,
  GetSignableTradeRequest,
  WalletConnection,
} from "@imtbl/core-sdk";
import {
  generateStarkWallet,
  BaseSigner
} from "@imtbl/core-sdk-old";
import { Web3Provider } from "@ethersproject/providers"

// select which environment you want to work in
const config = Config.SANDBOX; // Or PRODUCTION
const ethNetwork = "goerli"; // Or 'mainnet'

// construct the api client
export const client = new ImmutableX(config);

//setup a wrapper Wallet type to have all the key components we need for core-sdk operations
export type Wallet = {
  signer: Signer,
  provider: Web3Provider,
  walletConnection: WalletConnection,
  address: string,
}

//setup the WalletConnection object that Core-SDK needs using the L1 signer and 
//generating the L2 stark private key leveragin Core SDK 0.7 exposed functions
export async function generateSpecificWalletConnection(ethSigner: Signer) {
  const starkWallet = await generateStarkWallet(ethSigner);
  const starkSigner = new BaseSigner(starkWallet.starkKeyPair);

  return {
    ethSigner,
    starkSigner
  }
}

//check if user wallet has been registered on IMX and if not setup on IMX
export async function needToRegister(wallet: Wallet) {
  try {
    await client.getUser(wallet.address);
    console.log("User is already registered")
  } catch(e) {
      console.log(e);
      try {
        console.log('User is unregistered. Need to register user.')
        await client.registerOffchain(wallet.walletConnection);
        console.log("User has successfully been registered")
      } catch {
        throw new Error('Error in user registration');
      }
  }
}

//get the IMX ETH balance of the wallet
export async function getWalletBalance(wallet: Wallet) {
  // Get balance of the users wallet
  const balanceAPIRequest: BalancesApiGetBalanceRequest = {
    owner: wallet.address,
    address: 'ETH'
  }
  return client.getBalance(balanceAPIRequest)
}

//get the L2 IMX assets owned by the wallet
export async function getAssets(wallet: string) {
  // Get all assets in the users wallet
  const assetAPIRequest: AssetsApiListAssetsRequest = {
    user: wallet
  }
  return client.listAssets(assetAPIRequest)
}

//create an ERC721 transfer on IMX
export async function createERC721Transfer(wallet: Wallet, tokenId: string, tokenAddress: string, transferTo: string) {
  // Assemble ERC721 Unsigned Transfer request
  const transferRequest: UnsignedTransferRequest = {
    receiver: transferTo.toLowerCase(),
    type: 'ERC721',
    tokenId: tokenId,
    tokenAddress: tokenAddress.toLowerCase()
  }
  return client.transfer(wallet.walletConnection, transferRequest)
}

//create an ERC20 transfer on IMX
export async function createERC20Transfer(wallet: Wallet, amount: string, tokenAddress: string, transferTo: string) {
  // Assemble ERC20 Unsigned Transfer request
  const transferRequest: UnsignedTransferRequest = {
    receiver: transferTo.toLowerCase(),
    type: 'ERC20',
    amount: amount,
    tokenAddress: tokenAddress.toLowerCase()
  }
  return client.transfer(wallet.walletConnection, transferRequest)
}

//sell ERC721 for ETH based on input amount
export async function sellERC721ForETH(wallet: Wallet, tokenId: string, tokenAddress: string, amount: string) {
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

  return client.createOrder(wallet.walletConnection, orderRequest)
    .then((id) => {
      console.log(`Sell order created, id: ${id.order_id}`); // you'll need this ID to complete a trade later.
    })
    .catch((err) => {
      throw err;
    });

}

//buy an order on IMX
export async function buyOrder(wallet: Wallet, orderId: number) {
  const tradeRequest: GetSignableTradeRequest = {
    order_id: orderId,
    user: wallet.address,
  };

  client.createTrade(wallet.walletConnection, tradeRequest)
    .then((id) => {
      console.log(`Trade created, id: ${id.trade_id}`);
    })
    .catch((err) => {
      throw err;
    });

}
//deposit some ETH from L1 to L2 IMX
export async function createETHDeposit(wallet: Wallet, amount: string) {

  // Deposit ETH
  return await client.deposit(wallet.signer, {
    type: 'ETH',
    amount: amount,
  })
  .then((id) => {
    console.log(`Deposit created, tx: ${id.hash} amount: ${id.value}`);
  })
  .catch((err) => {
    throw err;
  });

}


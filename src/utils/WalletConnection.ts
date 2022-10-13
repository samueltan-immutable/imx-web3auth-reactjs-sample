import { AlchemyProvider, Formatter } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import {
  ImmutableX,
  Config,
  createStarkSigner,
  generateStarkPrivateKey,
  WalletConnection,
} from "@imtbl/core-sdk";
import {
    generateStarkWallet,
    BaseSigner
  } from "@imtbl/core-sdk-old";
import { getEnv } from "./getEnv";
import * as dotenv from 'dotenv'
dotenv.config()

// select which environment you want to work in
const config = Config.SANDBOX; // Or PRODUCTION
const ethNetwork = "goerli"; // Or 'mainnet'

// construct the api client
export const client = new ImmutableX(config);
// Create Ethereum signer
const provider = new AlchemyProvider(ethNetwork, getEnv("REACT_APP_ALCHEMY_API_KEY")); // make sure this is set in your environment variables.

export const l1Wallet = new Wallet(getEnv("REACT_APP_ETH_PRIVATE_KEY")); // make sure this is set in your environment variables.
const ethSigner = l1Wallet.connect(provider);

// Create Stark signer
// const starkPrivateKey = generateStarkPrivateKey(); // 🚨 Warning 🚨 this is non-deterministic, make sure you save your key somewhere!

// const starkSigner = createStarkSigner(starkPrivateKey);
// construct the wallet connection
// export const walletConnection: WalletConnection = { ethSigner, starkSigner };

// deterministic stark (L2) keypair generation
export const generateWalletConnection = async () => {
    
    const starkWallet = await generateStarkWallet(ethSigner);
    const starkSigner = new BaseSigner(starkWallet.starkKeyPair);
    
    return {
      ethSigner,
      starkSigner
    }
  }

export async function generateSpecificWalletConnection (privateKey:string) {
    const l1Wallet_spec = new Wallet(getEnv(privateKey));
    const ethSigner = l1Wallet_spec.connect(provider);
    const starkWallet = await generateStarkWallet(ethSigner);
    const starkSigner = new BaseSigner(starkWallet.starkKeyPair);
    
    return {
      ethSigner,
      starkSigner
    }
  }
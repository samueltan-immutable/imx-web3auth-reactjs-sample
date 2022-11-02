import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/web3auth";
import { CHAIN_NAMESPACES, SafeEventEmitterProvider } from "@web3auth/base";
import RPC from "./web3RPC";
import "./App.css";
import {
  Wallet,
  needToRegister,
  createERC721Transfer,
  getAssets,
  createETHDeposit,
  generateSpecificWalletConnection,
  getWalletBalance,
  sellERC721ForETH,
  buyOrder,
} from "./utils/WalletConnection";
import { Web3Provider } from "@ethersproject/providers";
//import {Web3} from "web3";
import { useModal } from "./useModal";
import { Modal } from "./modal/modal";
import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";

const clientId =
  "BFPl1lD-zUhMkA1l9moBsaCVWET-tFVkWDyPbUlcTatNTAyhKzfMpqhqm-7vY2qnbtSfdd1jItBq5aWtdF3IjUE"; // get from https://dashboard.web3auth.io

//For Mainnet
/* chainConfig: {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1",
  rpcTarget: "https://rpc.ankr.com/eth", // This is the public RPC we have added, please pass on your own endpoint while creating an app
}, */

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth>(
    new Web3Auth({
      clientId,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x5",
        displayName: "Goerli Testnet",
        blockExplorer: "https://goerli.etherscan.io",
        rpcTarget: "https://rpc.ankr.com/eth_goerli", // This is the public RPC we have added, please pass on your own endpoint while creating an app
      },
    })
  );
  const { isShown, toggle } = useModal();
  const [data, updateModal] = useState<JSX.Element>(
    <React.Fragment></React.Fragment>
  );

  const [wallet, setWalletState] = useState<Wallet | null>(null);

  const setCurrentWallet = async (
    web3AuthProvider: SafeEventEmitterProvider | null
  ) => {
    if (web3AuthProvider === null) {
      setWalletState(null);
      return;
    }
    const provider = new Web3Provider(web3AuthProvider);
    const signer = provider.getSigner();
    const address = (await signer.getAddress()).toLowerCase();
    const walletConnection = await generateSpecificWalletConnection(signer);

    setWalletState({
      signer,
      provider,
      walletConnection,
      address,
    });
  };

  useEffect(() => {
    const init = async () => {
      try {
        await web3auth.initModal();
        if (web3auth.provider) return "No Valid Web3 Provider";
        await setCurrentWallet(web3auth.provider);
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  //login user wallet
  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    if (web3authProvider == null) return;
    setCurrentWallet(web3authProvider);
  };

  //get web3auth user info
  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    showModal(user, updateModal, toggle);
  };

  //get Web3auth token details
  const getidToken = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    showModal(idToken, updateModal, toggle);
  };

  //Get IMX ETH balance of wallet
  const checkIMXBalance = async () => {
    if (!wallet) {
      console.log("Wallet not initialized yet");
      return;
    }
    try {
      const balance = await getWalletBalance(wallet);
      showModal(balance, updateModal, toggle);
    } catch (error) {
      throw new Error(JSON.stringify(error, null, 4));
    }
  };

  //Make sure the wallet is registered with IMX
  const connectWithIMX = async () => {
    if (!wallet) {
      console.log("Wallet not initialized yet");
      return;
    }
    try {
      const result = needToRegister(wallet);
      showModal(result, updateModal, toggle);
    } catch (error) {
      throw new Error(JSON.stringify(error, null, 4));
    }
  };

  //Transfer an ERC721 from users wallet to a target wallet
  const doERC721Transfer = async () => {
    if (!wallet) {
      console.log("Wallet not initialized yet");
      return;
    }
    try {
      //check if target wallet has been registered
      needToRegister(wallet);

      const target_wallet = "0xF6372939CE2d14A68A629B8E4785E9dCB4EdA0cf";
      const token_address_for_sale =
        "0x7510f4d7bcaa8639c0f21b938662071c2df38c73";
      const token_id_for_sale = "328";
      const result = await createERC721Transfer(
        wallet,
        token_id_for_sale,
        token_address_for_sale,
        target_wallet
      );
      showModal(result, updateModal, toggle);
    } catch (error) {
      console.error(error);
    }
  };

  //Buy a specific IMX Order_ID
  const doBuyOrder = async () => {
    if (!wallet) {
      console.log("Wallet not initialized yet");
      return;
    }
    try {
      //make sure wallet is registered before doing something
      needToRegister(wallet);
      const order_id_to_buy = 328;
      const result = await buyOrder(wallet, order_id_to_buy);
      showModal(result, updateModal, toggle);
    } catch (error) {
      console.error(error);
    }
  };

  //Sell IMX ERC721 for ETH
  const doSellERC721forETH = async () => {
    if (!wallet) {
      console.log("Wallet not initialized yet");
      return;
    }
    try {
      //make sure wallet is registered before doing something
      needToRegister(wallet);

      const token_address_for_sale =
        "0x7510f4d7bcaa8639c0f21b938662071c2df38c73";
      const token_id_for_sale = "152";
      //amount is quantized -
      const amount_eth_for_sale = "10000000000000000";
      const result = await sellERC721ForETH(
        wallet,
        token_id_for_sale,
        token_address_for_sale,
        amount_eth_for_sale
      );
      showModal(result, updateModal, toggle);
    } catch (error) {
      console.error(error);
    }
  };

  //Write to console all asset in a wallet
  const getAssetsIOwn = async () => {
    if (!wallet) {
      console.log("Wallet not initialized yet");
      return;
    }
    try {
      const balance = await getAssets(wallet.address);
      showModal(balance, updateModal, toggle);
    } catch (error) {
      console.error(error);
    }
  };

  //Deposit 0.01 ETH to IMX
  const depositETHtoIMX = async () => {
    if (!wallet) {
      console.log("Wallet not initialized yet");
      return;
    }
    try {
      //make sure wallet is registered before doing something
      needToRegister(wallet);
      const amount_to_deposit = "100000000000000000";
      const result = await createETHDeposit(wallet, amount_to_deposit);
      showModal(result, updateModal, toggle);
    } catch (error) {
      console.error(error);
    }
  };

  //Logout current wallet
  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setWalletState(null);
  };

  //get chain information for wallet
  const getChainId = async () => {
    if (!wallet) {
      console.log("Wallet not initialized yet");
      return;
    }
    const chainId = await wallet.provider?.getNetwork();
    showModal(chainId, updateModal, toggle);

  };

  //get L1 wallet addresses
  const getAccounts = async () => {
    if (!wallet) {
      console.log("Wallet not initialized yet");
      return;
    }
    const address = await wallet.provider?.listAccounts();
    showModal(address, updateModal, toggle);
  };

  //get L1 balance of wallet
  const getBalance = async () => {
    if (!wallet) {
      console.log("Wallet not initialized yet");
      return;
    }
    const balance = await wallet.provider?.getBalance(wallet?.address);
    showModal(balance, updateModal, toggle);
  };

  //sign a specific message using wallet
  const signMessage = async () => {
    if (!wallet) {
      console.log("Wallet not initialized yet");
      return;
    }

    const originalMessage = "YOUR_MESSAGE";

    // Sign the message
    const signedMessage = await wallet?.signer.signMessage(originalMessage);
    console.log(signedMessage);
    showModal(signedMessage, updateModal, toggle);
  };

  //get private key if available
  const getPrivateKey = async () => {
    if (!web3auth.provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(web3auth.provider);
    const privateKey = await rpc.getPrivateKey();
    showModal(privateKey, updateModal, toggle);
  };

  const loggedInView = (
    <>
      <div id="modal"></div>
      <button onClick={getUserInfo} className="card">
        Get User Info
        <Modal
          isShown={isShown}
          hide={toggle}
          modalContent={data}
          headerText={"Result"}
        />
      </button>
      <button onClick={getidToken} className="card">
        Get ID Token
      </button>
      <button onClick={getChainId} className="card">
        Get Chain ID
      </button>
      <button onClick={getAccounts} className="card">
        Get Accounts
      </button>
      <button onClick={getBalance} className="card">
        Get Balance
      </button>
      <button onClick={signMessage} className="card">
        Sign Message
      </button>
      <button onClick={getPrivateKey} className="card">
        Get Private Key
      </button>
      <button onClick={connectWithIMX} className="card">
        Connect with IMX
      </button>
      <button onClick={checkIMXBalance} className="card">
        Get IMX Balance
      </button>
      <button onClick={getAssetsIOwn} className="card">
        Get IMX Assets
      </button>
      <button onClick={depositETHtoIMX} className="card">
        Deposit 0.01 ETH to IMX
      </button>
      <button onClick={doERC721Transfer} className="card">
        Transfer ERC721
      </button>
      <button onClick={doSellERC721forETH} className="card">
        Sell ERC721 for ETH
      </button>
      <button onClick={doBuyOrder} className="card">
        Buy OrderID
      </button>
      <button onClick={logout} className="card">
        Log Out
      </button>

      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>
    </>
  );

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>
        <a
          target="_blank"
          href="https://docs.x.immutable.com/"
          rel="noreferrer"
        >
          + IMX
        </a>
        <a target="_blank" href="https://reactjs.org/" rel="noreferrer">
          + ReactJS Example
        </a>
      </h1>

      <div className="grid">{wallet ? loggedInView : unloggedInView}</div>

      <footer className="footer">
        <a
          href="https://github.com/samueltan-immutable/web3auth-test"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  );
}

function showModal(content: any, updateModal: React.Dispatch<React.SetStateAction<JSX.Element>>, toggle: () => void) {
  const json = JSON.stringify(content, null, 2)
  console.log(json);
  const modal = (
    <React.Fragment>
      <SyntaxHighlighter language="json" style={github} wrapLongLines={true}>
        {json}
      </SyntaxHighlighter>
    </React.Fragment>
  );
  updateModal(modal);
  toggle();
}

export default App;
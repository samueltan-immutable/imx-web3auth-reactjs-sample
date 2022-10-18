import { useEffect, useState } from "react";
import { Web3Auth } from "@web3auth/web3auth";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import RPC from "./web3RPC";
import { Signer } from "@ethersproject/abstract-signer";
import "./App.css";
import { client, createTransfer, generateSpecificWalletConnection, getWalletBalance } from "./utils/WalletConnection";
import {Web3Provider} from "@ethersproject/providers"
import {utils} from "web3";

const clientId = "BFPl1lD-zUhMkA1l9moBsaCVWET-tFVkWDyPbUlcTatNTAyhKzfMpqhqm-7vY2qnbtSfdd1jItBq5aWtdF3IjUE"; // get from https://dashboard.web3auth.io

function App() {
  const [web3auth, setWeb3auth] = useState<Web3Auth>(
    new Web3Auth({
      clientId,
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.EIP155,
        chainId: "0x1",
        rpcTarget: "https://rpc.ankr.com/eth", // This is the public RPC we have added, please pass on your own endpoint while creating an app
      },
    })
  );
  const [provider, setProvider] = useState<Web3Provider | null>(null);
  const [signer, setSigner] = useState<Signer | null>(null);

  useEffect(() => {
    const init = async () => {
      try {

      await web3auth.initModal();
        if (web3auth.provider) {
          const provider = new Web3Provider (web3auth.provider)
          if (provider == null) return;
          setProvider(provider);
          setSigner(provider.getSigner());
        };
      } catch (error) {
        console.error(error);
      }
    };

    init();
  }, []);

  const login = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const web3authProvider = await web3auth.connect();
    if (web3authProvider == null) return;
    const provider = new Web3Provider (web3authProvider)
    if (!provider) return;
    setProvider(provider);
    setSigner(provider.getSigner());
    
  };

  const getUserInfo = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const user = await web3auth.getUserInfo();
    console.log(user);
  };


  const getidToken = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    const idToken = await web3auth.authenticateUser();
    console.log(idToken);
  };

  // Checks that the user is registered.
  async function checkUserRegistration(address: string): Promise<boolean> {
    try {
      const user = await client.getUser(address);
      return Boolean(user.accounts.length) 
    }
    catch (error)
    {
      console.error(JSON.stringify(error, null, 2));
      return false;
    }
    
  }

  const checkIMXBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    try {const balance = await getWalletBalance(provider.getSigner());
      console.log(JSON.stringify(balance, null, 4));
    } catch (error) {
      throw new Error(JSON.stringify(error, null, 4));
    }
  };

  const connectWithIMX = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    try {
     
      //fetch the web3auth using ethers web3 provider
      const walletConnection = await generateSpecificWalletConnection(provider.getSigner());
      const address = await walletConnection.ethSigner.getAddress();
      const isRegistered = await checkUserRegistration(address);
      console.log(isRegistered);
      if (!isRegistered) {
        console.log ('Registering new user')
        await client.registerOffchain(walletConnection);
      }
    } catch (error) {
      throw new Error(JSON.stringify(error, null, 4));
    }
  };

  const doERC721Transfer = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    try {
     
      //check if target wallet has been registered
      const walletConnection = await generateSpecificWalletConnection(provider.getSigner());
      const address = await walletConnection.ethSigner.getAddress();
      const isRegistered = await checkUserRegistration(address);
      console.log(isRegistered);
      if (!isRegistered) {
        console.log ('Registering new user')
        await client.registerOffchain(walletConnection);
      }

      const walletConnection2 = await generateSpecificWalletConnection(provider.getSigner());
      const balance = await createTransfer(walletConnection2, '1', '1','address');
      console.log(JSON.stringify(balance, null, 4));

    } catch (error) {
      throw new Error(JSON.stringify(error, null, 4));
    }
  };

  const logout = async () => {
    if (!web3auth) {
      console.log("web3auth not initialized yet");
      return;
    }
    await web3auth.logout();
    setProvider(null);
    setSigner(null);
  };

  const getChainId = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const chainId = await provider?.getNetwork();
    console.log(chainId);
  };
  const getAccounts = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const address = await provider?.listAccounts();
    console.log(address);
  };

  const getBalance = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }
    const balance = await provider?.getBalance(provider?.getSigner().getAddress());
    console.log(balance);
  };

  const sendTransaction = async () => {
    if (!signer) {
      console.log("provider not initialized yet");
      return;
    }
    const destination = signer.getAddress();

    const amount = utils.toWei("0.001"); // Convert 1 ether to wei

    // Submit transaction to the blockchain and wait for it to be mined
    const receipt = await signer.sendTransaction({
      from: signer.getAddress(),
      to: destination,
      value: amount,
      maxPriorityFeePerGas: "5000000000", // Max priority fee per gas
      maxFeePerGas: "6000000000000", // Max fee per gas
    });
    console.log(receipt);
  };

  const signMessage = async () => {
    if (!provider) {
      console.log("provider not initialized yet");
      return;
    }

    const originalMessage = "YOUR_MESSAGE";

    // Sign the message
    const signedMessage = await provider?.getSigner().signMessage(originalMessage)
    console.log(signedMessage);
  };

  const getPrivateKey = async () => {
    if (!web3auth.provider) {
      console.log("provider not initialized yet");
      return;
    }
    const rpc = new RPC(web3auth.provider);
    const privateKey = await rpc.getPrivateKey();
    console.log(privateKey);
  };
  const loggedInView = (
    <>
      <button onClick={getUserInfo} className="card">
        Get User Info
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
      <button onClick={sendTransaction} className="card">
        Send Transaction
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
      <button onClick={doERC721Transfer} className="card">
        Transfer ERC721
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
        & ReactJS Example
      </h1>

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>

      <footer className="footer">
        <a href="https://github.com/Web3Auth/Web3Auth/tree/master/examples/react-app" target="_blank" rel="noopener noreferrer">
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;
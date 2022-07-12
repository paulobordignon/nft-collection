import React, { useEffect, useState } from "react";
import "./styles/App.css";
import { ethers } from "ethers";
import MyEpicNft from "./utils/MyEpicNFT.json";

const CONTRACT_ADDRESS = "0x89a702d966256c04Cdf9915D4D7828b2E2cF08Cc";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentNFTLink, setCurrentNFTLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastURI, setLastURI] = useState("");
  const [codeImage, setCodeImage] = useState(null);
  const [rinkebyConnected, setRinkebyConnected] = useState(false);

  useEffect(() => {
    if (lastURI){
      const [, jsonContentEncoded] = lastURI.split("base64,");
      const { image } = JSON.parse(atob(jsonContentEncoded));
      setCodeImage(image);
    }
  }, [lastURI]);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Certifique-se que você tem metamask instalado!")
      return;
    } else {
      console.log("Temos o objeto ethereum!", ethereum)
    }
    const accounts = await ethereum.request({ method: "eth_accounts" });
    let chainId = await ethereum.request({ method: 'eth_chainId' });
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
    const rinkebyChainId = "0x4"; 
    if (chainId !== rinkebyChainId) {
      setRinkebyConnected(false);
    } else {
      setRinkebyConnected(true);
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Baixe o Metamask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Conectado", accounts[0]);
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, MyEpicNft.abi, signer)

        connectedContract.on("NewEpicNFTMinted", (from, tokenId, finalTokenUri) => {
          console.log(from, tokenId.toNumber())
          console.log('metadata', finalTokenUri)
          setCurrentNFTLink(`https://testnets.opensea.io/assets/rinkeby/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`)
          setLastURI(finalTokenUri);
        })

        console.log("Setup event listener!")
      } else {
        console.log("Objeto ethereum não existe!")
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          MyEpicNft.abi,
          signer
        );
        console.log("Vai abrir a carteira agora para pagar o gás...");
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setLoading(true);
        console.log("Cunhando...espere por favor.");
        await nftTxn.wait();
        setLoading(false);
        console.log(
          `Cunhado, veja a transação: https://goerli.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Objeto ethereum não existe!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect
    </button>
  )
  
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Single. Incredible. Find your NFT today.
          </p>
          <p className="by-text"> by {` `}
            <a
              className="by-text"
              href={'https://github.com/paulobordignon'}
              target="_blank"
              rel="noreferrer"
            >{`@paulobordignon`}
            </a>
          </p>
          <div className="connect-block">
            {!rinkebyConnected ? 
              <p className="text">Please use Rinkeby network</p> 
            : currentAccount === "" ? (
              renderNotConnectedContainer()
            ) : 
              loading ? 
                <p className="text"> Minting... </p>
              : 
                <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                  Mint NFT
                </button>
            }
          </div>
          {currentNFTLink &&
            <div className="block-minted">
               {codeImage && (
                <img
                  className="nft-preview"
                  src={codeImage}
                  alt="NFT preview"
                />
              )}
              <div className="links-block">
                <p>
                  <span role="img" aria-label="wave">🌊</span>
                  <a href={currentNFTLink} className="text" target="_blank">click here to see on opensea</a>
                  <span role="img" aria-label="wave">🌊</span>
                </p>
                <p>
                  <span role="img" aria-label="true">👍</span>
                  <a href={`https://testnets.opensea.io/collection/incredible-nfts-v3`} className="text" target="_blank">or see the collection</a>
                  <span role="img" aria-label="true">👍</span>
                </p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default App;

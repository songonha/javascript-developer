// Importing necessary functions from ethers for client-side interaction
import { ethers, BrowserProvider, Contract } from 'ethers';
import NewsArchiveABI from './newsArchiveABI.json';

// Function to check if MetaMask is installed
export const checkIfWalletIsConnected = async () => {
  try {
    if (!window.ethereum) {
      console.error("Please install MetaMask!");
      return null;
    }
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (accounts.length === 0) {
      console.log("No authorized accounts found");
      return null;
    }
    
    return accounts[0];
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    return null;
  }
};

// Function to check if connected wallet is the contract owner
export const checkIfOwner = async () => {
  try {
    const account = await checkIfWalletIsConnected();
    if (!account) return false;
    
    // Get contract address
    const contractAddress = import.meta.env.PUBLIC_CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890";
    
    // Initialize provider
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Create contract instance
    const newsArchiveContract = new Contract(
      contractAddress,
      NewsArchiveABI,
      signer
    );
    
    // Get owner address
    const ownerAddress = await newsArchiveContract.owner();
    
    // Compare owner address with connected account
    return account.toLowerCase() === ownerAddress.toLowerCase();
  } catch (error) {
    console.error("Error checking owner status:", error);
    return false;
  }
};

// Function for owner to call sendRequest function directly
export const callSendRequestAsOwner = async () => {
  try {
    // Check if user is the owner
    const isOwner = await checkIfOwner();
    if (!isOwner) {
      throw new Error("Only the contract owner can call this function");
    }

    // Get contract address
    const contractAddress = import.meta.env.PUBLIC_CONTRACT_ADDRESS || "0x16F52E327e57cEB124Db335306c3E15D4EF5650b";
    
    console.log("Using contract address:", contractAddress);

    // Initialize ethers provider
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Create contract instance
    const newsArchiveContract = new Contract(
      contractAddress,
      NewsArchiveABI,
      signer
    );

    // Call sendRequest function
    const tx = await newsArchiveContract.sendRequest();
    
    // Wait for transaction to be mined
    const receipt = await tx.wait();
    
    return {
      success: true,
      message: "Request sent successfully! Request ID: " + receipt.logs[0].topics[1],
      txHash: tx.hash,
      requestId: receipt.logs[0].topics[1]
    };
    
  } catch (error) {
    console.error("Error calling sendRequest:", error);
    return {
      success: false,
      message: error.message || "Failed to send request",
      error
    };
  }
};

// Function to send a URL to the smart contract
export const sendUrlToContract = async (url) => {
  try {
    // Check if user has connected their wallet
    const account = await checkIfWalletIsConnected();
    if (!account) {
      throw new Error("Please connect your wallet first");
    }

    // Get contract address from environment variable or use a fallback
    const contractAddress = import.meta.env.PUBLIC_CONTRACT_ADDRESS || "0x16F52E327e57cEB124Db335306c3E15D4EF5650b";
    
    console.log("Using contract address:", contractAddress);

    // Initialize ethers provider using browser's ethereum object
    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    // Create contract instance
    const newsArchiveContract = new Contract(
      contractAddress,
      NewsArchiveABI,
      signer
    );

    // Send transaction using the correct function name from the ABI
    // Instead of addArticle, use sendRequest which appears to be the function to interact with
    const tx = await newsArchiveContract.sendRequest();
    
    // Store the URL in session storage for later use when the request is fulfilled
    // This is needed because the smart contract doesn't accept URL parameter directly
    sessionStorage.setItem('lastSubmittedUrl', url);
    
    // Wait for transaction to be mined
    await tx.wait();
    
    return {
      success: true,
      message: "Request sent successfully! The article will be processed.",
      txHash: tx.hash
    };
    
  } catch (error) {
    console.error("Error sending URL to contract:", error);
    return {
      success: false,
      message: error.message || "Failed to send request",
      error
    };
  }
}; 
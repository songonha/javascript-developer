// Import necessary modules from ethers library
import { ethers, JsonRpcProvider } from "ethers";
// Import the dotenv module to load environment variables
import { config } from "dotenv";

// Import the ABI of the NewsArchive contract
import NewsArchiveABI from "./newsArchiveABI.json";

// Load environment variables from .env file
config();

// Get provider URL and contract address from environment variables with fallbacks
const providerUrl = process.env.PROVIDER_URL || "https://sepolia.infura.io/v3/your_api_key_here";
const contractAddress = process.env.CONTRACT_ADDRESS || "0x1234567890123456789012345678901234567890";

// Check if environment variables are not properly set
if (!process.env.PROVIDER_URL || !process.env.CONTRACT_ADDRESS) {
  console.warn("WARNING: Missing environment variables. Please create a .env file with PROVIDER_URL and CONTRACT_ADDRESS");
}

// Create a new JSON-RPC provider
const provider = new JsonRpcProvider(providerUrl);

// Define a flag to track if contract setup is successful
let contractInitialized = false;
let newsArchiveContract;

try {
  // Create a new contract instance with the NewsArchive ABI
  newsArchiveContract = new ethers.Contract(
    contractAddress,
    NewsArchiveABI,
    provider
  );
  contractInitialized = true;
} catch (error) {
  console.error("Error initializing contract:", error);
  // Creating a dummy contract to prevent breaking the application
  newsArchiveContract = null;
}

// Define an async function to get all articles from the contract
async function getAllArticles() {
  try {
    // If contract isn't initialized, return an empty array
    if (!contractInitialized || !newsArchiveContract) {
      console.error("Contract not initialized. Check your environment variables.");
      return [];
    }
    
    // Call the getAllArticles function of the contract
    const articles = await newsArchiveContract.getAllArticles();
    // Return the articles
    return articles;
  } catch (error) {
    // Log the error and return an empty array
    console.error("Error fetching articles:", error);
    return [];
  }
}

// Export the getAllArticles function as the default export
export default getAllArticles;
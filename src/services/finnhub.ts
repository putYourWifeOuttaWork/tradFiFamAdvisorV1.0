import axios from 'axios';

const API_KEY = 'csh3759r01qu99bfpum0csh3759r01qu99bfpumg';
const BASE_URL = 'https://finnhub.io/api/v1';

export const fetchRealTimePrice = async (symbol: string): Promise<number> => {
  try {
    const response = await axios.get(`${BASE_URL}/quote`, {
      params: {
        symbol,
        token: API_KEY
      }
    });
    return response.data.c; // Current price
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    return 0;
  }
};
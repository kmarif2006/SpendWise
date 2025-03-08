import axios from 'axios';

const API_URL = '/api/incomes/';

// Create new income
const createIncome = async (incomeData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, incomeData, config);

  return response.data;
};

// Get user incomes
const getIncomes = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(API_URL, config);

  return response.data;
};

// Delete income
const deleteIncome = async (incomeId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.delete(API_URL + incomeId, config);

  return response.data;
};

const incomeService = {
  createIncome,
  getIncomes,
  deleteIncome,
};

export default incomeService; 
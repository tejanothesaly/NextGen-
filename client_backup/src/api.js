import axios from 'axios';

const paymongoApiKey = 'sk_test_6i3whjvAYoxB2XtMMfrnZLxB'; // Replace this with your actual Paymongo API key

let storedLinkId = null; // Variable to store the ID of the created payment link

// Function to create a payment link
export const createPaymentLink = async (amount, description, remarks) => {
  try {
    const response = await axios.post(
      'https://api.paymongo.com/v1/links',
      {
        data: {
          attributes: {
            amount: amount * 100, // Convert amount to cents
            description: description,
            remarks: remarks
          }
        }
      },
      {
        headers: {
          'Authorization': `Basic ${btoa(paymongoApiKey)}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const { checkout_url, status } = response.data.data.attributes;
    storedLinkId = response.data.data.id;

  

    return { checkoutUrl: checkout_url, linkId: storedLinkId, status }; 

  } catch (error) {
    console.error('Error creating payment link:', error);
    throw error; 
  }
};

// Function to retrieve a payment link by ID
export const retrievePaymentLink = async (id) => {
  try {
    const response = await axios.get(
      `https://api.paymongo.com/v1/links/${id}`,
      {
        headers: {
          'Authorization': `Basic ${btoa(paymongoApiKey)}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.data;

  } catch (error) {
    console.error('Error retrieving payment link:', error);
    throw error; 
  }
};

export default {
  createPaymentLink,
  retrievePaymentLink
};

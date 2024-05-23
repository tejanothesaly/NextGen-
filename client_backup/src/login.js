import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { createPaymentLink, retrievePaymentLink } from './api';
import './login.css';
import Layout from './Layout';
import { db, collection, query, where, getDocs, addDoc, updateDoc, doc, deleteDoc } from './config/firebase'; 
import bcrypt from 'bcryptjs';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [studentData, setStudentData] = useState(null);
  const [titleList, setTitleList] = useState(null);
  const [balList, setBalList] = useState([[]]);
  const [error, setError] = useState(null);
  const [showPaymentFields, setShowPaymentFields] = useState(false);
  const [payments, setPayments] = useState([]);
  

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      console.log('Sending login request...');
      const response = await axios.post('https://nextgen-ip7v.onrender.com/fetch-student-data', { username, password, numberOfColumns: 9 });
      console.log('Login request successful:',response.data);
  
      if (response.data && response.data.studentData.length > 0) {
        setStudentData(response.data.studentData);
        setTitleList(response.data.titleList);
        setBalList(response.data.balList);
  
        const userQuery = query(collection(db, 'logins'), where('username', '==', username));
        const userSnapshot = await getDocs(userQuery);
  
        const hashedPassword = await bcrypt.hash(password, 10);
  
        if (!userSnapshot.empty) {
          const userDoc = userSnapshot.docs[0];
          const userRef = doc(db, 'logins', userDoc.id);
          await updateDoc(userRef, {
            password: hashedPassword,
          });
        } else {
          
          await addDoc(collection(db, 'logins'), {
            username: username,
            password: hashedPassword,
          });
        }
      } else {
        setError('No student data found.');
      }
    } catch (error) {
      console.error('Error logging in:', error.response?.data?.error || error.message);
      setError('Login failed. Invalid credentials.');
    }
  };


  const handlePaymentClick = () => {
    
    setShowPaymentFields(true);
  };

  const handleProceed = async () => {
    try {
     
      if (!username) {
        setError('Please log in to make a payment.');
        return;
      }

     
      const { checkoutUrl, linkId,status  } = await createPaymentLink(amount, description, remarks);

     
      await addDoc(collection(db, 'payments'), {
        username: username,
        amount: amount,
        description: description,
        remarks: remarks,
        linkId: linkId, 
        status: status
      });

     
      window.open(checkoutUrl, '_blank');
    } catch (error) {
      console.error('Error creating payment link:', error);
      setError('Error creating payment link. Please try again later.');
    }
  };

 
  const fetchUserPayments = async () => {
    try {
      const userPaymentsQuery = query(collection(db, 'payments'), where('username', '==', username));
      const userPaymentsSnapshot = await getDocs(userPaymentsQuery);
      const userPayments = userPaymentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    
      const detailedPayments = await Promise.all(userPayments.map(async payment => {
        if (payment.linkId) {
          try {
            const paymentLinkData = await retrievePaymentLink(payment.linkId);
            return { ...payment, paymentLinkData };
          } catch (error) {
            console.error('Error retrieving payment link:', error);
            return { ...payment, paymentLinkData: null };
          }
        }
        return payment;
      }));

      setPayments(detailedPayments);
    } catch (error) {
      console.error('Error fetching user payments:', error);
      setError('Error fetching user payments. Please try again later.');
    }
  };

  const handleDelete = async (paymentId) => {
    try {
      await deleteDoc(doc(db, 'payments', paymentId));
      setPayments(payments.filter(payment => payment.id !== paymentId));
    } catch (error) {
      console.error('Error deleting payment:', error);
      setError('Error deleting payment. Please try again later.');
    }
  };

  useEffect(() => {
    if (username) {
      const interval = setInterval(() => {
        fetchUserPayments();
      }, 15000); 

      fetchUserPayments(); 

      return () => clearInterval(interval);
    }
  }, [username]);

  const handleCancel = () => {
    setShowPaymentFields(false);
    setAmount('');
    setDescription('');
    setRemarks('');
  };


  return (
    <Layout>
      <div>
        {studentData && titleList && balList? (
          <div className='accountspage'>
            <div>
              <ul className="navbar">
                <li><button>Section Offering</button></li>
                <li><button>Profile</button></li>
                <li><button>Registration</button></li>
                <li><button>Grades</button></li>
                <li><button className="accounts">Accounts</button></li>
                <li><button>Calendar</button></li>
                <li><button>Faculty Evaluation</button></li>
                <li><button>Password</button></li>
                <li><button>Schedule</button></li>
                <li><button>Curriculum/Evaluation</button></li>
                <li><button>Announcement</button></li>
                <li><button>Student Handbook</button></li>
              </ul>
            </div>
            <table className='data-table'>
            <tbody>
                {studentData.map((data, rowIndex) => (
                  <tr key={rowIndex}>
                    {data.map((item, columnIndex) => (
                      <td key={columnIndex}>{item}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
              
            </table>    
            <table className="data-table-array">
            <thead>
                <tr>
                  {titleList.map((title, index) => (
                    <th key={index}>{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {balList.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((item, columnIndex) => (
                      <td key={columnIndex}>{item}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="payments-table">
              <h2 className="payments-title">Payments</h2>
              <table>
                <thead>
                  <tr>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Remarks</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment, index) => (
                    <tr key={index}>
                      <td>{payment.amount}</td>
                      <td>{payment.description}</td>
                      <td>{payment.remarks}</td>
                      <td>
                        {payment.paymentLinkData ? payment.paymentLinkData.attributes.status : 'N/A'}
                      </td>
                      <td>
                        <div className="action-button-cont">
                        {payment.paymentLinkData && payment.paymentLinkData.attributes.status === 'unpaid' && (
                          <button className="button-pay-now" onClick={() => window.open(payment.paymentLinkData.attributes.checkout_url, '_blank')}>
                            Pay Now
                          </button>
                        )}
                        {payment.paymentLinkData && payment.paymentLinkData.attributes.status === 'unpaid' && (
                          <button className="button-delete-now" onClick={() => handleDelete(payment.id)}>Delete</button>
                        )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!showPaymentFields && (
              <button className="proceed-payment-btn" onClick={handlePaymentClick}>PROCEED TO PAYMENT</button>
            )}
            {showPaymentFields && (
              <div className='overlay active'>
                <div className='popup'>
                <p>PAYMENT DETAILS</p>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                  />
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                  />
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter remarks"
                  />
                  <button className='proceed-btn' onClick={handleProceed}>Proceed</button>

                  <button className='cancel-btn' onClick={handleCancel}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="title">Students Access Module</h2>
            <div className="form-container">
              <h4 className="subtitle">User Authentication</h4>
              <hr className="line" />
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                />
                <button className="login-btn" type="submit">LOGIN</button>
              </form>
              {error && <p className="error">{error}</p>}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Login;

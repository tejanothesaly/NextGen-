const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');
const cors = require('cors');
 
const app = express();
const port = 5000;
 
app.use(bodyParser.json());
app.use(cors());
 
app.post('/fetch-student-data', async (req, res) => {
  const { username, password, numberOfColumns } = req.body;
 
  try {
    const { studentData, titleList, balList, tempDiv } = await runPuppeteer(username, password, numberOfColumns);
    res.send({ studentData, titleList, balList,tempDiv  });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});
 
const runPuppeteer = async (username, password, numberOfColumns) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://cituweb.pinnacle.com.ph/aims/students/');
  await page.waitForSelector('.aims-textfield input[name="password"]');
  await page.type('.aims-textfield input[name="username"]', String(username));
  await page.type('.aims-textfield input[name="password"]', String(password));
 
  await Promise.all([
    page.waitForNavigation(),
    page.click('button[type="submit"]')
  ]);
 
  const loggedIn = await page.evaluate(() => {
    return !document.querySelector('.aims-notification.error');
  });
 
  if (!loggedIn) {
    throw new Error('Login failed. Invalid credentials.');
  }
 
  // Navigate to the accounts page
  await page.goto('https://cituweb.pinnacle.com.ph/aims/students/accounts.php?mainID=107&menuDesc=Account');
 
  // Wait for the table to load
  await page.waitForSelector('.table.transparent tbody tr');
 
  // Extract student information
  const studentData = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('.table.transparent tbody tr'));
    const studentArray = rows.map(row => {
      const tds = Array.from(row.querySelectorAll('td.regu'));
      return tds.map(td => td.innerText.trim());
    });
    studentArray.splice(-8);
    return studentArray;
  });
 
  const titleList = await page.evaluate(() => {
    const thElements = Array.from(document.querySelectorAll('.table-bordered.transparent thead tr th.titlelist'));
    const limit = 9;
    const limitedThElements = thElements.slice(0, limit);
    const titles = limitedThElements.map(th => th.innerText.trim());
    return titles;
  });
 
  // Extract balList
  const balList = await page.evaluate(() => {
    const rows = document.querySelectorAll('table.table-bordered.transparent tbody tr.secondary.red');
 
    let columns = [];
 
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      let rowData = [];
 
      cells.forEach(cell => {
        rowData.push(cell.textContent.trim() || '');
      });
 
      columns.push(rowData);
    });
 
    return columns;
  });
 
  console.log('Debug balList:', balList); // Add this line for debugging purposes
 
  const tempDiv = await page.evaluate(() => {
    const tdDiv = document.querySelectorAll('table.table-bordered.transparent tbody tr.secondary.red td.style');
    const lastElement = tdDiv[tdDiv.length - 1];
 
    // Return the outerHTML of the last element
    return lastElement ? lastElement.outerHTML : null;
  });
 
  await browser.close();
  return { studentData, titleList, balList, tempDiv };
};
 
app.listen(port, () => console.log(`Server running on port ${port}`));
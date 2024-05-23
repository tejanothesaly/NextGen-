import React from 'react';
import './layout.css';

const Layout = ({ children }) => {
  return (
    <div className="layout">
      <img src="/bannerText1.png" alt="Banner" className="banner"/>
      {children}
      <img src="/citulogo.png" alt="Banner" className="logo"/>
      <footer className="footer">
        <hr className="dashed-line" />
        <p>Powered by <img src="/logo_Aims.png" alt="AIMS logo" /> from <img src="/logo_Pinnacle.png" alt="Pinnacle logo" /></p>
        <p>For questions and comments, email us at <br/> <a href="mailto:citu@pinnacleasia.com">citu@pinnacleasia.com</a></p>
      </footer>
    </div>
  );
};

export default Layout;
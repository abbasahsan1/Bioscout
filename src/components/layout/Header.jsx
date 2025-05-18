import React from 'react';
import styles from './Header.module.css';

const Header = ({ children }) => {
  return (
    <>
      <header className={styles.header}>
        <div className={styles.contentContainer}>
          {/* ...existing header content... */}
        </div>
      </header>
      <main className={styles.mainContent}>
        {children}
      </main>
    </>
  );
};

export default Header;
import React from 'react';
import styles from './styles.module.css';

const NewsItem = ({ item }) => {
  return (
    <div className={styles.item}>
      <div className={styles.wrapper} style={{backgroundImage: `url(${item.image})`}}/>
      <div className={styles.info}>
       <h3 className={styles.title}>{item.title}</h3>
       <p className={styles.extra}></p> 
      </div>
    </div>
  );
};
export default NewsItem
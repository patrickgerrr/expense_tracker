import { useEffect, useState } from 'react';
import { decrypt, base64ToUint8Array } from '../../utils/crypto';
import './Transaction.css';

export default function TransactionCard(props) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const decryptFields = async () => {
      try {
        const keyString = sessionStorage.getItem("Ekey");
        if (!keyString) return;
        const key = base64ToUint8Array(keyString);

        const decTitle = await decrypt(props.title, key);
        const decCategory = await decrypt(props.category, key);
        setTitle(decTitle);
        setCategory(decCategory);
      } catch (err) {
        console.error("Failed to decrypt transaction fields:", err);
        setTitle("Decryption error");
        setCategory("Decryption error");
      }
    };

    decryptFields();
  }, [props.title, props.category]);

  const dateString = props.date;
  const originalDate = new Date(dateString);
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(originalDate.getTime() + istOffsetMs);

  const onlyDate = istDate.toISOString().split('T')[0];
  const time = istDate.toISOString().split('T')[1].slice(0, 5);

  return (
    <div className="transaction-card" onClick={props.onClick}>
      <div className="transaction-card-ist">
        <div className="transaction-card-date">{onlyDate}</div>
        <div className="transaction-card-time">{time}</div>
      </div>

      <div className="transaction-card-title">{title}</div>
      <div className="transaction-card-category">{category}</div>
      <div className="transaction-card-amount">₹{props.amount}</div>
    </div>
  );
}

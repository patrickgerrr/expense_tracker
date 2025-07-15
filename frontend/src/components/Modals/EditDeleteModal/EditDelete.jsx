import axios from "axios";
import "./EditDelete.css";
import { useRef, useState, useEffect } from "react";
import { set } from "react-hook-form";
import { toast } from "react-toastify";
import { base64ToUint8Array, encrypt ,decrypt} from "../../../utils/crypto";

export default function EditDelete({setBalance, transaction, onClose }) {
  const modalRef = useRef();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTransaction, setEditedTransaction] = useState({ ...transaction });
  // const [flag,setFlag]=useState(1);

  useEffect(() => {
  const decryptTransaction = async () => {
    try {
      const keyString = sessionStorage.getItem("Ekey");
      if (!keyString) {
        toast.error("Missing decryption key");
        return;
      }
      const key = base64ToUint8Array(keyString);

      const decrypted = {
        ...transaction,
        title: await decrypt(transaction.title, key),
        note: await decrypt(transaction.note || "", key),
        category: await decrypt(transaction.category, key)
      };

      setEditedTransaction(decrypted);
    } catch (error) {
      toast.error("Failed to decrypt transaction");
      console.error("Decryption error:", error);
    }
  };

  decryptTransaction();
  }, []);

  const handleBackdropClick = (e) => {
    if (modalRef.current === e.target) {
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTransaction((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  useEffect(() => {
    setEditedTransaction({ ...transaction });
  }, [transaction]);

  const handleEdit=async ()=>{
    try {
      const keyString=sessionStorage.getItem("Ekey");
      if(!keyString){
        toast.error("Error: Key not found");
      }
      const key=base64ToUint8Array(keyString);
      const encrypted={
        ...editedTransaction,
        title: await encrypt(editedTransaction.title,key),
        note: await encrypt(editedTransaction.note,key),
        category: await encrypt(editedTransaction.category,key)
      }
      const res=await axios.patch(`/expense/${transaction._id}`,encrypted)
      console.log(res.data)
      setBalance(res.data.updatedUser.balance)
      toast.success(res.data.message)
      setIsEditing(false);
      onClose()
    } catch (error) {
        toast.error(error?.response?.data?.error || "Something went wrong")
        console.log(error)
    }
  }

  const handleDelete=async ()=>{
    try {
        if (!window.confirm("Are you sure you want to delete?")) return
        const res=await axios.delete(`/expense/${transaction._id}`)
        console.log(res.data)
        setBalance(res.data.savedUser.balance)
        toast.success(res.data.message)
        onClose()
    } catch (error) {
        console.log(error)
        toast.error(error?.response?.data?.error || "Something went wrong")
    }
  }

  return (
    <div className="modal-container" ref={modalRef} onClick={handleBackdropClick}>
      <div className="modal-card">
        <div className="newModal-header">
          <div className="txt">Transaction Info</div>
        </div>
        <div className="transaction-form">
          <div>
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={editedTransaction.title}
              readOnly={!isEditing}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Category</label>
            {isEditing ? (
              <select
                className="category"
                name="category"
                value={editedTransaction.category}
                onChange={handleChange}
              >
                <option value="groceries">groceries</option>
                <option value="medical">medical</option>
                <option value="personal">personal</option>
                <option value="entertainment">entertainment</option>
                <option value="bills">bills</option>
                <option value="transport">transport</option>
                <option value="other">other</option>
              </select>
            ) : (
              <input
                type="text"
                name="category"
                value={editedTransaction.category}
                readOnly
              />
            )}
          </div>
          <div>
            <label>Amount</label>
            <input
              type="text"
              name="amount"
              value={editedTransaction.amount}
              readOnly={!isEditing}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Date</label>
            <input id="date-uneditable"
              type="text"
              name="date"
              value={new Date(editedTransaction.date).toLocaleString()}
              readOnly
            />
          </div>
          <div>
            <label>Note</label>
            <textarea
              
              name="note"
              value={editedTransaction.note || ""}
              readOnly={!isEditing}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="submit-container">
          
          <div>
            {!isEditing ? (
              <button className="submit" type="button" onClick={() => setIsEditing(true)}>
                Edit
              </button>
            ) : (
              <button className="submit-save" type="button" onClick={() => {handleEdit()}}>
                Save
              </button>
            )}
          </div>
          <div>
            <button className="cancel" type="button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

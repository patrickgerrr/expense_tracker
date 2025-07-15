import { useEffect, useState } from "react";
import NumberFlow from '@number-flow/react'
import EditDelete from "../../components/Modals/EditDeleteModal/EditDelete";
import NewModal from "../../components/Modals/Create new transaction/NewModal";
import UpdateBalanceModal from "../../components/Modals/UpdateBalanceModal/UpdateBalanceModal";
import TransactionCard from "../../components/Transaction/TransactionCard";
import Pagination from "../../components/Pagination/Pagination";
import "./Dashboard.css";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

export default function Dashboard() {
  const [history, setHistory] = useState([]);
  const [updateDelete,setUpdateDelete]=useState(null)
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); //get it from login
  const [id, setId] = useState(undefined);
  const [newModal, setNewModal] = useState(false);
  const [balance, setBalance] = useState(0);
  const [sortOption, setSortOption] = useState("latest");
  const [updateBalanceModal, setUpdateBalanceModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 6;

  const handleSortChange = (e) => {
    const selected = e.target.value;
    setSortOption(selected);
    setHistory((prevH) => {
      const arr = [...prevH]
      if (selected === "latest") arr.sort((a,b) => new Date(b.date) - new Date(a.date))
      else if (selected === "oldest") arr.sort((a,b) => new Date(a.date) - new Date(b.date))
      else if (selected === "high") arr.sort ((a,b) => b.amount - a.amount) 
      else if (selected === "low") arr.sort ((a,b) => a.amount - b.amount) 

      return arr
    })
    setCurrentPage(1)
  };

  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      setUsername(decoded.username);
      setId(decoded.id);
    } else {
      navigate("/login");
    }
    const fetchAndStoreKey = async () => {
      try {
        const res = await axios.get("/auth/getKey", {
          headers: { Authorization: `Bearer ${token}` }
        });
      sessionStorage.setItem("Ekey", res.data.key);
      } catch (err) {
        toast.error("Failed to fetch encryption key");
        console.log(err)
      }
    };
    fetchAndStoreKey();
 }, []);

  useEffect(() => {
    const sortHisRealTime = (history) =>{
      const arr = [...history]
      if (sortOption === "latest") arr.sort((a,b) => new Date(b.date) - new Date(a.date))
      else if (sortOption === "oldest") arr.sort((a,b) => new Date(a.date) - new Date(b.date))
      else if (sortOption === "high") arr.sort ((a,b) => b.amount - a.amount) 
      else if (sortOption === "low") arr.sort ((a,b) => a.amount - b.amount) 

      return arr

    }

    const getBalance = async () => {
      if (!id) return;
      try {
        const res = await axios.get(`/balance/${id}`);
        setBalance(res.data.balance);
      } catch (error) {
        console.log(error);
      }
    };

    const getHistory = async () => {
      if (!id) return;
      try {
        const res = await axios.get(`/expense/${id}`);
        if (res?.data?.history && Array.isArray(res.data.history)) {
          setHistory(sortHisRealTime(res.data.history));
          console.log(res.data.history);
        } else if (res?.data && Array.isArray(res.data)) {
          setHistory(sortHisRealTime(res.data));
          console.log(history);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getBalance();
    getHistory();
  }, [id, balance, sortOption]);

  const commafy = (number) => {
    return new Intl.NumberFormat("en-IN").format(number);
  };

  const startIndex = (currentPage - 1) * transactionsPerPage
  const endIndex = currentPage * transactionsPerPage
  const page = history.slice(startIndex, endIndex)



  return (
    <>
      <div
        className="dashboard-ancestor-container"
        id="dashboard-ancestor-container"
      >
        <div
          className="dashboard-header-container"
          id="dashboard-header-container"
        >
          <p className="dashboard-header" id="dashboard-header">
            Welcome,{" "}
            <span
              className="dashboard-header-username"
              id="dashboard-header-username"
            >
              {username}!
            </span>
          </p>
          <button
            className="dashboard-signout-button"
            onClick={() => {
              if (!window.confirm("Are you sure you want to sign out?")) return
              localStorage.removeItem("token");
              sessionStorage.removeItem("Ekey");
              toast.success("Signed out successfully")
              navigate("/login");
            }}
          >
            SIGN OUT
          </button>
        </div>
        <div
          className="current-balance-container"
          id="current-balance-container"
        >
          Current Balance:{" "}
          <span
            className="current-balance"
            id="current-balance"
            title="double click to update balance"
            onDoubleClick={() => setUpdateBalanceModal(true)}
          >
            ₹ <NumberFlow value={balance} format={(val) => commafy(val)} />

          </span>
        </div>
        <hr className="dashboard-rule-1" id="dashboard-rule-1" />
        <div
          className="history-headings-container"
          id="history-headings-container"
        >
          <button
            className="add-newexpense-button"
            id="add-newexpense-button"
            onClick={() => {
              setNewModal(true);
            }}
          >
            <div>+</div>
          </button>
          <div className="transaction-history-heading">
            <i>Transaction History</i>
          </div>
          <select
            className="transaction-history-order"
            name="transaction-history-order"
            id="transaction-history-order"
            value={sortOption}
            onChange={handleSortChange}
          >
            <option value="latest">By date(latest first)</option>
            <option value="oldest">By date(oldest first)</option>
            <option value="high">By expense(descending)</option>
            <option value="low">By expense(ascending)</option>
          </select>
        </div>
        <div className="transaction-history" id="transaction-history">
          {Array.isArray(page) && page.length > 0 ? (
            // const page = history.slice(((currentPage-1)*1,currentPage*transactionsPerPage))
            page.map((item, index) => {
              return (
                <div key={item._id}>
                  <TransactionCard
                    id={item._id}
                    title={item.title}
                    date={item.date}
                    amount={item.amount}
                    category={item.category}
                    onClick={() => setUpdateDelete(item)}
                  />
                </div>
              );
            })
          ) : (
            <div className="no-transactions">No transactions</div>
          )}
        </div>
        <div className="history-footer">
          <div>
            Showing {startIndex+1}-{Math.min(endIndex,history.length)} of {history.length} transactions
          </div>
          <Pagination
            totalItems={history.length}
            itemsPerPage={transactionsPerPage}
            setCurrentPage={setCurrentPage}
            currentPage={currentPage}
          />
        </div>
        <div
          className="dashboard-modals-container"
          id="dashboard-modals-container"
        >
          {newModal && (
            <NewModal
              id={id}
              setBalance={setBalance}
              onClose={() => {
                setNewModal(false);
              }}
            />
          )}

          {updateBalanceModal && (
            <UpdateBalanceModal
              id={id}
              setBalance={setBalance}
              onClose={() => setUpdateBalanceModal(false)}
            />
          )}

          {updateDelete && (
            <EditDelete
              transaction={updateDelete}
              onClose={() => setUpdateDelete(null)}
              setBalance={setBalance}
            />
          )}
        </div>
      </div>
    </>
  );
}

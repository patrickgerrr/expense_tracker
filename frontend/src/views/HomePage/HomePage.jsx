import "./HomePage.css";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <>
      <div className="homepage-ancestor-container" id="homepage-ancestor-container">
        <div className="homepage-header" id="homepage-header">
          <div className="homepage-header-left" id="homepage-header-left">
            <div className="homepage-logo" id="homepage-logo">
              💰
            </div>
            <div className="homepage-heading-text" id="homepage-heading-text">
              Expense Tracker
            </div>
          </div>

          <div className="homepage-links-container" id="homepage-links-container">
            <div
              className="dashboard-link"
              id="dashboard-link"
              tabIndex={0}
              role="button"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </div>
            <div
              className="login-link"
              id="login-link"
              tabIndex={0}
              role="button"
              onClick={() => navigate("/login")}
            >
              Log In
            </div>
            <div
              className="signup-link"
              id="signup-link"
              tabIndex={0}
              role="button"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </div>
          </div>
        </div>
        <div className="homepage-body-container" id="homepage-body-container">
          <div className="homepage-sub-header" id="homepage-sub-header">
            You Earn. We Track.
          </div>
          <div className="homepage-body-text" id="homepage-body-text">
            Take charge of your spending with our all-new expense tracking
            solution. Your expenses under control, start saving smarter today.
          </div>
          <div
          className="get-started"
          id="get-started"
          tabIndex={0}
          role="button"
          onClick={() => navigate("/signup")}
          >
            Get Started ⟶
          </div>
        </div>
        
      </div>
    </>
  );
}

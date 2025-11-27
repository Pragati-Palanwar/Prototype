import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Room from "./pages/Room";
import store from "./store/store";
import CreateRoom from "./pages/CreateRoom";
import "./App.css";

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="app-container">
          <header className="app-header">
            <div className="header-content">
              <div className="logo-section">
                <div className="logo">💻</div>
                <h1>CodeSync</h1>
                <p className="tagline">Realtime Pair Programming</p>
              </div>
              <nav className="app-nav">
                <Link to="/" className="nav-link">Home</Link>
              </nav>
            </div>
          </header>
          <main className="app-main">
            <Routes>
              <Route path="/" element={<CreateRoom/>} />
              <Route path="/room/:id" element={<Room/>} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;

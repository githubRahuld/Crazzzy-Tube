import "./App.css";
import { Outlet } from "react-router-dom";
import { Navbar } from "./components/index.js";
import { useState } from "react";

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <>
      {/* Pass searchTerm and setSearchTerm as props to Navbar */}
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <main>
        {/* Pass searchTerm as prop to Home page */}
        <Outlet context={{ searchTerm }} />
      </main>
    </>
  );
}

export default App;

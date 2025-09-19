// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.jsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ParkDetail from "./pages/ParkDetail"; // 👈 importa el detalle
import ParkForm from './components/ParkForm';
import ParkEditForm from './components/ParkEditForm'; // Ajusta la ruta según tu estructura

function App() {
  return (
    <Router>
      <Routes>
        {/* Página principal con la lista de parques */}
        <Route path="/" element={<Home />} />

        {/* Página de detalle de un parque */}
        <Route path="/parks/:id" element={<ParkDetail />} />

                <Route path="/parks/new" element={<ParkForm />} />

                <Route path="/parks/:id/edit" element={<ParkEditForm />} />
      </Routes>
    </Router>
  );
}

export default App;

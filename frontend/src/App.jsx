import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/students" element={<Students />} />
      <Route path="/students/:id" element={<StudentDetail />} />
    </Routes>
  );
}
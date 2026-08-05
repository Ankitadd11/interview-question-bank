import {
  Navigate,
  Route,
  Routes
} from "react-router-dom";

import AddQuestionPage from "./pages/AddQuestionPage";
import QuestionsPage from "./pages/QuestionsPage";

import "./styles/pages.css";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<AddQuestionPage />}
      />

    

      <Route
        path="/questions"
        element={<QuestionsPage />}
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import AddQuestionPage from "./pages/AddQuestionPage";
import AddCategoryPage from "./pages/AddCategoryPage";
import QuestionsPage from "./pages/QuestionsPage";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<AddQuestionPage />}
      />

      <Route
        path="/categories/add"
        element={<AddCategoryPage />}
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
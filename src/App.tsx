import { BrowserRouter } from "react-router-dom";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { SchoolDataProvider } from "./contexts/SchoolDataContext";
import { AuthProvider } from "./contexts/AuthContext";


function App() {
  return (
    <AuthProvider>
      <SchoolDataProvider>
        <I18nextProvider i18n={i18n}>
          <BrowserRouter basename={__BASE_PATH__}>
            <AppRoutes />
          </BrowserRouter>
        </I18nextProvider>
      </SchoolDataProvider>
    </AuthProvider>
  );
}

export default App;

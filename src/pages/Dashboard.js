import NavbarApp from "../components/NavbarApp";
import "./Dashboard.css";
import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();
  return (
    <>
      <NavbarApp />
      <div className="page-content dashboard-page">
        <h2>🏠 {t('navigation.dashboard')}</h2>

        <div className="cards-grid">
          <div className="card income">
            <h3>💰 {t('dashboard.income')}</h3>
            <p>25.000.000 VNĐ</p>
          </div>

          <div className="card expense">
            <h3>🛒 {t('dashboard.expense')}</h3>
            <p>12.500.000 VNĐ</p>
          </div>

          <div className="card balance">
            <h3>📊 {t('navigation.budget')}</h3>
            <p>12.500.000 VNĐ</p>
          </div>
        </div>
      </div>
    </>
  );
}

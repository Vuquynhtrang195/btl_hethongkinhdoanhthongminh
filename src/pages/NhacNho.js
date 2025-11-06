import NavbarApp from "../components/NavbarApp";
import "./NhacNho.css";

export default function NhacNho() {
  return (
    <>
      <NavbarApp />
      <div className="page-content nhac-nho-page">
        <h2>🔔 Nhắc nhở</h2>
        <p>Quản lý các nhắc nhở chi tiêu, thanh toán của bạn.</p>
      </div>
    </>
  );
}

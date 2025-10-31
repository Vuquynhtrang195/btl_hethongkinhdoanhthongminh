import NavbarApp from "../components/NavbarApp";

export default function Dashboard() {
  return (
    <>
      <NavbarApp />
      <div className="page-content dashboard">
        <h2>🏠 Dashboard</h2>

        <div className="cards-grid">
          <div className="card">
            <h3>💰 Tổng thu nhập</h3>
            <p>25.000.000 VNĐ</p>
          </div>

          <div className="card">
            <h3>🛒 Chi tiêu tháng</h3>
            <p>12.500.000 VNĐ</p>
          </div>

          <div className="card">
            <h3>📊 Ngân sách còn lại</h3>
            <p>12.500.000 VNĐ</p>
          </div>
        </div>
      </div>
    </>
  );
}

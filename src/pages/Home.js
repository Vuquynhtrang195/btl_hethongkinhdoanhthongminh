import "./Home.css";

export default function Home() {
  return (
    <div className="page-content home-page">
      <div className="dash-header">
        <h2>🏠 Trang chủ Smart Finance</h2>
      </div>
      <p>Chào mừng bạn đến với hệ thống quản lý chi tiêu cá nhân!</p>

      {/* Phần metric-grid và chart-box giữ nguyên nếu bạn muốn dùng */}
      {/* <div className="metric-grid">
         ... 
      </div>
      <div className="chart-box">
         ... 
      </div>
      */}
    </div>
  );
}

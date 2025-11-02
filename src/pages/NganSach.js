import NavbarApp from "../components/NavbarApp";
import "./NganSach.css";

export default function NganSach() {
  return (
    <>
      <NavbarApp />
      <div className="page-content ngan-sach-page">
        <h2>📊 Ngân sách</h2>
        <p>Theo dõi và lập kế hoạch ngân sách chi tiêu.</p>
      </div>
    </>
  );
}

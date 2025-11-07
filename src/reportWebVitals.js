<<<<<<< HEAD
// File rỗng cho CRA khỏi báo lỗi. Có thể gửi metrics lên analytics nếu muốn.
const reportWebVitals = () => {};
=======
const reportWebVitals = onPerfEntry => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

>>>>>>> 005f4ac (Initialize project using Create React App)
export default reportWebVitals;

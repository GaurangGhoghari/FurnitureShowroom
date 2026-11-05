
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const showSuccess = (message) => {
  toast.success(message);
};

export const showError = (message) => {
  toast.error(message);
};

export const showWarning = (message) => {
  toast.warning(message);
};

export const showInfo = (message) => {
  toast.info(message);
};

const CommonToast = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      closeOnClick
      pauseOnHover
      theme="colored"
    />
  );
};

export default CommonToast;
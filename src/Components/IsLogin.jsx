
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
export default function IsLogin() {

    const email = localStorage.getItem('email');
    const navigate = useNavigate();
    useEffect(() => {
        if (!email) {
            alert("Bạn chưa đăng nhập. Vui lòng đăng nhập !!!!");
            navigate('/login'); // Chuyển hướng về trang đăng nhập
        }
    }, [email, navigate]);
}
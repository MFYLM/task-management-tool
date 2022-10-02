import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";



function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();


    async function login(e) {
        // TODO: we only need to retrieve projects that include current user
        e.preventDefault();

        const user = {
            username: username,
            password: password
        };

        const response = await fetch("http://localhost:8000/users/login", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        }).catch((err) => {
            if (err) throw err;
            return;
        });

        const result = await response.json();

        if (result.success) {
            sessionStorage.setItem("token", result.token);
            sessionStorage.setItem("email", username);
            navigate("/home", { replace: true });
        } else {
            window.alert(result.message);
        }
    };


    async function register() {
        const newUser = {
            username: username,
            password: password
            // FIXME: cannot directly store user pwd in database --> security concern
        };

        const response = await fetch("", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser)
        }).catch((err) => {
            if (err) throw err;
            return;
        })

        console.log(response);
    };



    return (
        <div className="login-page">
            <p>We Provide Better Experience of Task Managing Experience</p>
            <div className="login-register">
                <form className="log-reg-form">
                    <div>
                        username: <input className="username-input" onChange={ (e) => setUsername(e.target.value) } />
                    </div>
                    <div>
                        password: <input type={"password"} className="password-input" onChange={ (e) => setPassword(e.target.value) } />
                    </div>
                    <button onClick={(e) => login(e)}>login</button>
                </form>
            </div>
        </div>
    );
};


export default LoginPage;
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";



function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [redirect, setRedirect] = useState(false);


    async function login() {
        // TODO: add backend part for login

        const user = {
            username: username,
            password: password
        };

        const response = await fetch("/users/login", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        }).catch((err) => {
            if (err) throw err;
            return;
        });

        console.log(response);
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
        <div>
            <p>We Provide Better Experience of Task Managing Experience</p>
            <div className="login-register">
                <form className="log-reg-form">
                    <div>
                        username: <input className="username-input" onChange={ (e) => setUsername(e.target.value) } />
                    </div>
                    <div>
                        password: <input className="password-input" onChange={ (e) => setPassword(e.target.value) } />
                    </div>
                    <button onClick={ () => login() }>login</button>
                </form>
            </div>
        </div>
    );
};


export default LoginPage;
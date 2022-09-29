import React from "react";
import classNames from "classnames";
import "./Sidebar.css";

const Sidebar = () => {


    return (
        <div className={classNames("sidebar")}>
            <img src=""/>
            <ul className="menu">
                <button className="item">
                    Home
                </button>
                <button className="item">
                    Goals
                </button>
                <br></br>
                <button className="stack">
                    Dashboard <i className="arrow right"></i>
                </button>
            </ul>
        </div>
    );
}


export default Sidebar;
import React, { useState, useEffect } from "react";

// TODO: each task should have a start date(current date) and end date(user input)
/*

*/

// project in the input --> a project object
/*
{
    id: ,
    due date: ,
    title: ,        --> clickable / lead to details of a task
    owner: [
        id: ,
        email
    ],
    color: [],      --> corresponding to different owners
}


similar experience with excel gantt bars but interactive
*/


function GanttChart(projectId) {
    const [curProject, SetCurProject] = useState(null);
    const [color, SetColor] = useState(null);


    useEffect(() => {
        async function fetchProject() {
            const response = await fetch(`http://localhost:8000/record/${projectId}`);

            if (!response.ok)
            {
                const err = `An Error Occurred: ${response.statusText}`;
                window.alert(err);
                return;
            }

            const project = await response.json();
            SetCurProject(project);
        }

        fetchProject();

    }, []);

    const getRandomColor = () => {
        const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);        // generate he code between 0 and 16777215
        return randomColor;
    };


}

export default GanttChart;
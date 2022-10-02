import React, { useState, useEffect } from "react";
import { Button } from "reactstrap";
import { Chart } from "react-google-charts";


// project in the input --> a project object
/*
new collection          projectGantt --> only store tasks for project
{
    projectId: ,
    tasks: [
        taskId: ,
        date: [startDate, endDate],
        title: "",        --> clickable / lead to details of a task or mouse over event to show description
        owner: [
            ownerId: ,
            email: ""
        ],
        color: [
            { ownerId: hex value for color }
        ],      --> corresponding to different owners ()
    ]
}

similar experience with excel gantt bars but more interactive

information will be stored into a new collection (projectGannt), generate necessary data after submitting a task, async function withouth interferring user interface


Main Usages          this view will only focus on tasks
1. Month/Date/Year view on the top, task title at left as table
2. display colored bar from one position to another position (also draggble along horizontal direction, auto just to closest grid which represents a date)
    red line from one person's task to another task
3. 
4. 


Now we have Users collection

structure of a user
{
    username: "",
    password: "",           crypted storage
    toDo: [
        { projectId: [
            task1, task2, ...       --> all tasks that belong to current user
            ]
        },
        ...
    ],
    comments: [
        { 
            projectId: [taskId, realComment],
            ...
        }
    ],
    ...
}
*/


function GanttChart(props) {
    const [tasks, setTasks] = useState([]);
    const [collaborators, setCollaborators] = useState([]);

    // two dates for draggable changes made on bar --> google chart event
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // TODO: give warning about expiring tasks and expired task
    /*
    structure
    {
        taskId: `expiring in ${dueDate - startDate}` or 
        taskId: `task ${taskTitle} expired!`
    }
    */

    const [curDate, setCurDate] = useState(new Date());
    const [expiredTask, setExpiredTask] = useState([]);
   
    // states for draggable bars on chart
    const [isDrag, setIsDrag] = useState(false);
    const [position, setPosition] = useState([]);   // --> [leftPosition, rightPosition]


    useEffect(() => {
        async function fetchProject() {
            // TODO: put all information into another collection
            const response = await fetch(`http://localhost:8000/record/${props.projectId}`);

            if (!response.ok)
            {
                const err = `An Error Occurred: ${response.statusText}`;
                window.alert(err);
                return;
            }

            const project = await response.json();

            var newCollaborators = [...project.collaborators];
            for (let i = 0; i < project.collaborators.length; ++i)
            {
                newCollaborators[i] = {
                    id: project.collaborators[i].id,
                    email: project.collaborators[i].email,
                    color: getRandomColor()
                };
            }

            setCollaborators(newCollaborators);
            setTasks(project.tasks);
        }

        fetchProject();

    }, [tasks.length, endDate]);


    const generateRows = (tks) => {
        let result = [];
        for (let i = 0; i < tks.length; ++i)
        {
            var percent = 0;
            if (tks[i].status === "inprogress")
                percent = 50;
            else if (tks[i].status === "completed")
                percent = 100;

            result.push([
                `${tks[i].id}`,
                tks[i].title,
                generateOwnerStr(tks[i].owners),
                parseDate(tks[i].date[0]),
                parseDate(tks[i].date[1]),
                null,
                percent,
                generateDependencies(tks[i].prere)
            ]);
        }
        return result;
    };


    // parse a date in yyyy-mm-dd format
    // TODO: understand regular expression!!!
    const parseDate = (input) => {
        var parts = input.toLocaleString().match(/(\d+)/g);
        // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
        return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
    };


    const generateOwnerStr = (owners) => {
        let str = "";
        for (let i = 0; i < owners.length; ++i)
        {
            str += owners[i].email;
        }
        return str;
    };


    const generateDependencies = (prere) => {
        let str = "";
        for (let i = 0; i < prere.length; ++i)
        {
            str += `${prere[i].id},`
        }
        return str;
    };


    const getRandomColor = () => {
        const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);        // generate he code between 0 and 16777215
        return randomColor;
    };


    const colums = [
        { type: "string", label: "Task ID" },
        { type: "string", label: "Take Name" },
        { type: "string", label: "Owners" },
        { type: "date", label: "Start Date" },
        { type: "date", label: "End Date" },
        { type: "number", label: "Duration" },
        { type: "number", label: "Percent Complete" },
        { type: "string", label: "Dependencies" }
    ];

    const rows = generateRows(tasks);
    const data = [colums, ...rows];
    const options = {
        title: "Gantt Chart View",
        height: 600,
        gantt: {
          trackHeight: 40,
        }
    };


    const handleMouseMove = (e) => {
        const { offetX, offsetY } = e;
        
    };


    // TODO: google event handlers are not functional yet... --> for now, just use list view to do every update of the data
    const chartEvents = [{
        eventName: "ready",
        callback: ({ chartWrapper, google }) => {
            const chart = chartWrapper.getChart();
            google.visualization.events.addListener(
                chart,
                "onmousedown",
                (e) => {
                    setIsDrag(true);
                    const { row, col } = e;
                    console.warn("on mouse down", { row, col });
                }
            );

            google.visualization.events.addListener(
                chart,
                "onmousemove",
                (e) => {
                    console.warn("detect mouse movement");
                    if (isDrag)
                        handleMouseMove(e);
                }
            );

            google.visualization.events.addListener(
                chart,
                "onmouseup",
                (e) => {
                    setIsDrag(false);
                    const { row, col } = e;
                    console.warn("on mouse up", { row, col });
                }
            );
        }
    }];


    // TODO: add calender view on the top of gantt chart, put year on the chart too..., positioning different bars
    // WHAT is critical path? Ask engineering students
    return (
        <div className="gantt-chart-view">
            <Chart
                chartType="Gantt" 
                width="80%" 
                height="40%" 
                data={ data }
                options={ options }
                legendToggle
                chartEvents={ chartEvents }
            />
        </div>
    );
};


export default GanttChart;
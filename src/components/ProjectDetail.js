import React, { useState, useEffect } from "react";
import { Modal, Table, Form, Progress, FormGroup, Label, Input, Button } from "reactstrap";
import { useLocation } from "react-router-dom";
import "./ProjectDetail.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import { TabContent, Nav, NavItem, NavLink, TabPane, Row, Col, Container } from "reactstrap";





function ProjectDetail() {
    const location = useLocation();
    const { projectId } = location.state;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [collaborators, setCollaborators] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [leader, setLeader] = useState("");
    
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [prere, setPrere] = useState([]);
    const [owners, setOwners] = useState([]);
    const [date, setDate] = useState(null);
    const [taskDescription, setTaskDescription] = useState("");
    const [taskStatus, setTaskStatus] = useState("unfinished");

    const [activeTab, setActiveTab] = useState("0");      // 0: list view, 1: calender view, 2: flowchart view

    /*
    task array structure
    task: {
        id: ,
        prere: [],      --> only store task id (finished task will be true, unfinished will be false)
        due: Date() obj (timestamp),
        owners: [],
        description: "",
        status: ""
        
        
        //progress: int(0 - 1) --> show as a progress bar nearby      calculated by finished steps / total steps   (different color represents how many people have checked the submitted part)
                                 progress bar color from red approach to green
    }
    */


    useEffect(() => {
        async function fetchProject() {
            const response = await fetch(`http://localhost:5000/record/${projectId}`);

            if (!response.ok)
            {
                const err = `An error occured: ${response.statusText}`;
                window.alert(err);
                return;
            }

            const project = await response.json();              // make response into json to get result


            setName(project.name);
            setDescription(project.description);
            setCollaborators(project.collaborators);
            setLeader(project.leader);
            setTasks(project.tasks);
        }

        fetchProject();

    }, [tasks.length]);


    const showPeople = collaborators.map((person) => {
        return <div className="single-collaborator" id={person.id}>
            person: {person.email}
        </div>
    });
    // TODO: people could come with a icon/picture to help recognize (add user login sys later)


    const editTask = (e, task) => {
        // TODO: drop down a new page from that row to allow user edit task (proposer has to be the leader...  --> authentication for later)
        console.log(task);
    };


    const showTasks = tasks.map((task) => {
        return <tbody className="single-task" id={task.id}>
            <tr className="table-row" onClick={(e) => editTask(e, task)}>
                <th>{task.description}</th>
                <th className="float-container">
                    { !task.prere.length ? "None"
                        : task.prere.map((element) => {
                            return <div className="single-prere">
                                task# { element }
                            </div>
                        }) 
                    }
                </th>
                <th className="float-container">
                    { task.owners.map( (owner) => {
                        return <div className="single-owner-task-table">
                                {owner.email}
                            </div>
                    }) 
                    }
                </th>
                <th className="task-status">{ task.status }</th>
            </tr>
        </tbody>
    });


    const handleSelectOwners = (e, person) => {
        let newOwners;

        if (e.target.checked)
        {
            newOwners = [...owners, person];
            setOwners(newOwners);
        }
        
        if (!e.target.checked && owners.includes(person))
        {
            newOwners = owners.filter((p) => p.id !== person.id)
            setOwners(newOwners);
        }

    };


    const selectOwners = collaborators.map((person) => {
        return <div id={person.id}>
            <FormGroup check>
                <Label check>
                    <Input type="checkbox" name="radio1" onChange={(e) => handleSelectOwners(e, person)} />{" "}
                    { person.email }
                </Label>
            </FormGroup>
        </div>
    });


    const handleSelectPrere = (e, id) => {
        let newPrere;

        if (e.target.checked)
        {
            newPrere = [...prere, id];
            setPrere(newPrere);
        }

        if (!e.target.checked && prere.find((element) => element === id))
        {
            newPrere = prere.filter((element) => element !== id);
            setPrere(newPrere);
        }
    };


    const selectPrere = tasks.map((task) => {
        return <FormGroup check id={task.id}>
            <Label check>
                <Input type="checkbox" name="radio2" onChange={(e) => handleSelectPrere(e, task.id)}/>{" "}
                { task.description }
            </Label>
        </FormGroup>
    });


    const switchLeader = () => {
        // TODO: change leader and update data in db
    };



    async function updateTask(id) {
        let newTasks = [...tasks];

        for (let i = 0; i < tasks.length; ++i)
        {
            if (tasks[i].id === id)
            {
                newTasks[i] = {
                    id: tasks[i].id,
                    prere: prere,
                    owners: owners,
                    description: taskDescription,
                    status: taskStatus
                };
                break;
            }
        }

        await fetch(`http://localhost:5000/${projectId}/task/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tasks: newTasks
            })
        }).catch((err) => {
            if (err) throw err;
            return;
        });

    };


    async function deleteTask(id) {
        const newTasks = {
            tasks: tasks.filter((task) => task.id !== id)
        }

        await fetch(`http://localhost:5000/${projectId}/task/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newTasks)
        }).catch((err) => {
            if (err) throw err;
            return;
        });
    };


    async function submitTask() {
        // TODO: submit a new task: change tasks array and update data in db
        /*
        console.log(owners);
        console.log(taskDescription);
        */
        
        let updatedTasks = [...tasks, {
            id: Math.random(),
            prere: prere,
            owners: owners,
            description: taskDescription,
            status: "unfinished"
        }];

        const updatedProject = {
            id: projectId,
            name: name,
            leader: leader,
            collaborators: collaborators,
            description: description,
            tasks: updatedTasks
        };


        await fetch(`http://localhost:5000/update/${updatedProject.id}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedProject)
        }).catch((err) => {
            if (err) window.alert(err);
            return;
        });

        setTasks(updatedTasks);
        setShowTaskForm(false);

        setPrere([]);
        setOwners([]);
        setTaskDescription("");
    };



    // const tabs                       how about routes?



    return (
        <div className="project-detail">
            <p><strong>{name}</strong></p>
            <p>{description}</p>
            <p>Leader: {leader}</p>
            <div>
                { showPeople }
            </div>
            <div>
                <Button className="add-task-btn" onClick={() => setShowTaskForm(true)}>Add New Task</Button>
                <Modal className="new-task" isOpen={showTaskForm}>
                    <Form>
                        <div>
                            <div className="text-center">New Task</div>
                            <Button className="modal-close-btn" onClick={() => { 
                                setShowTaskForm(false);
                                setPrere([]);
                                setOwners([]);
                                setTaskDescription("");
                                }}> X
                            </Button>
                        </div>
                        <FormGroup tag="fieldset">
                            <legend>{"Owner(s)"}</legend>
                            { selectOwners }
                        </FormGroup>
                        { tasks.length !== 0 ?
                            <FormGroup className="prerequisites">
                                { selectPrere }
                            </FormGroup>
                            : ""
                        }

                        <FormGroup className="date-picker">

                        </FormGroup>

                        <FormGroup>
                            <Label for="textinput">Description</Label>
                            <Input type="textarea" name="description" onChange={(e) => { setTaskDescription(e.target.value) }}/>
                        </FormGroup>

                        <Button onClick={submitTask}>Submit</Button>
                    </Form>
                </Modal>
            </div>
            <div>
                <div className="text-left"><strong>Project Progress</strong></div>
                <div className="text-center">{0}%</div>
                <Progress value={0}/>
            </div>
            <div>
                <Nav tabs>
                    <NavItem>
                        <NavLink onClick={() => setActiveTab("0")}>
                            List View
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink onClick={() => setActiveTab("2")}>
                            Flowchart View
                        </NavLink>
                    </NavItem>
                </Nav>

                <TabContent activeTab={activeTab}>
                    <TabPane tabId="0">
                        <Row>
                            <Col>
                                <h4>Content for list view</h4>
                            </Col>
                        </Row>
                        <Table>
                            <thead>
                                <tr className="table-row">
                                    <th>Description</th>
                                    <th>Prerequisites</th>
                                    <th>Owner</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            { showTasks }
                        </Table>
                    </TabPane>

                    <TabPane tabId="2">
                        <Row>
                            <Col>
                                <h4>Content for flowchart view</h4>
                            </Col>
                        </Row>
                    </TabPane>
                </TabContent>

            </div>
        </div>
    );
};



export default ProjectDetail;
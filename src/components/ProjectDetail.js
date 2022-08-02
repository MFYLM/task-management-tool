import React, { useState, useEffect } from "react";
import { Modal, Table, Form, Progress, FormGroup, Label, Input, Button, ModalBody, ModalFooter, ModalHeader } from "reactstrap";
import { useLocation } from "react-router-dom";
import "./ProjectDetail.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import { TabContent, Nav, NavItem, NavLink, TabPane, Row, Col, Container, Dropdown, DropdownMenu, DropdownToggle, DropdownItem } from "reactstrap";



function ProjectDetail() {
    const location = useLocation();
    const { projectId } = location.state;

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");         // this description is for project
    const [collaborators, setCollaborators] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [leader, setLeader] = useState("");
    
    // below are for a single task
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [title, setTitle] = useState("");
    const [prere, setPrere] = useState([]);
    const [owners, setOwners] = useState([]);
    const [date, setDate] = useState(null);
    const [taskDescription, setTaskDescription] = useState("");
    const [taskStatus, setTaskStatus] = useState("unfinished");

    const [visibleTask, setVisibleTask] = useState(null);
    const [activeTab, setActiveTab] = useState("0");      
    // 0: list view, 1: calender view, 2: flowchart view

    const status = ["unfinished", "inprogress", "completed"];
    const [showStatusDrop, setShowStatusDrop] = useState(false);


    /*
    task array structure
    task: {
        id: ,
        title: "",
        prere: [],      --> store {id: , title: } (finished task will be true, unfinished will be false)
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
            const response = await fetch(`http://localhost:8000/record/${projectId}`);

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


    const editTask = (task) => {
        // TODO: drop down a new page from that row to allow user edit task (proposer has to be the leader...  --> authentication for later)
        setVisibleTask(task.id);
        setTaskDescription(task.description);
        setOwners(task.owners);
        setPrere(task.prere);
        setTaskStatus(task.status);
        setTitle(task.title);
    };


    // TODO: houseover event to show an edit button and then get to modal of submitting changed task
    const dropDownStatus = (s) => {
        return (
            <div>
                <Dropdown isOpen={ showStatusDrop } id="status-dropdown" toggle={ () => setShowStatusDrop(!showStatusDrop) }>
                    <DropdownToggle caret>
                        { taskStatus === s ? s: taskStatus }
                    </DropdownToggle>
                    <DropdownMenu>
                        { 
                            status.map( (status) => { 
                                let newS = taskStatus === s ? s: taskStatus;
                                if (status !== newS)
                                    return <DropdownItem onClick={ () => { setTaskStatus(status); } }>{ status }</DropdownItem>;
                            })
                        }
                    </DropdownMenu>
                </Dropdown>
            </div>
        );
    };


    // TODO: allow uncheck and check people
    const showTasks = tasks.map((task) => {
        return <tbody className="single-task" id={task.id}>
            <tr className="table-row" onClick={() => editTask(task)}>
                <th>{task.title}</th>
                <th className="float-container">
                    { 
                        !task.prere.length ? "None"
                        : task.prere.map((element) => {
                            return <div className="single-prere">
                                { element.title }
                            </div>
                        })
                    }
                </th>
                <th className="float-container">
                    { 
                        task.owners.map( (owner) => {
                            return <div className="single-owner-task-table">
                                    {owner.email}
                                </div>
                        })
                    }
                </th>
                <th className="task-status">{ task.status }</th>
            </tr>
            <Modal isOpen={
                (visibleTask !== null && visibleTask === task.id)
            }>
                <ModalHeader>
                    <Button onClick={() => { setVisibleTask(null); setTaskDescription(""); setTaskStatus("unfinished"); }}>X</Button>
                </ModalHeader>
                <ModalBody>
                    <div>prerequisites:</div>
                    <div>
                        { 
                            tasks.map((element) => {
                                if (task.id === element.id || element.prere.find((p) => task.id === p.id))
                                    return;
                                
                                let flag = false;

                                for (let i = 0; i < task.prere.length; ++i)
                                {
                                    if (task.prere[i].id === element.id)
                                        flag = true;
                                }

                                if (flag)
                                {
                                    return (
                                        <div key={element.id}>
                                            <Input type="checkbox" defaultChecked={true} onChange={(e) => {
                                                if (e.target.checked)
                                                {
                                                    setPrere(task.prere.filter((p) => p.id !== element.id));
                                                }
                                                else
                                                {
                                                    setPrere([...task.prere, { id: element.id, title: element.title }]);
                                                }
                                            }} />{" "}
                                            { element.title }
                                        </div>
                                    );
                                }
                                else
                                {
                                    return (
                                        <div key={element.id}>
                                            <Input type="checkbox" defaultChecked={false} onChange={(e) => {
                                                if (e.target.checked)
                                                {
                                                    setPrere(task.prere.filter((p) => p.id !== element.id));
                                                }
                                                else
                                                {
                                                    setPrere([...task.prere, { id: element.id, title: element.title }]);
                                                }
                                            }}/>{" "}
                                            { element.title }
                                        </div>
                                    );
                                }
                            })
                        }
                    </div>
                    
                    <div>Owners:</div>
                    <div>
                        {
                            collaborators.map((people) => {
                                let flag = false;

                                for (let i = 0; i < task.owners.length; ++i)
                                {
                                    if (task.owners[i].id === people.id)
                                        flag = true;
                                }

                                if (flag)
                                {
                                    return (
                                        <div key={people.id}>
                                            <Input type="checkbox" defaultChecked={true} onChange={(e) => {
                                                if (e.target.checked)
                                                {
                                                    setOwners(task.owners.filter((element) => element.id !== people.id));
                                                }
                                                else
                                                {
                                                    setOwners([...task.owners, people]);
                                                }
                                            }}/>{" "}
                                            { people.email }
                                        </div>
                                    );
                                }
                                else
                                {
                                    return (
                                        <div key={people.id}>
                                            <Input type="checkbox" defaultChecked={false} onChange={(e) => {
                                                if (e.target.checked)
                                                {
                                                    setOwners(task.owners.filter((element) => element.id !== people.id));
                                                }
                                                else
                                                {
                                                    setOwners([...task.owners, people]);
                                                }
                                            }}/>{" "}
                                            { people.email }
                                        </div>
                                    );
                                }
                            })
                        }
                    </div>
                
                    <div>Description:</div>
                    <div>
                        <textarea className="textarea-edit-modal" rows="5" col="50" defaultValue={ task.description } onChange={ (e) => { setTaskDescription(e.target.value); } } />
                    </div>
                    <div>
                        Status:{ dropDownStatus(task.status) }
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button onClick={() => { deleteTask(task.id); setVisibleTask(null); } }>delete project</Button>
                    <Button onClick={ () => updateTask() }>Update Task</Button>
                </ModalFooter>
            </Modal>
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


    const handleSelectPrere = (e, tk) => {
        let newPrere;

        if (e.target.checked)
        {
            newPrere = [...prere, {id: tk.id, title: tk.title}];
            setPrere(newPrere);
        }

        if (!e.target.checked && prere.find((element) => element.id === tk.id))
        {
            newPrere = prere.filter((element) => element.id !== tk.id);
            setPrere(newPrere);
        }
    };


    const selectPrere = tasks.map((task) => {
        return <FormGroup check id={task.id}>
            <Label check>
                <Input type="checkbox" name="radio2" onChange={(e) => handleSelectPrere(e, task)}/>{" "}
                { task.title }
            </Label>
        </FormGroup>
    });


    const switchLeader = () => {
        // TODO: change leader and update data in db
    };


    // FIXME: somehow updateTask function is not working
    async function updateTask(id) {
        /*
        console.log(taskDescription);
        console.log(title);
        console.log(prere);
        console.log(owners);
        console.log(taskStatus);
        */

        let newTasks = [...tasks];

        for ( let i = 0; i < tasks.length; ++i)
        {
            if (tasks[i].id === id)
            {
                newTasks[i] = {
                    id: tasks[i].id,
                    title: title,
                    prere: prere,
                    owners: owners,
                    description: taskDescription,
                    status: taskStatus
                };
                break;
            }
        }

        setTitle("");
        setTaskDescription("");
        setTaskStatus("unfinished");
        setOwners([]);
        setPrere([]);

        await fetch(`http://localhost:8000/${projectId}/task/update`, {
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

        setShowTaskForm(false);
    };


    async function deleteTask(id) {
        const newTasks = {
            tasks: tasks.filter((task) => task.id !== id)
        }

        await fetch(`http://localhost:8000/${projectId}/task/update`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newTasks)
        }).catch((err) => {
            if (err) throw err;
            return;
        });

        // after deleting one element, rerender is not triggered
        setTasks(tasks.filter((task) => task.id !== id));
        setTitle("");
        setTaskDescription("");
        setTaskStatus("unfinished");
        setOwners([]);
        setPrere([]);
    };


    async function submitTask() {
        // TODO: submit a new task: change tasks array and update data in db

        if (title === "" || taskDescription === "")
        {
            window.alert("Task title or description cannot be empty");
            return;
        }

        if (owners.length === 0)
        {
            window.alert("You need to select owner(s) for a task");
            return;
        }

        let updatedTasks = [...tasks, {
            id: Math.random(),
            title: title,
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

        await fetch(`http://localhost:8000/update/${updatedProject.id}`, {
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
        setTitle("");
        setTaskDescription("");
    };


    return (
        <div className="project-detail" key={projectId}>
            <p><strong>{name}</strong></p>
            <p>{description}</p>
            <p>Leader: {leader}</p>
            <div>
                { showPeople }
            </div>
            <div className="add-task-modal">
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

                        <FormGroup>
                            <Label>Title</Label>
                            <Input type="textarea" name="title" onChange={(e) => setTitle(e.target.value)} />
                        </FormGroup>

                        <FormGroup tag="fieldset">
                            <legend>{"Owner(s)"}</legend>
                            { selectOwners }
                        </FormGroup>
                        { tasks.length !== 0 ?
                            <FormGroup className="prerequisites">
                                Prerequisites:
                                { selectPrere }
                            </FormGroup>
                            : ""
                        }

                        <FormGroup className="date-picker">
                            <div>Date Picker is needed!</div>
                        </FormGroup>

                        <FormGroup>
                            <Label for="textinput">Description</Label>
                            <Input type="textarea" name="description" onChange={(e) => { setTaskDescription(e.target.value) }}/>
                        </FormGroup>

                        <Button onClick={submitTask}>Submit</Button>
                    </Form>
                </Modal>
            </div>
            <div className="task-progress">
                <div className="text-left"><strong>Project Progress (# of finished task / total # of tasks)</strong></div>
                <div className="text-center">{0}%</div>
                <Progress value={0}/>
            </div>
            <div className="tab-views">
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
                    <NavItem>
                        <NavLink onClick={() => setActiveTab("1")}>
                            Gantt Chart
                        </NavLink>
                    </NavItem>
                </Nav>

                <TabContent activeTab={activeTab}>
                    <TabPane tabId="0">
                        <Row>
                            <Col>
                                <h4>Content in list</h4>
                            </Col>
                        </Row>
                        <Table>
                            <thead>
                                <tr className="table-row">
                                    <th>Title</th>
                                    <th>Prerequisites</th>
                                    <th>Owner</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            { showTasks }
                        </Table>
                    </TabPane>

                    <TabPane tabId="1">
                        <Row>
                            <Col>
                                <h4>Content in Gantt</h4>
                            </Col>
                        </Row>
                    </TabPane>

                    <TabPane tabId="2">
                        <Row>
                            <Col>
                                <h4>Content in flowchart</h4>
                            </Col>
                        </Row>
                    </TabPane>
                </TabContent>

            </div>
        </div>
    );
};



export default ProjectDetail;
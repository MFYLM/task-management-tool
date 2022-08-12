import React, { useEffect, useState } from "react";
import { Navigate, Link, Route } from "react-router-dom";
import { Modal, ModalBody, ModalHeader, ModalFooter, Button, FormGroup, Form, Input } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./Homepage.css";


function Home() {
    const [projectName, setProjectName] = useState("");
    const [leader, setLeader] = useState("");
    const [collaborators, setCollaborators] = useState([{ id: Math.random(), email: "please type email here" }]);
    const [description, setDescription] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [projectList, setProjectList] = useState([]);


    const [isEditProject, setIsEditProject] = useState(false);
    const [editProject, setEditProject] = useState(null);

    /*
    structure of a project
    {
        name: "",
        leader: "",
        collaborators: [
            id: int,
            userName: "",      --> [later update: collection this information from login sys]
            email: ""          --> [later update: regular expression for validating email, send email to get confirmation of collaboration, user icon for better UX]
        ],
        description: "",
        tasks: [
            id: int,
            description: "",
            owner: [
                email: ""
            ]
        ]
    }
    */

    useEffect(() => {
        // retrieve project list in here
        async function getProjects() {
            const response = await fetch("http://localhost:8000/record");

            if (!response.ok)
            {
                const err = `An Error Occured: ${response.statusText}`;
                window.alert(err);
                return;
            }

            const projects = await response.json();
            setProjectList(projects);
        };

        getProjects();

    }, [projectList.length, isOpen, isEditProject]);


    async function submitNewProject(e) {
        e.preventDefault();

        if (!collaborators.length)
        {
            window.alert("You need to add collaborators for your project!");
            return;
        }

        const newProject = {
            id: Math.random(),
            name: projectName,
            leader: leader,
            collaborators: collaborators,
            description: description,
            tasks: []
            // tasks could be created after having a new project setted up
        };
    
        await fetch("http://localhost:8000/record/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newProject)
        }).catch(err => {
            window.alert(err);
            return;
        });

        setProjectList([...projectList, newProject]);
        setIsOpen(false);
    };


    // TODO: only change fields of a task besides its tasks
    async function updateProject(projectId) {
        let newProject = {
            name: projectName,
            leader: leader,
            description: description,
            collaborators: collaborators,
        };

        const regex = /[0-9a-fA-F]{24}/
        const id = projectId.match(regex)

        const response = await fetch(`http://localhost:8000/update/${id[0]}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newProject)
        }).catch((err) => {
            if (err) throw err;
            return;
        })

        setProjectName("");
        setCollaborators([]);
        setDescription("");
        setLeader("");
    };


    const changeCollaborator = ( e, id ) => {
        // change value in submit
        let newCollaborators = [...collaborators];
        for (let i = 0; i < collaborators.length; ++i)
        {
            if (collaborators[i].id === id)
                newCollaborators[i].email = e.target.value;
        }
        setCollaborators(newCollaborators);
    };


    const deleteCollaborator = (id) => {
        setCollaborators(collaborators.filter((collaborator) => collaborator.id !== id));
    };


    const inputCollaborators = collaborators.map((person) => {
        return <div key={person.id}>
            <input className="collaborators-email-username" placeholder={person.email} onChange={(e) => changeCollaborator(e, person.id)}/>
            <button className="remove-collaborator" onClick={() => deleteCollaborator(person.id)}>x</button>
        </div>;
    });


    const displayCollaborators = collaborators.map((person) => {
        return <div key={person.id}>
            <input className="collaborators-email-username" defaultValue={person.email === "please type email here" ? "" : person.email} onChange={(e) => changeCollaborator(e, person.id)}/>
            <Button className="remove-collaborator" onClick={() => deleteCollaborator(person.id)}>x</Button>
        </div>;
    });


    const showProjectList = projectList.map((project) => {
        const path = "./projectdetail/" + project._id;

        return <div className="project-object" key={project._id}>
                <Link to={path} state={ {projectId: project._id} }><strong>{project.name}</strong></Link>
                <p>{project.description}</p>
                <Button onClick={ () => { setEditProject(project._id); setCollaborators(project.collaborators); setLeader(project.leader); setDescription(project.description); setProjectName(project.name); setIsEditProject(true); } }>Edit Project</Button>
                <Modal isOpen={isEditProject && editProject === project._id}>
                    <Form>
                        <FormGroup>
                            Name:
                            <Input value={projectName} onChange={ (e) => setProjectName(e.target.value) }/>
                        </FormGroup>

                        <FormGroup>
                            Leader: <Input value={ leader } onChange={ (e) => setLeader(e.target.value) }/>
                        </FormGroup>

                        <FormGroup>
                            Description: <textarea defaultValue={description} onChange={ (e) => setDescription(e.target.value) }/>
                        </FormGroup>

                        <FormGroup>
                            Collaborators: 
                            <Button onClick={(e) => { setCollaborators([...collaborators, { id: Math.random(), email: "please type email here" }]); e.preventDefault(); } }>+</Button>
                            {displayCollaborators}
                        </FormGroup>

                        <Button onClick={() => { updateProject(project._id); setIsEditProject(false);} }>Submit</Button>
                        <Button onClick={() => { setIsEditProject(false);  setProjectName(""); setCollaborators([]); setDescription(""); setLeader("");} }>Cancel</Button>
                    </Form>
                </Modal>
            </div>
    });
    // Link component needs to be used inside of route view


    return (
            <div className="project-overview">
                <div className="header-homepage">
                    <header className="text-center"><strong>Welcome To TMT!</strong></header>
                </div>
                <button className="add-project-btn" onClick={() => setIsOpen(true)}>Add New Project</button>
                <Modal isOpen={isOpen}>
                    <ModalHeader>
                        <div>Include A New Project</div>
                        <div>
                            <button className="btn delete-button" onClick={() => setIsOpen(false)}>X</button>
                        </div>
                    </ModalHeader>
                    <ModalBody>
                        <form className="new-project-form">
                            <label>Name: </label>
                            <input className="project-name" placeholder="type here" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                            <br></br>
                            <label>Leader: </label>
                            <input className="leader-email-username" value={leader} onChange={(e) => setLeader(e.target.value)} />
                            <br></br>
                            <label>Collaborators: </label>
                            <button onClick={(e) => { setCollaborators([...collaborators, { id: Math.random(), email: "please type email here" }]); e.preventDefault(); } }>+</button>
                            { inputCollaborators }
                            <br></br>
                            <label>Description: </label>
                            <textarea className="project-description" value={description} onChange={(e) => setDescription(e.target.value)}/>
                        </form>
                    </ModalBody>
                    <ModalFooter>
                        <button className="btn btn-outline-dark float-right" onClick={submitNewProject}>Submit</button>
                    </ModalFooter>
                </Modal>
                <div className="project-table">
                    { showProjectList }
                </div>
            </div>
    );

};





export default Home;
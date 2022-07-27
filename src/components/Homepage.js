import React, { useEffect, useState } from "react";
import { Navigate, Link, Route } from "react-router-dom";
import { Modal, ModalBody, ModalHeader, ModalFooter } from "reactstrap";
import 'bootstrap/dist/css/bootstrap.min.css';



function Home() {
    const [projectName, setProjectName] = useState("");
    const [leader, setLeader] = useState("");
    const [collaborators, setCollaborators] = useState([{ id: Math.random(), email: "please type email here" }]);
    const [description, setDescription] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [projectList, setProjectList] = useState([]);

    /*
    structure of a project
    {
        name: "",
        leader: "",
        collaborators: [
            id: int,
            email: ""
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

    }, [projectList.length]);


    async function submitNewProject(e) {
        // send value to MongoDB
        e.preventDefault();

        /*
        console.log(projectName);
        console.log(leader);
        console.log(collaborators);
        console.log(description);
        */
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


    const showProjectList = projectList.map((project) => {
        const path = "./projectdetail/" + project._id;

        return <div className="project-object" key={project._id}>
                <Link to={path} state={ {projectId: project._id} }><strong>{project.name}</strong></Link>
                <p>{project.description}</p>
        </div>
    });

    // Link component needs to be used inside of route view

    return (
            <div className="create-project">
                <div className="header-homepage">
                    <header className="text-center"><strong>Welcome To TMT!</strong></header>
                </div>
                <button className="btn btn-outline-dark float-right" onClick={() => setIsOpen(true)}>Add New Project</button>
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
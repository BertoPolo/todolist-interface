import React, { useEffect, useState } from 'react'
import { Container, Button, Form, ListGroup, Modal, Spinner } from "react-bootstrap"
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PencilSquare, Trash, Plus } from 'react-bootstrap-icons'
import MyNavbar from './Navbar'

const Home = () => {
    const [tasks, setTasks] = useState([])
    const [folders, setFolders] = useState([]);
    const [selectedFolder, setSelectedFolder] = useState("");

    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [randomNum, setRandomNum] = useState("1"); // temporary random ID for droppableId


    const bgColors = ['bg-color-1', 'bg-color-2', 'bg-color-3', 'bg-color-4', 'bg-color-5'];

    const getTasks = async (folder) => {
        setIsLoading(true)
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER}tasks`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
            });
            const data = await response.json();

            if (data) {
                const uniqueFolders = [...new Set(data.map(task => task.folder))];
                if (folder) {
                    setTasks(data.filter(task => task.folder === folder));
                    setSelectedFolder(folder)
                } else {
                    setTasks(data.filter(task => task.folder === uniqueFolders[0]));
                    setFolders(uniqueFolders);
                    setSelectedFolder(uniqueFolders[0])
                }
            }
            else console.error("No tasks found")

        } catch (error) {
            console.log(error)
        } finally {
            setIsLoading(false);
        }
    }

    const createNewTask = async (e) => {
        e.preventDefault();
        const title = e.target.title.value
        const task = e.target.task.value
        const folder = e.target.folder.value

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER}tasks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ title, task, folder })
            });

            if (response.ok) {
                getTasks()
                setShowCreateModal(false)
            }
        } catch (error) {
            console.error('Error al crear la tarea:', error);
        }
    };

    const editTask = async (e) => {

        e.preventDefault();
        const title = e.target.title.value
        const task = e.target.task.value
        const folder = e.target.folder.value

        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER}tasks/${selectedTask._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ title, task, folder })
            });

            if (response.ok) {
                getTasks()
                setShowEditModal(false)
            }
        } catch (error) {
            console.error('Error al modificar la tarea:', error);
        }

    }

    const deleteTask = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER}tasks/${selectedTask._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
            });

            if (response.ok) {
                getTasks()
                setShowDeleteModal(false)
            }
        } catch (error) {
            console.error('Error al eliminar la tarea:', error);
        }

    }

    const handleEditClick = (task) => {
        setSelectedTask(task);
        setShowEditModal(true);
    };

    const handleDeleteClick = (task) => {
        setSelectedTask(task);
        setShowDeleteModal(true);
    };


    useEffect(() => {
        getTasks()
    }, [])

    useEffect(() => {
        // temporary random ID for droppableId
        setRandomNum(Math.floor(Math.random() * 4).toString())
    }, [tasks]);


    const onDragEnd = async (result) => {
        if (!result.destination) {
            return;
        }

        const { source, destination } = result;

        if (destination.droppableId.startsWith("folder-")) {
            const folderName = destination.droppableId.split("folder-")[1];
            const updatedTask = { ...tasks[source.index], folder: folderName };

            try {
                const response = await fetch(`${process.env.REACT_APP_SERVER}tasks/${updatedTask._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify(updatedTask)
                });

                if (response.ok) {
                    getTasks();
                } else {
                    console.error('Error al mover la tarea:', response.statusText);
                }
            } catch (error) {
                console.error('Error al mover la tarea:', error);
            }
        }
        else {
            //non sense feature, this is to reorder tasks
            const reorderedTasks = Array.from(tasks);
            const [removed] = reorderedTasks.splice(source.index, 1);
            reorderedTasks.splice(destination.index, 0, removed);
            setTasks(reorderedTasks);

        }
    };


    return (
        <>
            <MyNavbar />

            <DragDropContext onDragEnd={onDragEnd} isCombineEnabled={true}>
                <Container className='mb-4'>
                    <div className='d-flex align-items-center my-4 justify-content-between'>
                        <div className='d-flex'>
                            {/* <div className="folder pointer" onClick={() => getTasks()}>All tasks</div> */}
                            {/* Each existing folder  */}
                            {folders.map((folder, index) => (
                                <Droppable key={`folder-${index}`} droppableId={`folder-${folder}`} isCombineEnabled={false}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.droppableProps} className="folder-container pointer" onClick={() => getTasks(folder)}>
                                            <div className={`folder ${selectedFolder === folder ? "selectedFolder" : ""}`}>{folder}</div>
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            ))}


                        </div>
                        <Button className="btnLogin border-0" onClick={() => setShowCreateModal(true)}>
                            <Plus className="d-inline-block d-sm-none" />
                            <span className="d-none d-sm-inline">New Task</span>
                        </Button>
                    </div>

                    <Droppable droppableId={randomNum}>
                        {(provided) => (
                            <ListGroup {...provided.droppableProps} ref={provided.innerRef}>
                                {isLoading ? (
                                    <div className="d-flex justify-content-center">
                                        <Spinner animation="border" variant="success">
                                            {/* <span className="text-success">Loading...</span> */}
                                        </Spinner>
                                    </div>
                                ) : tasks.length > 0 ? (
                                    tasks.map((task, index) => (
                                        <Draggable key={task._id} draggableId={task._id} index={index}>
                                            {(provided, snapshot) => (
                                                <ListGroup.Item
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={`border-0 rounded d-flex flex-column justify-content-between mb-2 ${bgColors[index % bgColors.length]} ${snapshot.isDragging ? 'is-dragging' : ''}`}                                                >
                                                    <div>
                                                        <h5 className="font-weight-bold">{task.title}</h5>
                                                        <p>{task.task}</p>
                                                        <small className="text-muted">Created: {new Date(task.createdAt).toLocaleString()}</small>
                                                    </div>
                                                    <div className="d-flex justify-content-end">
                                                        <PencilSquare
                                                            onClick={() => handleEditClick(task)}
                                                            className="pointer mx-2"
                                                            style={{ width: '1.2rem', height: '1.2rem' }}
                                                        />
                                                        <Trash
                                                            onClick={() => handleDeleteClick(task)}
                                                            className="pointer text-danger"
                                                            style={{ width: '1.2rem', height: '1.2rem' }}
                                                        />
                                                    </div>
                                                </ListGroup.Item>
                                            )}
                                        </Draggable>
                                    ))
                                ) : (
                                    <div className="text-center mt-3">
                                        <p>No tasks saved</p>
                                    </div>
                                )}
                                {provided.placeholder}
                            </ListGroup>
                        )}
                    </Droppable>

                    <p className="pointer mt-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}><u>Back to top</u></p>

                    {/* MODALS */}

                    {/* Create Task */}
                    <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Create New Task</Modal.Title>
                        </Modal.Header>
                        <Form onSubmit={(e) => createNewTask(e)}>
                            <Modal.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        name="title"
                                        type="text"
                                        placeholder="Título"
                                        required maxLength="20"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Task Description</Form.Label>
                                    <Form.Control
                                        name="task"
                                        as="textarea"
                                        rows={3}
                                        placeholder="Descripción de la tarea"
                                        required maxLength="150"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Folder</Form.Label>
                                    <Form.Control
                                        name="folder"
                                        type="text"
                                        placeholder="Carpeta"
                                        required maxLength="15"
                                    />
                                </Form.Group>
                            </Modal.Body>

                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Close</Button>
                                <Button variant="primary" type="submit">Create Task</Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                    {/* Edit modal */}
                    <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Edit Task</Modal.Title>
                        </Modal.Header>

                        <Form onSubmit={(e) => {
                            e.preventDefault();
                            editTask(e, selectedTask._id);
                        }}>
                            <Modal.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control
                                        name="title"
                                        type="text"
                                        defaultValue={selectedTask?.title}
                                        required maxLength="20"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Task Description</Form.Label>
                                    <Form.Control
                                        name="task"
                                        as="textarea"
                                        rows={3}
                                        defaultValue={selectedTask?.task}
                                        required maxLength="150"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Folder</Form.Label>
                                    <Form.Control
                                        name="folder"
                                        type="text"
                                        placeholder="Carpeta"
                                        defaultValue={selectedTask?.folder}
                                        required maxLength="15"
                                    />
                                </Form.Group>
                            </Modal.Body>

                            <Modal.Footer>
                                <Button variant="secondary" onClick={() => setShowEditModal(false)}>Close</Button>
                                <Button variant="primary" type="submit">Save Changes</Button>
                            </Modal.Footer>
                        </Form>
                    </Modal>

                    {/* Delete Modal */}
                    <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Delete Task</Modal.Title>
                        </Modal.Header>

                        <Modal.Body>Are you sure you want to delete this task?</Modal.Body>

                        <Modal.Footer>
                            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                            <Button variant="danger" onClick={deleteTask}>Delete</Button>
                        </Modal.Footer>
                    </Modal>

                </Container>
            </DragDropContext>

        </>
    );
}

export default Home
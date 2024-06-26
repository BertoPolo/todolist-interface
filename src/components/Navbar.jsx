import React from 'react'
import { Navbar, Nav, Button, Container, Image } from 'react-bootstrap';
import { BoxArrowRight, PersonFill } from 'react-bootstrap-icons';
import { useNavigate } from "react-router-dom"
import CustomTasksColor from './CustomTasksColor';
import { useAuth } from '../tools/authContext';


const MyNavbar = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const isUserLoggedIn = localStorage.getItem('accessToken');

    const handleLogout = () => {
        logout()
        localStorage.removeItem('accessToken');
        navigate("/");
    };

    return (
        <Navbar bg="light" >
            <Container>
                <Navbar.Brand href="/home">
                    <Image
                        src="/taskwave_nobg.png" alt="Company logo"
                        className="d-inline-block align-top"
                        style={{ height: "5vh", width: "auto" }}
                    />

                </Navbar.Brand>
                <Nav className="ms-auto">

                    {isUserLoggedIn ? (
                        <Button variant="outline-danger" onClick={handleLogout} className="d-flex align-items-center">
                            <BoxArrowRight className="d-inline-block d-sm-none" />
                            <span className="d-none d-sm-inline">Logout</span>
                        </Button>
                    ) : (
                        <Button variant="outline-primary" onClick={() => navigate("/")} className="d-flex align-items-center">
                            <PersonFill className="d-inline-block d-sm-none " />
                            <span className="d-none d-sm-inline">Login</span>
                        </Button>
                    )}
                </Nav>
            </Container>
        </Navbar>)
}

export default MyNavbar
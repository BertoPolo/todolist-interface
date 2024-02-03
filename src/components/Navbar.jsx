import React from 'react'
import { Navbar, Nav, Button, Container, Image } from 'react-bootstrap';
import { BoxArrowRight, PersonFill } from 'react-bootstrap-icons';
import { useNavigate } from "react-router-dom"

const MyNavbar = () => {
    const navigate = useNavigate();
    const isUserLoggedIn = localStorage.getItem('accessToken');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        navigate("/");
    };

    return (
        <Navbar bg="light" >
            <Container>
                <Navbar.Brand href="/home">
                    <Image
                        src="https://numentech.es/wp-content/uploads/2022/09/Recurso-20.png"
                        className="d-inline-block align-top"
                        alt="Logo de la empresa"
                        style={{ height: "7vh", width: "auto" }}
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
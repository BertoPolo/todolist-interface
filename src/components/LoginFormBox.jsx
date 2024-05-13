import { Form, Button, Spinner } from "react-bootstrap"
import { useNavigate, Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react";


const FormBox = ({ setIsVerifiying, setIsVerified, isVerifiying, isVerified, handleCredentials, modalFirstInputRef }) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isCharging, setIsCharging] = useState(false)
    const [isError, setIsError] = useState(false)

    const navigate = useNavigate()
    const passwordRef = useRef(null)

    const isValidEmail = email => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const createToken = async () => {
        setIsCharging(true)
        try {
            const body = {
                email: email,
                password: password
            }

            const response = await fetch(`${process.env.REACT_APP_SERVER}users/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            if (response.ok) {
                const data = await response.json();

                if (data.isVerified === false) {
                    handleCredentials(email, password);
                    setIsVerifiying(true);
                    setIsVerified(false);//is it really needed? 

                } else {
                    localStorage.setItem("accessToken", data.accessToken);
                    navigate("/home");
                }
            } else {
                console.log("Check your credentials again");
                setIsError(true);
                setTimeout(() => setIsError(false), 3000);
            }

        } catch (error) { console.log(error) }
        finally {
            setIsCharging(false)
        }
    }

    useEffect(() => {
        if (isVerified) createToken(email, password);
    }, [isVerified]);

    return (
        <>
            <Form className="login-container" onSubmit={(e) => { e.preventDefault(); createToken(email, password) }} style={{ opacity: isCharging ? "0.5" : "1" }}>
                <div className="login-modal">
                    <h3 className="mb-3 d-flex">Welcome!</h3>

                    <Form.Group>
                        <div className="d-flex"><Form.Label>Email</Form.Label></div>
                        <Form.Control type="email" placeholder="fernando23@taskwave.be" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isVerifiying} />
                    </Form.Group>

                    <Form.Group>
                        <div className="d-flex"><Form.Label>Password</Form.Label></div>
                        <Form.Control type="password" placeholder="****" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isVerifiying} onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                createToken(email, password);
                            }
                        }} />
                    </Form.Group>


                    <div className="d-flex justify-content-around">
                        <Button className="border-0 btnSignup" onClick={() => navigate("/register")} disabled={isCharging}>Sign up</Button>

                        <Button className="border-0 buttonLogin" type="submit" disabled={!isValidEmail(email) || (!password) || isCharging} >
                            Login
                        </Button>
                    </div>

                    <Link className="mt-4 d-block text-center" to="/home"><small>I don't have an account</small></Link>

                    {/* <small className="text-muted text-center login-small-font d-block mt-3">© 2024 ALL RIGHTS RESERVED</small> */}
                </div >
                {isCharging && <Spinner className="position-absolute" animation="border" variant="success" />}
                {isError && <Spinner className="position-absolute" animation="grow" variant="danger" />}

            </Form >





        </>
    )
}

export default FormBox
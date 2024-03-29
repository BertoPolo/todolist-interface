import { jwtDecode } from "jwt-decode"

//from  the access token you get the owner of the task
export function getCreatedBy() {
  const token = localStorage.getItem("accessToken")
  if (token) {
    const decoded = jwtDecode(token)
    console.log(decoded.email)
    return decoded.email
  }
  return null
}

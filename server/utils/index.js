const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

export function validateEmail(email) {
    return emailRegex.test(email)
}

export function validatePassword(password) {
    return passwordRegex.test(password)
}

const USER_DATA_KEY = 'user';

function checkExistingUser() {
    const userData = localStorage.getItem(USER_DATA_KEY);
    if (userData) {
        window.location.href = 'home.html';
    }
}

function handleSubmit(event) {
    event.preventDefault();
    
    const user = {
        name: document.getElementById('name').value,
        age: parseInt(document.getElementById('age').value),
        height: parseFloat(document.getElementById('height').value),
        weight: parseFloat(document.getElementById('weight').value)
    };
    
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    window.location.href = 'home.html';
}

document.addEventListener('DOMContentLoaded', () => {
    checkExistingUser();
    document.getElementById('onboarding-form').addEventListener('submit', handleSubmit);
});

// Auto-redirect if not logged in
if (!localStorage.getItem('adminAuth') && !window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
}
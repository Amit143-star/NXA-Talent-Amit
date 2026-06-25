/**
 * NXA TALENT - APP STATE ENGINE
 * Centralized state and reactive handlers.
 */

const AppState = {
    user: JSON.parse(localStorage.getItem('nxa_active_session')) || null,
    role: localStorage.getItem('nxa_active_role') || 'student',
    roleType: localStorage.getItem('nxa_active_roletype') || null,
    view: 'home', // 'home' | 'courses' | 'career'
    courses: [
        { id: 1, title: 'Quantum Frontend', domain: 'Eng', enrolled: false },
        { id: 2, title: 'Ethical AI', domain: 'AI', enrolled: false },
        { id: 3, title: 'Neural Security', domain: 'Defense', enrolled: false }
    ],
    
    // Core Handlers
    listeners: [],
    
    subscribe(callback) {
        this.listeners.push(callback);
    },
    
    notify() {
        this.listeners.forEach(cb => cb(this));
        localStorage.setItem('nxa_active_session', JSON.stringify(this.user));
        localStorage.setItem('nxa_active_role', this.role);
        if (this.roleType) {
            localStorage.setItem('nxa_active_roletype', this.roleType);
        } else {
            localStorage.removeItem('nxa_active_roletype');
        }
    },
    
    setUser(user, role = 'student', roleType = null) {
        this.user = user;
        this.role = role || 'student';
        this.roleType = roleType;
        this.notify();
    },
    
    setView(view) {
        this.view = view;
        this.notify();
    },
    
    logout() {
        this.user = null;
        this.role = 'student';
        this.roleType = null;
        this.notify();
    }
};

export default AppState;

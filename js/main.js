/**
 * NXA TALENT - MODULE ORCHESTRATOR
 * Handles mounting, routing, and lifecycle.
 */

import AppState from './state.js';

const DOM = {
    root: document.getElementById('root'),
    mask: document.getElementById('loading-mask')
};

class NXAEngine {
    constructor() {
        this.init();
    }

    async init() {
        console.log("NXA CORE: INITIALIZING MODULES...");
        
        // Subscribe to state changes for reactive UI
        AppState.subscribe((state) => this.render(state));
        
        // Initial delay for 'Industrial Loading' effect
        setTimeout(() => {
            DOM.mask.style.opacity = '0';
            setTimeout(() => DOM.mask.remove(), 1000);
            this.render(AppState);
        }, 1500);
    }

    render(state) {
        if (!state.user) {
            this.mountAuth();
        } else {
            this.mountCore(state);
        }
    }

    mountAuth(mode = 'login') {
        DOM.root.innerHTML = `
            <div class="auth-overlay">
                <div class="auth-card">
                    <div class="auth-header">
                        <span class="nx">NXA</span><span class="talent">TALENT</span>
                        <h2>${mode === 'login' ? 'IDENTITY ACCESS' : 'REGISTER CORE ID'}</h2>
                    </div>
                    
                    <form id="authForm">
                        ${mode === 'signup' ? `
                        <div class="input-block">
                            <label>FULL NAME</label>
                            <input type="text" id="name" required placeholder="Enter student name">
                        </div>` : ''}
                        <div class="input-block">
                            <label>CORE ID (EMAIL)</label>
                            <input type="email" id="email" required placeholder="name@nxa.core">
                        </div>
                        <div class="input-block">
                            <label>ACCESS KEY</label>
                            <input type="password" id="pass" required placeholder="••••••••">
                        </div>
                        <button type="submit" class="btn-primary-lg w-full">
                            ${mode === 'login' ? 'INITIALIZE SESSION' : 'AUTHORIZE IDENTITY'}
                        </button>
                    </form>

                    <div class="auth-divider"><span>OR MATRIX LINK</span></div>
                    
                    <button id="googleLogin" class="btn-google">
                        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png">
                        GOOGLE IDENTITY
                    </button>

                    <p class="auth-switch">
                        ${mode === 'login' ? 
                            'No core ID? <a href="#" id="toggleAuth">Register Identity</a>' : 
                            'Already recorded? <a href="#" id="toggleAuth">Login Verification</a>'}
                    </p>
                </div>
            </div>
        `;

        // Wiring
        document.getElementById('toggleAuth').onclick = (e) => {
            e.preventDefault();
            this.mountAuth(mode === 'login' ? 'signup' : 'login');
        };

        document.getElementById('authForm').onsubmit = (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const pass = document.getElementById('pass').value;
            
            if (mode === 'signup') {
                const name = document.getElementById('name').value;
                this.handleRegister(name, email, pass);
            } else {
                this.handleLogin(email, pass);
            }
        };

        document.getElementById('googleLogin').onclick = () => {
            AppState.setUser({ name: "Google_Agent", email: "agent@gmail.com" });
        };
    }

    handleRegister(name, email, pass) {
        const users = JSON.parse(localStorage.getItem('nxa_users')) || [];
        if (users.find(u => u.email === email)) {
            alert("This Core ID is already registered in the matrix.");
            return;
        }
        const newUser = { name, email, pass };
        users.push(newUser);
        localStorage.setItem('nxa_users', JSON.stringify(users));
        alert("Identity Authorized. Redirecting to Core...");
        AppState.setUser(newUser);
    }

    handleLogin(email, pass) {
        const users = JSON.parse(localStorage.getItem('nxa_users')) || [];
        const user = users.find(u => u.email === email && u.pass === pass);
        if (user) {
            AppState.setUser(user);
        } else {
            alert("ACCESS DENIED: Invalid Core ID or Access Key.");
        }
    }

    mountCore(state) {
        DOM.root.innerHTML = `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="logo">
                        <span class="nx">NXA</span><span class="talent">TALENT</span>
                    </div>
                    <div class="nav-links">
                        <a href="#" class="nav-item ${state.view === 'home' ? 'active' : ''}" data-view="home">Home</a>
                        <a href="#" class="nav-item ${state.view === 'courses' ? 'active' : ''}" data-view="courses">Courses</a>
                        <a href="#" class="nav-item ${state.view === 'career' ? 'active' : ''}" data-view="career">Career</a>
                    </div>
                    <div class="user-meta">
                        <div class="user-display">
                            <span class="name">${state.user.name}</span>
                            <span class="status">CORE_SYNC_ACTIVE</span>
                        </div>
                        <button class="btn-logout" id="logoutBtn">TERMINATE</button>
                    </div>
                </div>
            </nav>
            <main id="app-viewport">
                ${this.renderView(state)}
            </main>
        `;

        // Wire up nav events
        document.querySelectorAll('.nav-item').forEach(item => {
            item.onclick = (e) => {
                e.preventDefault();
                AppState.setView(item.dataset.view);
            }
        });

        document.getElementById('logoutBtn').onclick = () => AppState.logout();
    }

    renderView(state) {
        if (state.view === 'home') return this.viewHome(state);
        if (state.view === 'courses') return this.viewCourses(state);
        if (state.view === 'career') return this.viewCareer(state);
    }

    viewHome(state) {
        return `
            <section class="section">
                <h1 class="glitch-text">Welcome back,<br>${state.user.name}</h1>
                <p style="margin-top:2rem; font-size: 1.2rem; color: var(--text-dim);">
                    Your career trajectory is currently at <strong>OPTIMAL</strong> levels.<br>
                    3 priority courses are awaiting your session.
                </p>
                <div style="margin-top:4rem;">
                    <button class="btn-primary-lg" onclick="location.hash='#courses'">Continue Architecture</button>
                </div>
            </section>
        `;
    }

    viewCourses(state) {
        return `
            <section class="section">
                <h2 style="font-family: var(--font-heading); font-size: 2.5rem; margin-bottom: 3rem;">COURSE_MATRIX</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem;">
                    ${state.courses.map(c => `
                        <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); padding: 2rem; border-radius: 12px;">
                            <span style="font-size: 0.7rem; color: var(--accent-primary); letter-spacing: 1px;">[${c.domain}]</span>
                            <h3 style="margin: 1rem 0; font-family: var(--font-heading);">${c.title}</h3>
                            <button class="btn-primary-lg" style="padding: 0.75rem 2rem; font-size: 0.8rem;">INITIATE MODULE</button>
                        </div>
                    `).join('')}
                </div>
            </section>
        `;
    }

    viewCareer(state) {
        return `
            <section class="section">
                <h2 style="font-family: var(--font-heading); font-size: 2.5rem; margin-bottom: 3rem;">TRAJECTORY_SYNC</h2>
                <div style="max-width: 600px; padding: 3rem; background: var(--bg-darker); border: 1px solid var(--glass-border); border-radius: 20px;">
                    <h3>Neural Architect</h3>
                    <div style="height: 4px; background: var(--glass-border); margin: 2rem 0; position: relative;">
                        <div style="width: 65%; height: 100%; background: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary);"></div>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--text-dim);">Your progress towards Neural Architect core is 65% complete. Focus on 'Quantum Frontend' to reach level 4.</p>
                </div>
            </section>
        `;
    }
}

// Start the Engine
new NXAEngine();

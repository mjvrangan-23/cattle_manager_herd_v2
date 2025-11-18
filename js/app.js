class CattleHerdManager {
    constructor() {
        this.currentUser = null;
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupEventListeners();
        this.loadDashboard();
    }

    checkAuthentication() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            this.currentUser = JSON.parse(user);
            this.showAppScreen();
        } else {
            this.showLoginScreen();
        }
    }

    showLoginScreen() {
        document.getElementById('loginScreen').classList.add('active');
        document.getElementById('appScreen').classList.remove('active');
    }

    showAppScreen() {
        document.getElementById('loginScreen').classList.remove('active');
        document.getElementById('appScreen').classList.add('active');
        document.getElementById('currentUser').textContent = 
            `Welcome, ${this.currentUser.name} (${this.currentUser.role})`;
        this.updateNavigation();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionName).classList.add('active');
        
        // Activate corresponding nav link
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        this.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch(sectionName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'animals':
                window.animalsManager.loadAnimals();
                break;
            case 'treatments':
                window.treatmentsManager.loadTreatments();
                break;
            case 'inventory':
                window.inventoryManager.loadInventory();
                break;
            case 'outcomes':
                window.outcomesManager.loadOutcomes();
                break;
            case 'expenses':
                window.expensesManager.loadExpenses();
                break;
            case 'documents':
                window.documentsManager.loadDocuments();
                break;
            case 'reports':
                window.reportsManager.loadReports();
                break;
            case 'users':
                this.loadUsers();
                break;
        }
    }

    loadDashboard() {
        const animals = window.database.getAnimals();
        const treatments = window.database.getTreatments();
        const inventory = window.database.getInventory();

        document.getElementById('totalAnimals').textContent = animals.length;
        document.getElementById('activeTreatments').textContent = 
            treatments.filter(t => !t.completed).length;
        document.getElementById('lowStockItems').textContent = 
            inventory.filter(item => item.quantity <= item.lowStockThreshold).length;
        document.getElementById('adoptedAnimals').textContent = 
            animals.filter(a => a.outcome === 'Adopted').length;

        this.loadRecentActivities();
    }

    loadRecentActivities() {
        const activities = window.database.getActivities();
        const activitiesList = document.getElementById('activitiesList');
        
        activitiesList.innerHTML = activities.slice(0, 10).map(activity => `
            <div class="activity-item">
                <strong>${activity.type}</strong>: ${activity.description}
                <small>${new Date(activity.timestamp).toLocaleString()}</small>
            </div>
        `).join('');
    }

    loadUsers() {
        // Only admin can access this section
        if (this.currentUser.role !== 'Admin') {
            this.showSection('dashboard');
            alert('Access denied. Admin privileges required.');
            return;
        }

        const users = window.database.getUsers();
        // Implementation for users management
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.showLoginScreen();
    }

    hasPermission(requiredRole) {
        const userRole = this.currentUser.role;
        const roleHierarchy = {
            'Admin': 4,
            'Veterinarian': 3,
            'Staff': 2,
            'External': 1
        };

        return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CattleHerdManager();
});
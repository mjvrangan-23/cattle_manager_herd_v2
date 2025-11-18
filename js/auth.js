class AuthManager {
    constructor() {
        this.setupLoginForm();
        this.initializeDemoData();
    }

    setupLoginForm() {
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        const user = this.authenticateUser(username, password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.reload();
        } else {
            alert('Invalid username or password');
        }
    }

    authenticateUser(username, password) {
        const users = window.database.getUsers();
        return users.find(user => 
            user.username === username && user.password === password
        );
    }

    initializeDemoData() {
        // Only initialize if no users exist
        if (window.database.getUsers().length === 0) {
            const demoUsers = [
                {
                    id: 1,
                    username: 'admin',
                    password: 'admin123',
                    name: 'System Administrator',
                    role: 'Admin',
                    email: 'admin@shelter.org'
                },
                {
                    id: 2,
                    username: 'vet',
                    password: 'vet123',
                    name: 'Dr. Sarah Wilson',
                    role: 'Veterinarian',
                    email: 'vet@shelter.org'
                },
                {
                    id: 3,
                    username: 'staff',
                    password: 'staff123',
                    name: 'John Doe',
                    role: 'Staff',
                    email: 'staff@shelter.org'
                }
            ];

            demoUsers.forEach(user => window.database.addUser(user));

            // Add some sample animals
            const sampleAnimals = [
                {
                    id: 1,
                    name: 'Bessie',
                    species: 'Cow',
                    breed: 'Holstein',
                    age: 3,
                    sex: 'Female',
                    colorMarkings: 'Black and white spots',
                    intakeDate: '2024-01-15',
                    intakeTime: '10:30',
                    intakeReason: 'Owner Unable to Maintain',
                    conditionArrival: 'Malnourished but otherwise healthy',
                    status: 'Active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    name: 'Billy',
                    species: 'Goat',
                    breed: 'Nubian',
                    age: 2,
                    sex: 'Male',
                    colorMarkings: 'Brown with white patches',
                    intakeDate: '2024-01-20',
                    intakeTime: '14:00',
                    intakeReason: 'Accident',
                    conditionArrival: 'Leg injury, requires treatment',
                    status: 'Active',
                    createdAt: new Date().toISOString()
                }
            ];

            sampleAnimals.forEach(animal => window.database.addAnimal(animal));

            // Add sample inventory
            const sampleInventory = [
                {
                    id: 1,
                    name: 'Antibiotic Injection',
                    category: 'Medication',
                    quantity: 50,
                    unit: 'vials',
                    lowStockThreshold: 10,
                    supplier: 'MedSupply Co.'
                },
                {
                    id: 2,
                    name: 'Bandages',
                    category: 'Supplies',
                    quantity: 200,
                    unit: 'pieces',
                    lowStockThreshold: 50,
                    supplier: 'First Aid Inc.'
                }
            ];

            sampleInventory.forEach(item => window.database.addInventoryItem(item));
        }
    }
}

// Initialize auth manager
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});
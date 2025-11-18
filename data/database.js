class Database {
    constructor() {
        this.init();
    }

    init() {
        // Initialize localStorage keys if they don't exist
        const keys = ['users', 'animals', 'treatments', 'inventory', 'outcomes', 'expenses', 'documents', 'activities'];
        
        keys.forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
    }

    // Generic CRUD operations
    getAll(key) {
        return JSON.parse(localStorage.getItem(key)) || [];
    }

    getById(key, id) {
        const items = this.getAll(key);
        return items.find(item => item.id === id);
    }

    add(key, item) {
        const items = this.getAll(key);
        const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        item.id = newId;
        items.push(item);
        localStorage.setItem(key, JSON.stringify(items));
        return item;
    }

    update(key, updatedItem) {
        const items = this.getAll(key);
        const index = items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedItem };
            localStorage.setItem(key, JSON.stringify(items));
            return true;
        }
        return false;
    }

    delete(key, id) {
        const items = this.getAll(key);
        const filteredItems = items.filter(item => item.id !== id);
        localStorage.setItem(key, JSON.stringify(filteredItems));
        return true;
    }

    // Users
    getUsers() {
        return this.getAll('users');
    }

    getUser(id) {
        return this.getById('users', id);
    }

    addUser(user) {
        return this.add('users', user);
    }

    updateUser(user) {
        return this.update('users', user);
    }

    deleteUser(id) {
        return this.delete('users', id);
    }

    // Animals
    getAnimals() {
        return this.getAll('animals');
    }

    getAnimal(id) {
        return this.getById('animals', id);
    }

    addAnimal(animal) {
        const result = this.add('animals', animal);
        this.addActivity('Animal Added', `Added animal: ${animal.name}`);
        return result;
    }

    updateAnimal(animal) {
        const result = this.update('animals', animal);
        this.addActivity('Animal Updated', `Updated animal: ${animal.name}`);
        return result;
    }

    deleteAnimal(id) {
        const animal = this.getAnimal(id);
        const result = this.delete('animals', id);
        if (animal) {
            this.addActivity('Animal Deleted', `Deleted animal: ${animal.name}`);
        }
        return result;
    }

    // Treatments
    getTreatments() {
        return this.getAll('treatments');
    }

    getTreatment(id) {
        return this.getById('treatments', id);
    }

    addTreatment(treatment) {
        const result = this.add('treatments', treatment);
        this.addActivity('Treatment Added', `Added treatment for animal ID: ${treatment.animalId}`);
        return result;
    }

    updateTreatment(treatment) {
        return this.update('treatments', treatment);
    }

    deleteTreatment(id) {
        return this.delete('treatments', id);
    }

    // Inventory
    getInventory() {
        return this.getAll('inventory');
    }

    getInventoryItem(id) {
        return this.getById('inventory', id);
    }

    addInventoryItem(item) {
        return this.add('inventory', item);
    }

    updateInventoryItem(item) {
        return this.update('inventory', item);
    }

    deleteInventoryItem(id) {
        return this.delete('inventory', id);
    }

    // Outcomes
    getOutcomes() {
        return this.getAll('outcomes');
    }

    addOutcome(outcome) {
        return this.add('outcomes', outcome);
    }

    // Expenses
    getExpenses() {
        return this.getAll('expenses');
    }

    addExpense(expense) {
        return this.add('expenses', expense);
    }

    // Documents
    getDocuments() {
        return this.getAll('documents');
    }

    addDocument(document) {
        return this.add('documents', document);
    }

    // Activities
    getActivities() {
        return this.getAll('activities').sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
    }

    addActivity(type, description) {
        const activity = {
            type,
            description,
            timestamp: new Date().toISOString(),
            user: window.app ? window.app.currentUser.name : 'System'
        };
        return this.add('activities', activity);
    }
}

// Initialize database
window.database = new Database();
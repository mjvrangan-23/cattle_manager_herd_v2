class AnimalsManager {
    constructor() {
        this.currentEditingId = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Add animal button
        document.getElementById('addAnimalBtn').addEventListener('click', () => {
            this.showAnimalModal();
        });

        // Animal form submission
        document.getElementById('animalForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAnimal();
        });

        // Cancel button
        document.getElementById('cancelAnimalBtn').addEventListener('click', () => {
            this.hideAnimalModal();
        });

        // Search and filters
        document.getElementById('animalSearch').addEventListener('input', () => {
            this.loadAnimals();
        });

        document.getElementById('speciesFilter').addEventListener('change', () => {
            this.loadAnimals();
        });

        document.getElementById('statusFilter').addEventListener('change', () => {
            this.loadAnimals();
        });
    }

    showAnimalModal(animalId = null) {
        const modal = document.getElementById('animalModal');
        const title = document.getElementById('animalModalTitle');
        
        if (animalId) {
            title.textContent = 'Edit Animal';
            this.currentEditingId = animalId;
            this.populateAnimalForm(animalId);
        } else {
            title.textContent = 'Add New Animal';
            this.currentEditingId = null;
            document.getElementById('animalForm').reset();
        }
        
        modal.style.display = 'block';
    }

    hideAnimalModal() {
        document.getElementById('animalModal').style.display = 'none';
        this.currentEditingId = null;
        document.getElementById('animalForm').reset();
    }

    populateAnimalForm(animalId) {
        const animal = window.database.getAnimal(animalId);
        if (!animal) return;

        document.getElementById('animalName').value = animal.name || '';
        document.getElementById('animalSpecies').value = animal.species || '';
        document.getElementById('animalBreed').value = animal.breed || '';
        document.getElementById('animalAge').value = animal.age || '';
        document.getElementById('animalSex').value = animal.sex || '';
        document.getElementById('animalColor').value = animal.colorMarkings || '';
        document.getElementById('intakeDate').value = animal.intakeDate || '';
        document.getElementById('intakeTime').value = animal.intakeTime || '';
        document.getElementById('intakeReason').value = animal.intakeReason || '';
        document.getElementById('conditionArrival').value = animal.conditionArrival || '';
    }

    saveAnimal() {
        const formData = new FormData(document.getElementById('animalForm'));
        
        const animalData = {
            name: formData.get('name'),
            species: formData.get('species'),
            breed: formData.get('breed'),
            age: parseFloat(formData.get('age')) || 0,
            sex: formData.get('sex'),
            colorMarkings: formData.get('colorMarkings'),
            intakeDate: formData.get('intakeDate'),
            intakeTime: formData.get('intakeTime'),
            intakeReason: formData.get('intakeReason'),
            conditionArrival: formData.get('conditionArrival'),
            status: 'Active',
            updatedAt: new Date().toISOString()
        };

        if (this.currentEditingId) {
            // Update existing animal
            animalData.id = this.currentEditingId;
            window.database.updateAnimal(animalData);
        } else {
            // Add new animal
            animalData.createdAt = new Date().toISOString();
            window.database.addAnimal(animalData);
        }

        this.hideAnimalModal();
        this.loadAnimals();
        window.app.loadDashboard(); // Refresh dashboard stats
    }

    loadAnimals() {
        const searchTerm = document.getElementById('animalSearch').value.toLowerCase();
        const speciesFilter = document.getElementById('speciesFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;

        let animals = window.database.getAnimals();

        // Apply filters
        if (searchTerm) {
            animals = animals.filter(animal => 
                animal.name.toLowerCase().includes(searchTerm) ||
                animal.breed.toLowerCase().includes(searchTerm) ||
                animal.colorMarkings.toLowerCase().includes(searchTerm)
            );
        }

        if (speciesFilter) {
            animals = animals.filter(animal => animal.species === speciesFilter);
        }

        if (statusFilter) {
            animals = animals.filter(animal => animal.status === statusFilter);
        }

        this.displayAnimals(animals);
    }

    displayAnimals(animals) {
        const container = document.getElementById('animalsList');
        
        if (animals.length === 0) {
            container.innerHTML = '<div class="no-data">No animals found</div>';
            return;
        }

        container.innerHTML = animals.map(animal => `
            <div class="data-item">
                <div class="data-item-info">
                    <h4>${animal.name} (${animal.species})</h4>
                    <p><strong>Breed:</strong> ${animal.breed || 'Unknown'}</p>
                    <p><strong>Age:</strong> ${animal.age || 'Unknown'} years</p>
                    <p><strong>Sex:</strong> ${animal.sex || 'Unknown'}</p>
                    <p><strong>Intake Date:</strong> ${animal.intakeDate}</p>
                    <p><strong>Status:</strong> <span class="status-${animal.status.toLowerCase()}">${animal.status}</span></p>
                </div>
                <div class="data-item-actions">
                    <button class="btn btn-primary" onclick="window.animalsManager.editAnimal(${animal.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-secondary" onclick="window.animalsManager.viewAnimal(${animal.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-danger" onclick="window.animalsManager.deleteAnimal(${animal.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    editAnimal(animalId) {
        this.showAnimalModal(animalId);
    }

    viewAnimal(animalId) {
        const animal = window.database.getAnimal(animalId);
        if (animal) {
            alert(`Animal Details:\n\nName: ${animal.name}\nSpecies: ${animal.species}\nBreed: ${animal.breed}\nAge: ${animal.age}\nSex: ${animal.sex}\nStatus: ${animal.status}`);
        }
    }

    deleteAnimal(animalId) {
        if (confirm('Are you sure you want to delete this animal?')) {
            window.database.deleteAnimal(animalId);
            this.loadAnimals();
            window.app.loadDashboard(); // Refresh dashboard stats
        }
    }
}

// Initialize animals manager
document.addEventListener('DOMContentLoaded', () => {
    window.animalsManager = new AnimalsManager();
});
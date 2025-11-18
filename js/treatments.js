class TreatmentsManager {
    constructor() {
        this.currentEditingId = null;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('addTreatmentBtn').addEventListener('click', () => {
            this.showTreatmentModal();
        });

        document.getElementById('treatmentForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveTreatment();
        });

        document.getElementById('cancelTreatmentBtn').addEventListener('click', () => {
            this.hideTreatmentModal();
        });
    }

    showTreatmentModal(treatmentId = null) {
        const modal = document.getElementById('treatmentModal');
        const title = document.getElementById('treatmentModalTitle');
        
        this.populateAnimalDropdown();
        this.populateMedicationDropdown();
        
        if (treatmentId) {
            title.textContent = 'Edit Treatment';
            this.currentEditingId = treatmentId;
            this.populateTreatmentForm(treatmentId);
        } else {
            title.textContent = 'Add Treatment Record';
            this.currentEditingId = null;
            document.getElementById('treatmentForm').reset();
            document.getElementById('treatmentDate').value = new Date().toISOString().split('T')[0];
        }
        
        modal.style.display = 'block';
    }

    hideTreatmentModal() {
        document.getElementById('treatmentModal').style.display = 'none';
        this.currentEditingId = null;
        document.getElementById('treatmentForm').reset();
    }

    populateAnimalDropdown() {
        const select = document.getElementById('treatmentAnimal');
        const animals = window.database.getAnimals().filter(a => a.status === 'Active');
        
        select.innerHTML = '<option value="">Select Animal</option>' +
            animals.map(animal => 
                `<option value="${animal.id}">${animal.name} (${animal.species})</option>`
            ).join('');
    }

    populateMedicationDropdown() {
        const select = document.getElementById('medicationPrescribed');
        const medications = window.database.getInventory().filter(item => 
            item.category === 'Medication' && item.quantity > 0
        );
        
        select.innerHTML = '<option value="">Select Medication</option>' +
            medications.map(med => 
                `<option value="${med.id}">${med.name} (Stock: ${med.quantity})</option>`
            ).join('');
    }

    populateTreatmentForm(treatmentId) {
        const treatment = window.database.getTreatment(treatmentId);
        if (!treatment) return;

        document.getElementById('treatmentAnimal').value = treatment.animalId || '';
        document.getElementById('treatmentDate').value = treatment.date || '';
        document.getElementById('treatmentTime').value = treatment.time || '';
        document.getElementById('diagnosedIssue').value = treatment.diagnosedIssue || '';
        document.getElementById('treatmentDescription').value = treatment.treatmentDescription || '';
        document.getElementById('medicationPrescribed').value = treatment.medicationId || '';
        document.getElementById('quantityUsed').value = treatment.quantityUsed || 1;
        document.getElementById('veterinarianName').value = treatment.veterinarianName || '';
        document.getElementById('veterinarianSignature').value = treatment.veterinarianSignature || '';
        document.getElementById('followUpInstructions').value = treatment.followUpInstructions || '';
    }

    saveTreatment() {
        const formData = new FormData(document.getElementById('treatmentForm'));
        
        const treatmentData = {
            animalId: parseInt(formData.get('animalId')),
            date: formData.get('date'),
            time: formData.get('time'),
            diagnosedIssue: formData.get('diagnosedIssue'),
            treatmentDescription: formData.get('treatmentDescription'),
            medicationId: formData.get('medicationId') ? parseInt(formData.get('medicationId')) : null,
            quantityUsed: parseInt(formData.get('quantityUsed')) || 0,
            veterinarianName: formData.get('veterinarianName'),
            veterinarianSignature: formData.get('veterinarianSignature'),
            followUpInstructions: formData.get('followUpInstructions'),
            completed: false,
            updatedAt: new Date().toISOString()
        };

        // Update inventory if medication is used
        if (treatmentData.medicationId && treatmentData.quantityUsed > 0) {
            this.updateInventory(treatmentData.medicationId, treatmentData.quantityUsed);
        }

        if (this.currentEditingId) {
            treatmentData.id = this.currentEditingId;
            window.database.updateTreatment(treatmentData);
        } else {
            treatmentData.createdAt = new Date().toISOString();
            window.database.addTreatment(treatmentData);
        }

        this.hideTreatmentModal();
        this.loadTreatments();
        window.app.loadDashboard(); // Refresh dashboard stats
    }

    updateInventory(medicationId, quantityUsed) {
        const medication = window.database.getInventoryItem(medicationId);
        if (medication) {
            medication.quantity = Math.max(0, medication.quantity - quantityUsed);
            window.database.updateInventoryItem(medication);
        }
    }

    loadTreatments() {
        const treatments = window.database.getTreatments();
        this.displayTreatments(treatments);
    }

    displayTreatments(treatments) {
        const container = document.getElementById('treatmentsList');
        const animals = window.database.getAnimals();
        
        if (treatments.length === 0) {
            container.innerHTML = '<div class="no-data">No treatments found</div>';
            return;
        }

        container.innerHTML = treatments.map(treatment => {
            const animal = animals.find(a => a.id === treatment.animalId);
            const animalName = animal ? animal.name : 'Unknown Animal';
            
            return `
                <div class="data-item">
                    <div class="data-item-info">
                        <h4>${animalName} - ${treatment.diagnosedIssue}</h4>
                        <p><strong>Date:</strong> ${treatment.date} ${treatment.time || ''}</p>
                        <p><strong>Treatment:</strong> ${treatment.treatmentDescription}</p>
                        <p><strong>Veterinarian:</strong> ${treatment.veterinarianName}</p>
                        <p><strong>Status:</strong> ${treatment.completed ? 'Completed' : 'Active'}</p>
                    </div>
                    <div class="data-item-actions">
                        <button class="btn btn-primary" onclick="window.treatmentsManager.editTreatment(${treatment.id})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-secondary" onclick="window.treatmentsManager.viewTreatment(${treatment.id})">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-danger" onclick="window.treatmentsManager.deleteTreatment(${treatment.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    editTreatment(treatmentId) {
        this.showTreatmentModal(treatmentId);
    }

    viewTreatment(treatmentId) {
        const treatment = window.database.getTreatment(treatmentId);
        const animal = window.database.getAnimal(treatment.animalId);
        
        if (treatment) {
            alert(`Treatment Details:\n\nAnimal: ${animal ? animal.name : 'Unknown'}\nIssue: ${treatment.diagnosedIssue}\nTreatment: ${treatment.treatmentDescription}\nVeterinarian: ${treatment.veterinarianName}\nDate: ${treatment.date}`);
        }
    }

    deleteTreatment(treatmentId) {
        if (confirm('Are you sure you want to delete this treatment record?')) {
            window.database.deleteTreatment(treatmentId);
            this.loadTreatments();
            window.app.loadDashboard();
        }
    }
}

// Initialize treatments manager
document.addEventListener('DOMContentLoaded', () => {
    window.treatmentsManager = new TreatmentsManager();
});
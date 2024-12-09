document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    const tesinaForm = document.getElementById('tesina-form');
    const savedTesinasTable = document.getElementById('saved-tesinas');
    const searchInput = document.getElementById('search-input');
    const searchType = document.getElementById('search-type');
    const yearSelect = document.getElementById('year');

    // Populate year dropdown
    const currentYear = new Date().getFullYear();
    for (let year = 2010; year <= currentYear; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    async function loadTesinas() {
        try {
            const response = await fetch('http://localhost:5000/tesinas', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch tesinas');
            }
            const tesinas = await response.json();
            displayTesinas(tesinas);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar las tesinas');
        }
    }

    function displayTesinas(tesinas) {
        savedTesinasTable.innerHTML = '';
        tesinas.forEach(tesina => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td data-label="Autores">${tesina.nombreAutor}</td>
                <td data-label="Tesina">${tesina.nombreTesina}</td>
                <td data-label="Año">${tesina.año}</td>
                <td data-label="Carrera">${tesina.carrera}</td>
                <td data-label="Tipo">${tesina.tipo}</td>
                <td data-label="Acciones">
                    <button onclick="deleteTesina('${tesina._id}')" class="delete-btn">Eliminar</button>
                </td>
            `;
            savedTesinasTable.appendChild(row);
        });
    }

    tesinaForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const tesinaData = {
            nombreAutor: document.getElementById('authors').value,
            nombreTesina: document.getElementById('tesina-name').value,
            año: parseInt(document.getElementById('year').value),
            carrera: document.getElementById('carrera').value,
            tipo: document.getElementById('tipo').value
        };

        try {
            const response = await fetch('http://localhost:5000/tesinas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(tesinaData)
            });

            if (!response.ok) {
                throw new Error('Failed to add tesina');
            }

            tesinaForm.reset();
            loadTesinas();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar la tesina');
        }
    });

    function handleSearch() {
        const searchValue = searchInput.value.toLowerCase();
        const searchField = searchType.value;
        
        const rows = savedTesinasTable.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const cells = row.getElementsByTagName('td');
            if (cells.length) {
                let found = false;
                switch(searchField) {
                    case 'nombreAutor':
                        found = cells[0].textContent.toLowerCase().includes(searchValue);
                        break;
                    case 'nombreTesina':
                        found = cells[1].textContent.toLowerCase().includes(searchValue);
                        break;
                    case 'año':
                        found = cells[2].textContent.toLowerCase().includes(searchValue);
                        break;
                    case 'carrera':
                        found = cells[3].textContent.toLowerCase().includes(searchValue);
                        break;
                }
                row.style.display = found ? '' : 'none';
            }
        });
    }

    window.deleteTesina = async (id) => {
        if (confirm('¿Está seguro de eliminar esta tesina?')) {
            try {
                const response = await fetch(`http://localhost:5000/tesinas/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete tesina');
                }

                loadTesinas();
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar la tesina');
            }
        }
    };

    searchInput.addEventListener('input', handleSearch);
    searchType.addEventListener('change', handleSearch);

    loadTesinas();
});
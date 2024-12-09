document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    const projectForm = document.getElementById('project-form');
    const savedProjectsTable = document.getElementById('saved-projects');
    const searchInput = document.getElementById('search-input');
    const searchType = document.getElementById('search-type');

    async function loadProjects() {
        try {
            const response = await fetch('http://localhost:5000/proyectos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            const projects = await response.json();
            displayProjects(projects);
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar los proyectos');
        }
    }

    function displayProjects(projects) {
        savedProjectsTable.innerHTML = '';
        projects.forEach(project => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${project.nombreAutor}</td>
                <td>${project.nombreProyecto}</td>
                <td>${project.año}</td>
                <td>${project.carrera}</td>
                <td>${project.tipo}</td>
                <td>
                    <button onclick="deleteProject('${project._id}')" class="delete-btn">Eliminar</button>
                </td>
            `;
            savedProjectsTable.appendChild(row);
        });
    }

    projectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const projectData = {
            nombreAutor: document.getElementById('authors').value,
            nombreProyecto: document.getElementById('project-name').value,
            año: parseInt(document.getElementById('year').value),
            carrera: document.getElementById('race').value,
            tipo: 'Proyecto'
        };

        try {
            const response = await fetch('http://localhost:5000/proyectos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(projectData)
            });

            if (!response.ok) {
                throw new Error('Failed to add project');
            }

            projectForm.reset();
            loadProjects();
        } catch (error) {
            console.error('Error:', error);
            alert('Error al agregar el proyecto');
        }
    });

    function handleSearch() {
        const searchValue = searchInput.value.toLowerCase();
        const searchField = searchType.value;
        
        const rows = savedProjectsTable.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            const cells = row.getElementsByTagName('td');
            if (cells.length) {
                let found = false;
                switch(searchField) {
                    case 'authors':
                        found = cells[0].textContent.toLowerCase().includes(searchValue);
                        break;
                    case 'projectName':
                        found = cells[1].textContent.toLowerCase().includes(searchValue);
                        break;
                    case 'year':
                        found = cells[2].textContent.toLowerCase().includes(searchValue);
                        break;
                    case 'race':
                        found = cells[3].textContent.toLowerCase().includes(searchValue);
                        break;
                    case 'type':
                        found = cells[4].textContent.toLowerCase().includes(searchValue);
                        break;
                }
                row.style.display = found ? '' : 'none';
            }
        });
    }

    window.deleteProject = async (id) => {
        if (confirm('¿Está seguro de eliminar este proyecto?')) {
            try {
                const response = await fetch(`http://localhost:5000/proyectos/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete project');
                }

                loadProjects();
            } catch (error) {
                console.error('Error:', error);
                alert('Error al eliminar el proyecto');
            }
        }
    };

    searchInput.addEventListener('input', handleSearch);
    searchType.addEventListener('change', handleSearch);

    loadProjects();
});
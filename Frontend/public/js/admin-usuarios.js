
        const API_BASE_URL = "http://localhost:3000/api/admin/usuarios";
        const token = localStorage.getItem('adminToken');
        const usuariosTableBody = document.getElementById('usuariosTableBody');
        const editUserModal = document.getElementById('editUserModal');
        const editUserForm = document.getElementById('editUserForm');
        const closeEditModal = document.getElementById('closeEditModal');
        const editMessage = document.getElementById('editMessage');

        // 1. 🛡️ Proteção de Rota Frontend
        if (!token) {
            window.location.href = 'index.html';
        }
        
        // 2. Função de Logout
        document.getElementById('logoutAdmin').addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            window.location.href = 'index.html';
        });

        // 3. 📄 Função de Busca (READ)
        async function fetchUsuarios() {
            try {
                const response = await fetch(API_BASE_URL, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                         localStorage.removeItem('adminToken');
                         alert("Sessão expirada. Faça login novamente.");
                         window.location.href = 'index.html';
                    }
                    throw new Error('Falha ao buscar usuários');
                }

                const usuarios = await response.json();
                renderTable(usuarios);

            } catch (error) {
                usuariosTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-red-400">Erro ao carregar lista de usuários. Verifique o servidor.</td></tr>`;
                console.error('Erro ao buscar usuários:', error);
            }
        }

        // 4. Renderiza a Tabela (Chamando handleEdit)
        function renderTable(usuarios) {
            if (usuarios.length === 0) {
                usuariosTableBody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-gray-400">Nenhum usuário cadastrado.</td></tr>`;
                return;
            }

            usuariosTableBody.innerHTML = usuarios.map(usuario => {
                const isAdmin = usuario.is_admin ? '<span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-800 text-red-300">ADMIN</span>' : 'Comum';
                const createdAt = new Date(usuario.createdAt).toLocaleDateString('pt-BR');
                
                return `
                    <tr class="hover:bg-gray-700">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">${usuario.id}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-white">${usuario.nome}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${usuario.email}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm">${isAdmin}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${createdAt}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onclick="handleEdit(${usuario.id})" class="text-indigo-400 hover:text-indigo-600 mr-2">Editar</button>
                            <button onclick="handleDelete(${usuario.id})" class="text-red-400 hover:text-red-600">Excluir</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        // 5. ❌ Função de Exclusão (DELETE) - Mantida
        async function handleDelete(id) {
            if (!confirm(`Tem certeza que deseja excluir o usuário ID ${id}? Esta ação é irreversível.`)) return;

            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    alert(`Usuário ID ${id} excluído com sucesso!`);
                    fetchUsuarios(); 
                } else {
                    const data = await response.json();
                    alert(`Erro ao excluir: ${data.erro || 'Erro desconhecido.'}`);
                    if (response.status === 401 || response.status === 403) {
                         localStorage.removeItem('adminToken');
                         window.location.href = 'index.html';
                    }
                }
            } catch (error) {
                alert('Erro de conexão com o servidor ao tentar excluir.');
            }
        }

        // 6. ✏️ Funções de Edição (PUT) - NOVO
        closeEditModal.addEventListener('click', () => {
            editUserModal.style.display = 'none';
        });

        // Função para carregar dados no modal
        async function handleEdit(id) {
            editMessage.classList.add('hidden');
            editUserModal.style.display = 'flex';
            document.getElementById('editUserIdDisplay').textContent = `(#${id})`;
            document.getElementById('editUserId').value = id;
            
            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const usuario = await response.json();
                    document.getElementById('editNome').value = usuario.nome;
                    document.getElementById('editEmail').value = usuario.email;
                    document.getElementById('editIsAdmin').checked = usuario.is_admin;
                } else {
                    const data = await response.json();
                    editMessage.textContent = data.erro || "Erro ao carregar dados do usuário.";
                    editMessage.classList.remove('hidden');
                }
            } catch (error) {
                editMessage.textContent = 'Erro de conexão ao buscar dados.';
                editMessage.classList.remove('hidden');
            }
        }

        // Função para enviar os dados atualizados
        editUserForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            editMessage.classList.add('hidden');

            const id = document.getElementById('editUserId').value;
            const nome = document.getElementById('editNome').value;
            const email = document.getElementById('editEmail').value;
            const isAdmin = document.getElementById('editIsAdmin').checked;
            
            const payload = { nome, email, is_admin: isAdmin };

            try {
                const response = await fetch(`${API_BASE_URL}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert(`Usuário ID ${id} atualizado com sucesso!`);
                    editUserModal.style.display = 'none';
                    fetchUsuarios(); // Recarrega a lista
                } else {
                    const data = await response.json();
                    editMessage.textContent = data.erro || 'Erro ao salvar alterações.';
                    editMessage.classList.remove('hidden');
                }
            } catch (error) {
                editMessage.textContent = 'Erro de conexão ao tentar salvar.';
                editMessage.classList.remove('hidden');
            }
        });

        // Inicia o carregamento dos dados ao abrir a página
        fetchUsuarios();
    
const API_BASE_URL = "http://localhost:3000/api/admin";
        const token = localStorage.getItem('adminToken');
        const adminNomeSpan = document.getElementById('adminNome');
        const metricsContainer = document.getElementById('metricsContainer');
        const loadingMessage = document.getElementById('loadingMessage');
        const errorMessage = document.getElementById('errorMessage');

        // 1. 🛡️ Proteção de Rota
        if (!token) {
            // Se não houver token, força o redirecionamento para o login
            window.location.href = 'index.html'; // Voltando para a página inicial que tem o modal
        } else {
            // Carrega o nome do admin e inicia o fetch de dados
            const adminUser = JSON.parse(localStorage.getItem('adminUser'));
            if (adminUser && adminUser.nome) {
                adminNomeSpan.textContent = adminUser.nome;
            }

            // 2. 🚪 Função de Logout
            document.getElementById('logoutAdmin').addEventListener('click', () => {
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminUser');
                window.location.href = 'index.html'; // Volta para a página inicial (login modal)
            });

            // 3. 📊 Carregar Métricas do Dashboard
            async function fetchMetrics() {
                try {
                    const response = await fetch(`${API_BASE_URL}/dashboard-metrics`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}` // Envia o token para o backend
                        }
                    });

                    loadingMessage.classList.add('hidden');

                    if (response.ok) {
                        const data = await response.json();
                        
                        // Atualiza as métricas na tela
                        document.getElementById('totalUsuarios').textContent = data.totalUsuarios || 'N/A';
                        document.getElementById('totalFilmes').textContent = data.totalFilmes || 'N/A';
                        document.getElementById('ultimoLogin').textContent = data.ultimoLogin ? new Date(data.ultimoLogin).toLocaleDateString('pt-BR') : 'Hoje';

                        metricsContainer.classList.remove('hidden');

                    } else if (response.status === 401 || response.status === 403) {
                        // Se o token for inválido/expirado, força o logout
                        localStorage.removeItem('adminToken');
                        localStorage.removeItem('adminUser');
                        alert("Sua sessão expirou. Faça login novamente.");
                        window.location.href = 'index.html';

                    } else {
                        const errorData = await response.json();
                        errorMessage.textContent = `Erro ao carregar dados: ${errorData.erro || response.statusText}`;
                        errorMessage.classList.remove('hidden');
                    }
                } catch (error) {
                    loadingMessage.classList.add('hidden');
                    errorMessage.textContent = 'Erro de conexão com o servidor. Verifique se o backend está rodando.';
                    errorMessage.classList.remove('hidden');
                    console.error('Erro ao buscar métricas:', error);
                }
            }

            fetchMetrics();
        }
    
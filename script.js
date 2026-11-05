
// =========================================================
// 1. CONECTANDO O JAVASCRIPT AOS ELEMENTOS DO HTML
// =========================================================

// Formulário e campos das tarefas
const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const taskDescription = document.getElementById("taskDescription");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");

// Lista, pesquisa e filtros
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");
const priorityFilter = document.getElementById("priorityFilter");

// Contadores das tarefas
const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");
const visibleCount = document.getElementById("visibleCount");

// Elementos usados na edição
const saveButton = document.getElementById("saveButton");
const cancelEdit = document.getElementById("cancelEdit");
const formHeading = document.getElementById("formHeading");
const formMessage = document.getElementById("formMessage");

// Data atual
const todayDate = document.getElementById("todayDate");

// Elementos do botão de tema
const themeToggle = document.getElementById("themeToggle");
const themeLabel = document.getElementById("themeLabel");
const themeIcon = document.getElementById("themeIcon");
const themeColor = document.getElementById("themeColor");


// =========================================================
// 2. VARIÁVEIS PRINCIPAIS DO SISTEMA
// =========================================================

// Recupera as tarefas salvas no navegador
let tasks = JSON.parse(
    localStorage.getItem("estodolist_tasks") || "[]"
);

// Guarda o ID da tarefa que está sendo editada
let editingId = null;

// Define a lista que será exibida
let currentView = "all";


// =========================================================
// 3. MOSTRAR A DATA ATUAL
// =========================================================

// Exibe a data atual no formato brasileiro
todayDate.textContent = new Date().toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric"
});


// =========================================================
// 4. MODO CLARO E MODO ESCURO
// =========================================================

// Aplica o tema escolhido e atualiza o botão
function applyTheme(theme) {

    // Verifica se o tema escolhido é o claro
    const isLight = theme === "light";

    // Adiciona ou remove a classe que muda as cores do site
    document.body.classList.toggle("light-mode", isLight);

    // Atualiza o texto do botão
    themeLabel.textContent = isLight
        ? "Ativar modo escuro"
        : "Ativar modo claro";

    // Atualiza o ícone do botão
    themeIcon.textContent = isLight ? "☾" : "☀";

    // Atualiza a descrição acessível do botão
    themeToggle.setAttribute(
        "aria-label",
        isLight ? "Ativar modo escuro" : "Ativar modo claro"
    );

    // Informa se o modo claro está ativado
    themeToggle.setAttribute(
        "aria-pressed",
        String(isLight)
    );

    // Atualiza a cor da barra do navegador
    themeColor.setAttribute(
        "content",
        isLight ? "#f5f7fb" : "#141414"
    );

    // Salva o tema escolhido no navegador
    localStorage.setItem("estodolist_theme", theme);
}


// Recupera o tema salvo.
// Se ainda não houver escolha, utiliza o modo escuro.
const savedTheme = localStorage.getItem("estodolist_theme") || "dark";

// Aplica o tema assim que o site é carregado
applyTheme(savedTheme);

// Alterna entre os temas quando o botão é clicado
themeToggle.addEventListener("click", () => {

    // Verifica qual tema está ativo no momento
    const isLight = document.body.classList.contains("light-mode");

    // Ativa o tema oposto
    applyTheme(isLight ? "dark" : "light");

});


// =========================================================
// 5. FUNÇÃO saveTasks()
// =========================================================

// Salva as tarefas no armazenamento do navegador
function saveTasks() {
    localStorage.setItem(
        "estodolist_tasks",
        JSON.stringify(tasks)
    );
}


// =========================================================
// 6. FUNÇÃO showMessage()
// =========================================================

// Mostra uma mensagem e apaga depois de 3 segundos
function showMessage(message) {
    formMessage.textContent = message;

    setTimeout(() => {
        formMessage.textContent = "";
    }, 3000);
}


// =========================================================
// 7. FUNÇÃO escapeHTML()
// =========================================================

// Converte caracteres especiais para texto seguro
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


// =========================================================
// 8. FUNÇÃO formatDate()
// =========================================================

// Converte a data para o formato DD/MM/AAAA
function formatDate(date) {
    if (!date) return "Sem prazo";

    const parts = date.split("-");

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}


// =========================================================
// 9. FUNÇÃO updateCounters()
// =========================================================

// Atualiza os números dos cartões de resumo
function updateCounters() {

    // Quantidade total de tarefas
    totalCount.textContent = tasks.length;

    // Quantidade de tarefas pendentes
    pendingCount.textContent = tasks.filter(
        task => !task.completed
    ).length;

    // Quantidade de tarefas concluídas
    completedCount.textContent = tasks.filter(
        task => task.completed
    ).length;
}


// =========================================================
// 10. FUNÇÃO renderTasks()
// =========================================================

// Mostra as tarefas na tela e aplica os filtros
function renderTasks() {

    // Atualiza os contadores
    updateCounters();

    // Texto digitado na pesquisa
    const search = searchInput.value.trim().toLowerCase();

    // Prioridade selecionada
    const priority = priorityFilter.value;

    // Seleciona as tarefas que atendem aos filtros
    const filteredTasks = tasks.filter(task => {

        // Confere a lista escolhida no menu
        const matchesView =
            currentView === "all" ||
            (currentView === "pending" && !task.completed) ||
            (currentView === "completed" && task.completed);

        // Pesquisa pelo nome ou pela descrição
        const matchesSearch =
            task.name.toLowerCase().includes(search) ||
            (task.description || "").toLowerCase().includes(search);

        // Confere a prioridade selecionada
        const matchesPriority =
            priority === "all" || task.priority === priority;

        // A tarefa precisa atender a todos os filtros
        return matchesView && matchesSearch && matchesPriority;
    });

    // Limpa a lista antes de criar os cartões novamente
    taskList.innerHTML = "";

    // Mostra a mensagem quando não há resultados
    emptyState.style.display = filteredTasks.length
        ? "none"
        : "block";

    // Atualiza a quantidade de tarefas visíveis
    visibleCount.textContent =
        `${filteredTasks.length} ${
            filteredTasks.length === 1 ? "tarefa" : "tarefas"
        }`;

    // Cria um cartão para cada tarefa filtrada
    filteredTasks.forEach(task => {

        const card = document.createElement("article");

        // Adiciona a classe done quando a tarefa está concluída
        card.className = `task-card ${task.completed ? "done" : ""}`;

        // Remove acentos da prioridade para usar no CSS
        // Exemplo: "Média" vira "media"
        const priorityClass = task.priority
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // Monta o conteúdo do cartão
        card.innerHTML = `
            <div class="task-top">

                <input
                    class="task-check"
                    type="checkbox"
                    aria-label="Concluir tarefa"
                    ${task.completed ? "checked" : ""}
                >

                <div class="task-content">

                    <h3 class="task-title">
                        ${escapeHTML(task.name)}
                    </h3>

                    ${task.description
                        ? `<p class="task-description">${escapeHTML(task.description)}</p>`
                        : ""}

                    <div class="task-meta">

                        <span>📅 ${formatDate(task.date)}</span>

                        <span class="priority ${priorityClass}">
                            ${escapeHTML(task.priority)}
                        </span>

                        <span>
                            ${task.completed ? "Concluída" : "Pendente"}
                        </span>

                    </div>

                </div>

            </div>

            <div class="task-actions">

                <button type="button" data-action="edit">
                    Editar
                </button>

                <button type="button" data-action="toggle">
                    ${task.completed ? "Reabrir" : "Concluir"}
                </button>

                <button
                    type="button"
                    class="delete-button"
                    data-action="delete"
                >
                    Excluir
                </button>

            </div>
        `;

        // Permite concluir ou reabrir a tarefa pela caixa de seleção
        card.querySelector(".task-check").addEventListener(
            "change",
            () => toggleTask(task.id)
        );

        // Adiciona ações aos botões do cartão
        card.querySelectorAll("[data-action]").forEach(button => {

            button.addEventListener("click", () => {

                const action = button.dataset.action;

                if (action === "edit") editTask(task.id);

                if (action === "toggle") toggleTask(task.id);

                if (action === "delete") deleteTask(task.id);

            });

        });

        // Coloca o cartão dentro da lista
        taskList.appendChild(card);

    });

}


// =========================================================
// 11. CADASTRAR E ATUALIZAR TAREFAS
// =========================================================

// Executa quando o formulário é enviado
taskForm.addEventListener("submit", event => {

    // Impede que a página seja recarregada
    event.preventDefault();

    // Lê o nome digitado
    const name = taskName.value.trim();

    // Confere se o nome foi preenchido
    if (!name) {
        showMessage("Digite o nome da tarefa.");
        taskName.focus();
        return;
    }

    // Se estiver editando, atualiza a tarefa existente
    if (editingId !== null) {

        const task = tasks.find(item => item.id === editingId);

        if (task) {
            task.name = name;
            task.description = taskDescription.value.trim();
            task.date = taskDate.value;
            task.priority = taskPriority.value;
        }

        showMessage("Tarefa atualizada com sucesso!");

    } else {

        // Cria uma nova tarefa e coloca no início da lista
        tasks.unshift({
            id: Date.now(),
            name,
            description: taskDescription.value.trim(),
            date: taskDate.value,
            priority: taskPriority.value,
            completed: false
        });

        showMessage("Tarefa adicionada com sucesso!");

    }

    // Salva as alterações, limpa o formulário e atualiza a tela
    saveTasks();
    resetForm();
    renderTasks();

});


// =========================================================
// 12. FUNÇÃO editTask()
// =========================================================

// Preenche o formulário com os dados da tarefa escolhida
function editTask(id) {

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    // Guarda o ID da tarefa em edição
    editingId = id;

    // Preenche os campos
    taskName.value = task.name;
    taskDescription.value = task.description;
    taskDate.value = task.date;
    taskPriority.value = task.priority;

    // Atualiza os textos e mostra o botão de cancelar
    formHeading.textContent = "Editar tarefa";
    saveButton.textContent = "Salvar alterações";
    cancelEdit.classList.remove("hidden");

    // Leva o usuário até o formulário
    document.querySelector(".form-panel").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    taskName.focus();

}


// =========================================================
// 13. FUNÇÃO resetForm()
// =========================================================

// Limpa o formulário e encerra a edição
function resetForm() {

    taskForm.reset();

    editingId = null;

    formHeading.textContent = "Adicionar tarefa";
    saveButton.textContent = "＋ Adicionar tarefa";

    cancelEdit.classList.add("hidden");

}


// =========================================================
// 14. CANCELAR A EDIÇÃO
// =========================================================

// Limpa o formulário ao clicar em cancelar
cancelEdit.addEventListener("click", resetForm);


// =========================================================
// 15. FUNÇÃO toggleTask()
// =========================================================

// Alterna a tarefa entre pendente e concluída
function toggleTask(id) {

    const task = tasks.find(item => item.id === id);

    if (!task) return;

    // Inverte a situação da tarefa
    task.completed = !task.completed;

    saveTasks();
    renderTasks();

}


// =========================================================
// 16. FUNÇÃO deleteTask()
// =========================================================

// Exclui uma tarefa depois de pedir confirmação
function deleteTask(id) {

    const confirmed = confirm(
        "Deseja realmente excluir esta tarefa?"
    );

    if (!confirmed) return;

    // Cria uma lista sem a tarefa escolhida
    tasks = tasks.filter(task => task.id !== id);

    // Limpa o formulário se a tarefa excluída estava em edição
    if (editingId === id) resetForm();

    saveTasks();
    renderTasks();

}


// =========================================================
// 17. NAVEGAÇÃO ENTRE AS LISTAS
// =========================================================

// Adiciona funcionamento aos botões do menu
document.querySelectorAll(".nav-item").forEach(button => {

    button.addEventListener("click", () => {

        // Guarda a lista selecionada
        currentView = button.dataset.view;

        // Remove o destaque dos outros botões
        document.querySelectorAll(".nav-item").forEach(item => {
            item.classList.remove("active");
        });

        // Destaca o botão clicado
        button.classList.add("active");

        // Descrições para cada lista
        const subtitles = {
            all: "Veja tudo o que precisa fazer.",
            pending: "Estas tarefas ainda precisam ser feitas.",
            completed: "Confira suas tarefas concluídas."
        };

        // Atualiza a descrição da lista
        document.getElementById("listSubtitle").textContent =
            subtitles[currentView];

        // Atualiza as tarefas exibidas
        renderTasks();

    });

});


// =========================================================
// 18. ATUALIZAÇÃO DOS FILTROS
// =========================================================

// Atualiza a lista quando o usuário pesquisa
searchInput.addEventListener("input", renderTasks);

// Atualiza a lista quando a prioridade muda
priorityFilter.addEventListener("change", renderTasks);


// =========================================================
// 19. INICIALIZAÇÃO DO SISTEMA
// =========================================================

// Mostra as tarefas salvas ao abrir a página
renderTasks();

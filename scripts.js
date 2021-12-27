const Modal = {

    /**
     * Abrir a modal
     */
    open() {
        document.querySelector('.modal-overlay')
            .classList.add('active');
    },

    /**
     * Fechar a Modal
     */
    close() {
        document.querySelector('.modal-overlay')
            .classList.remove('active');
    }
}

const Storage = {

    /**
    * Recuperando as transações armazenadas no localStorage do navegador
    * e transformando-a em um array novamente ou retornando um array vazio.
    *
     * @return array
     */
    get() {
        return JSON.parse(localStorage.getItem("app.finances.transactions"))
            || []
    },

    /**
     * Setando as transações no localStorage do navegador.
     * Lembrando que é necessário transformá-la em string antes.
     * 
     * @param {*} transactions 
     */
    set(transactions) {
        localStorage.setItem(
            "app.finances.transactions",
            JSON.stringify(transactions)
        )
    }
}

const Transaction = {

    all: Storage.get(),

    /**
     * Adiciona um novo objeto de transação no array.
     * 
     * @param {*} transaction 
     */
    add(transaction) {
        this.all.push(transaction)
        App.reload()
    },

    /**
     * remove um objeto de transação do array.
     * 
     * @param {*} index 
     */
    remove(index) {
        this.all.splice(index, 1)
        App.reload()
    },

    /**
     * Método para somar as entradas
     * 
     * @return number
     */
    incomes() {
        let income = 0
        this.all.forEach((transaction) => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })

        return income
    },

    /**
     * Método para somar as saídas.
     * 
     * @return number
     */
    expenses() {
        let expense = 0
        this.all.forEach((transaction) => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        return expense
    },

    /**
     * Entradas - Saídas
     * Nesse caso esta sendo somado porque o expense é negativo.
     * 
     * @return number
     */
    total() {

        return this.incomes() + this.expenses()
    }
}

const DOM = {

    transactionsBodyTableHTML: document.querySelector('#data-table tbody'),

    /**
     * Monta o html com dados da transação.
     * 
     * @param {*} transaction 
     * @return html
     */
    innerHTMLTransaction(transaction, index) {
        const classCSS = transaction.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transaction.amount)
        const html = `
            
            <td class="description">${transaction.description}</td>
            <td class="${classCSS}"> ${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="././assets/minus.svg" alt="Remover Transação">
            </td>
        `
        return html
    },

    /**
     * Adiciona uma transação ao método innerHTMLTransaction()
     * para que seja montado o html com os dados atualizados na tela.
     * 
     * @param {*} transaction 
     * @param {*} index 
     */
    addTransaction(transaction, index) {

        const tr = document.createElement('tr')
        tr.innerHTML = this.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        this.transactionsBodyTableHTML.appendChild(tr)
    },


    /**
     * Atualiza os dados dos cards de entradas, saídas e total para cada
     * ação que for realizada nas transações.
     */
    updateBalance() {
        document
            .getElementById("display-income")
            .innerHTML = Utils.formatCurrency(Transaction.incomes())

        document
            .getElementById("display-expense")
            .innerHTML = Utils.formatCurrency(Transaction.expenses())

        document
            .getElementById("display-total")
            .innerHTML = Utils.formatCurrency(Transaction.total())

    },

    /**
     * Limpa os dados da tabela de transações.
     */
    clearTransactions() {
        this.transactionsBodyTableHTML.innerHTML = ""
    }
}

const Utils = {

    /**
     * Formata o valor de amount de acordo com o padrão que o mesmo
     * deve permanecer quando for salvo.
     * 
     * @param {*} value 
     * @return number
     */
    formatAmount(value) {
        // retirando virgula e ponto com regex antes de transformar em número.
        return Number(value.replace(/\,\./g, "")) * 100
    },

    /**
     * Formata a data informada no formulário para o padrão dd/mm/AAAA.
     * 
     * @param {*} date 
     * @return String
     */
    formatDate(date) {
        const dateSplit = date.split("-")

        let year = dateSplit[0]
        let month = dateSplit[1]
        let day = dateSplit[2]

        return `${day}/${month}/${year}`
    },

    /**
     * Formata o valor de amount para um padrão de moeda brasileira
     * colocando o valor como negativo caso o mesmo seja um valor de
     * saída.
     * 
     * @param {*} value 
     * @return String
     */
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "- " : ""

        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })
        return signal + value
    }
}

const Form = {

    /**
     * Capturando todos os elementos html do formulário.
     */
    elementDescription: document.querySelector("input#description"),
    elementAmount: document.querySelector("input#amount"),
    elementDate: document.querySelector("input#date"),

    /**
     * Capturando os valores do elemento html dos inputs do formulário
     * e os transformando em propriedades de um objeto.
     * 
     * @return Object
     */
    getValues() {
        return {
            description: this.elementDescription.value,
            amount: this.elementAmount.value,
            date: this.elementDate.value,
        }
    },

    /**
     * Verificando se todos os campos do formulário foram preenchidos.
     * Caso não tenham sido preenchidos é retornado uma exceção com uma mesnagem de erro.
     * Cao contrário, é retornado um objeto com os dados informados no formulário.
     * 
     * @return Error | Object
     */
    validateFields() {
        const { description, amount, date } = this.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!")
        }

        return { description, amount, date }
    },

    /**
     * Método que invoca os demais métodos responsáveis pela
     * formatação de cada campo vindo do formulário de cadastro.
     * 
     * @param {*} fields 
     * @return Object
     */
    formatFields(fields) {
        let { description, amount, date } = fields

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return { description, amount, date }
    },

    /**
     * Limpar os dados do formulário após a inserção dos dados.
     */
    clearFields() {
        this.elementDescription.value = ""
        this.elementAmount.value = ""
        this.elementDate.value = ""
    },

    /**
     * Captura de dados do formulário de cadastro para serem tratados.
     * 
     * @param {*} event 
     */
    submit(event) {
        event.preventDefault()

        try {
            let fields = this.validateFields()
            transaction = this.formatFields(fields)
            Transaction.add(transaction)
            this.clearFields()
            Modal.close()
        } catch (error) {
            alert(error.message)
        }
    }
}

App = {

    /**
     * Método que inicia a aplicação
     */
    init() {
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        Storage.set(Transaction.all)
        DOM.updateBalance()
    },

    /**
     * Método que limpa os dados da tabela de transações e reinicia a aplicação com dados
     * atualizados.
     */
    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()

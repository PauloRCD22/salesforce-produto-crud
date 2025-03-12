import { LightningElement, track, wire } from 'lwc';
import getProdutos from '@salesforce/apex/ProdutoController.getProdutos';
import createProduto from '@salesforce/apex/ProdutoController.createProduto';
import deleteProduto from '@salesforce/apex/ProdutoController.deleteProduto';
import updateProduto from '@salesforce/apex/ProdutoController.updateProduto';
import { refreshApex } from '@salesforce/apex';

export default class ProdutoCrud extends LightningElement {
    @track produtos;
    nome = '';
    preco = '';
    estoque = '';
    produtoId;

    erroPreco = '';
    erroEstoque = '';
    erroNome = '';

    columns = [
        { label: 'Nome', fieldName: 'Nome__c' },
        { label: 'Preço', fieldName: 'Preco__c', type: 'currency' },
        { label: 'Estoque', fieldName: 'Estoque__c', type: 'number' },
        { 
            type: 'button', 
            typeAttributes: { 
                label: 'Excluir', 
                name: 'delete',
                iconName: 'utility:delete',
                variant: 'destructive',
                data: { id: {fieldName: 'Id'} }
            }
        },
        { 
            type: 'button', 
            typeAttributes: { 
                label: 'Editar', 
                name: 'edit',
                iconName: 'utility:edit',
                variant: 'base',
                data: { id: {fieldName: 'Id'} }
            }
        }
    ];

    // Busca os produtos do Salesforce
    @wire(getProdutos)
    wiredProdutos({ data, error }) {
        if (data) {
            this.produtos = data;
        } else if (error) {
            console.error('Erro ao buscar produtos:', error);
        }
    }

    // Atualiza valores do formulário
    handleNomeChange(event) {
        this.nome = event.target.value;
        this.erroNome = this.nome ? '' : 'Nome do produto é obrigatório';
    }

    handlePrecoChange(event) {
        let precoString = event.target.value;
        
        // Limpa caracteres não numéricos, permitindo apenas números, vírgulas e pontos
        precoString = precoString.replace(/[^0-9.,]/g, '');
        
        // Atualiza o valor do preco
        this.preco = precoString;

        // Valida o preço
        if (!this.preco || isNaN(this.preco.replace(',', '.'))) {
            this.erroPreco = 'Preço inválido';
        } else {
            this.erroPreco = '';
        }
    }

    handleEstoqueChange(event) {
        this.estoque = event.target.value;

        // Valida se o estoque é um número válido e maior ou igual a zero
        if (!this.estoque || isNaN(this.estoque) || parseInt(this.estoque) < 0) {
            this.erroEstoque = 'Insira um valor válido';
        } else {
            this.erroEstoque = '';
        }
    }

    // Adiciona um novo produto
    handleCreate() {
        // Tratar e validar a string do preço
        const precoTratado = this.preco.replace(',', '.'); // Substitui vírgula por ponto
        const precoNumerico = parseFloat(precoTratado); // Converte para número

        // Verifica se o preço é válido
        if (!isNaN(precoNumerico)) {
            createProduto({ produto: { Nome__c: this.nome, Preco__c: precoNumerico, Estoque__c: this.estoque } })
                .then(() => {
                    return refreshApex(this.wiredProdutos);
                })
                .catch(error => {
                    console.error('Erro ao criar produto:', error);
                });
        } else {
            console.error('Preço inválido');
            this.erroPreco = 'Preço inválido';
        }
    }

    // Exclui um produto
    handleDelete(event) {
        const produtoId = event.detail.row.Id; // Ajuste aqui para pegar a ID do produto
        deleteProduto({ produtoId })
            .then(() => {
                return refreshApex(this.wiredProdutos);
            })
            .catch(error => {
                console.error('Erro ao excluir produto:', error);
            });
    }

    // Edita um produto
    handleEdit(event) {
        const produtoId = event.detail.row.Id; // Ajuste aqui para pegar a ID do produto
        const produtoParaEditar = this.produtos.find(produto => produto.Id === produtoId);
        if (produtoParaEditar) {
            this.nome = produtoParaEditar.Nome__c;
            this.preco = produtoParaEditar.Preco__c;
            this.estoque = produtoParaEditar.Estoque__c;
            this.produtoId = produtoId;
        }
    }

    // Atualiza o produto após edição
    handleUpdate() {
        const precoTratado = this.preco.replace(',', '.'); // Substitui vírgula por ponto
        const precoNumerico = parseFloat(precoTratado); // Converte para número

        updateProduto({ produtoId: this.produtoId, nome: this.nome, preco: precoNumerico, estoque: this.estoque })
            .then(() => {
                return refreshApex(this.wiredProdutos);
            })
            .catch(error => {
                console.error('Erro ao atualizar produto:', error);
            });
    }

    // Método para capturar a ação do botão
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        if (actionName === 'delete') {
            this.handleDelete(event);
        } else if (actionName === 'edit') {
            this.handleEdit(event);
        }
    }
}

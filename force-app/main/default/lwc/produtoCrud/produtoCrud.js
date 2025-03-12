import { LightningElement, track, wire } from 'lwc';
import getProdutos from '@salesforce/apex/ProdutoController.getProdutos';
import createProduto from '@salesforce/apex/ProdutoController.createProduto';
import deleteProduto from '@salesforce/apex/ProdutoController.deleteProduto';

export default class ProdutoCrud extends LightningElement {
    @track produtos;
    nome = '';
    preco = 0;
    estoque = 0;

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
    }

    handlePrecoChange(event) {
        this.preco = event.target.value;
    }

    handleEstoqueChange(event) {
        this.estoque = event.target.value;
    }

    // Adiciona um novo produto
    handleCreate() {
        createProduto({ produto: { Nome__c: this.nome, Preco__c: this.preco, Estoque__c: this.estoque } })
            .then(() => {
                return refreshApex(this.wiredProdutos);
            })
            .catch(error => {
                console.error('Erro ao criar produto:', error);
            });
    }

    // Exclui um produto
    handleDelete(event) {
        const produtoId = event.target.dataset.id;
        deleteProduto({ produtoId })
            .then(() => {
                return refreshApex(this.wiredProdutos);
            })
            .catch(error => {
                console.error('Erro ao excluir produto:', error);
            });
    }
}

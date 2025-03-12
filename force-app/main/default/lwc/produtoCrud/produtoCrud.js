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
    }

    handlePrecoChange(event) {
        // Remove qualquer caractere que não seja número, ponto ou vírgula
        let precoString = event.target.value.replace(/[^0-9.,]/g, '');
    
        // Atualiza o valor de 'preco' com o valor válido
        this.preco = precoString;
    }
    
    
    

    handleEstoqueChange(event) {
        this.estoque = event.target.value;
    }

    // Adiciona um novo produto
    handleCreate() {
        // Substitui a vírgula por ponto, se necessário
        const precoParaSalvar = this.preco.replace(',', '.');  // Aqui substituímos a vírgula por ponto
    
        // Converte para número (garantindo que seja um valor numérico válido)
        const precoNumerico = parseFloat(precoParaSalvar);
    
        // Verifica se o valor é válido
        if (!isNaN(precoNumerico)) {
            // Agora você pode salvar o produto, usando o preço formatado
            createProduto({ produto: { Nome__c: this.nome, Preco__c: precoNumerico, Estoque__c: this.estoque } })
                .then(() => {
                    return refreshApex(this.wiredProdutos);
                })
                .catch(error => {
                    console.error('Erro ao criar produto:', error);
                });
        } else {
            console.error('Preço inválido');
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
        // Remove a vírgula e converte para número
        const precoParaSalvar = parseFloat(this.preco.replace('R$', '').replace(',', '.'));
    
        updateProduto({ produtoId: this.produtoId, nome: this.nome, preco: precoParaSalvar, estoque: this.estoque })
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


# Produto CRUD - Salesforce

Este projeto implementa uma interface de CRUD (Criar, Ler, Atualizar e Excluir) para gerenciar produtos no Salesforce. Através de um componente Lightning Web Component (LWC), é possível adicionar, listar, editar e excluir produtos diretamente do Salesforce.

## Funcionalidades

- **Criar Produto**: Adiciona novos produtos com nome, preço e estoque.
- **Listar Produtos**: Exibe uma lista de produtos já cadastrados.
- **Editar Produto**: Permite editar as informações de um produto existente.
- **Excluir Produto**: Exclui um produto do Salesforce.

## Tecnologias Utilizadas

- **Salesforce LWC (Lightning Web Component)**
- **Apex** (Para comunicação com o banco de dados do Salesforce)
- **Salesforce Lightning Design System (SLDS)**

## Pré-requisitos

- Conta no Salesforce (pode ser uma conta de desenvolvedor).
- Ferramenta Salesforce DX ou Salesforce Developer Console.
- Familiaridade básica com o desenvolvimento de Lightning Web Components e Apex.

## Como Usar

## Configuração do Backend (Apex Controller)

Para que o componente funcione corretamente, é necessário criar a classe `ProdutoController` no Salesforce.

### Criando a Classe Apex:

1. No Salesforce, abra o **Developer Console**.
2. Vá até **File > New > Apex Class**.
3. Nomeie a classe como `ProdutoController`.
4. Copie e cole o seguinte código:
   
public with sharing class ProdutoController {
    
    @AuraEnabled(cacheable=true)
    public static List<Produto__c> getProdutos() {
        return [SELECT Id, Nome__c, Preco__c, Estoque__c FROM Produto__c ORDER BY Nome__c];
    }

    @AuraEnabled
    public static Produto__c createProduto(Produto__c produto) {
        insert produto;
        return produto;
    }

     @AuraEnabled
    public static void updateProduto(Id produtoId, String nome, Decimal preco, Integer estoque) {
        Produto__c produto = [SELECT Id, Nome__c, Preco__c, Estoque__c FROM Produto__c WHERE Id = :produtoId LIMIT 1];
        produto.Nome__c = nome;
        produto.Preco__c = preco;
        produto.Estoque__c = estoque;
        update produto;
    }

    @AuraEnabled
    public static void deleteProduto(Id produtoId) {
        delete [SELECT Id FROM Produto__c WHERE Id = :produtoId];
    }
}

### Após a criação do Controller:

1. Clone o repositório:
   ```bash
   git clone https://github.com/PauloRCD22/salesforce-produto-crud.git
2.Adicione o componente LWC na sua organização Salesforce.

3. Importe os arquivos Apex (ProdutoController) para o Salesforce.

4. Adicione o componente no Lightning App Builder ou na página desejada no Salesforce.

5. Use o componente para gerenciar os produtos, criando, editando ou excluindo conforme necessário.


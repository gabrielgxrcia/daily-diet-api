# Requisitos Funcionais (RF)

## Cadastro de Usuário

* [RF-01] Deve ser possível criar um usuário.

## Identificação do Usuário

* [RF-02] Deve ser possível identificar o usuário entre as requisições.

## Registro de Refeição

* [RF-03] Deve ser possível registrar uma refeição com as seguintes informações:
    * [RF-03-1] Nome
    * [RF-03-2] Descrição
    * [RF-03-3] Data e Hora
    * [RF-03-4] Está dentro ou fora da dieta.

## Edição de Refeição

* [RF-04] Deve ser possível editar uma refeição, permitindo a alteração de todos os dados mencionados acima.

## Exclusão de Refeição

* [RF-05] Deve ser possível apagar uma refeição.

## Listagem de Refeições

* [RF-06] Deve ser possível listar todas as refeições de um usuário.

## Visualização de Refeição Individual

* [RF-07] Deve ser possível visualizar detalhes de uma única refeição.

## Recuperação de Métricas do Usuário

* [RF-08] Deve ser possível recuperar métricas de um usuário, incluindo:
    * [RF-08-1] Quantidade total de refeições registradas.
    * [RF-08-2] Quantidade total de refeições dentro da dieta.
    * [RF-08-3] Quantidade total de refeições fora da dieta.
    * [RF-08-4] Melhor sequência por dia de refeições dentro da dieta.

# Regras de Negócio (RN)

## Restrição de Acesso a Refeições

* [RN-01] O usuário só pode visualizar, editar e apagar as refeições que ele criou.
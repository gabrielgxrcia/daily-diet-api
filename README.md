# Requisitos Funcionais (RF)

## Cadastro de Usuário

- [x] Deve ser possível criar um usuário.

## Identificação do Usuário

- [x] Deve ser possível identificar o usuário entre as requisições.

## Registro de Refeição

- [x] Deve ser possível registrar uma refeição com as seguintes informações:
    - [x] Nome
    - [x] Descrição
    - [x] Data e Hora
    - [x] Está dentro ou fora da dieta.

## Edição de Refeição

- [x] Deve ser possível editar uma refeição, permitindo a alteração de todos os dados mencionados acima.

## Exclusão de Refeição

- [x] Deve ser possível apagar uma refeição.

## Listagem de Refeições

- [x] Deve ser possível listar todas as refeições de um usuário.

## Visualização de Refeição Individual

- [x] Deve ser possível visualizar detalhes de uma única refeição.

## Recuperação de Métricas do Usuário

- [x] Deve ser possível recuperar métricas de um usuário, incluindo:
    - [x] Quantidade total de refeições registradas.
    - [x] Quantidade total de refeições dentro da dieta.
    - [x] Quantidade total de refeições fora da dieta.
    - [x] Melhor sequência por dia de refeições dentro da dieta.

# Regras de Negócio (RN)

## Restrição de Acesso a Refeições

- [x] O usuário só pode visualizar, editar e apagar as refeições que ele criou.

## Instalação

```bash
# Clone o repositório
git clone git@github.com:gabrielgxrcia/daily-diet-api.git

# Instale as dependências do projeto
npm install

# Execute o projeto no ambiente de desenvolvimento
npm run dev

# Execute as migrations para criar o banco de dados
npm run knex -- migrate:latest
```

## Documentação e rotas
- Criar novo usuário

```http
  POST /users
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `name` | `Body - String` | **Obrigatório**. Nome do usuário. |
| `email` | `Body - String` | **Obrigatório**. Email do usuário. |
| `address` | `Body - String` | **Obrigatório**. Endereço do usuário. |
| `weight` | `Body - Number` | **Obrigatório**. Peso do usuário. |
| `height` | `Body - Number` | **Obrigatório**. Altura do usuário. |

- Criar novo registro de refeição

```http
  POST /meals
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `name` | `Body - String` | **Obrigatório**. Nome da refeição. |
| `description` | `Body - String` | **Obrigatório**. Descrição da refeição. |
| `is_on_diet` | `Body - Boolean` | **Obrigatório**. Indica se a refeição está na dieta. |

- Listar todas refeições registradas pelo usuário

```http
  GET /meals
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `user_id` | `Query Param` | **Opcional**. ID do usuário para filtras as métricas. |

- Listar uma refeição específica registrada pelo usuário

```http
  GET /meals/:${meal_id}
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `meal_id` | `Path Parameter` | **Obrigatório**. ID da refeição a ser consultada. |

- Mostrar um resumo geral das refeições cadastradas pelo usuário (total de refeições, refeições dentro da dieta e refeições fora da dieta)

```http
  GET /meals/summary
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `user_id` | `Query Param` | **Opcional**. ID do usuário para filtras as métricas. |

```http
  PUT /meals/:${meal_id}
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `meal_id` | `Path Parameter` | **Obrigatório**. ID da refeição a ser editada. |
| `name` | `Body - String` | **Opcional**. Novo nome da refeição. |
| `description` | `Body - String` | **Obrigatório**. Nova descrição da refeição. |
| `is_on_diet` | `Body - Boolean` | **Obrigatório**. Indica se a refeição está agora na dieta. |

```http
  DELETE /meals/:${meal_id}
```

| Parâmetro   | Tipo       | Descrição                           |
| :---------- | :--------- | :---------------------------------- |
| `meal_id` | `Path Parameter` | **Obrigatório**. ID da refeição a ser excluída. |
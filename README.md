Para inicialização do projeto necessário clonar, utilizar o comando npm install para instalar as dependencias.
Aplicação pode ser inicializada por: npm dev ou yarn dev.
Para criar as tabelas no banco, há script: yarn migration:run, esse é um script criado pro mim para rodar as migrations existentes no projeto, para saber quais são, existe o comando yarn:migration:show.

Há um serviço de redis rodando, necessário subir um container com o comando: docker compose up -d
assim evitará erros no console gerados pelo redis.

IA utilizada: chatgpt.

Exemplos de prompts:
gerar entidade baseada nas seguintes informações
gerar dto a partir da entidade
**Utilizo essa estratégia sempre com coisas simples para otimizar o tempo**
preciso de orientação de como rodar o redis dentro do docker
preciso de orientação de como documentar no swagger os campos obrigatórios dos filtros do metodo getAll ( nunca tinha feito isso, foi uma experiência bacana aprender algo novo)

Geralmente eu utilizo IA para tarefas simples ou repetitivas como criar entidades e DTO.

variaveis utilizadas para acesso ao banco:
nome do env: .env.development (necessário ter atenção que começa com o .env.)

#database
DATABASE_HOST=localhost
DATABASE_USER=admin-loomi
DATABASE_PASSWORD=loomi2025
DATABASE_NAME=loomi-ecommerce
DATABASE_PORT=5432

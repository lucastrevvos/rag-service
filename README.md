# RAG Service

API em Node.js para ingestão assíncrona de documentos e consulta de respostas com base em contexto recuperado.

## Visão geral

O RAG Service é um backend em TypeScript que demonstra um fluxo completo de Retrieval-Augmented Generation (RAG): receber documentos, processar o conteúdo em chunks, gerar representações vetoriais, recuperar trechos relevantes e produzir uma resposta contextualizada para uma pergunta.

O projeto foi construído com uma separação clara entre API HTTP, fila de processamento, worker de ingestão e camada de busca vetorial. Essa organização facilita a evolução do serviço para cenários com maior volume de documentos, integrações externas e armazenamento vetorial persistente.

## Problema

Aplicações que trabalham com documentos precisam oferecer respostas baseadas em conteúdo próprio, mantendo o processamento organizado e sem bloquear a experiência de uso. Em um fluxo RAG, a ingestão de textos, a criação de embeddings e a recuperação de contexto são etapas distintas que se beneficiam de uma arquitetura assíncrona e modular.

## Solução

O serviço expõe uma API para cadastrar textos e consultar perguntas. A ingestão é enviada para uma fila BullMQ, processada por um worker dedicado e armazenada em uma estrutura vetorial em memória. Na etapa de pergunta, a aplicação gera a representação da consulta, busca os chunks mais relevantes e monta uma resposta a partir do contexto recuperado.

Essa abordagem mantém a API responsiva, isola o trabalho pesado no worker e deixa o domínio de RAG organizado em módulos pequenos e objetivos.

## Funcionalidades

- Health check da API por meio de `GET /health`.
- Ingestão de documentos com `POST /ingest`, recebendo `docId` e `text`.
- Enfileiramento assíncrono de ingestões com BullMQ e Redis.
- Consulta de status de jobs por meio de `GET /jobs/:id`.
- Divisão de texto em chunks com sobreposição configurada no código.
- Geração de embeddings em implementação local para manter o fluxo executável sem dependência obrigatória de API externa.
- Busca vetorial em memória com similaridade de cosseno.
- Endpoint de perguntas com `POST /ask`, retornando resposta e fontes associadas.
- Execução local via scripts npm/pnpm e execução containerizada com Docker Compose.

## Stack

- Node.js 20
- TypeScript
- Express
- BullMQ
- Redis
- ioredis
- Docker e Docker Compose
- pnpm

## Arquitetura

A aplicação é organizada em camadas simples:

- **API HTTP**: define os endpoints de saúde, ingestão, consulta de jobs e perguntas.
- **Fila**: centraliza a criação da fila BullMQ, conexão com Redis e opções padrão de retry/backoff.
- **Worker**: consome jobs de ingestão em background e processa os documentos de forma assíncrona.
- **Domínio RAG**: concentra chunking, geração de embeddings, ingestão, busca vetorial e geração de respostas.
- **Vector store em memória**: mantém os chunks processados e seus vetores durante a execução da aplicação.

Fluxo principal:

1. O cliente envia um documento para `POST /ingest`.
2. A API valida o payload e cria um job na fila.
3. O worker consome o job, divide o texto em chunks e adiciona os embeddings ao vector store.
4. O cliente envia uma pergunta para `POST /ask`.
5. A aplicação recupera os chunks mais relevantes e retorna uma resposta contextualizada com as fontes.

## Como rodar

### Pré-requisitos

- Node.js 20+
- pnpm
- Redis disponível localmente ou via Docker

### Execução local

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Em outro terminal, execute o worker:

```bash
pnpm dev:worker
```

Com Redis local em `redis://localhost:6379`, a API ficará disponível em:

```text
http://localhost:3333
```

### Execução com Docker Compose

```bash
cp .env.example .env
pnpm install
pnpm run build
docker compose up --build
```

### Exemplos de uso

Ingerir um documento:

```bash
curl -X POST http://localhost:3333/ingest \
  -H "Content-Type: application/json" \
  -d '{"docId":"doc-1","text":"TypeScript adiciona tipagem estática ao JavaScript."}'
```

Consultar o status de um job:

```bash
curl http://localhost:3333/jobs/<jobId>
```

Fazer uma pergunta:

```bash
curl -X POST http://localhost:3333/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"O que TypeScript adiciona ao JavaScript?"}'
```

## Configuração

Crie um arquivo `.env` a partir de `.env.example` e ajuste as variáveis conforme o ambiente:

| Variável | Descrição |
| --- | --- |
| `PORT` | Porta HTTP utilizada pela API. |
| `REDIS_URL` | URL de conexão com o Redis usado pela fila. |
| `QUEUE_NAME` | Nome da fila de ingestão. |
| `OPENAI_API_KEY` | Chave de API reservada para integração com provedores de LLM. |
| `OPENAI_MODEL` | Modelo de geração configurável para evolução do serviço. |
| `OPENAI_EMBEDDING_MODEL` | Modelo de embeddings configurável para evolução do serviço. |

> Não inclua valores reais de chaves, tokens ou credenciais em commits.

## Decisões técnicas

- **TypeScript com modo estrito** para aumentar previsibilidade e segurança na evolução do código.
- **Express** pela simplicidade na criação de APIs HTTP e clareza dos handlers.
- **BullMQ com Redis** para separar a ingestão de documentos do ciclo de request/response da API.
- **Worker dedicado** para processar documentos em background e permitir controle de concorrência.
- **Retry com backoff exponencial** na fila para dar mais resiliência a falhas transitórias de processamento.
- **Chunking com overlap** para preservar contexto entre segmentos adjacentes de texto.
- **Vector store em memória** para manter o projeto leve, fácil de executar e focado na arquitetura do fluxo RAG.
- **Docker Compose** para subir API, worker e Redis de forma padronizada.

## Status

O projeto está em estágio funcional de portfólio, com API, fila, worker, chunking, busca vetorial em memória e fluxo de perguntas integrados. A implementação local de embeddings e geração de respostas mantém o serviço executável em ambiente de desenvolvimento sem exigir credenciais externas.

## Roadmap

- Integração completa com embeddings e geração de respostas por provedor externo de LLM.
- Persistência vetorial com banco especializado, como pgvector, Qdrant ou Pinecone.
- Suporte a upload e parsing de arquivos em formatos como PDF, Markdown e HTML.
- Estratégias avançadas de recuperação, como reranking e filtros por metadados.
- Autenticação para proteger endpoints de ingestão e consulta.
- Observabilidade com logs estruturados, métricas e tracing.
- Testes automatizados para API, worker e módulos de RAG.

## O que este projeto demonstra

- Construção de APIs backend com Node.js, Express e TypeScript.
- Modelagem de fluxos assíncronos com filas, workers e Redis.
- Organização de uma arquitetura RAG em módulos independentes.
- Implementação de chunking, busca por similaridade e composição de resposta contextualizada.
- Uso de Docker para padronizar execução local e serviços auxiliares.
- Atenção a separação de responsabilidades, configuração por ambiente e evolução incremental de produto.

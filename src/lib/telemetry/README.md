# OpenTelemetry - Tracing Distribuído

Este projeto está configurado com as dependências do OpenTelemetry para tracing distribuído de queries e mutations GraphQL.

## 📦 Dependências Instaladas

- `@opentelemetry/api` - API padrão do OpenTelemetry
- `@opentelemetry/sdk-node` - SDK Node.js
- `@opentelemetry/sdk-trace-node` - Trace SDK para Node.js
- `@opentelemetry/exporter-trace-otlp-http` - Exportador OTLP HTTP
- `@opentelemetry/instrumentation-graphql` - Instrumentação automática de GraphQL
- `@opentelemetry/instrumentation-http` - Instrumentação automática de HTTP

## 🚀 Como Usar

### 1. Configurar Variáveis de Ambiente

```bash
# Ativar OpenTelemetry (opcional, ativa automaticamente em produção)
OTEL_ENABLED=true

# Endpoint do coletor OTLP (padrão: http://localhost:4318/v1/traces)
OTEL_EXPORTER_OTLP_ENDPOINT=http://seu-collector:4318/v1/traces

# Nome do serviço
OTEL_SERVICE_NAME=strategiq-api
```

### 2. Inicializar em Produção

Em produção, o OpenTelemetry é inicializado automaticamente. Para desenvolvimento, use:

```bash
OTEL_ENABLED=true bun dev
```

### 3. Usar com Jaeger (Local)

```bash
# Iniciar Jaeger com Docker
docker run -d \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest

# Iniciar aplicação com OpenTelemetry
OTEL_ENABLED=true bun dev

# Acessar Jaeger UI em http://localhost:16686
```

### 4. Usar com Datadog

```bash
# Configurar para Datadog
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces \
OTEL_SERVICE_NAME=strategiq-api \
OTEL_ENABLED=true \
bun dev
```

## 📊 O que é Rastreado

### GraphQL
- **Queries**: Tempo de execução de cada query
- **Mutations**: Tempo de execução de cada mutation
- **Resolvers**: Tempo de cada field resolver (opcional)
- **Erros**: Erros durante execução

### HTTP
- **Requisições**: Método, URL, status code
- **Duração**: Tempo total da requisição
- **Headers**: Trace ID propagado

## 🔍 Exemplo de Trace

Um trace típico de uma mutation `createUser` incluiria:

```
createUser (mutation)
├── Validação de autenticação
├── Hash de senha
├── Prisma.user.create
│   ├── Query ao banco de dados
│   └── Retorno do resultado
└── Retorno do usuário criado
```

## 📝 Notas Importantes

- **Desenvolvimento**: OpenTelemetry é desativado por padrão para não impactar performance
- **Testes**: OpenTelemetry não interfere com testes (desativado automaticamente)
- **Produção**: OpenTelemetry é ativado automaticamente
- **Performance**: Instrumentação automática tem overhead mínimo

## 🔗 Recursos

- [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- [GraphQL Instrumentation](https://github.com/open-telemetry/opentelemetry-js-contrib/tree/main/packages/instrumentation-graphql)
- [Jaeger](https://www.jaegertracing.io/)
- [Datadog APM](https://docs.datadoghq.com/tracing/)


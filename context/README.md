# Context - Documentación de Sub-Agentes

Esta carpeta contiene toda la documentación de contexto que Claude Code utilizará para tomar decisiones informadas durante el desarrollo.

## 🎯 Guías Principales

### Para Empezar

- **[Cómo Usar Esta Guía](./COMO_USAR_ESTA_GUIA.md)** - Tutorial completo de uso
- **[Proyectos Existentes](./GUIA_PROYECTOS_EXISTENTES.md)** ⭐ - Si ya tienes código
- **[Plantilla Sub-Agente](./PLANTILLA_SUB_AGENTE.md)** - Para crear tus propios agentes
- **[Project Overview](./project-overview.md)** - Información de tu proyecto

## 📖 Sub-Agentes Especializados

### Agentes Creados

- [Frontend Agent](./agents/frontend-agent.md) - Componentes UI, estado, estilos
- [Security Agent](./agents/security-agent.md) - Validaciones, autenticación, protección
- [E-commerce Agent](./agents/ecommerce-agent.md) - Carrito, pagos, productos

### Agentes Recomendados (por crear)

- Backend Agent - APIs, middleware, servicios
- Database Agent - Esquemas, queries, migraciones
- Testing Agent - Estrategias de testing
- API Design Agent - Diseño de endpoints
- Performance Agent - Optimización, caching
- DevOps Agent - Docker, CI/CD, deployment

## 📏 Estándares del Proyecto

- [Code Style](./standards/code-style.md) - Reglas de estilo, ESLint, Prettier
- [Naming Conventions](./standards/naming-conventions.md) - Convenciones de nombres

## ✅ Checklists

- [Pre-Commit Checklist](./checklists/pre-commit-checklist.md) - Antes de cada commit

## 💡 Ejemplos

- [Componente React](./examples/component-example.md) - Ejemplo completo con tests
- [API Endpoint](./examples/api-endpoint-example.md) - Endpoint con validación

## 🎯 Cómo Usar

Cuando trabajes con Claude Code, referencia estos documentos en tus prompts:

```
"Siguiendo las guías del frontend-agent y security-agent,
crea un componente de login con validación"
```

Claude automáticamente consultará estos documentos para generar código que cumpla con tus estándares.

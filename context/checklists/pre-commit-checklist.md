# Pre-Commit Checklist

Usa este checklist antes de hacer commit de tus cambios.

## 📝 Code Quality

- [ ] El código compila sin errores
- [ ] No hay warnings de TypeScript
- [ ] Linter pasa sin errores (`npm run lint`)
- [ ] Formatter aplicado (`npm run format`)
- [ ] Código sigue las convenciones de naming del proyecto
- [ ] No hay código comentado (usar git history en su lugar)
- [ ] No hay console.logs de debug (usar logger apropiado)
- [ ] Imports organizados (no hay imports no usados)

## 🧪 Testing

- [ ] Tests existentes pasan (`npm run test`)
- [ ] Nuevos tests agregados para nueva funcionalidad
- [ ] Coverage no disminuyó significativamente
- [ ] Tests son significativos (no tests vacíos)
- [ ] Edge cases considerados y testeados

## 🔒 Security

- [ ] No hay secretos, API keys o passwords en el código
- [ ] Inputs de usuario validados
- [ ] Queries de DB usan parámetros (no string concatenation)
- [ ] Headers de seguridad configurados
- [ ] Dependencias no tienen vulnerabilidades críticas (`npm audit`)

## 📚 Documentation

- [ ] Funciones complejas tienen JSDoc comments
- [ ] README actualizado si cambió configuración/setup
- [ ] CHANGELOG actualizado (si aplica)
- [ ] Comentarios explican "por qué", no "qué"

## 🎯 Functionality

- [ ] Feature funciona como se espera
- [ ] No rompe funcionalidad existente
- [ ] UI responsive en diferentes tamaños de pantalla
- [ ] Accesibilidad verificada (teclado, screen readers)
- [ ] Loading states implementados
- [ ] Error handling implementado

## 📦 Git

- [ ] Cambios staged son relevantes al commit
- [ ] Commit message es descriptivo
- [ ] Commit message sigue formato: `type(scope): description`
  - Tipos: feat, fix, docs, style, refactor, test, chore
  - Ejemplo: `feat(cart): add remove item functionality`
- [ ] Un commit = un cambio lógico (no mezclar features)

## 🚀 Performance

- [ ] No hay N+1 queries
- [ ] Imágenes optimizadas
- [ ] Lazy loading implementado donde es apropiado
- [ ] Bundle size no aumentó significativamente

## ✅ Final Check

Antes de hacer push:

```bash
# Run all checks
npm run lint
npm run test
npm run build
npm audit

# Si todo pasa ✅
git push
```

---

**Tip**: Considera agregar un pre-commit hook con Husky para automatizar estos checks.

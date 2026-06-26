# TODO - Sheets deslizables en UserDashboard

- [ ] Paso 1: Analizar/entender estructura actual (UserDashboard.tsx y UserFloatingDock.tsx) y componentes paneles.
- [x] Paso 2: Implementar en `UserDashboard.tsx` el layout dividido: zona principal flex-1 (mapa+buscador) y `aside` sheet deslizante fixed al lado izquierdo.

- [x] Paso 3: Mover la lógica de render de paneles (news/favorites/etc.) al aside usando estado `isOpen` y `activePanel` controlados desde `UserDashboard`.

- [x] Paso 4: Actualizar `UserFloatingDock.tsx` para que los botones activen/cambien el panel del sheet vía callbacks (`onToggleSheet`). El botón principal será el '+' (primer item).

- [x] Paso 5: Asegurar tipado: `UserNewsPanel` con `news={mobilityNews}` y `UserFavoritesPanel` con `routes={favoriteRoutes}`.

- [x] Paso 6: Validar `npm run lint` / `typecheck` si aplica y revisar que el sheet no empuje el layout.

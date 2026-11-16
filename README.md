# Finanzas

Front en React y Vite, en su propio repositorio. En desarrollo el navegador pide `/transactions` en el puerto `5173` y Vite lo reenvía a la API en `http://localhost:3000`.

La API vive en `personal-finance-system` y tiene que estar en marcha antes de abrir esta pantalla.

```bash
pnpm install
pnpm dev
```

La pantalla queda en [http://localhost:5173](http://localhost:5173). Muestra el saldo, los ingresos, los gastos y la lista que devuelve la API.

# Finanzas

Front en React y Vite, en su propio repositorio. En desarrollo el navegador pide `/transactions`, `/card-payments` y `/accounts` en el puerto `5173` y Vite los reenvía a la API en `http://localhost:3000`.

La API vive en `personal-finance-system` y tiene que estar en marcha antes de abrir esta pantalla.

```bash
pnpm install
pnpm dev
```

La pantalla queda en [http://localhost:5173](http://localhost:5173). El resumen del mes muestra el saldo de caja, los ingresos, los gastos de caja, los gastos de tarjeta, los abonos y el pendiente. Movimientos lista las transacciones y los abonos, y deja filtrar por cuenta.

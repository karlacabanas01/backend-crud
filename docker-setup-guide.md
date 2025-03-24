
# 🏗️ Guía para el Backend  

## 🌐 **Configuración de la red compartida (`nabi-network`)**  
Docker maneja la comunicación entre servicios mediante **redes internas**.  
- La red `nabi-network` permite que el backend, la base de datos y el frontend **se comuniquen entre sí por nombre de servicio** en lugar de IP o `localhost`.  
- Docker resolverá automáticamente el nombre del contenedor como `nabi_backend`, `nabi_mysql`, `nabi_frontend`, etc.  
- Si la red **no existe**, créala manualmente antes de levantar cualquier servicio:  

```bash
docker network create nabi-network
```

✅ Si la red ya existe → Docker simplemente la usará.  
✅ Si la red no existe → Docker la creará automáticamente.  

---

## **1️⃣ Detener y eliminar el backend**
Para detener y eliminar solo el backend sin afectar otros servicios:

```bash
docker compose down
```

Si quieres eliminar también la caché y volúmenes asociados al backend:

```bash
docker compose down -v
```

---

## **2️⃣ Eliminar imagen del backend**
Si hiciste cambios en el `Dockerfile` o en las dependencias, elimina la imagen para reconstruir desde cero:

```bash
docker rmi nabi_backend
```

Si da error porque está en uso:

```bash
docker rmi -f nabi_backend
```

---

## **3️⃣ Levantar el backend**
Para reconstruir y levantar el backend desde cero:

```bash
docker compose up --build
```

Para ejecutarlo en segundo plano:

```bash
docker compose up --build -d
```

---

## **4️⃣ Verificar que el backend está corriendo**
```bash
docker ps
```

✅ Si todo está bien, debería aparecer algo como esto:

```
CONTAINER ID   IMAGE         STATUS         PORTS                   NAMES
abcd1234       nabi_backend  Up 10 seconds  0.0.0.0:3000->3000/tcp  nabi_backend
```

---

## **5️⃣ Ver logs del backend**
```bash
docker logs -f nabi_backend
```

---

## **6️⃣ Acceder al backend**
Prueba que el backend está disponible en:

```
http://localhost:3000
```

---

## **7️⃣ Probar la API con Postman o `curl`**
### ➡️ **Registrar un usuario**
```bash
curl -X POST http://localhost:3000/api/auth/register      -H "Content-Type: application/json"      -d '{
           "username": "juan",
           "email": "juan@example.com",
           "password": "123456"
         }'
```

### ➡️ **Iniciar sesión y obtener el token**
```bash
curl -X POST http://localhost:3000/api/auth/login      -H "Content-Type: application/json"      -d '{
           "email": "juan@example.com",
           "password": "123456"
         }'
```


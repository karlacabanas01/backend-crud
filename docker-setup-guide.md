# 📌 Guía Paso a Paso para Levantar y Resetear el Proyecto en Docker

Esta guía documenta los pasos para detener, limpiar y volver a levantar el entorno Docker para este proyecto.

Estos comandos deben ser ejecutados en la ruta del proyecto backend.

## Levantar la red compartida
```bash
docker network create nabi-network
```

## **🔹 Paso 1: Detener y eliminar todos los contenedores**

Antes de reiniciar el entorno, es importante detener los contenedores en ejecución.

```bash
docker compose down
```
✅ Esto baja los contenedores actuales sin eliminar volúmenes ni imágenes.

Si deseas **eliminar completamente la base de datos y los volúmenes**, usa:
```bash
docker compose down -v
```
✅ Esto elimina los volúmenes (`mysql_data`) y reinicia la base de datos.

---

## **🔹 Paso 2: Eliminar imágenes antiguas del backend**

Si hiciste cambios en el código y necesitas **reconstruirlo desde cero**, elimina la imagen anterior:
```bash
docker rmi nabi_backend
```
Si da error porque está en uso, usa el flag `-f`:
```bash
docker rmi -f nabi_backend
```

---

## **🔹 Paso 3: Limpiar caché de construcción** (Opcional)
Si Docker está reutilizando capas antiguas y quieres forzar una reconstrucción limpia:
```bash
docker builder prune -a
```
✅ Esto elimina capas de imágenes antiguas que podrían generar conflictos.

---

## **🔹 Paso 4: Verificar que todo está limpio**
Para asegurarte de que no quedan contenedores en ejecución:
```bash
docker ps
```
Para ver volúmenes existentes (deben estar vacíos después del `down -v`):
```bash
docker volume ls
```
Para ver imágenes en el sistema:
```bash
docker images
```

---

## **🔹 Paso 5: Levantar los servicios desde cero**

Ahora que todo está limpio, levanta Docker con **reconstrucción completa**:
```bash
docker compose up --build
```
✅ Esto va a:
1. **Reconstruir la imagen del backend (`nabi_backend`)**.
2. **Crear y levantar la base de datos MySQL (`nabi_mysql`)**.
3. **Ejecutar el script de inicialización (`mysql-init/init.sql`)**.
4. **Levantar Adminer (`mi-adminer`)**.

Si quieres ejecutarlo en **modo segundo plano (daemon)**:
```bash
docker compose up --build -d
```
✅ Los servicios correrán en segundo plano.

---

## **🔹 Paso 6: Verificar que los contenedores están corriendo**
```bash
docker ps
```
✅ Deberías ver algo como esto:
```
CONTAINER ID   IMAGE         STATUS         PORTS                   NAMES
abcd1234       nabi_backend  Up 10 seconds  0.0.0.0:3000->3000/tcp  nabi_backend
efgh5678       mysql:8.0     Up 10 seconds  0.0.0.0:3306->3306/tcp  nabi_mysql
ijkl9012       adminer       Up 10 seconds  0.0.0.0:8080->8080/tcp  mi-adminer
```
Si alguno no aparece, revisa los logs:
```bash
docker logs -f nabi_backend
docker logs -f nabi_mysql
docker logs -f mi-adminer
```

---

## **🔹 Paso 7: Acceder a los servicios**

🔹 **Backend API (prueba en navegador o Postman)**
```
http://localhost:3000
```

🔹 **Adminer (para gestionar la base de datos)**
```
http://localhost:8080
```
✅ Usa estas credenciales en Adminer:
- **Sistema:** `MySQL`
- **Servidor:** `mysql`
- **Usuario:** `root`
- **Contraseña:** `root`
- **Base de datos:** `nabi_db`

---

## **🔹 Paso 8: Conectarse manualmente a MySQL (Opcional)**
Si quieres verificar directamente en MySQL dentro del contenedor:
```bash
docker exec -it nabi_mysql mysql -u root -p
```
(Teclea `root` como contraseña).

Para ver la base de datos y las tablas:
```sql
SHOW DATABASES;
USE nabi_db;
SHOW TABLES;
```

---

## **🔹 Paso 9: Probar la API con Postman o `curl`**

### **Registrar un usuario**
```bash
curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
           "username": "juan",
           "email": "juan@example.com",
           "password": "123456"
         }'
```

### **Iniciar sesión y obtener el token**
```bash
curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
           "email": "juan@example.com",
           "password": "123456"
         }'
```
✅ **Este comando devuelve un `token` JWT, cópialo porque lo necesitarás para agregar productos.**

### **Crear un producto (requiere token)**
```bash
curl -X POST http://localhost:3000/api/products \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <TOKEN>" \
     -d '{
           "name": "Laptop Gamer",
           "description": "Alta potencia para juegos",
           "price": 1500
         }'
```
( **Reemplaza `<TOKEN>` con el JWT que obtuviste en el login**). #Debemos revisar el codigo, no funciona el tema del token

---

## ** Resumen de Comandos**
| Acción | Comando |
|--------|---------|
| **Detener contenedores** | `docker compose down` |
| **Eliminar base de datos y volúmenes** | `docker compose down -v` |
| **Eliminar imagen del backend** | `docker rmi nabi_backend` |
| **Limpiar caché de Docker** | `docker builder prune -a` |
| **Levantar desde cero** | `docker compose up --build` |
| **Levantar en segundo plano** | `docker compose up --build -d` |
| **Ver contenedores corriendo** | `docker ps` |
| **Ver logs del backend** | `docker logs -f nabi_backend` |
| **Ver logs de MySQL** | `docker logs -f nabi_mysql` |
| **Ver logs de Adminer** | `docker logs -f mi-adminer` |
| **Conectarse a MySQL dentro del contenedor** | `docker exec -it nabi_mysql mysql -u root -p` |

---


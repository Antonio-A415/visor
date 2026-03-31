# Visor de Outages

## Quick Setup

1. Clona el repositorio y entra en la carpeta del proyecto:
	```bash
	git clone <repo-url>
	cd visor
	```

2. Instala las dependencias:
	```bash
	npm install
	```

3. Crea un archivo `.env` en la raíz del proyecto con la siguiente variable de entorno:
	```env
	VITE_API_URL=endpoint
	```

4. Inicia la aplicación en modo desarrollo:
	```bash
	npm run dev
	```

5. Accede a la aplicación localmente en [http://localhost:5173](http://localhost:5173) (o el puerto que indique la terminal).

---

## Demo en la nube

Puedes ver la aplicación desplegada en:
https://visor-alpha.vercel.app/

---
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

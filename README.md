# Pisada · 3D Sneaker Configurator

> **Work in progress.**

A product configurator for a fictional sneaker store. Rotate the sneaker in 3D, change the color and material of each part, see the price update and share your exact design with a link.

## Tech stack

- [Next.js](https://nextjs.org) (App Router) and TypeScript
- Tailwind CSS
- Three.js with React Three Fiber and drei
- glTF Transform and sharp, to prepare the 3D model
- Zustand *(coming soon)*
- Vitest and Playwright *(coming soon)*
- GitHub Actions: lint, type check and build on every push

## Run it locally

You need Node.js 24 (see `.nvmrc`).

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the app for production |
| `npm run lint` | Checks the code with ESLint |
| `npm run typecheck` | Checks the TypeScript types |
| `npm run modelo` | Rebuilds `public/modelos/zapatilla.glb` from the original model |

## Credits

3D model: [Materials Variants Shoe](https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/MaterialsVariantsShoe) © 2021 Shopify, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
Changes: split into parts by color, color textures removed and compressed. See [`scripts/preparar-modelo.mts`](scripts/preparar-modelo.mts).

## License

The code is under the [MIT](LICENSE) license. The 3D model keeps its own license (CC BY 4.0, see Credits).

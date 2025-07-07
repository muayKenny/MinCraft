# MinCraft 🏰

An extremely minimal demo of MineCraft in Three.js : MinCraft!

Built following the excellent tutorial by **Dan Greenheck** at [threejsroadmap.com](https://threejsroadmap.com/)

All credit to core gameplay features to his tutorial, I have added music, a splash page, and environment maps by Skybox Labs.

Background music credit:
“Crusade: Heavy Industry” by Kevin MacLeod (The Best)
Licensed under Creative Commons Attribution 4.0 License
Artist: Kevin MacLeod

## ✨ Features

- **Procedural world generation** with chunks and biomes
- **First-person exploration** with smooth controls
- **Block placing/breaking** with intuitive tools
- **Ambient background music** (toggle with `M`)
- **Multiple environment themes** for different vibes
- **Physics simulation** with collision detection
- **Debug tools** for developers

## 🎮 Controls

- **WASD** - Move around
- **Mouse** - Look around
- **Space** - Jump
- **Left Click** - Place/Remove blocks
- **Number Keys (0-9)** - Select block types
- **M** - Toggle music on/off
- **R** - Reset player position
- **Escape** - Lock/unlock cursor

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open your browser and click "Start Game" to begin exploring!

## 🛠️ Tech Stack

- **Three.js** - 3D graphics and rendering
- **Vite** - Fast build tool and dev server
- **SimplexNoise** - Procedural terrain generation
- **Web Audio API** - Background music system

## 🎯 Architecture

The game uses a modular architecture with separate systems:

- **World & Chunks** - Manage terrain generation and block data
- **Player** - Handle movement, camera, and input
- **Physics** - Collision detection and gravity
- **Audio** - Background music and sound effects
- **UI** - Debug tools and settings

## 🎨 Customization

- Add new block types in `src/blocks.js`
- Modify world generation in `src/worldChunk.js`
- Adjust player physics in `src/physics.js`
- Change environment themes in `src/main.js`

## 🙏 Credits

Built following the excellent tutorial by **Dan Greenheck** at [threejsroadmap.com](https://threejsroadmap.com/)

## 📝 License

MIT License - feel free to build upon this project!

---

🎮\_

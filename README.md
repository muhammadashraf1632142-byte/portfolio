# Muhammad Ashraf — Frontend Portfolio

A long-form creative portfolio built with Next.js App Router, TypeScript, and Tailwind CSS. Identity, contact details, project content, and screenshots come from the supplied CV and assets.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000. On Windows PowerShell, use `npm.cmd` if script execution is restricted.

## Production and checks

```sh
npm run lint
npm run build
npm run start -- --hostname 127.0.0.1 --port 3001
```

With the production server running, use a separate terminal:

```sh
npm run test:e2e
```

The 20 browser checks use installed Google Chrome through Playwright. They cover real fragment breakup and reconstruction for both projects with pixel comparisons, cursor-speed intensity and contrast, avatar articulation and blinking, individual-letter response, spring panels, skills tabs, process controls, playground forces, gallery navigation, accessibility, responsive layouts, reduced motion, WebGL failures, static navigation without JavaScript, and unknown project routes. Screenshots are written to the ignored test-results directory.

## Page composition

Hero → identity → coding workspace → about → cinematic Gather/FreshCart showcase → capabilities → visual playground → process → tools → contact → footer.

Scenes use oversized typography, screenshot stacks, layered depth, clipped reveals, and distinct compositions rather than long paragraphs. Desktop projects share a pinned ScrollTrigger sequence spanning 4.4 viewport heights, with independent title, screenshot, metadata, and fragment transitions.

## Structure

- app: homepage, pre-rendered project pages, metadata, and global styles
- components/layout and components/sections: accessible content and scene composition
- components/motion: articulated SVG avatar, scene timelines, Lenis, cursor, magnetic links, spring panels, reactive letters, controlled image trails, and progressive route transitions
- components/webgl: lazily loaded R3F renderer, Drei textures, one GPU mesh of independently moving fragments, and GLSL shaders
- components/ui: keyboard, touch, and mouse-accessible screenshot gallery
- data/profile.ts: identity, contact email, and the supplied PDF CV
- data/projects.ts: project content, real screenshots, and live URLs from the CV
- data/capabilities.ts: interactive capability groups

## Interaction behavior

One reusable SVG rig follows the supplied character reference: curly brown hair, glasses, a smiling beard, navy polo, light trousers, brown shoes, shoulder bag, and folded arms at rest. It provides walking entry, breathing, blinking, damped mouse look, typing with moving hands and pulsing screen content, pointing, painting, and waving. Scene cues connect the avatar to UI panels and contact actions. Intersection and visibility observers pause hidden characters.

Project images render as approximately 3,500 independent textured mesh fragments in one draw call. Mouse UV coordinates, direction, speed, seeded offsets, rotation, and shrinkage produce visible holes and RGB separation. A damped spring reconstructs the image when movement stops. Scroll progress also drives breakup during the project handoff. No React component or DOM element is created per fragment.

Rendering runs on demand, caps pixel density, and unmounts canvases offscreen. Only the active pinned project receives a renderer. The intact Next.js image is hidden after WebGL becomes ready and restored on failure, so breakup holes expose the scene rather than another intact image.

The playground uses a small 2D canvas simulation with cursor forces, springs, boundaries, spinning shapes, and a brush-driven force. Six reusable screenshot echoes provide a local, short-lived image trail. GSAP, Lenis, and the playground share the GSAP ticker; no independent perpetual animation loops are added.

Touch devices keep lightweight avatar animation, screenshot compositions, tabs, buttons, and tap-to-stir controls. They omit the custom cursor, shader renderers, and expensive pinning. Reduced motion removes character and scroll animation while keeping controls functional; stirring rearranges shapes immediately. Low-memory and data-saving devices use ordinary images.

No content or navigation depends on hover, WebGL, or motion. Desktop project links use native View Transitions where supported.

## Content

Gather leads with its feed and uses people discovery and account screens as supporting layers. FreshCart leads with its storefront and uses product browsing and produce-home screens. Only original files in public/projects are used; unavailable profile, product-detail, and cart screenshots are not fabricated.

Edit content and ordering in data/projects.ts. Live URLs are the original links from the CV. The download uses the supplied Muhammad_Ashraf_CV_Frontend_Backend_2026.pdf; the contact address and download path are in data/profile.ts.

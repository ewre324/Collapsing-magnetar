# Collapsing Magnetar Simulation

A client-side 3D simulation of a collapsing magnetar, built with [Three.js](https://threejs.org/).

This project visualizes a magnetar (a type of neutron star with an extremely powerful magnetic field) undergoing a collapse event. The simulation demonstrates the conservation of angular momentum (spin-up) and color shift due to heating.

## Features

*   **3D Visualization:** Realistic rendering of a magnetar with glowing material and surrounding magnetic field lines.
*   **Interactive Simulation:**
    *   **Start Collapse:** Triggers the collapse sequence where the star shrinks, spins faster, and changes color from red-orange to blue-white.
    *   **Reset:** Restores the star to its initial state.
*   **Client-Side Only:** Runs entirely in the browser using HTML5 Canvas and WebGL.

## How to Run Locally

Since this project uses Three.js and loads textures/assets (even though this specific version is procedural), it's best to run it via a local web server to avoid CORS issues with local file access.

### Prerequisites

*   A modern web browser (Chrome, Firefox, Safari, Edge).
*   Python 3 (optional, for a quick local server).

### Steps

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/magnetar-simulation.git
    cd magnetar-simulation
    ```

2.  Start a local server:
    *   **Using Python 3:**
        ```bash
        python3 -m http.server
        ```
    *   **Using Node.js (http-server):**
        ```bash
        npx http-server
        ```

3.  Open your browser and navigate to `http://localhost:8000` (or the port shown in your terminal).

## Deployment

This project is ready for deployment on **GitHub Pages**.

1.  Go to your repository settings on GitHub.
2.  Navigate to the "Pages" section.
3.  Select the `main` branch as the source.
4.  Save. Your site will be live at `https://<your-username>.github.io/<repository-name>/`.

## License

MIT License

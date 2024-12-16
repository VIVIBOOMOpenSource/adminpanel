# Installation Guide 
## ViviBoom Admin Panel
This guide walks you through setting up the development environment for the ViviBoom admin panel.

### Prerequisites
- Node.js & npm: Download and install Node.js from the official website (https://nodejs.org/) which includes npm by default.

### Installation
1. Clone the repository:
    ```bash
    git clone https://<repository_url>.git
    ```
1. Navigate to the project directory:
    ```bash
    cd viviboom-admin
    ```
1. Install dependencies:
    ```bash
    npm install
    ```
1. Start development server:
    ```bash
    npm run start-dev
    ```
 **Note -** If you encounter an error during this step, you have two options:
    1. Update the `start-dev` script in package.json
        - From:
            ```json
            "start-dev": "cross-env PORT=3029 NODE_ENV=development react-scripts start"
            ```
        - To:
            ```json
            "start-dev": "cross-env PORT=3029 NODE_ENV=development react-scripts --openssl-legacy-provider start"
            ```
    1. [Downgrade Node.js to version 14](https://github.com/VIVIBOOMOpenSource/VIVIBOOMOpenSource/blob/main/nodejs-downgrade.md).
1. Access the frontend:
    - Local: http://localhost:3029/
    - Dev: https://www.release-admin.viviboom.co/
    - Production: https://www.admin.viviboom.co

**You’re all set! Configure the backend, update assets, and start developing or testing the admin panel.**

## Contribute to the project
We welcome contributions to make this project even better! Whether it's fixing bugs, adding new features, improving documentation, or optimizing performance, your help is appreciated.

Before you get started, please read the [Contribution Guidelines](https://github.com/VIVIBOOMOpenSource/VIVIBOOMOpenSource/blob/main/contribution.md) to understand the process and conventions.

Thank you for contributing to the project! 🚀
